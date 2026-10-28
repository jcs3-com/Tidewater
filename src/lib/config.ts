export const categories = [
  {slug:'catering', name:'Catering', short:'Event meals, boxed lunches, receptions and recurring service.'},
  {slug:'concessions', name:'Food & beverage concessions', short:'Public venues, parks and hospitality operations.'},
  {slug:'janitorial', name:'Janitorial', short:'Building cleaning, routine maintenance and facility support.'},
  {slug:'security', name:'Security', short:'Guard services, site coverage and event access support.'},
  {slug:'event-services', name:'Event services', short:'Setup, staffing, rental support and event operations.'}
] as const;
export const jurisdictions = [
  {slug:'washington-dc', name:'Washington, DC', short:'District of Columbia', region:'dmv'},
  {slug:'montgomery-county-md', name:'Montgomery County, MD', short:'Montgomery County', region:'dmv'},
  {slug:'prince-georges-county-md', name:"Prince George’s County, MD", short:"Prince George’s County", region:'dmv'},
  {slug:'fairfax-county-va', name:'Fairfax County, VA', short:'Fairfax County', region:'dmv'},
  {slug:'arlington-county-va', name:'Arlington County, VA', short:'Arlington County', region:'dmv'},
  {slug:'alexandria-va', name:'Alexandria, VA', short:'City of Alexandria', region:'dmv'},
  {slug:'loudoun-county-va', name:'Loudoun County, VA', short:'Loudoun County', region:'dmv'},
  {slug:'annapolis-md', name:'Annapolis, MD', short:'Annapolis', region:'dmv'},
  {slug:'charleston-sc', name:'Charleston, SC area', short:'Charleston, Berkeley and Dorchester counties', region:'charleston'}
] as const;
export const categoryName = (s:string) => categories.find(x=>x.slug===s)?.name || s.replaceAll('-', ' ');
export const jurisdictionName = (s:string) => jurisdictions.find(x=>x.slug===s)?.name || s.replaceAll('-', ' ');
export const siteUrl = import.meta.env.SITE || 'https://tidewaterbid.com';
// Production defaults to same-origin Cloudflare Pages Functions.
export const apiUrl = import.meta.env.PUBLIC_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:8787');
export const todayUTC = () => new Date().toISOString().slice(0,10);
export const displayDate = (iso:string) => !iso ? 'Not published' : new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric', timeZone:'UTC'}).format(new Date(iso.slice(0,10)+'T12:00:00Z'));
export const hasValue = (amount:number|null|undefined) => amount !== null && amount !== undefined && Number.isFinite(amount);
// Build-time label; public/scripts/days-left.js refreshes it in the browser.
export const daysLeftLabel = (iso:string, status:string, now=new Date()) => {
  if(status==='SAMPLE') return 'Example';
  if(status==='Awarded') return 'Awarded';
  if(status==='Closed') return 'Closed';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const today=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  const days=Math.round((Date.parse(iso+'T00:00:00Z')-today)/86400000);
  return days<0 ? 'Closed' : days===0 ? 'Due today' : `${days} ${days===1?'day':'days'} left`;
};
export const displayValue = (amount:number|null|undefined) => amount === null || amount === undefined || !Number.isFinite(amount) ? 'Not published' : '$'+Math.round(amount).toLocaleString('en-US');
export const pageUrl = (path:string) => new URL(path, siteUrl).toString();
// Launch gates. Both default OFF; set to "1" in the Cloudflare Pages build environment only when ready.
// SITE_INDEXABLE=1: remove the site-wide noindex and open robots.txt (only after copy/legal TODOs are cleared).
// NEWSLETTER_ENABLED=1: render signup forms (only after Resend sender, MAILING_ADDRESS and HMAC_SECRET are set).
const flag = (name:string) => (import.meta.env[name] ?? (typeof process !== 'undefined' ? process.env[name] : undefined)) === '1';
export const indexable = flag('SITE_INDEXABLE');
export const newsletterEnabled = flag('NEWSLETTER_ENABLED');
// CHECKOUT_ENABLED=1 would render the gated Single Bid Architecture payment step. It stays OFF until
// engagement terms, refund policy, payment credentials and fulfilment capacity are verified.
// Even when on, payment is offered only after a written qualification and tier confirmation.
export const checkoutEnabled = flag('CHECKOUT_ENABLED');
