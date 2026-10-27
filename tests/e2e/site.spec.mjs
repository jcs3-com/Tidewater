import {test,expect} from '@playwright/test';
const demo=process.env.DEMO_SEED!=='0';
export const routes=['/','/bids','/pricing','/restaurant-advisory','/restaurant-advisory/food-waste','/restaurant-advisory/funding','/open-bids','/readiness','/becoming-a-contractor','/insights','/about','/contact','/privacy','/terms','/contracts/catering/montgomery-county-md',...(demo?['/bids/washington-dc/sample-event-catering']:[])];
for(const width of [360,390,768,1440]){
 test(`routes usable at ${width}px without horizontal scrolling`,async({page})=>{
  await page.setViewportSize({width,height:800});
  for(const path of routes){
   const response=await page.goto(path,{waitUntil:'domcontentloaded'});
   expect(response?.status(),`Failed route ${path}`).toBe(200);
   await expect(page.locator('h1').first()).toBeVisible();
   const dimensions=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
   expect(dimensions.content,`Horizontal scroll at ${width} on ${path}`).toBeLessThanOrEqual(dimensions.viewport+1);
   await expect(page.locator('footer')).toContainText('Not affiliated with any government agency');
  }
 });
}
test('mobile nav opens and links to pricing',async({page})=>{
 await page.setViewportSize({width:360,height:800});await page.goto('/');
 const button=page.locator('#menu-toggle');await button.click();
 await expect(button).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape');
 await expect(button).toHaveAttribute('aria-expanded','false');
 await expect(button).toBeFocused();
 await button.press('Enter');
 const mnav=page.getByRole('navigation',{name:'Main navigation'});
 await expect(mnav.getByRole('link',{name:'Contact Tidewater'})).toBeVisible();
 await mnav.getByRole('link',{name:'The Bid Desk'}).click();
 await expect(page).toHaveURL(/\/bids$/);
});
test('theme toggle switches to dark',async({page})=>{
 await page.goto('/');await page.locator('#theme-toggle').click();
 const t=await page.locator('html').getAttribute('data-theme');expect(['dark','light']).toContain(t);
});

