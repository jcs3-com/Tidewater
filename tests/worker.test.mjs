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
test('newsletter stores pending state and sends one confirmation email',async()=>{mock();const result=await handler.fetch(req({kind:'newsletter',email:'subscribe@example.org',consent:'yes'}),env);assert.equal(result.status,201);const save=requests.find(r=>r.url.includes('/Prospects')&&r.init.method==='POST');const fields=JSON.parse(save.init.body).fields;assert.equal(fields['Newsletter Status'],'Pending');assert.equal(fields['Opt-in Token Hash'].length,64);const msg=requests.find(r=>r.url.includes('api.resend.com'));assert.ok(msg);const email=JSON.parse(msg.init.body);assert.match(email.text,/Unsubscribe:/);assert.match(email.text,/Confirm your Tidewater/);globalThis.fetch=oldFetch;});
test('quiz computes server score and creates a prospective match without reserving exclusivity',async()=>{mock();const answers={kind:'quiz',name:'Test',business:'Food Biz',email:'test@example.org',consent:'yes',entity:'registered',years:'2plus',licenses:'yes',gl:'yes',wc:'yes',bond:'yes',portals:'yes',government:'no',staff:'5to9',jurisdictions:'washington-dc',categories:'catering'};const result=await handler.fetch(req(answers),env);assert.equal(result.status,201);const saves=requests.filter(r=>r.init.method==='POST');const prospect=JSON.parse(saves.find(x=>x.url.includes('/Prospects')).init.body).fields;assert.ok(prospect['Readiness Score']>0);const match=JSON.parse(saves.find(x=>x.url.includes('/Matches')).init.body).fields;assert.equal(match.Status,'offered');assert.ok(match['Offer Expiry']);assert.ok(!match['Exclusivity Holder']);globalThis.fetch=oldFetch;});
test('sample, draft and expired bids are not offered in matching', async()=>{mock();globalThis.fetch=async(input,init={})=>{const url=String(input);requests.push({url,init});if(url.includes('Prospects')&&init.method==='POST')return new Response(JSON.stringify({id:'recLead123'}));if(url.includes('RFPs'))return new Response(JSON.stringify({records:[{id:'recS',fields:{Status:'SAMPLE',Category:'catering',Jurisdiction:'washington-dc','Due Date':'2099-01-01'}}]}));if(url.includes('Matches'))return new Response(JSON.stringify({records:[]}));return new Response('{}',{status:404});};const answers={kind:'quiz',name:'Test',business:'Demo LLC',email:'test@example.org',consent:'yes',entity:'registered',years:'2plus',licenses:'yes',gl:'yes',wc:'yes',bond:'yes',portals:'yes',government:'no',staff:'1to4',jurisdictions:'washington-dc',categories:'catering'};const response=await handler.fetch(req(answers),env);assert.equal(response.status,201);assert.equal(requests.filter(r=>r.url.includes('/Matches')&&r.init.method==='POST').length,0);globalThis.fetch=oldFetch;});
test('double opt-in callback marks pending record confirmed', async()=>{
 mock();
 const token='f'.repeat(48);
 const response=await handler.fetch(new Request(`https://api.example.test/api/confirm?token=${token}`),env);
 assert.equal(response.status,302);
 assert.equal(response.headers.get('location'),'https://example.test/newsletter-confirmed');
 const update=requests.find(r=>r.url.includes('/Prospects/recLead123')&&r.init.method==='PATCH');
 assert.ok(update);
 assert.equal(JSON.parse(update.init.body).fields['Newsletter Status'],'Confirmed');
 globalThis.fetch=oldFetch;
});
test('newsletter unsubscribe requires a valid signed link',async()=>{
 mock();
 const record='recLead123';
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.HMAC_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(record));
 const sig=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
 const result=await handler.fetch(new Request(`https://api.example.test/api/unsubscribe?record=${record}&sig=${sig}`),env);
 assert.equal(result.status,302);
 const update=requests.find(r=>r.url.includes('/Prospects/recLead123')&&r.init.method==='PATCH');
 assert.equal(JSON.parse(update.init.body).fields['Newsletter Status'],'Unsubscribed');
 const denied=await handler.fetch(new Request(`https://api.example.test/api/unsubscribe?record=${record}&sig=${'0'.repeat(64)}`),env);
 assert.equal(denied.status,403);
 globalThis.fetch=oldFetch;
});
