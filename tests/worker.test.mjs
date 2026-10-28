import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../worker/src/index.js';
import {scoreReadiness} from '../public/scripts/score.js';

const env={AIRTABLE_PAT:'test-secret',AIRTABLE_BASE_ID:'appTEST',ALLOWED_ORIGIN:'https://example.test',SITE_URL:'https://example.test',WORKER_URL:'https://api.example.test',RESEND_API_KEY:'test-key',FROM_EMAIL:'Tidewater <hello@example.test>',MAILING_ADDRESS:'123 Test Street, Example City, DC 20001',HMAC_SECRET:'12345678901234567890123456789012'};
const req=(data,origin='https://example.test')=>new Request('https://api.example.test/api/lead',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)});
let requests=[];
const oldFetch=globalThis.fetch;
function mock(){requests=[];globalThis.fetch=async(input,init={})=>{const url=String(input);requests.push({url,init});if(url.includes('api.resend.com'))return new Response(JSON.stringify({id:'email1'}),{status:200});if(url.includes('/Prospects')&&init.method==='POST')return new Response(JSON.stringify({id:'recLead123',fields:JSON.parse(init.body).fields}));if(url.includes('/Prospects?'))return new Response(JSON.stringify({records:[{id:'recLead123',fields:{'Opt-in Expires At':new Date(Date.now()+3600000).toISOString()}}]}));if(url.includes('/Prospects/')&&init.method==='PATCH')return new Response(JSON.stringify({id:'recLead123'}));if(url.includes('/RFPs'))return new Response(JSON.stringify({records:[{id:'recRfp123',fields:{Status:'Open',Category:'catering',Jurisdiction:'washington-dc','Due Date':'2099-01-01'}}]}));if(url.includes('/Matches')&&init.method==='GET')return new Response(JSON.stringify({records:[]}));if(url.includes('/Matches')&&init.method==='POST')return new Response(JSON.stringify({id:'recMatch1'}));return new Response('{}',{status:404});};}
const contact={kind:'contact',name:'Test Person',business:'Demo LLC',email:'test@example.org',consent:'yes',source:'test'};

