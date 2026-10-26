import {test,expect} from '@playwright/test';
const routes=['/','/bids','/pricing','/restaurant-advisory','/open-bids','/readiness','/insights','/about','/contact','/privacy','/terms','/contracts/catering/montgomery-county-md','/bids/washington-dc/sample-event-catering'];
for(const width of [360,1440]){
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
 const button=page.getByRole('button',{name:'Menu'});await button.click();
 await expect(button).toHaveAttribute('aria-expanded','true');
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
 await expect(page.getByText(/SAMPLE cards are fictional/)).toBeVisible();
 const sample=page.locator('[data-bid-row][data-status=SAMPLE]');await expect(sample).toHaveCount(3);
 await page.locator('#due-filter').selectOption('7');await expect(page.locator('#filter-count')).toContainText('0 listings');
});