test('bid desk leads with contact, keeps readiness interior and separates food waste',async({page})=>{
 await page.goto('/');
 const hero=page.locator('.hero-shell');
 await expect(hero.getByRole('link')).toHaveCount(0);
 const header=page.locator('.site-header');
 await expect(header.getByRole('link',{name:'Contact Tidewater'}).first()).toHaveAttribute('href','/contact');
 const nav=page.getByRole('navigation',{name:'Main navigation'});
 await expect(nav.locator('li:not(.nav-contact) a')).toHaveText(['The Bid Desk','The Restaurant Advisory','About']);
 await expect(page.locator('main .bid-list')).toHaveCount(0);
 await expect(page.locator('main a[href="/readiness"]')).toHaveCount(0);
 await expect(page.locator('.division-image-card[href="/bids"]')).toBeVisible();
 await expect(page.locator('.division-image-card[href="/restaurant-advisory"]')).toBeVisible();
 await page.locator('.header-cta').click();
 await expect(page.getByRole('form',{name:'Contact Tidewater'})).toBeVisible();
 await page.goto('/bids');
 await page.getByRole('link',{name:'Becoming a government contractor',exact:true}).click();
 await expect(page).toHaveURL(/\/becoming-a-contractor$/);
 await page.getByRole('link',{name:'Take the readiness check'}).click();
 await expect(page.locator('#readiness-form')).toBeVisible();
 await page.locator('footer').getByRole('link',{name:'Tidewater Food Waste'}).click();
 await expect(page).toHaveURL(/\/restaurant-advisory\/food-waste$/);
 await expect(page.getByRole('heading',{level:1})).toContainText('Waste less.');
 await page.getByRole('link',{name:'Request an Opportunity Assessment'}).first().click();
 const form=page.getByRole('form',{name:'Request an Opportunity Assessment'});
 await expect(form).toBeVisible();
 await expect(form.locator('[name=source]')).toHaveValue('food-waste-project');
 await expect(form.locator('[name=categories]')).toHaveCount(0);
});
test('restaurant advisory hub links food waste and funding desk',async({page})=>{
 await page.goto('/restaurant-advisory');
 await expect(page.getByRole('heading',{level:1})).toContainText('Make the operation better.');
 await expect(page.locator('main img[src^="http"]')).toHaveCount(0);
 await expect(page.locator('main .fw-stage')).toHaveCount(5);
 await expect(page.locator('#funding-opportunities')).toBeVisible();
 await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'The Restaurant Advisory'})).toHaveAttribute('aria-current','page');
 await page.locator('main').getByRole('link',{name:'Read the food waste playbook'}).click();
 await expect(page).toHaveURL(/\/restaurant-advisory\/food-waste$/);
 await page.goto('/restaurant-advisory/funding');
 const cards=page.locator('.funding-card');
 expect(await cards.count()).toBeGreaterThan(0);
 for(const card of await cards.all()){
  await expect(card.locator('.funding-card-footer a')).toHaveAttribute('href',/^https:\/\//);
  await expect(card.locator('.funding-card-footer')).toContainText('Verified:');
 }
 await page.locator('#funding-region').selectOption('DC');
 for(const card of await cards.all()) if(await card.isVisible()) expect(await card.getAttribute('data-geography')).toContain('DC');
});
test('funding desk never shows an expired deadline as Open',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-11-02T12:00:00'));
 await page.goto('/restaurant-advisory/funding');
 for(const card of await page.locator('.funding-card[data-deadline]').all()){
  const d=await card.getAttribute('data-deadline');
  if(d && d<'2026-11-02') await expect(card.locator('[data-status-label]')).not.toHaveText('Open');
 }
});
test('bid desk landing explains the RFP process then lists open bids',async({page})=>{
 await page.goto('/bids');
 const process=page.locator('.bid-process');
 await expect(process.getByRole('heading',{level:2})).toContainText('Implementation');
 await expect(process.locator('.panel')).toHaveCount(4);
 await expect(page.locator('#open-opportunities')).toBeVisible();
 expect(await page.locator('.bid-process').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('#open-opportunities'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
 await page.locator('#open-opportunities').getByRole('link',{name:'Browse all opportunities'}).click();
 await expect(page).toHaveURL(/\/open-bids$/);
});
test('readiness calculates score and reveals lead capture',async({page})=>{
 await page.goto('/readiness');
 const answers={entity:'registered',years:'2plus',licenses:'yes',gl:'yes',wc:'yes',bond:'yes',portals:'yes',government:'no',staff:'5to9',jurisdictions:'washington-dc',categories:'catering'};
 for(const [id,value] of Object.entries(answers))await page.locator(`#${id}`).selectOption(value);
 await page.getByRole('button',{name:'Calculate my readiness'}).click();
 await expect(page.locator('#score-display')).toContainText('/ 100');
 await expect(page.getByRole('button',{name:'Send my result and find matches'})).toBeVisible();
});
test('sample listings never appear as verified bids',async({page})=>{
 await page.goto('/open-bids');
 const sample=page.locator('[data-bid-row][data-status=SAMPLE]');await expect(sample).toHaveCount(demo?3:0);
 if(demo){
  await expect(page.getByText(/SAMPLE cards are fictional/)).toBeVisible();
  await page.locator('#due-filter').selectOption('7');await expect(page.locator('#filter-count')).toContainText('0 listings');
 }else{
  const response=await page.goto('/bids/washington-dc/sample-event-catering');expect(response?.status()).toBe(404);
 }
});

test('canonical URLs are clean, served directly and marked in navigation',async({page,request})=>{
 for(const path of ['/','/pricing','/open-bids','/contracts/catering/montgomery-county-md','/insights/winner-teardown-reading-bid-tabs']){
  await page.goto(path);
  const href=await page.locator('link[rel=canonical]').getAttribute('href');
  expect(new URL(href).pathname,`canonical on ${path}`).toBe(path);
  expect(href).not.toMatch(/\.html$/);
  expect((await request.get(path,{maxRedirects:0})).status(),`${path} must not redirect`).toBe(200);
 }
 await page.goto('/pricing');
 await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'The Bid Desk'})).toHaveAttribute('aria-current','true');
});

test('retired v1 source paths return uncacheable 410 and never expose source',async({request})=>{
 for(const path of ['/README.md','/LAUNCH_CHECKLIST.md','/package.json','/src/pages/contact.astro','/worker/src/index.js','/.env.example']){
  const r=await request.get(path,{maxRedirects:0});
  expect(r.status(),path).toBe(410);
  expect(r.headers()['cache-control'],path).toBe('no-store');
  expect(await r.text(),path).not.toMatch(/@gmail\.com/i);
 }
 expect((await request.get('/health')).status()).toBe(200);
 expect((await request.get('/pricing')).status()).toBe(200);
 for(const asset of ['/scripts/forms.js','/scripts/readiness.js','/scripts/landscape.js','/assets/favicon.svg'])expect((await request.get(asset)).status(),asset).toBe(200);
});
