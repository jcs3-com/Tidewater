import {scoreReadiness} from '../../public/scripts/score.js';
import {bidDeskTiers,tierForContractValue} from '../../public/scripts/pricing.js';

const MAX_BODY = 16000;
async function verifyTurnstile(fields,env) {
  if(!env.TURNSTILE_SECRET) return true; // Opt-in protection; strongly recommended in production.
  const token=clean(fields['cf-turnstile-response'],4096);
  if(!token) return false;
  const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body});
  return res.ok && (await res.json()).success===true;
}

// Inbound solicitation filter. Real Tidewater enquiries are about bids, funding and operations; vendor
// pitches (SEO/AEO, web design, lead lists) are accepted with a neutral 200 and not stored, like the honeypot.
// Two or more distinct signals are required so a single passing mention never drops a genuine lead.
const PITCH_SIGNALS = [
  /\bSEO\b|search engine optimi[sz]ation/i,
  /\b(AEO|GEO)\b|answer engine optimi[sz]ation|generative engine optimi[sz]ation/i,
  /\brank(ing)?\b[^.]{0,40}\b(google|bing|search)\b|first page of google/i,
  /visibility on (google|bing)|discoverable on ai platforms/i,
  /\b(backlinks?|guest post|link building|domain authority)\b/i,
  /(web|website) (design|redesign|development) (services|agency|expertise)|squarespace|shopify|wix|wordpress|godaddy/i,
  /(reply|respond) with your (phone|number|contact)|provide your name, contact information/i,
  /\b(lead generation|email list|b2b leads|appointment setting) (services|agency)\b/i,
  /i (was going through|checked|came across|noticed) your website/i
];
export function isVendorPitch(text) {
  const t = String(text || '');
  return PITCH_SIGNALS.filter(rx => rx.test(t)).length >= 2;
}
const urlCount = t => (String(t || '').match(/https?:\/\/|www\.[a-z0-9-]+\./gi) || []).length;
const MAX_LINKS = 2;
// Browsers always send Origin on fetch/form POSTs. A POST with neither Origin nor a same-origin Referer is a
// scripted submission; reject it so server-to-server bots cannot bypass the CORS origin check.
function sameOriginRequest(req, env) {
  const allowed = env.ALLOWED_ORIGIN || 'http://localhost:4321';
  const origin = req.headers.get('Origin');
  if (origin) return origin === allowed;
  const ref = req.headers.get('Referer');
  try { return Boolean(ref) && new URL(ref).origin === allowed; } catch { return false; }
}

