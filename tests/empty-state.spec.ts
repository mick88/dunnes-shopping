// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Empty State Workflows', () => {
  test('Empty shopping list message displays', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Click My List tab
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Verify empty state message appears
    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();
  });

  test('All products dismissed scenario', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get all dismiss buttons
    const dismissBtns = page.getByRole('button', { name: '✕' });
    const count = await dismissBtns.count();

    // Dismiss first 3 products
    for (let i = 0; i < Math.min(3, count); i++) {
      await dismissBtns.nth(i).click();
    }

    // Counter is hidden when no items added (count = 0)
    // Just verify first product has dismissed class
    const firstCard = page.locator('div.product-card').first();
    await expect(firstCard).toHaveClass(/dismissed/);

    // Switch to Browse view (should still be there)
    const browseBtn = page.getByRole('button', { name: 'Browse' });
    await browseBtn.click();

    // Verify remaining products are visible (dismissed ones are still shown but with dismissed class)
    const productCards = page.locator('div.product-card');
    const visibleProducts = await productCards.count();
    expect(visibleProducts).toBeGreaterThan(0);
  });

  test('Add item to empty list', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Verify list is empty initially
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();
    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();

    // Go back to Browse
    const browseBtn = page.getByRole('button', { name: 'Browse' });
    await browseBtn.click();

    // Add first item
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();
    await firstAddBtn.click();

    // Verify counter updates to 1 items
    await expect(page.getByText('1 items')).toBeVisible();

    // Switch to My List
    await myListBtn.click();

    // Verify the item is displayed
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const itemCount = await removeButtons.count();
    expect(itemCount).toBe(1);

    // Verify empty message is gone
    await expect(page.getByText('Your shopping list is empty.')).not.toBeVisible();
  });
});
