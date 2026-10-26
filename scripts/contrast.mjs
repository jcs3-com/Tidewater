import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
const token=(name)=>{const m=css.match(new RegExp(`--${name}:(#[0-9A-Fa-f]{6})`));assert.ok(m,`Missing ${name} token`);return m[1]};
const lum=(s)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const [lighter,darker]=[lum(a),lum(b)].sort((x,y)=>y-x);return (lighter+.05)/(darker+.05)};
const pairs=[
 ['Light: body',token('ink'),token('cream')],['Light: muted',token('petrol'),token('cream')],
 ['Light: surface',token('ink'),'#FFFDF6'],['Light: action','#FFFFFF',token('oxblood')],
 ['Dark: body',token('cream'),token('ink')],['Dark: muted','#E2DBCB',token('ink')],
 ['Dark: surface',token('cream'),'#252A2B'],['Dark: muted surface','#E2DBCB','#252A2B'],
 ['Dark: pill',token('cream'),'#383E3F'],['Blue panel','#FFFFFF',token('petrol')],
 ['Reverse panel','#FFFFFF','#244759'],['Light: feedback error','#9F3C49','#FFFDF6'],
 ['Dark: feedback error','#FFADB5','#252A2B'],
 ['Sample chip','#422A07','#F0D9AE'],['Open chip','#15432B','#D1E3D8'],
 ['Closed chip','#512D2D','#E2D8D8'],['Awarded chip','#203F65','#D5DDEC']
];
for(const [name,fg,bg] of pairs){const ratio=contrast(fg,bg);console.log(`${name}: ${ratio.toFixed(2)}:1`);assert.ok(ratio>=4.5,`${name} fails WCAG AA: ${ratio}`);}
assert.ok(css.includes('@media(max-width:970px)'), 'No mobile breakpoint');
console.log('All enumerated text/background pairs pass WCAG AA.');
