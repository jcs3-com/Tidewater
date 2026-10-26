import type {APIRoute} from 'astro';
import {Resvg} from '@resvg/resvg-js';
import {getVisibleRfps,type Rfp} from '../../../../lib/rfps';
import {categoryName,jurisdictionName,displayDate} from '../../../../lib/config';
export async function getStaticPaths(){return (await getVisibleRfps()).map(b=>({params:{jurisdiction:b.jurisdiction,slug:b.slug},props:{bid:b}}));}
const xmlEscape=(s:string)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const breakTitle=(s:string)=>{const words=s.split(' ');const lines=[''];for(const w of words){const i=lines.length-1;if((lines[i]+w).length>37&&lines.length<3)lines.push(w);else lines[i]+=(lines[i]?' ':'')+w;}return lines.map(x=>xmlEscape(x.length>44?x.slice(0,41)+'…':x));};
export const GET:APIRoute=({props})=>{
 const bid=props.bid as Rfp; const lines=breakTitle(bid.title);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#2B5266"/><g fill="none" stroke="#95B2B9" opacity=".35" stroke-width="3"><path d="M-80 90 C250 0 400 210 730 100S1080 60 1320 140"/><path d="M-80 145 C250 55 400 265 730 155S1080 115 1320 195"/><path d="M-80 200 C250 110 400 320 730 210S1080 170 1320 250"/><path d="M-80 255 C250 165 400 375 730 265S1080 225 1320 305"/><path d="M-80 310 C250 220 400 430 730 320S1080 280 1320 360"/></g><rect x="55" y="70" width="1090" height="490" fill="#2B5266" opacity=".92"/><text x="85" y="120" font-family="sans-serif" font-size="30" fill="#F2ECDD" letter-spacing="5">TIDEWATER / BID DESK</text>${lines.map((l,i)=>`<text x="85" y="${245+i*72}" font-family="Georgia,serif" font-weight="bold" font-size="58" fill="#FFFFFF">${l}</text>`).join('')}<text x="85" y="525" font-family="sans-serif" font-size="26" fill="#F2ECDD">${xmlEscape(categoryName(bid.category))} · ${xmlEscape(jurisdictionName(bid.jurisdiction))} · Due ${xmlEscape(displayDate(bid.dueDate))}</text><path d="M85 145H1110" stroke="#F2ECDD" stroke-width="2"/></svg>`;
 const png=new Resvg(svg,{fitTo:{mode:'width',value:1200}}).render().asPng();
 return new Response(new Uint8Array(png),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400'}});
};
