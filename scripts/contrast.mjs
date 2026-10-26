import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
const token=(name)=>{const m=css.match(new RegExp(`--${name}:(#[0-9A-Fa-f]{6})`));assert.ok(m,`Missing ${name} token`);return m[1]};
const lum=(s)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const [lighter,darker]=[lum(a),lum(b)].sort((x,y)=>y-x);return (lighter+.05)/(darker+.05)};
const pairs=[];
for(const [mode,fg,muted,surfaces] of [
 ['Light',token('ink'),token('muted'),[token('cream'),'#FFFFFF',token('subtle')]],
 ['Dark','#F5F5F0','#C6D5D9',['#182C35','#213B46','#28434E']]
])for(const bg of surfaces){pairs.push([`${mode} body on ${bg}`,fg,bg],[`${mode} muted on ${bg}`,muted,bg]);}
pairs.push(
 ['Primary button','#FFFFFF',token('action')],['Dark primary button','#182C35','#D6E5E7'],
 ['Reverse panel','#FFFFFF',token('petrol')],['Reverse muted','#DCE7E8',token('petrol')],
 ['Photo captions','#FFFFFF','#243943'],['Hero text','#243943','#F5F5F0'],['Hero muted','#4B626D','#F5F5F0'],
 ['Light error','#913C40','#FFFFFF'],['Dark error','#FFBDC0','#213B46'],
 ['Light pill',token('pill-text'),token('pill-bg')],['Dark pill','#F5F5F0','#3C5660'],
 ['Sample chip','#422A07','#F0D9AE'],['Open chip','#15432B','#D1E3D8'],
 ['Closed chip','#512D2D','#E2D8D8'],['Awarded chip','#203F65','#D5DDEC']
);
for(const [name,fg,bg] of pairs){const ratio=contrast(fg,bg);console.log(`${name}: ${ratio.toFixed(2)}:1`);assert.ok(ratio>=4.5,`${name} fails WCAG AA: ${ratio}`);}
assert.ok(css.includes('@media(max-width:970px)'), 'No mobile breakpoint');
console.log('All enumerated text/background pairs pass WCAG AA.');
