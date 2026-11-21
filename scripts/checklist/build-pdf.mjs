// Render public/downloads/tidewater-dc-business-checklist.pdf from src/data/dc-checklist.ts.
// Usage: node scripts/checklist/build-pdf.mjs   (needs Chrome/Chromium; set CHROME_PATH to override)
import {mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
import {checklist, checklistMeta, checklistSources} from '../../src/data/dc-checklist.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const asset = (p) => pathToFileURL(root + 'public/' + p).href;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mark = readFileSync(root + 'public/assets/brand/oyster-mark-ink.svg', 'utf8');
const out = root + 'public' + checklistMeta.pdf;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(checklistMeta.title)} | Tidewater Advisory</title><style>
@font-face{font-family:'Cormorant Garamond';font-weight:300 700;src:url('${asset('assets/fonts/cormorant-garamond-latin.woff2')}') format('woff2')}
@font-face{font-family:'DM Sans';font-weight:100 1000;src:url('${asset('assets/fonts/dm-sans-latin.woff2')}') format('woff2')}
@page{size:Letter;margin:0.7in 0.75in 0.75in}
*{box-sizing:border-box}body{margin:0;font:400 9.6pt/1.5 'DM Sans',sans-serif;color:#243943}
.brand{display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1.5px solid #2E4B5B}
.brand svg{width:44px;height:auto}.brand .w{font:600 20pt/1 'Cormorant Garamond',serif;color:#2E4B5B}.brand .s{font:600 6.5pt/1 'DM Sans';letter-spacing:.22em;text-transform:uppercase;color:#6B8A96;margin-top:3px}
.brand .right{margin-left:auto;text-align:right;font-size:7.5pt;color:#4B626D;line-height:1.45}
h1{font:500 30pt/1.05 'Cormorant Garamond',serif;color:#2E4B5B;margin:20px 0 4px;letter-spacing:-.02em}
.sub{font-size:11pt;color:#4B626D;margin:0 0 10px}.note{font-size:8pt;color:#4B626D;background:#F7F5EF;border-left:3px solid #D8CBB8;padding:7px 10px;margin:0 0 6px}
section{margin-top:16px;break-inside:auto}
.sh{display:flex;align-items:baseline;gap:10px;border-bottom:1px solid #B7C4C7;padding-bottom:4px;margin-bottom:8px;break-after:avoid}
.num{font:600 8pt/1 'DM Sans';color:#6B8A96;letter-spacing:.08em}.sh h2{font:500 17pt/1.1 'Cormorant Garamond',serif;color:#2E4B5B;margin:0}.when{margin-left:auto;font-size:7.5pt;text-transform:uppercase;letter-spacing:.12em;color:#6B8A96}
.it{display:grid;grid-template-columns:14px 1fr;gap:9px;margin:0 0 7px;break-inside:avoid}
.box{width:11px;height:11px;border:1.2px solid #2E4B5B;margin-top:2.5px}
.it b{font-weight:600}.it p{margin:1px 0 0}.it a{color:#2E4B5B;font-size:8pt;text-decoration:none;border-bottom:.5px solid #6B8A96}
.src{margin-top:18px;break-inside:avoid}.src h2{font:500 14pt/1.1 'Cormorant Garamond',serif;color:#2E4B5B;margin:0 0 4px}
.src ul{columns:2;column-gap:22px;margin:4px 0 0;padding-left:12px;font-size:7.6pt}.src li{break-inside:avoid;margin:0 0 2px}.src a{color:#243943;text-decoration:none}
.end{margin-top:16px;padding-top:9px;border-top:1.5px solid #2E4B5B;font-size:8pt;color:#4B626D;display:flex;justify-content:space-between;gap:12px;break-inside:avoid}
</style></head><body>
<div class="brand">${mark}<div><div class="w">Tidewater</div><div class="s">Advisory</div></div><div class="right">tidewaterbid.com<br>hello@tidewaterbid.com<br>Capitol Hill East, Washington, DC</div></div>
<h1>${esc(checklistMeta.title)}</h1><p class="sub">${esc(checklistMeta.subtitle)}. Updated ${esc(checklistMeta.updated)}.</p>
<p class="note">${esc(checklistMeta.note)}</p>
${checklist.map((s) => `<section><div class="sh"><span class="num">${s.step}</span><h2>${esc(s.title)}</h2><span class="when">${esc(s.when)}</span></div>
${s.items.map((i) => `<div class="it"><span class="box"></span><div><b>${esc(i.task)}.</b> ${esc(i.detail)}${i.link ? ` <a href="${esc(i.link.href)}">${esc(i.link.label)}</a>` : ''}</div></div>`).join('')}</section>`).join('')}
<div class="src"><h2>Official sources</h2><ul>${checklistSources.map((x) => `<li><a href="${esc(x.href)}">${esc(x.label)}</a></li>`).join('')}</ul></div>
<div class="end"><span>Tidewater Advisory is independent and not affiliated with any government agency. Nothing here guarantees a license, approval, contract award or grant.</span><span>Online version: tidewaterbid.com/checklist</span></div>
</body></html>`;

const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome'});
const page = await browser.newPage();
const tmp = join(mkdtempSync(join(tmpdir(), 'tw-checklist-')), 'checklist.html');
writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, {waitUntil: 'load'}); // file:// so the self-hosted fonts load
await page.evaluate(() => document.fonts.ready);
mkdirSync(root + 'public/downloads', {recursive: true});
const pdf = await page.pdf({format: 'Letter', printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: '<div style="width:100%;font:7pt DM Sans,sans-serif;color:#6B8A96;padding:0 0.75in;display:flex;justify-content:space-between"><span>Tidewater Advisory · DC Business Checklist</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});
await browser.close();
writeFileSync(out, pdf);
console.log(`Wrote ${out} (${pdf.length} bytes)`);