test('readiness score is bounded and highlights gaps',()=>{const result=scoreReadiness({entity:'no',years:'under1',licenses:'no',gl:'no',wc:'no',bond:'no',portals:'no',government:'no',staff:'solo',categories:'catering',jurisdictions:'washington-dc'});assert.ok(result.score>=0&&result.score<=100);assert.ok(result.gaps.length>=5);});
test('form validates email and explicit consent',async()=>{mock();const noConsent=await handler.fetch(req({...contact,consent:'no'}),env);assert.equal(noConsent.status,422);const badEmail=await handler.fetch(req({...contact,email:'not-email'}),env);assert.equal(badEmail.status,422);assert.equal(requests.length,0);globalThis.fetch=oldFetch;});
test('origin-restricted CORS and honeypot',async()=>{mock();assert.equal((await handler.fetch(req(contact,'https://evil.test'),env)).status,403);const honeypot=await handler.fetch(req({...contact,website:'robot'}),env);assert.equal(honeypot.status,200);assert.equal(requests.length,0);globalThis.fetch=oldFetch;});
test('contact form writes one Airtable prospect',async()=>{mock();const response=await handler.fetch(req(contact),env);assert.equal(response.status,201);const save=requests.find(r=>r.url.includes('/Prospects')&&r.init.method==='POST');assert.ok(save);const fields=JSON.parse(save.init.body).fields;assert.equal(fields['Email'],'test@example.org');assert.equal(fields['Lead Type'],'contact');assert.ok(fields['Consent Timestamp']);globalThis.fetch=oldFetch;});
test('quiz computes server score and creates a prospective match without reserving exclusivity',async()=>{mock();const answers={kind:'quiz',name:'Test',business:'Food Biz',email:'test@example.org',consent:'yes',entity:'registered',years:'2plus',licenses:'yes',gl:'yes',wc:'yes',bond:'yes',portals:'yes',government:'no',staff:'5to9',jurisdictions:'washington-dc',categories:'catering'};const result=await handler.fetch(req(answers),env);assert.equal(result.status,201);const saves=requests.filter(r=>r.init.method==='POST');const prospect=JSON.parse(saves.find(x=>x.url.includes('/Prospects')).init.body).fields;assert.ok(prospect['Readiness Score']>0);const match=JSON.parse(saves.find(x=>x.url.includes('/Matches')).init.body).fields;assert.equal(match.Status,'offered');assert.ok(match['Offer Expiry']);assert.ok(!match['Exclusivity Holder']);globalThis.fetch=oldFetch;});
test('sample, draft and expired bids are not offered in matching', async()=>{mock();globalThis.fetch=async(input,init={})=>{const url=String(input);requests.push({url,init});if(url.includes('Prospects')&&init.method==='POST')return new Response(JSON.stringify({id:'recLead123'}));if(url.includes('RFPs'))return new Response(JSON.stringify({records:[{id:'recS',fields:{Status:'SAMPLE',Category:'catering',Jurisdiction:'washington-dc','Due Date':'2099-01-01'}}]}));if(url.includes('Matches'))return new Response(JSON.stringify({records:[]}));return new Response('{}',{status:404});};const answers={kind:'quiz',name:'Test',business:'Demo LLC',email:'test@example.org',consent:'yes',entity:'registered',years:'2plus',licenses:'yes',gl:'yes',wc:'yes',bond:'yes',portals:'yes',government:'no',staff:'1to4',jurisdictions:'washington-dc',categories:'catering'};const response=await handler.fetch(req(answers),env);assert.equal(response.status,201);assert.equal(requests.filter(r=>r.url.includes('/Matches')&&r.init.method==='POST').length,0);globalThis.fetch=oldFetch;});
test('restaurant finder writes a prospect with validated answers and a private pipeline row',async()=>{
 mock();
 const extra=globalThis.fetch;globalThis.fetch=async(input,init={})=>{if(String(input).includes('/Restaurant%20Projects')){requests.push({url:String(input),init});return new Response(JSON.stringify({id:'recProj1'}));}return extra(input,init);};
 const base={kind:'restaurant_finder',name:'Test',business:'Oyster Bar LLC',email:'test@example.org',consent:'yes',contactPreference:'phone',location:'charlottesville',businessType:'independent-restaurant',tenure:'lease',interests:'funding,food-waste'};
 const ok=await handler.fetch(req(base),env);assert.equal(ok.status,201);
 const prospect=JSON.parse(requests.find(r=>r.url.includes('/Prospects')&&r.init.method==='POST').init.body).fields;
 assert.equal(prospect['Lead Type'],'restaurant_finder');assert.equal(prospect['Jurisdictions'],'charlottesville');assert.match(prospect['Notes'],/Contact preference: phone/);
 const project=JSON.parse(requests.find(r=>r.url.includes('/Restaurant%20Projects')).init.body).fields;
 assert.equal(project.Stage,'Lead');assert.deepEqual(project.Service,['Funding & Incentives','Food Waste & Resource Recovery']);
 requests=[];
 assert.equal((await handler.fetch(req({...base,interests:'free-money'}),env)).status,422);
 assert.equal((await handler.fetch(req({...base,location:'mars'}),env)).status,422);
 assert.equal(requests.length,0);
 globalThis.fetch=oldFetch;
});
test('checkout is disabled by default and only accepts a signed, unexpired, server-priced quote',async()=>{
 const {signQuote}=await import('../worker/src/index.js');
 const creq=(body)=>new Request('https://api.example.test/api/checkout',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await handler.fetch(creq({quote:'x'}),env)).status,503);
 const on={...env,CHECKOUT_ENABLED:'1',STRIPE_SECRET_KEY:'sk_test_x'};
 const exp=String(Math.floor(Date.now()/1000)+3600);
 const good=`recAAAAAAAAAAAAAA.sba-2.${exp}.${await signQuote(on,'recAAAAAAAAAAAAAA','sba-2',exp)}`;
 let stripeBody='';globalThis.fetch=async(input,init={})=>{if(String(input).includes('api.stripe.com')){stripeBody=String(init.body);return new Response(JSON.stringify({url:'https://checkout.stripe.test/s'}));}return new Response('{}',{status:404});};
 assert.equal((await handler.fetch(creq({quote:good.replace('sba-2','sba-1')}),on)).status,403);
 assert.equal((await handler.fetch(creq({quote:good.slice(0,-1)+'0'}),on)).status,403);
 const past=String(Math.floor(Date.now()/1000)-10);
 assert.equal((await handler.fetch(creq({quote:`recAAAAAAAAAAAAAA.sba-1.${past}.${await signQuote(on,'recAAAAAAAAAAAAAA','sba-1',past)}`}),on)).status,410);
 const res=await handler.fetch(creq({quote:good}),on);assert.equal(res.status,200);
 assert.match(stripeBody,/unit_amount%5D=250000/);
 globalThis.fetch=oldFetch;
});
test('scripted POST without Origin or same-origin Referer is rejected; same-origin Referer is accepted',async()=>{
 mock();
 const noOrigin=new Request('https://api.example.test/api/lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(contact)});
 assert.equal((await handler.fetch(noOrigin,env)).status,403);
 const foreignRef=new Request('https://api.example.test/api/lead',{method:'POST',headers:{'content-type':'application/json',referer:'https://evil.test/x'},body:JSON.stringify(contact)});
 assert.equal((await handler.fetch(foreignRef,env)).status,403);
 assert.equal(requests.length,0);
 const sameRef=new Request('https://api.example.test/api/lead',{method:'POST',headers:{'content-type':'application/json',referer:'https://example.test/contact'},body:JSON.stringify(contact)});
 assert.equal((await handler.fetch(sameRef,env)).status,201);
 globalThis.fetch=oldFetch;
});
test('vendor pitches are acknowledged but never stored; genuine enquiries still save',async()=>{
 mock();
 const pitch={...contact,name:'Daniel Edwards',business:'Digital Marketing Agency',notes:'We checked your website and noticed that its visibility on Google and Bing appears to be lower than it should be. Some SEO (Search Engine Optimization) steps may be incomplete. Just reply with your phone number and a time to call.'};
 const r=await handler.fetch(req(pitch),env);
 assert.equal(r.status,200);
 assert.equal(requests.filter(x=>x.url.includes('/Prospects')).length,0);
 const genuine={...contact,notes:'We cater 200-person events in Silver Spring and want help with Montgomery County open solicitation 1163448.'};
 assert.equal((await handler.fetch(req(genuine),env)).status,201);
 globalThis.fetch=oldFetch;
});
test('messages with more than two links are refused before storage',async()=>{
 mock();
 const spam={...contact,notes:'https://a.example https://b.example https://c.example'};
 assert.equal((await handler.fetch(req(spam),env)).status,422);
 assert.equal(requests.length,0);
 globalThis.fetch=oldFetch;
});
test('newsletter kind and its endpoints are retired',async()=>{
 mock();
 assert.equal((await handler.fetch(req({kind:'newsletter',email:'a@example.org',consent:'yes'}),env)).status,400);
 assert.equal((await handler.fetch(new Request('https://api.example.test/api/confirm?token='+'f'.repeat(48)),env)).status,404);
 assert.equal((await handler.fetch(new Request('https://api.example.test/api/unsubscribe?record=recX&sig=0'),env)).status,404);
 assert.equal(requests.length,0);
 globalThis.fetch=oldFetch;
});
