import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const repo=new URL('..',import.meta.url).pathname;
const root=new URL('../src/pages/',import.meta.url).pathname;
function walk(p){return readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(join(p,d.name)):[join(p,d.name)]);}
const source=walk(root).filter(p=>p.endsWith('.astro')).map(p=>readFileSync(p,'utf8')).join('\n');
for(const forbidden of [/success[ -]?fee/i,/commission\b/i,/percent(?:age)?\s+of\s+(?:the\s+)?contract\s+value/i]) {
 assert.ok(!forbidden.test(source),`Marketing copy has forbidden or misleading language: ${forbidden}`);
}
for(const statement of ['Tidewater is a trade name of Tidewater Advisory LLC','Not affiliated with any government agency','We do not guarantee contract awards']) {
 assert.ok(readFileSync(new URL('../src/layouts/Base.astro',import.meta.url),'utf8').includes(statement),`Missing disclaimer: ${statement}`);
}
// Privacy: only the business domain may appear as a contact address in anything published
// (site source, public assets) or in the public repository docs.
const published=['src','public','docs','functions','worker'].map(d=>join(repo,d)).filter(existsSync).flatMap(walk)
  .concat(['README.md','LAUNCH_CHECKLIST.md','.env.example'].map(f=>join(repo,f)).filter(existsSync))
  .filter(p=>/\.(astro|ts|js|mjs|md|json|txt|html|svg|xml|example)$/.test(p)||p.endsWith('.env.example'));
const personal=/[\w.+-]+@(?:gmail|googlemail|yahoo|hotmail|outlook|live|icloud|me|aol|proton(?:mail)?)\.(?:com|me)\b/i;
for(const file of published){
 const hit=readFileSync(file,'utf8').match(personal);
 assert.ok(!hit,`Personal email address published in ${file.replace(repo,'')}: ${hit?.[0]}`);
}
console.log('Marketing-copy guardrails passed.');
