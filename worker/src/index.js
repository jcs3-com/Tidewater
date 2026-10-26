import {scoreReadiness} from '../../public/scripts/score.js';

const MAX_BODY = 16000;
async function verifyTurnstile(fields,env) {
  if(!env.TURNSTILE_SECRET) return true; // Opt-in protection; strongly recommended in production.
  const token=clean(fields['cf-turnstile-response'],4096);
  if(!token) return false;
  const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body});
  return res.ok && (await res.json()).success===true;
}

const allowedKinds = new Set(['contact','newsletter','bid_packet','quiz']);
const clean = (v,max=2000) => typeof v==='string' ? v.trim().slice(0,max) : '';
const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length<=254;
const now = () => new Date().toISOString();
const json = (v,status=200,extra={}) => new Response(JSON.stringify(v), {status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
function cors(req,env) {
  const origin=req.headers.get('Origin'); const allowed=env.ALLOWED_ORIGIN || 'http://localhost:4321';
  return origin===allowed ? {'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','vary':'Origin'} : null;
}
const bad = (message,status=400,headers={})=>json({error:message},status,headers);
async function airtable(env,table,{method='GET',body,query='',id=''}={}) {
  if(!env.AIRTABLE_PAT||!env.AIRTABLE_BASE_ID)throw new Error('Backend not configured');
  const u=`https://api.airtable.com/v0/${encodeURIComponent(env.AIRTABLE_BASE_ID)}/${encodeURIComponent(table)}${id?'/'+encodeURIComponent(id):''}${query?'?'+query:''}`;
  const res=await fetch(u,{method,headers:{authorization:`Bearer ${env.AIRTABLE_PAT}`,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!res.ok){const detail=await res.text();console.error('Airtable',res.status,detail.slice(0,200));throw new Error(`Database returned ${res.status}`)}
  return res.json();
}
const hex = bytes => Array.from(new Uint8Array(bytes)).map(n=>n.toString(16).padStart(2,'0')).join('');
async function sha256(s){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));}
async function signature(env,record){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.HMAC_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(record)));}
const safeCompare=(a,b)=>a.length===b.length&&Array.from(a).reduce((acc,ch,i)=>acc|(ch.charCodeAt(0)^b.charCodeAt(i)),0)===0;
function html(s){return clean(s,2000).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
async function emailConfirm(env,email,record,token) {
  if(!env.RESEND_API_KEY||!env.FROM_EMAIL||!env.MAILING_ADDRESS||!env.HMAC_SECRET||!env.WORKER_URL||!env.SITE_URL) throw Error('Email configuration incomplete');
  const confirm=`${env.WORKER_URL}/api/confirm?token=${encodeURIComponent(token)}`;
  const unsubscribe=`${env.WORKER_URL}/api/unsubscribe?record=${encodeURIComponent(record)}&sig=${await signature(env,record)}`;
  const sender=clean(env.MAILING_ADDRESS,250);
  if(sender.includes('TODO')||sender.length<10)throw Error('Physical mailing address not configured');
  const content=`Confirm your Tidewater bid digest subscription:\n${confirm}\n\nNo marketing emails will be sent until you confirm. If this wasn't you, ignore this message.\n\nTidewater Advisory LLC\n${sender}\nUnsubscribe: ${unsubscribe}`;
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.FROM_EMAIL,to:[email],subject:'Confirm your Tidewater bid digest subscription',text:content,html:`<p>Confirm your Tidewater bid digest subscription:</p><p><a href="${html(confirm)}">Confirm subscription</a></p><p>No marketing emails will be sent until you confirm. If this wasn't you, ignore this message.</p><hr><p>Tidewater Advisory LLC<br>${html(sender).replaceAll('\n','<br>')}<br><a href="${html(unsubscribe)}">Unsubscribe</a></p>`,headers:{'List-Unsubscribe':`<${unsubscribe}>`}})});
  if(!r.ok){console.error('Email delivery failure',r.status);throw Error('Confirmation email could not be sent');}
}
async function parseBody(req){
  if(Number(req.headers.get('content-length')||0)>MAX_BODY)throw Error('Form too large');
  const ct=req.headers.get('content-type')||'';
  if(ct.includes('application/json')){const raw=await req.text();if(raw.length>MAX_BODY)throw Error('Form too large');return JSON.parse(raw);}
  if(ct.includes('application/x-www-form-urlencoded')||ct.includes('multipart/form-data'))return Object.fromEntries((await req.formData()).entries());
  throw Error('Unsupported content type');
}
async function getAll(env,table){let offset='',rows=[];do{const qs=new URLSearchParams({pageSize:'100'});if(offset)qs.set('offset',offset);const body=await airtable(env,table,{query:qs.toString()});rows.push(...body.records);offset=body.offset||'';}while(offset);return rows;}
async function makeMatches(env,prospectId,values,score) {
  // Matching suggestions are NOT reservations: holder is not set until a signed engagement.
  try {
    const [rfps,matches]=await Promise.all([getAll(env,'RFPs'),getAll(env,'Matches')]);
    const chosen=new Set(matches.filter(m=>m.fields['Exclusivity Holder']).flatMap(m=>m.fields.RFP||[]));
    const matchesFound=rfps.filter(r=>r.fields.Status==='Open'&&!chosen.has(r.id)&&r.fields['Due Date']>=new Date().toISOString().slice(0,10)
      &&r.fields.Category===values.categories&&r.fields.Jurisdiction===values.jurisdictions).slice(0,5);
    for(const r of matchesFound)await airtable(env,'Matches',{method:'POST',body:{fields:{Match:`${prospectId} / ${r.id}`,Prospect:[prospectId],RFP:[r.id],'Fit Score':Math.min(100,Math.round(score*.35+65)),Status:'offered','Offer Expiry':new Date(Date.now()+48*3600*1000).toISOString()}}});
  }catch(err){console.error('Match follow-up failed',String(err));/* Lead is still safely captured. */}
}
async function createLead(req,env,headers) {
  let fields;
  try{fields=await parseBody(req);}catch{return bad('Invalid form data.',400,headers);}
  if(!fields || typeof fields!=='object'||Array.isArray(fields))return bad('Invalid form data.',400,headers);
  if(clean(fields.website))return json({message:'Request received.'},200,headers); // honeypot, no data stored
  const kind=clean(fields.kind,40);
  if(!allowedKinds.has(kind))return bad('Unknown form type.',400,headers);
  const email=clean(fields.email,254).toLowerCase();
  if(!isEmail(email))return bad('Please enter a valid email address.',422,headers);
  if(fields.consent!=='yes')return bad('Email follow-up consent is required.',422,headers);
  if(!(await verifyTurnstile(fields,env)))return bad('Please complete the verification and try again.',422,headers);
  const name=clean(fields.name,120),business=clean(fields.business,160);
  if(kind!=='newsletter'&&(!name||!business))return bad('Name and business are required.',422,headers);
  const payload={
    'Name':name||email,'Business':business,'Email':email,'Phone':clean(fields.phone,40),
    'Categories':clean(fields.categories,100),'Jurisdictions':clean(fields.jurisdictions,100),
    'Insurance Status':kind==='quiz'?`GL: ${clean(fields.gl,30)}; WC: ${clean(fields.wc,30)}`:'',
    'Registrations':kind==='quiz'?`Entity: ${clean(fields.entity,30)}; Licenses: ${clean(fields.licenses,30)}; Portals: ${clean(fields.portals,30)}; Bond: ${clean(fields.bond,30)}`:'',
    'Staff Size':kind==='quiz'?clean(fields.staff,40):'',
    'Source':clean(fields.source,250)||kind,'Consent Timestamp':now(),
    'Lead Type':kind,'Bid ID':clean(fields.bidId,80),'Notes':clean(fields.notes,2000),
    'Gap List':'','Newsletter Status':kind==='newsletter'?'Pending':''
  };
  let score=0;
  if(kind==='quiz'){
    const answers={};for(const k of ['entity','years','licenses','gl','wc','bond','portals','government','staff','jurisdictions','categories'])answers[k]=clean(fields[k],100);
    if(Object.values(answers).some(v=>!v))return bad('Complete all readiness questions.',422,headers);
    const result=scoreReadiness(answers);score=result.score;
    payload['Readiness Score']=score;payload['Gap List']=result.gaps.join('\n');
  }
  let token='';
  if(kind==='newsletter'){
    if(!env.RESEND_API_KEY||!env.FROM_EMAIL||!env.MAILING_ADDRESS||!env.HMAC_SECRET||!env.WORKER_URL||!env.SITE_URL||env.MAILING_ADDRESS.includes('TODO'))return bad('Newsletter confirmation is not configured yet.',503,headers);
    const raw=crypto.getRandomValues(new Uint8Array(24));token=hex(raw);
    payload['Opt-in Token Hash']=await sha256(token);
    payload['Opt-in Expires At']=new Date(Date.now()+48*3600*1000).toISOString();
  }
  const record=await airtable(env,'Prospects',{method:'POST',body:{fields:payload,typecast:false}});
  if(kind==='newsletter'){
    try{await emailConfirm(env,email,record.id,token);}catch(e){console.error(String(e));return bad('We saved your request but could not deliver the confirmation email. Please contact Tidewater.',502,headers);}
    return json({message:'Check your email. Your subscription is not active until you confirm.'},201,headers);
  }
  if(kind==='quiz')await makeMatches(env,record.id,fields,score);
  return json({message:kind==='bid_packet'?'Request received. We will follow up about the bid packet.':'Request received. We will follow up by email.'},201,headers);
}
async function confirm(env,url){
  const token=clean(url.searchParams.get('token'),100);
  if(!/^[a-f0-9]{48}$/.test(token))return Response.redirect(env.SITE_URL+'/newsletter-invalid',302);
  const hash=await sha256(token);
  const q=new URLSearchParams({filterByFormula:`AND({Opt-in Token Hash}='${hash}',{Newsletter Status}='Pending')`,maxRecords:'1'});
  const result=await airtable(env,'Prospects',{query:q.toString()});const record=result.records[0];
  if(!record||Date.parse(record.fields['Opt-in Expires At']||'')<Date.now())return Response.redirect(env.SITE_URL+'/newsletter-invalid',302);
  await airtable(env,'Prospects',{method:'PATCH',id:record.id,body:{fields:{'Newsletter Status':'Confirmed','Opt-in Token Hash':'','Opt-in Expires At':null}}});
  return Response.redirect(env.SITE_URL+'/newsletter-confirmed',302);
}
async function unsubscribe(env,url){
  const record=clean(url.searchParams.get('record'),100),sig=clean(url.searchParams.get('sig'),128);
  if(!/^rec[a-zA-Z0-9]+$/.test(record)||!/^[a-f0-9]{64}$/.test(sig))return bad('Invalid unsubscribe link.');
  if(!env.HMAC_SECRET)return bad('Not configured.',503);
  const expected=await signature(env,record);
  if(!safeCompare(expected,sig))return bad('Invalid unsubscribe link.',403);
  await airtable(env,'Prospects',{method:'PATCH',id:record,body:{fields:{'Newsletter Status':'Unsubscribed'}}});
  return Response.redirect(env.SITE_URL+'/newsletter-unsubscribed',302);
}
export default {
 async fetch(req,env) {
  const url=new URL(req.url);const path=url.pathname.replace(/\/$/,'')||'/';const c=cors(req,env);
  if(path==='/health')return json({status:'ok'});
  if(path==='/api/confirm'&&req.method==='GET')try{return await confirm(env,url)}catch(e){console.error(String(e));return bad('Confirmation failed.',500);}
  if(path==='/api/unsubscribe'&&['GET','POST'].includes(req.method))try{
    if(req.method==='POST'){const f=await req.formData();const u=new URL(req.url);u.searchParams.set('record',clean(f.get('record')));u.searchParams.set('sig',clean(f.get('sig')));return await unsubscribe(env,u);}
    return await unsubscribe(env,url);
  }catch(e){console.error(String(e));return bad('Unsubscribe request failed.',500);}
  if(path!=='/api/lead')return bad('Not found.',404);
  if(req.method==='OPTIONS')return c?new Response(null,{status:204,headers:c}):bad('Origin not allowed.',403);
  if(req.method!=='POST')return bad('Method not allowed.',405);
  if(req.headers.has('origin')&&!c)return bad('Origin not allowed.',403);
  try{return await createLead(req,env,c||{});}catch(e){console.error(String(e));return bad('Unable to save your request. Please try again later.',503,c||{});}
 }
};
