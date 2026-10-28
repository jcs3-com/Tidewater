// Regenerates raster brand derivatives from the approved engraving and traced vector.
// Usage: node scripts/brand/render-brand-assets.mjs <transparent-engraving.png> <out-dir>
// Requires Playwright Chromium (npx playwright install chromium). Writes PNGs; WebP conversion is done separately.
import {chromium} from 'playwright';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {writeFileSync,rmSync} from 'node:fs';
const [,,engraving,outDir]=process.argv;
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const u=p=>pathToFileURL(resolve(root,p)).href;
const fonts=`@font-face{font-family:Cormorant;src:url(${u('public/assets/fonts/cormorant-garamond-latin.woff2')}) format('woff2');font-weight:300 700}
@font-face{font-family:Cormorant;font-style:italic;src:url(${u('public/assets/fonts/cormorant-garamond-latin-italic.woff2')}) format('woff2');font-weight:300 700}
@font-face{font-family:DMSans;src:url(${u('public/assets/fonts/dm-sans-latin.woff2')}) format('woff2');font-weight:100 1000}
body{margin:0}`;
const eng=pathToFileURL(resolve(engraving)).href;
const jobs=[
 {name:'oyster-mark-ink-header.png',w:120,h:85,transparent:true,html:`<img src="${u('public/assets/brand/oyster-mark-ink.svg')}" style="width:120px;height:85px;display:block">`},
 {name:'oyster-mark-shell-header.png',w:120,h:85,transparent:true,html:`<img src="${u('public/assets/brand/oyster-mark-shell.svg')}" style="width:120px;height:85px;display:block">`},
 {name:'apple-touch-icon.png',w:180,h:180,html:`<div style="width:180px;height:180px;background:#243943;display:grid;place-items:center"><img src="${u('public/assets/brand/oyster-mark-shell.svg')}" style="width:150px"></div>`},
 {name:'favicon-32.png',w:32,h:32,transparent:true,html:`<img src="${u('public/assets/favicon.svg')}" style="width:32px;height:32px;display:block">`},
 {name:'og-default.png',w:1200,h:630,html:`<div style="position:relative;width:1200px;height:630px;background:#F7F5EF;overflow:hidden;font-family:Cormorant;color:#243943">
  <img src="${u('public/assets/estuary-contours.svg')}" style="position:absolute;right:-160px;top:-120px;width:1250px;opacity:.5">
  <img src="${eng}" style="position:absolute;left:70px;top:150px;width:430px">
  <div style="position:absolute;left:540px;top:178px">
   <div style="font-size:150px;font-weight:500;letter-spacing:-3px;line-height:1">Tidewater</div>
   <div style="font:400 30px DMSans;letter-spacing:15px;margin:18px 0 0 8px">ADVISORY</div>
   <div style="width:80px;border-top:1.5px solid #243943;margin:30px 0 0 10px"></div>
   <div style="font-style:italic;font-size:40px;margin:26px 0 0 6px">Read the current. Find the opportunity.</div>
  </div></div>`}
];
const b=await chromium.launch();
for(const j of jobs){const p=await b.newPage({viewport:{width:j.w,height:j.h},deviceScaleFactor:1});
 const tmp=resolve(outDir,'.render-'+j.name+'.html');writeFileSync(tmp,`<!doctype html><style>${fonts}</style>${j.html}`);
 await p.goto(pathToFileURL(tmp).href,{waitUntil:'load'});rmSync(tmp);
 await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
 await p.screenshot({path:resolve(outDir,j.name),omitBackground:!!j.transparent});await p.close();}
await b.close();console.log('rendered',jobs.length);
