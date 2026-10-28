import {test,expect} from '@playwright/test';
const routes=['/','/bids','/pricing','/opportunity-finder','/engage','/restaurant-advisory','/restaurant-advisory/food-waste','/restaurant-advisory/funding','/open-bids','/readiness','/becoming-a-contractor','/insights','/about','/contact','/privacy','/terms','/contracts/catering/montgomery-county-md'];
const retired=[/\$295/,/\$250\s*[–-]\s*\$500/,/\$1,500\s*[–-]\s*\$3,000/,/Bid Viability Review/i,/\$500 per bid/i];

test('approved brand lockup, tagline, favicon and social image are installed',async({page,request})=>{
 await page.goto('/');
 const logo=page.locator('.site-header .logo');
 await expect(logo.locator('.logo-word')).toHaveText('Tidewater');
 await expect(logo.locator('.logo-subtitle')).toHaveText('Advisory');
 await expect(logo.locator('img.mark-ink')).toHaveAttribute('src','/assets/brand/oyster-mark-ink-header.webp');
 await expect(page.getByRole('heading',{level:1})).toHaveText(/Read the current\.\s*Find the opportunity\./);
 await expect(page.locator('.footer-tagline')).toHaveText('Read the current. Find the opportunity.');
 expect(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily)).toMatch(/Cormorant Garamond/);
 expect(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily)).toMatch(/DM Sans/);
 expect(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(247, 245, 239)');
 for(const href of ['/assets/favicon.svg','/assets/brand/apple-touch-icon.png','/assets/og-default.png','/assets/brand/oyster-mark-shell-header.webp','/assets/brand/oyster-engraving-503.webp'])expect((await request.get(href)).status(),href).toBe(200);
 await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',/\/assets\/og-default\.png$/);
 await page.locator('#theme-toggle').click();
 const dark=await page.locator('html').getAttribute('data-theme');
 await expect(logo.locator(dark==='dark'?'img.mark-shell':'img.mark-ink')).toBeVisible();
});

test('pricing shows only the approved Bid Desk tiers and the $100,000 boundary',async({page})=>{
 await page.goto('/pricing');
 await expect(page.locator('[data-tier="sba-1"] .price-amount')).toHaveText('$1,250');
 await expect(page.locator('[data-tier="sba-2"] .price-amount')).toHaveText('$2,500');
 const input=page.locator('#tier-value');const out=page.locator('#tier-result');
 await input.fill('99999');await page.getByRole('button',{name:'Show the fee'}).click();
 await expect(out).toContainText('$1,250');await expect(out).not.toContainText('Tier II');
 await input.fill('100,000');await page.getByRole('button',{name:'Show the fee'}).click();
 await expect(out).toContainText('Tier II');await expect(out).toContainText('$2,500');
 const ld=await page.locator('script[type="application/ld+json"]').textContent();
 const prices=[...ld.matchAll(/"price":"(\d+)"/g)].map(m=>Number(m[1]));
 expect(prices.sort()).toEqual([1250,2500]);
});

test('no retired or sub-floor Bid Desk prices on any rendered public page',async({page})=>{
 test.setTimeout(90000);
 for(const path of routes){
  await page.goto(path);const text=await page.locator('body').innerText();
  for(const r of retired)expect(text,`${path} contains ${r}`).not.toMatch(r);
  const amounts=[...text.matchAll(/\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?!\s*(?:,\d|million|k\b))/g)].map(m=>Number(m[1].replace(/,/g,'')));
  // Any dollar figure on Bid Desk fee pages must be a tier price or a contract-value boundary, never a lower fee.
  if(path==='/pricing')for(const a of amounts)expect([1250,2500,100000,1000000].includes(a)||a>=100000,`${path} unexpected amount $${a}`).toBe(true);
 }
});

