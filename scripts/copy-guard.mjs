import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../src/pages/',import.meta.url));
function walk(p){return readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(join(p,d.name)):[join(p,d.name)]);}
const source=walk(root).filter(p=>p.endsWith('.astro')).map(p=>readFileSync(p,'utf8')).join('\n');
for(const forbidden of [/success[ -]?fee/i,/commission\b/i,/percent(?:age)?\s+of\s+(?:the\s+)?contract\s+value/i,/Read the current/i,/\[\[TODO/]) {
 assert.ok(!forbidden.test(source),`Marketing copy has forbidden or misleading language: ${forbidden}`);
}
for(const statement of ['Tidewater is an independent consultancy','Not affiliated with any government agency','We do not guarantee contract awards']) {
 assert.ok(readFileSync(new URL('../src/layouts/Base.astro',import.meta.url),'utf8').includes(statement),`Missing disclaimer: ${statement}`);
}
assert.ok(readFileSync(new URL('../src/layouts/Base.astro',import.meta.url),'utf8').includes('Funding opportunity at the source.'),'Missing approved tagline in Base layout');
// Owner decision 2026-11-05: no personal legal name as the business entity in the footer or legal pages.
for(const f of ['../src/layouts/Base.astro','../src/pages/terms.astro','../src/pages/privacy.astro']){const t=readFileSync(new URL(f,import.meta.url),'utf8');assert.ok(!/Simpson|trade name of/i.test(t),`Legal name or trade-name statement in ${f}`);}
console.log('Marketing-copy guardrails passed.');
