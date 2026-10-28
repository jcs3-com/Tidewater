import type {APIRoute} from 'astro';
import {categories,jurisdictions,siteUrl} from '../lib/config';
import {getVisibleRfps,effectiveStatus,bidUrl} from '../lib/rfps';
import {articles} from '../data/insights';
export const GET:APIRoute=async()=>{
  const fixed=['/','/bids','/open-bids','/pricing','/restaurant-advisory','/restaurant-advisory/funding','/restaurant-advisory/food-waste','/opportunity-finder','/readiness','/becoming-a-contractor','/insights','/about','/contact','/privacy','/terms'];
  const contractPaths=categories.flatMap(c=>jurisdictions.map(j=>`/contracts/${c.slug}/${j.slug}`));
  const articlePaths=articles.map(a=>`/insights/${a.slug}`);
  const bidPaths=(await getVisibleRfps()).filter(r=>effectiveStatus(r)!=='SAMPLE').map(bidUrl);
  const paths=[...new Set([...fixed,...contractPaths,...articlePaths,...bidPaths])];
  const escapeXml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${escapeXml(new URL(p,siteUrl).toString())}</loc></url>`).join('')}</urlset>`;
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
};
