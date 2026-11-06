import {test, expect} from '@playwright/test';
const pages=['/','/funding-directory','/funding-services','/projects','/resources','/tools','/academy','/fundamentals','/fellowship','/careers','/ethics','/contact'];
test('funding-first architecture ships without pretend clients',async({page})=>{
  for(const path of pages){
    const response=await page.goto(path);
    expect(response?.status(),path).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
  await page.goto('/');
  await expect(page.locator('h1').first()).toHaveText('Funding opportunity at the source.');
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  await expect(nav.locator('li:not(.nav-contact) a')).toHaveText(['Funding Finder','Funding Services','Resources','About','Bid Desk']);
  await expect(page.locator('main')).not.toContainText(/Our clients include|clients we have helped secure|\$200M\+ secured/i);
  await page.goto('/careers');
  await expect(page.locator('a[href="mailto:career@tidewaterbid.com"]')).toBeVisible();
});

test('funding directory closes expired opportunities',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-11-02T12:00:00'));
  await page.goto('/funding-directory');
  for(const card of await page.locator('.funding-card').all()){
    const date=await card.getAttribute('data-deadline');
    if(date&&date<'2026-11-02') await expect(card.locator('[data-status-label]')).not.toHaveText('Open');
  }
});
