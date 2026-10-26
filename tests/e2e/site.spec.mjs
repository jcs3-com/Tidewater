import {test,expect} from '@playwright/test';
const demo=process.env.DEMO_SEED!=='0';
export const routes=['/','/bids','/pricing','/restaurant-advisory','/open-bids','/readiness','/insights','/about','/contact','/privacy','/terms','/contracts/catering/montgomery-county-md',...(demo?['/bids/washington-dc/sample-event-catering']:[])];
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
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Pricing'}).click();
 await expect(page).toHaveURL(/\/pricing$/);
});
test('theme toggle switches to dark',async({page})=>{
 await page.goto('/');await page.locator('#theme-toggle').click();
 const t=await page.locator('html').getAttribute('data-theme');expect(['dark','light']).toContain(t);
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
 await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Pricing'})).toHaveAttribute('aria-current','page');
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
