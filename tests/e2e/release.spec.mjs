import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['/','/bids','/open-bids','/pricing','/opportunity-finder','/restaurant-advisory','/restaurant-advisory/food-waste','/restaurant-advisory/funding','/readiness','/becoming-a-contractor','/about','/insights','/contact','/privacy','/terms','/contracts/catering/montgomery-county-md','/credits'];

for(const theme of ['light','dark']){
 test(`WCAG A/AA automated audit across primary routes, ${theme}`,async({page})=>{
  test.setTimeout(120000);
  await page.addInitScript(value=>localStorage.setItem('tidewater-theme',value),theme);
  await page.setViewportSize({width:theme==='dark'?390:1440,height:900});
  for(const route of routes){
   await page.goto(route);await page.evaluate(()=>document.fonts.ready);
   const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   expect(results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),`${theme} ${route}`).toEqual([]);
  }
 });
}
test('poster assets are local and loaded; pause and reduced motion work',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const hero=page.locator('.hero-cinematic');await expect(hero).toHaveAttribute('data-motion','enabled');
 const pause=page.locator('#motion-toggle');await pause.click();
 await expect(hero).toHaveAttribute('data-paused','true');
 expect(await page.locator('.hero-image').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
 await pause.click();await expect(hero).toHaveAttribute('data-paused','false');
 for(const img of await page.locator('main img').all()){
  await img.evaluate(el=>el.scrollIntoView({block:'center'}));await expect(img).toBeVisible();
  await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  expect(await img.evaluate(el=>new URL(el.currentSrc).origin===location.origin)).toBe(true);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(hero).toHaveAttribute('data-motion','disabled');await expect(pause).toBeHidden();
 expect(await page.locator('.hero-image').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await page.goto('/about');await page.locator('.landscape-story').scrollIntoViewIfNeeded();
 const secondary=page.locator('.landscape-story img');await expect(secondary).toBeVisible();
 await expect.poll(()=>secondary.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
});
test('headline and action remain readable when photographs fail',async({page})=>{
 await page.route(/\/assets\/.*\.(webp|jpg)$/,route=>route.abort());await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('Find the opportunity.');
 await expect(page.locator('.header-cta')).toBeVisible();
 await expect(page.locator('#motion-toggle')).toBeHidden();
});
test('keyboard skip link and disclosure navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page).toHaveURL(/#main$/);
 await page.locator('#menu-toggle').focus();await page.keyboard.press('Enter');
 await page.keyboard.press('Escape');await expect(page.locator('#menu-toggle')).toBeFocused();
 await expect(page.locator('#primary-nav')).toBeHidden();
});
test('failed form delivery preserves entries and offers direct email',async({page})=>{
 await page.route('**/api/lead',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Online delivery is unavailable. Please email Tidewater.'})}));
 await page.goto('/contact');const form=page.locator('form[data-lead-form]');
 await form.locator('[name=name]').fill('Synthetic QA');await form.locator('[name=business]').fill('QA example');
 await form.locator('[name=email]').fill('qa@example.test');await form.locator('[name=consent]').check();
 await form.getByRole('button',{name:'Send request'}).click();
 await expect(form.locator('.form-feedback')).toHaveAttribute('data-state','error');
 await expect(form.locator('[name=email]')).toHaveValue('qa@example.test');
 await expect(form.getByRole('link',{name:'email Tidewater directly'})).toHaveAttribute('href',/^mailto:/);
});
test('launch gates and deployed-source marker stay explicit',async({page,request})=>{
 await page.goto('/');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
 const marker=await (await request.get('/release.json')).json();
 expect(marker.version).toBe('3.1.0');expect(marker.commit).toMatch(/^[a-f0-9]{40}$/);
 await expect(page.locator('meta[name=tidewater-commit]')).toHaveAttribute('content',marker.commit);
 const robots=await (await request.get('/robots.txt')).text();expect(robots).toContain('Disallow: /');
 // Canonical origin follows the SITE_URL the build used (Cloudflare env in production).
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',new URL('/',process.env.SITE_URL||'https://tidewaterbid.com').href);
 await page.goto('/insights');await expect(page.getByText('Signups open soon.')).toBeVisible();
});
for(const width of [360,390,768,1440]){
 test(`release screenshots at ${width}px`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['/','/pricing','/open-bids','/readiness']){
   await page.goto(route);await page.evaluate(()=>document.fonts.ready);
   await testInfo.attach(`${route==='/'?'home':route.slice(1)}-${width}`,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  }
 });
}
