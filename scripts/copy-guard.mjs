import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../src/pages/',import.meta.url));
function walk(p){return readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(join(p,d.name)):[join(p,d.name)]);}
const source=walk(root).filter(p=>p.endsWith('.astro')).map(p=>readFileSync(p,'utf8')).join('\n');
for(const forbidden of [/success[ -]?fee/i,/commission\b/i,/percent(?:age)?\s+of\s+(?:the\s+)?contract\s+value/i]) {
 assert.ok(!forbidden.test(source),`Marketing copy has forbidden or misleading language: ${forbidden}`);
}
for(const statement of ['Tidewater is a trade name of Tidewater Advisory LLC','Not affiliated with any government agency','We do not guarantee contract awards']) {
 assert.ok(readFileSync(new URL('../src/layouts/Base.astro',import.meta.url),'utf8').includes(statement),`Missing disclaimer: ${statement}`);
}
console.log('Marketing-copy guardrails passed.');
