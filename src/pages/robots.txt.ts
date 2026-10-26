import type {APIRoute} from 'astro';
import {siteUrl,indexable} from '../lib/config';
export const GET:APIRoute=()=>new Response(!indexable ? `User-agent: *\nDisallow: /\n` : `User-agent: *\nAllow: /\nDisallow: /newsletter-invalid\nDisallow: /newsletter-unsubscribed\nSitemap: ${new URL('/sitemap.xml',siteUrl).toString()}\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
