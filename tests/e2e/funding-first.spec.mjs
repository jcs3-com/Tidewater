import {test, expect} from '@playwright/test';
const pages=['/','/funding-directory','/funding-services','/projects','/resources','/tools','/academy','/fundamentals','/fellowship','/careers','/ethics','/contact'];
test('funding-first architecture ships without pretend clients or empty tools',async({page})=>{
  for(const path of pages){
    const response=await page.goto(path);
    expect(response?.status(),path).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
  await page.goto('/');
  await expect(page.locator('h1').first()).toHaveText('Funding opportunity at the source.');
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  await expect(nav.locator('li:not(.nav-contact) a')).toHaveText(['Funding Finder','Funding Services','Resources','About','Bid Desk']);
  await expect(page.locator('main .tw-project-card')).toHaveCount(5);
  await expect(page.locator('main')).not.toContainText(/Our clients include|clients we have helped secure|\$200M\+ secured/i);
  await expect(page.locator('body')).not.toContainText('Read the current. Find the opportunity.');
  await page.goto('/tools');
  await expect(page.locator('.tw-tool-card')).toHaveCount(5);
  await expect(page.locator('.tw-status')).toHaveCount(5);
  await page.goto('/careers');
  await expect(page.locator('a[href="mailto:career@tidewaterbid.com"]')).toBeVisible();
  await page.goto('/fellowship');
  await expect(page.locator('main')).toContainText('Applications are not open.');
});

test('funding directory preserves official sources and historical status',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-11-02T12:00:00'));
  await page.goto('/funding-directory');
  for(const card of await page.locator('.funding-card').all()){
    await expect(card.locator('.funding-card-footer a')).toHaveAttribute('href',/^https:\/\//);
    await expect(card.locator('.funding-card-footer')).toContainText('Verified:');
    const date=await card.getAttribute('data-deadline');
    if(date&&date<'2026-11-02') await expect(card.locator('[data-status-label]')).not.toHaveText('Open');
  }
});