const allowedKinds = new Set(['contact','bid_packet','quiz','restaurant_finder']);
// Opportunity Finder (restaurant path) answers are validated against fixed choices; free text is length-capped.
const RESTAURANT = {
  location:new Set(['washington-dc','maryland','northern-virginia','charlottesville','virginia-other','other']),
  businessType:new Set(['independent-restaurant','restaurant-group','bar','cafe-bakery','caterer','food-producer','hotel-venue','nonprofit','farmer','market-distributor','other']),
  tenure:new Set(['own','lease','unsure']),
  interests:new Set(['funding','efficiency','equipment','operations','food-waste'])
};
const PROJECT_SERVICE = {funding:'Funding & Incentives',efficiency:'Operational Performance',equipment:'Operational Performance',operations:'Operational Performance','food-waste':'Food Waste & Resource Recovery'};
const CONTACT_PREFS = new Set(['email','phone','either']);
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
async function signature(env,record){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.HMAC_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(record)));}
const safeCompare=(a,b)=>a.length===b.length&&Array.from(a).reduce((acc,ch,i)=>acc|(ch.charCodeAt(0)^b.charCodeAt(i)),0)===0;
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
async function makeRestaurantLead(env,business,r,prospectId){
  // Best-effort pipeline row in the private Restaurant Projects tracker; the Prospect record above is authoritative.
  try{
    const services=[...new Set(r.interests.map(i=>PROJECT_SERVICE[i]).filter(Boolean))];
    await airtable(env,'Restaurant Projects',{method:'POST',body:{fields:{'Project':`${business} — Opportunity Finder lead`,'Client / Organization':business,'Service':services,'Location':r.location,'Stage':'Lead','Next Action':'Qualify the request and reply with a scoped next step.','Notes':`Website Opportunity Finder submission. Prospect ${prospectId}. Business type ${r.businessType}; tenure ${r.tenure}.`},typecast:false}});
  }catch(err){console.error('Restaurant project follow-up failed',String(err));}
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
  const freeText=[fields.notes,fields.services,fields.business,fields.name].map(v=>clean(v,2000)).join('\n');
  if(urlCount(freeText)>MAX_LINKS)return bad('Please remove extra links from your message; two are enough for us to find the solicitation.',422,headers);
  if(kind==='contact'&&isVendorPitch(freeText))return json({message:'Request received.'},200,headers); // vendor pitch, not stored
  const name=clean(fields.name,120),business=clean(fields.business,160);
  if(!name||!business)return bad('Name and business are required.',422,headers);
  const pref=clean(fields.contactPreference,20);
  const noteLines=[];
  if(pref){if(!CONTACT_PREFS.has(pref))return bad('Choose a follow-up preference.',422,headers);noteLines.push(`Contact preference: ${pref}`);}
  if(clean(fields.services,600))noteLines.push(`Services: ${clean(fields.services,600)}`);
  let restaurant=null;
  if(kind==='restaurant_finder'){
    const interests=clean(fields.interests,200).split(',').map(x=>x.trim()).filter(Boolean);
    restaurant={location:clean(fields.location,40),businessType:clean(fields.businessType,40),tenure:clean(fields.tenure,20),interests};
    if(!RESTAURANT.location.has(restaurant.location)||!RESTAURANT.businessType.has(restaurant.businessType)||!RESTAURANT.tenure.has(restaurant.tenure)||!interests.length||interests.some(i=>!RESTAURANT.interests.has(i)))return bad('Complete the project questions.',422,headers);
    noteLines.push(`Restaurant: ${restaurant.businessType}; location ${restaurant.location}; tenure ${restaurant.tenure}; interests ${interests.join(', ')}`);
  }
  if(clean(fields.notes,2000))noteLines.push(clean(fields.notes,2000));
  const payload={
    'Name':name,'Business':business,'Email':email,'Phone':clean(fields.phone,40),
    'Categories':kind==='restaurant_finder'?`restaurant:${restaurant.businessType}`:clean(fields.categories,100),'Jurisdictions':kind==='restaurant_finder'?restaurant.location:clean(fields.jurisdictions,100),
    'Insurance Status':kind==='quiz'?`GL: ${clean(fields.gl,30)}; WC: ${clean(fields.wc,30)}`:'',
    'Registrations':kind==='quiz'?`Entity: ${clean(fields.entity,30)}; Licenses: ${clean(fields.licenses,30)}; Portals: ${clean(fields.portals,30)}; Bond: ${clean(fields.bond,30)}`:'',
    'Staff Size':kind==='quiz'?clean(fields.staff,40):'',
    'Source':clean(fields.source,250)||kind,'Consent Timestamp':now(),
    'Lead Type':kind,'Bid ID':clean(fields.bidId,80),'Notes':noteLines.join('\n').slice(0,4000),
    'Gap List':''
  };
  let score=0;
  if(kind==='quiz'){
    const answers={};for(const k of ['entity','years','licenses','gl','wc','bond','portals','government','staff','jurisdictions','categories'])answers[k]=clean(fields[k],100);
    if(Object.values(answers).some(v=>!v))return bad('Complete all readiness questions.',422,headers);
    const result=scoreReadiness(answers);score=result.score;
    payload['Readiness Score']=score;payload['Gap List']=result.gaps.join('\n');
  }
  const record=await airtable(env,'Prospects',{method:'POST',body:{fields:payload,typecast:false}});
  if(kind==='quiz')await makeMatches(env,record.id,fields,score);
  if(kind==='restaurant_finder')await makeRestaurantLead(env,business,restaurant,record.id);
  return json({message:kind==='bid_packet'?'Request received. We will follow up about the bid packet.':'Request received. We will follow up by email.'},201,headers);
}
// P2 gated checkout for Single Bid Architecture. OFF unless CHECKOUT_ENABLED=1 and Stripe is configured.
// A payment link is only valid for a written, qualified quote: the operator issues an HMAC-signed token
// "<prospectRecordId>.<tierId>.<expiryEpochSeconds>.<signature>" after confirming fit, tier and signed terms.
// The amount always comes from the server-side tier table, never from the browser.
export function signQuote(env,prospect,tierId,expires){return signature(env,`quote:${prospect}.${tierId}.${expires}`);}
const RFP_ID=/^rec[a-zA-Z0-9]{14}$/;
async function stripeSession(env,form){
  const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'content-type':'application/x-www-form-urlencoded'},body:form});
  if(!r.ok){console.error('Stripe session failed',r.status);return null;}
  return (await r.json()).url||null;
}
// Listing checkout: a visitor buys one bid straight from an Open listing on the feed. The server reads the
// listing from Airtable and prices it from the tier table; the browser sends only the record id. By owner
// decision (2026-11-05) there is no availability check: duplicate purchases are resolved by hand after
// payment. Listings marked Excluded (Tidewater has a conflict) are not for sale.
async function listingCheckout(env,headers,rfpId){
  if(!RFP_ID.test(rfpId))return bad('This listing is not available.',404,headers);
  let rec;try{rec=await airtable(env,'RFPs',{id:rfpId});}catch{return bad('This listing is not available.',404,headers);}
  const f=rec.fields||{};const today=new Date().toISOString().slice(0,10);
  if(f.Status!=='Open'||!/^\d{4}-\d{2}-\d{2}$/.test(f['Due Date']||'')||f['Due Date']<today||f['Listing Badge']==='Excluded')return bad('This listing is not available.',410,headers);
  const tier=tierForContractValue(f['Est. Value'])||bidDeskTiers[0];
  const jur=clean(f.Jurisdiction,80),slug=clean(f.Slug,160);
  const back=/^[a-z0-9-]+$/.test(jur)&&/^[a-z0-9-]+$/.test(slug)?`${env.SITE_URL}/bids/${jur}/${slug}`:`${env.SITE_URL}/bids`;
  const name=`Bid on this with Tidewater: ${clean(f.Title,200)}`.slice(0,250);
  // Bill against the fixed Stripe product for the tier when configured (clean reporting); the amount still
  // comes from the server tier table. Without a product id, fall back to an inline product.
  const productId=tier.id==='sba-2'?env.STRIPE_PRODUCT_TIER2:env.STRIPE_PRODUCT_TIER1;
  const product=/^prod_[A-Za-z0-9]{6,40}$/.test(productId||'')?{'line_items[0][price_data][product]':productId}:{'line_items[0][price_data][product_data][name]':name};
  const form=new URLSearchParams({mode:'payment',success_url:`${env.SITE_URL}/engagement-received`,cancel_url:back,
    'line_items[0][quantity]':'1','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(tier.price*100),
    ...product,'payment_intent_data[description]':name,'metadata[listing]':clean(f.Title,400),'phone_number_collection[enabled]':'true',
    'custom_fields[0][key]':'business','custom_fields[0][label][type]':'custom','custom_fields[0][label][custom]':'Business name','custom_fields[0][type]':'text',
    client_reference_id:rfpId,'metadata[rfp]':rfpId,'metadata[tier]':tier.id,'payment_intent_data[metadata][rfp]':rfpId});
  const url=await stripeSession(env,form);
  return url?json({url},200,headers):bad('Payment could not be started. No charge was made.',502,headers);
}
async function checkout(req,env,headers){
  if(env.CHECKOUT_ENABLED!=='1')return bad('Online payment is not available yet. Email hello@tidewaterbid.com and we will send a payment link.',503,headers);
  if(!env.STRIPE_SECRET_KEY||!env.SITE_URL)return bad('Payment is not configured.',503,headers);
  let fields;try{fields=await parseBody(req);}catch{return bad('Invalid request.',400,headers);}
  if(fields&&typeof fields==='object'&&fields.rfp!==undefined)return listingCheckout(env,headers,clean(fields.rfp,40));
  if(!env.HMAC_SECRET)return bad('Payment is not configured.',503,headers);
  const [prospect,tierId,expires,sig]=clean(fields.quote,300).split('.');
  if(!/^rec[a-zA-Z0-9]{14}$/.test(prospect||'')||!/^[0-9]{9,11}$/.test(expires||'')||!/^[a-f0-9]{64}$/.test(sig||''))return bad('This payment link is not valid.',403,headers);
  const tier=bidDeskTiers.find(t=>t.id===tierId);
  if(!tier)return bad('This payment link is not valid.',403,headers);
  if(Number(expires)*1000<Date.now())return bad('This payment link has expired. Ask Tidewater for a new one.',410,headers);
  if(!safeCompare(await signQuote(env,prospect,tierId,expires),sig))return bad('This payment link is not valid.',403,headers);
  const form=new URLSearchParams({mode:'payment',success_url:`${env.SITE_URL}/engagement-received`,cancel_url:`${env.SITE_URL}/pricing`,'line_items[0][quantity]':'1','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(tier.price*100),'line_items[0][price_data][product_data][name]':tier.name,client_reference_id:prospect,'metadata[tier]':tier.id,'metadata[prospect]':prospect});
  const url=await stripeSession(env,form);
  return url?json({url},200,headers):bad('Payment could not be started. No charge was made.',502,headers);
}
// Stripe webhook: after a paid listing checkout, mark the listing Secured, record the buyer as a Prospect and
// trigger a rebuild so the badge shows. Verified with STRIPE_WEBHOOK_SECRET (Stripe-Signature, 5-minute window).
export async function stripeSignature(secret,timestamp,payload){
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return hex(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(`${timestamp}.${payload}`)));
}
const PAID_EVENTS=new Set(['checkout.session.completed','checkout.session.async_payment_succeeded']);
async function stripeWebhook(req,env){
  if(!env.STRIPE_WEBHOOK_SECRET)return bad('Not configured.',503);
  const raw=await req.text();if(raw.length>200000)return bad('Too large.',413);
  const parts=Object.fromEntries((req.headers.get('stripe-signature')||'').split(',').map(p=>p.split('=')).filter(p=>p.length===2&&p[0]!=='v1'));
  const sigs=(req.headers.get('stripe-signature')||'').split(',').filter(p=>p.startsWith('v1=')).map(p=>p.slice(3));
  const t=parts.t;
  if(!/^\d{9,11}$/.test(t||'')||Math.abs(Date.now()/1000-Number(t))>300||!sigs.length)return bad('Invalid signature.',400);
  const expected=await stripeSignature(env.STRIPE_WEBHOOK_SECRET,t,raw);
  if(!sigs.some(s=>safeCompare(s,expected)))return bad('Invalid signature.',400);
  let event;try{event=JSON.parse(raw);}catch{return bad('Invalid payload.',400);}
  const s=event?.data?.object||{};const rfp=s.metadata?.rfp;
  // Cards are paid at completion; ACH bank payments clear later and arrive as async_payment_succeeded.
  if(!PAID_EVENTS.has(event.type)||s.payment_status!=='paid'||!RFP_ID.test(rfp||''))return json({received:true});
  const d=s.customer_details||{};
  const business=clean((s.custom_fields||[]).find(c=>c.key==='business')?.text?.value,160);
  await airtable(env,'RFPs',{method:'PATCH',id:rfp,body:{fields:{'Listing Badge':'Secured'},typecast:false}});
  await airtable(env,'Prospects',{method:'POST',body:{fields:{'Name':clean(d.name,120)||'Checkout buyer','Business':business,'Email':clean(d.email,254).toLowerCase(),'Phone':clean(d.phone,40),'Source':'listing checkout','Lead Type':'bid_purchase','Bid ID':rfp,'Consent Timestamp':now(),'Notes':`Paid ${formatCents(s.amount_total)} for listing ${rfp}. Stripe session ${clean(s.id,80)}.`},typecast:false}});
  if(env.PAGES_DEPLOY_HOOK){try{await fetch(env.PAGES_DEPLOY_HOOK,{method:'POST'});}catch(e){console.error('Deploy hook failed',String(e));}}
  return json({received:true});
}
const formatCents=c=>Number.isFinite(c)?'$'+(c/100).toLocaleString('en-US',{minimumFractionDigits:0}):'an unknown amount';
export default {
 async fetch(req,env) {
  const url=new URL(req.url);const path=url.pathname.replace(/\/$/,'')||'/';const c=cors(req,env);
  if(path==='/health')return json({status:'ok'});
  if(path==='/api/checkout'){
    if(req.method==='OPTIONS')return c?new Response(null,{status:204,headers:c}):bad('Origin not allowed.',403);
    if(req.method!=='POST')return bad('Method not allowed.',405);
    if(req.headers.has('origin')&&!c)return bad('Origin not allowed.',403);
    try{return await checkout(req,env,c||{});}catch(e){console.error(String(e));return bad('Payment could not be started. No charge was made.',503,c||{});}
  }
  if(path==='/api/stripe-webhook'){
    if(req.method!=='POST')return bad('Method not allowed.',405);
    try{return await stripeWebhook(req,env);}catch(e){console.error(String(e));return bad('Webhook failed.',500);}
  }
  if(path!=='/api/lead')return bad('Not found.',404);
  if(req.method==='OPTIONS')return c?new Response(null,{status:204,headers:c}):bad('Origin not allowed.',403);
  if(req.method!=='POST')return bad('Method not allowed.',405);
  if(!sameOriginRequest(req,env))return bad('Origin not allowed.',403);
  try{return await createLead(req,env,c||{});}catch(e){console.error(String(e));return bad('Unable to save your request. Please try again later.',503,c||{});}
 }
};
