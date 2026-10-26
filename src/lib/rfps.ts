import seed from '../../seed/rfps.sample.json';
import {categories,jurisdictions} from './config';
export interface Rfp {
  id:string; title:string; agency:string; jurisdiction:string; category:string; slug:string;
  dueDate:string; estimatedValue:number|null; solicitationUrl:string;
  requirements:string[]; summary:string; status:string; awardAmount:number|null;
  bidTabUrl:string; publishedAt:string;
}
const asStr = (x:unknown) => typeof x==='string' ? x.trim() : '';
const numOrNull = (v:unknown) => typeof v==='number' && Number.isFinite(v) ? v : null;
const safeUrl = (s:string) => { try { const u = new URL(s); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const slug = (s:string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
function parseRequirements(v:unknown):string[] {
  if(Array.isArray(v)) return v.filter((x):x is string=>typeof x==='string').map(x=>x.trim()).filter(Boolean);
  if(typeof v!=='string') return [];
  try { const a=JSON.parse(v); if(Array.isArray(a)) return parseRequirements(a); } catch {}
  return v.split(/\r?\n/).map(x=>x.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
}
export function normalizeRfp(row:any):Rfp {
  const f=row.fields || row;
  const j=slug(asStr(f.Jurisdiction || f.jurisdiction));
  const c=slug(asStr(f.Category || f.category));
  const title=asStr(f.Title || f.title);
  return {
    id:asStr(row.id || f.id), title, agency:asStr(f.Agency || f.agency),
    jurisdiction:j, category:c, slug:slug(asStr(f.Slug || f.slug) || title),
    dueDate:asStr(f['Due Date'] || f.dueDate).slice(0,10),
    estimatedValue:numOrNull(f['Est. Value'] ?? f.estimatedValue),
    solicitationUrl:safeUrl(asStr(f['Solicitation URL'] || f.solicitationUrl)),
    requirements:parseRequirements(f.Requirements ?? f.requirements),
    summary:asStr(f.Summary || f.summary), status:asStr(f.Status || f.status) || 'Draft',
    awardAmount:numOrNull(f['Award Amount'] ?? f.awardAmount),
    bidTabUrl:safeUrl(asStr(f['Bid Tab URL'] || f.bidTabUrl)),
    publishedAt:asStr(f['Published At'] || f.publishedAt).slice(0,10)
  };
}
export function effectiveStatus(r:Rfp, now=new Date()):string {
  const s=r.status.toLowerCase();
  if(s==='sample') return 'SAMPLE';
  if(s==='awarded') return 'Awarded';
  if(s==='closed' || (r.dueDate && r.dueDate < now.toISOString().slice(0,10))) return 'Closed';
  return s==='open' ? 'Open' : 'Draft';
}
export const bidUrl = (r:Rfp) => `/bids/${r.jurisdiction}/${r.slug}`;
let cache:Promise<Rfp[]>|null=null;
export async function getRfps():Promise<Rfp[]> {
  if(cache) return cache;
  cache=(async()=>{
    const key=import.meta.env.AIRTABLE_PAT || process.env.AIRTABLE_PAT;
    const base=import.meta.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
    if(!key || !base) return import.meta.env.DEMO_SEED === '0' || process.env.DEMO_SEED==='0' ? [] : seed.map(normalizeRfp);
    let offset='', rows:any[]=[];
    do {
      const q=new URLSearchParams({pageSize:'100'});
      if(offset) q.set('offset',offset);
      const url=`https://api.airtable.com/v0/${encodeURIComponent(base)}/RFPs?${q}`;
      const resp=await fetch(url,{headers:{Authorization:`Bearer ${key}`}});
      if(!resp.ok) throw new Error(`Airtable RFP build read failed (${resp.status}). Refusing to serve stale listings.`);
      const body:any=await resp.json(); rows.push(...(body.records||[])); offset=body.offset||'';
    }while(offset);
    const publicRows=rows.map(normalizeRfp).filter(r=>r.title && r.slug && r.category && r.jurisdiction && ['Open','Closed','Awarded','SAMPLE'].includes(r.status));
    const seen=new Set<string>();
    for(const r of publicRows){
      const key=`${r.jurisdiction}/${r.slug}`;
      if(seen.has(key)) throw new Error(`Duplicate public RFP URL: ${key}`);
      seen.add(key);
      if(!categories.some(c=>c.slug===r.category)||!jurisdictions.some(j=>j.slug===r.jurisdiction))throw new Error(`Unsupported category or jurisdiction: ${key}`);
      if(r.status==='Open' && (!r.solicitationUrl || !/^\d{4}-\d{2}-\d{2}$/.test(r.dueDate)))throw new Error(`Open RFP missing required official URL or due date: ${key}`);
    }
    return publicRows;
  })(); return cache;
}
export async function getVisibleRfps() {
  const allowSamples = !(import.meta.env.DEMO_SEED === '0' || process.env.DEMO_SEED === '0');
  return (await getRfps()).filter(r=> effectiveStatus(r)!=='Draft' && (allowSamples || effectiveStatus(r)!=='SAMPLE'));
}
export async function getOpenRfps() {
  return (await getVisibleRfps()).filter(r=>effectiveStatus(r)==='Open').sort((a,b)=>(b.publishedAt||b.dueDate).localeCompare(a.publishedAt||a.dueDate));
}
export async function getBidBoardRfps() {
  const all=await getVisibleRfps();
  return all.filter(r=>effectiveStatus(r)==='Open' || effectiveStatus(r)==='SAMPLE' || effectiveStatus(r)==='Closed' || effectiveStatus(r)==='Awarded').sort((a,b)=>(b.publishedAt||b.dueDate).localeCompare(a.publishedAt||a.dueDate));
}
