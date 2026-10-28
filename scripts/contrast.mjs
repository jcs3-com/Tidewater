import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
const token=(name)=>{const m=css.match(new RegExp(`--${name}:(#[0-9A-Fa-f]{6})`));assert.ok(m,`Missing ${name} token`);return m[1]};
const lum=(s)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const [lighter,darker]=[lum(a),lum(b)].sort((x,y)=>y-x);return (lighter+.05)/(darker+.05)};
const pairs=[];
for(const [mode,fg,muted,surfaces] of [
 ['Light',token('ink'),token('muted'),[token('cream'),'#FFFFFF',token('subtle')]],
 ['Dark','#F7F5EF','#C3CFD2',['#1A2C35','#213640','#283F4A']]
])for(const bg of surfaces){pairs.push([`${mode} body on ${bg}`,fg,bg],[`${mode} muted on ${bg}`,muted,bg]);}
pairs.push(
 ['Primary button','#FFFFFF',token('action')],['Dark primary button','#1A2C35','#D8CBB8'],
 ['Reverse panel','#F7F5EF','#243943'],['Reverse muted','#D3DCDE','#243943'],['Deep tide panel','#FFFFFF',token('deep-tide')],
 ['Photo captions','#FFFFFF','#243943'],['Hero text','#243943','#F7F5EF'],['Hero muted','#4B626D','#F7F5EF'],['Muted on subtle',token('muted'),token('subtle')],['Ink on oyster','#243943',token('oyster')],
 ['Light error','#913C40','#FFFFFF'],['Dark error','#FFBDC0','#213B46'],
 ['Light pill',token('pill-text'),token('pill-bg')],['Dark pill','#F7F5EF','#3A535D'],
 ['Sample chip','#422A07','#F0D9AE'],['Open chip','#15432B','#D1E3D8'],
 ['Closed chip','#512D2D','#E2D8D8'],['Awarded chip','#203F65','#D5DDEC']
);
for(const [name,fg,bg] of pairs){const ratio=contrast(fg,bg);console.log(`${name}: ${ratio.toFixed(2)}:1`);assert.ok(ratio>=4.5,`${name} fails WCAG AA: ${ratio}`);}
// Non-text contrast (WCAG 1.4.11): form field borders must reach 3:1 against the page.
for(const [name,fg,bg] of [['Field border light',token('field-line'),token('page')],['Field border dark','#8FA6AF','#1A2C35']]){const r=contrast(fg,bg);console.log(`${name}: ${r.toFixed(2)}:1`);assert.ok(r>=3,`${name} fails 3:1: ${r}`);}
assert.ok(css.includes('@media(max-width:970px)'), 'No mobile breakpoint');
console.log('All enumerated text/background pairs pass WCAG AA.');
