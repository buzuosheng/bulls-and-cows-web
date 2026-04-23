import { test, expect, Page } from '@playwright/test'

async function dismissOnboarding(page: Page) {
  const skipButton = page.getByRole('dialog', { name: '新手引导' }).getByText('跳过')
  try {
    await skipButton.click({ timeout: 2000 })
  } catch {
    // No onboarding modal present
  }
}

test('homepage navigation to simple mode', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Bulls & Cows')

  await page.click('a[href="/simple"]')
  await expect(page).toHaveURL('/simple')
  await expect(page.locator('h1')).toContainText('简化版')
})

test('homepage navigation to classic mode', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href="/classic"]')
  await expect(page).toHaveURL('/classic')
  await expect(page.locator('h1')).toContainText('经典版')
})

test('simple mode: input 4 digits and submit', async ({ page }) => {
  await page.goto('/simple')
  await dismissOnboarding(page)

  // Type 4 digits via NumberPad buttons
  await page.click('button[aria-label="数字 1"]')
  await page.click('button[aria-label="数字 2"]')
  await page.click('button[aria-label="数字 3"]')
  await page.click('button[aria-label="数字 4"]')

  // Submit
  await page.click('button[aria-label="确认"]')

  // Should see a guess row with the result (命中数) in the guess history area
  await expect(page.getByLabel('猜测历史').getByText('命中数')).toBeVisible()
})

test('classic mode: input 4 digits and submit', async ({ page }) => {
  await page.goto('/classic')
  await dismissOnboarding(page)

  // Type 4 digits
  await page.click('button[aria-label="数字 5"]')
  await page.click('button[aria-label="数字 6"]')
  await page.click('button[aria-label="数字 7"]')
  await page.click('button[aria-label="数字 8"]')

  // Submit
  await page.click('button[aria-label="确认"]')

  // Should see B: and C: feedback in the guess history area
  await expect(page.getByLabel('猜测历史').getByText('B:')).toBeVisible()
  await expect(page.getByLabel('猜测历史').getByText('C:')).toBeVisible()
})

test('back button returns to homepage', async ({ page }) => {
  await page.goto('/simple')
  await dismissOnboarding(page)

  await page.click('a[aria-label="返回首页"]')
  await expect(page).toHaveURL('/')
})

test('404 page shows for invalid routes', async ({ page }) => {
  await page.goto('/nonexistent')
  await expect(page.locator('text=404')).toBeVisible()
  await expect(page.locator('text=页面未找到')).toBeVisible()
  await page.click('text=返回首页')
  await expect(page).toHaveURL('/')
})