test('Opportunity Finder (bids): readiness result, honest empty state, safe failure keeps answers',async({page})=>{
 let calls=0;
 await page.route('**/api/lead',async route=>{calls++;const body=JSON.parse(route.request().postData()||'{}');
  expect(body.kind).toBe('quiz');expect(body.source).toBe('opportunity-finder');expect(body.contactPreference).toBe('phone');expect(body.location).toBeUndefined();
  if(calls===1)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Unable to save your request. Please try again later.'})});
  return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({message:'Request received. We will follow up by email.'})});});
 await page.goto('/opportunity-finder?path=bids');
 await expect(page.locator('#path-bids')).toBeVisible();await expect(page.locator('#path-restaurant')).toBeHidden();
 await page.getByRole('button',{name:'See my results'}).click();
 await expect(page.locator('#finder-validation')).toContainText('highlighted');
 const answers={'f-category':'catering','f-area':'washington-dc','f-staff':'5to9','f-years':'2plus','f-entity':'registered','f-licenses':'yes','f-portals':'yes','f-gov':'no','f-gl':'yes','f-wc':'yes','f-bond':'no'};
 for(const [id,v] of Object.entries(answers))await page.locator(`#${id}`).selectOption(v);
 await page.getByRole('button',{name:'See my results'}).click();
 const results=page.locator('#finder-results');
 await expect(results).toContainText('Readiness:');await expect(results).toContainText('$1,250');await expect(results).toContainText('$2,500');
 const n=await results.locator('.finder-match').count();
 if(n===0)await expect(results.locator('.finder-empty').first()).toContainText('not tracking a verified open');
 for(const link of await results.locator('a[target=_blank]').all())await expect(link).toHaveAttribute('href',/^https:\/\//);
 await page.locator('#c-name').fill('Test Person');await page.locator('#c-business').fill('Demo LLC');await page.locator('#c-email').fill('test@example.org');
 await page.locator('#c-pref').selectOption('phone');await page.locator('#c-notes').fill('Keep this note');
 await page.locator('#finder-contact input[name=consent]').check();
 await page.getByRole('button',{name:'Send to Tidewater'}).click();
 await expect(page.locator('#finder-feedback')).toContainText('Unable to save');
 await expect(page.locator('#c-notes')).toHaveValue('Keep this note');await expect(page.locator('#f-category')).toHaveValue('catering');
 await page.getByRole('button',{name:'Send to Tidewater'}).click();
 await expect(page.locator('#finder-feedback')).toContainText('Request received');
 expect(calls).toBe(2);
});

test('Opportunity Finder (restaurant): labelled, sourced programs and separate submission kind',async({page})=>{
 await page.route('**/api/lead',route=>{const body=JSON.parse(route.request().postData()||'{}');expect(body.kind).toBe('restaurant_finder');expect(body.interests).toBe('funding,food-waste');expect(body.categories).toBeUndefined();return route.fulfill({status:201,contentType:'application/json',body:'{"message":"Request received. We will follow up by email."}'});});
 await page.goto('/opportunity-finder');
 await page.getByText('Restaurant funding and improvements').click();
 await page.locator('#r-location').selectOption('charlottesville');await page.locator('#r-type').selectOption('independent-restaurant');await page.locator('#r-tenure').selectOption('lease');
 await page.getByLabel('Funding, grants or incentives').check();await page.getByLabel('Food waste, donation or recovery').check();
 await page.getByRole('button',{name:'See my results'}).click();
 const results=page.locator('#finder-results');await expect(results).toBeVisible();
 for(const card of await results.locator('.finder-match').all()){await expect(card.locator('a[target=_blank]')).toHaveAttribute('href',/^https:\/\//);await expect(card).toContainText('Verified');}
 const open=results.locator('.finder-match:has(.finder-label:text-is("Accepting applications"))');
 for(const card of await open.all())await expect(card.locator('.finder-label').nth(1)).toBeVisible();
 await page.locator('#c-name').fill('Test');await page.locator('#c-business').fill('Oyster Bar');await page.locator('#c-email').fill('t@example.org');
 await page.locator('#finder-contact input[name=consent]').check();await page.getByRole('button',{name:'Send to Tidewater'}).click();
 await expect(page.locator('#finder-feedback')).toContainText('Request received');
});

test('gated checkout is off: engagement page shows no payment control',async({page,request})=>{
 await page.goto('/engage?quote=recAAAAAAAAAAAAAA.sba-1.9999999999.'+'a'.repeat(64));
 await expect(page.locator('#engage-form')).toHaveCount(0);
 await expect(page.locator('#engage-offer')).toContainText('not open yet');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
 const r=await request.post('/api/checkout',{data:{quote:'x'}});expect(r.status()).toBe(503);
});
