/** Public, approved Restaurant Advisory opportunity records. Never ship an Airtable token to the browser. */
export type FundingStatus='Open'|'Upcoming'|'Closed'|'Monitoring'|'Unverified';
export type FundingOpportunity={id:string;slug:string;program:string;funder:string;geography:string[];type:string;eligibleApplicants:string;eligibleExpenses:string;amountNotes:string;match:string;status:FundingStatus;deadline?:string;nextRound?:string;url:string;verified:string;fit:string[];summary:string};
const statusSet=new Set<FundingStatus>(['Open','Upcoming','Closed','Monitoring','Unverified']);
const g=(f:Record<string,unknown>,key:string)=>typeof f[key]==='string'?String(f[key]).trim():'';
const choices=(v:unknown):string[]=>Array.isArray(v)?v.map(x=>typeof x==='string'?x:(x&&typeof x==='object'&&'name'in x?String((x as any).name):'')).filter(Boolean):[];
const normalized=(r:any):FundingOpportunity|null=>{
 const f=r?.fields||{};
 if(g(f,'Publication Status')!=='Approved')return null;
 const program=g(f,'Program'),url=g(f,'Official Source URL');
 if(!program||!/^https:\/\//.test(url))return null;
 const status=g(f,'Application Status') as FundingStatus;
 return {id:String(r.id),slug:g(f,'Slug')||String(r.id),program,funder:g(f,'Funder'),geography:choices(f.Geography),type:g(f,'Opportunity Type'),eligibleApplicants:g(f,'Eligible Applicants'),eligibleExpenses:g(f,'Eligible Expenses'),amountNotes:g(f,'Amount Notes'),match:g(f,'Match Requirement'),status:statusSet.has(status)?status:'Unverified',deadline:g(f,'Deadline')||undefined,nextRound:g(f,'Next Round')||undefined,url,verified:g(f,'Last Verified'),fit:choices(f['Advisory Fit']),summary:g(f,'Public Summary')};
};
const currentStatus=(o:FundingOpportunity):FundingOpportunity=>{
 // Retire expired application windows at build-time even if editorial status was not changed.
 const today=new Date().toISOString().slice(0,10);
 if(o.status==='Open' && o.deadline && o.deadline<today) return {...o,status:'Closed'};
 // A record left 'Open' for more than 45 days without review should not advertise an open grant.
 if(o.status==='Open' && (!o.verified || (new Date(today).getTime()-new Date(o.verified).getTime())>45*86400000))return {...o,status:'Unverified'};
 return o;
};
export async function getFundingOpportunities():Promise<{items:FundingOpportunity[];source:'airtable'|'editorial-snapshot';warning?:string}>{
 const token=import.meta.env.AIRTABLE_PAT||process.env.AIRTABLE_PAT;
 const base=import.meta.env.AIRTABLE_BASE_ID||process.env.AIRTABLE_BASE_ID;
 if(!token||!base){const {fundingSnapshot}=await import('../data/funding-snapshot');return {items:fundingSnapshot.map(currentStatus),source:'editorial-snapshot',warning:'Editorial snapshot only. Confirm details with the funder before acting.'};}
 let offset:string|undefined;let rows:FundingOpportunity[]=[];
 do{
  const endpoint=new URL(`https://api.airtable.com/v0/${encodeURIComponent(base)}/${encodeURIComponent('Funding Opportunities')}`);
  endpoint.searchParams.set('pageSize','100');if(offset)endpoint.searchParams.set('offset',offset);
  const res=await fetch(endpoint,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(12000)});
  if(!res.ok)throw new Error(`Funding feed request failed (HTTP ${res.status}); refusing to silently publish stale records.`);
  const data=await res.json() as {records:any[];offset?:string};
  rows.push(...data.records.map(normalized).filter((x):x is FundingOpportunity=>Boolean(x)));
  offset=data.offset;
 }while(offset);
 return {items:rows.map(currentStatus).sort((a,b)=>(a.status==='Open'?-1:0)-(b.status==='Open'?-1:0)||a.program.localeCompare(b.program)),source:'airtable'};
}
