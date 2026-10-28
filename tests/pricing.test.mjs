import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tierForContractValue,bidDeskTiers,minimumQuote,BID_DESK_FLOOR} from '../public/scripts/pricing.js';
import {matchBids,matchPrograms,programStatus,classifyProgram} from '../public/scripts/finder-logic.js';

test('Bid Desk tier boundary: $99,999 is $1,250 and exactly $100,000 is $2,500',()=>{
  assert.equal(tierForContractValue(99999).price,1250);
  assert.equal(tierForContractValue(99999.99).price,1250);
  assert.equal(tierForContractValue(100000).price,2500);
  assert.equal(tierForContractValue('$100,000').price,2500);
  assert.equal(tierForContractValue(0).price,1250);
  assert.equal(tierForContractValue(2500000).price,2500);
  for(const v of [null,undefined,'',NaN,-5,'abc'])assert.equal(tierForContractValue(v),null);
});
test('no paid Bid Desk offer below the $1,250 floor; custom quotes never below the tier',()=>{
  assert.equal(BID_DESK_FLOOR,1250);
  assert.ok(bidDeskTiers.every(t=>t.price>=BID_DESK_FLOOR));
  assert.deepEqual(bidDeskTiers.map(t=>t.price),[1250,2500]);
  assert.equal(minimumQuote(250000),2500);assert.equal(minimumQuote(null),1250);
});
test('public page sources carry no retired Bid Desk prices',()=>{
  const root=fileURLToPath(new URL('../src/',import.meta.url));
  const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(join(p,d.name)):[join(p,d.name)]);
  const text=walk(root).filter(p=>/\.(astro|ts)$/.test(p)).map(p=>readFileSync(p,'utf8')).join('\n');
  for(const retired of [/\$295/,/\$250\s*[–-]\s*\$500/,/\$1,500\s*[–-]\s*\$3,000/,/Bid Viability Review/i])assert.ok(!retired.test(text),`retired price present: ${retired}`);
});
const today='2026-10-28';
test('finder never shows expired, unsourced or stale-verified opportunities as open',()=>{
  assert.equal(programStatus({status:'Open',deadline:'2026-10-27',verified:'2026-10-27'},today),'Closed');
  assert.equal(programStatus({status:'Open',verified:'2026-08-01'},today),'Unverified');
  assert.equal(programStatus({status:'Open',deadline:'2026-12-09',verified:'2026-10-27'},today),'Open');
  const bids=[{category:'catering',jurisdiction:'washington-dc',dueDate:'2026-10-27',source:'https://x.gov/a'},{category:'catering',jurisdiction:'washington-dc',dueDate:'2026-11-30',source:'https://x.gov/b',estimatedValue:100000},{category:'catering',jurisdiction:'washington-dc',dueDate:'2026-11-30',source:''},{category:'catering',jurisdiction:'annapolis-md',dueDate:'2026-12-01',source:'https://x.gov/c',estimatedValue:99999}];
  const r=matchBids(bids,{category:'catering',jurisdiction:'washington-dc'},today);
  assert.equal(r.exact.length,1);assert.equal(r.exact[0].tier.price,2500);
  assert.equal(r.sameCategory[0].tier.price,1250);
});
test('finder labels grants, rebates, sponsor-required programs and owner-only programs',()=>{
  const sponsor=classifyProgram({type:'Grant',status:'Open',verified:'2026-10-27',applicants:'Virginia political subdivisions apply; private food businesses must collaborate with locality.'},today);
  assert.ok(sponsor.sponsorRequired);assert.ok(sponsor.labels.some(l=>l.text==='Grant'));
  const progs=[{program:'A',type:'Rebate / Incentive',status:'Open',verified:'2026-10-27',geography:['DC'],fit:['Operational Performance']},{program:'B',type:'Grant',status:'Monitoring',verified:'2026-10-27',geography:['DC'],fit:['Food Waste & Resource Recovery']},{program:'C',type:'Grant',status:'Open',verified:'2026-10-27',geography:['Maryland'],fit:['Funding & Incentives'],applicants:'Eligible Maryland building owners; not automatically available to tenants.'}];
  const dc=matchPrograms(progs,{location:'washington-dc',interests:['equipment','food-waste']},today);
  assert.deepEqual(dc.current.map(p=>p.program),['A']);assert.deepEqual(dc.watch.map(p=>p.program),['B']);
  const md=matchPrograms(progs,{location:'maryland',interests:['funding'],tenure:'lease'},today);
  assert.ok(md.current[0].ownerCaution);
  assert.equal(matchPrograms(progs,{location:'charlottesville',interests:['funding']},today).current.length,0);
});
test('finder fallback stays in the visitor region (no Charleston janitorial for DMV leads)',()=>{
 const today='2026-10-28';
 const regions={'montgomery-county-md':'dmv','fairfax-county-va':'dmv','charleston-sc':'charleston'};
 const bids=[
  {category:'janitorial',jurisdiction:'charleston-sc',dueDate:'2026-12-08',source:'https://x.test',estimatedValue:null},
  {category:'janitorial',jurisdiction:'fairfax-county-va',dueDate:'2026-12-01',source:'https://y.test',estimatedValue:null}
 ];
 const dmv=matchBids(bids,{category:'janitorial',jurisdiction:'montgomery-county-md'},today,regions);
 assert.deepEqual(dmv.sameCategory.map(b=>b.jurisdiction),['fairfax-county-va']);
 const sc=matchBids(bids,{category:'janitorial',jurisdiction:'charleston-sc'},today,regions);
 assert.equal(sc.exact.length,1);assert.equal(sc.sameCategory.length,0);
 const legacy=matchBids(bids,{category:'janitorial',jurisdiction:'montgomery-county-md'},today);
 assert.equal(legacy.sameCategory.length,2);
});
