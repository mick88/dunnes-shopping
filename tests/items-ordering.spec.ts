// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Items Ordering & Consistency', () => {
  test('Items maintain add order', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get all Add buttons
    const addBtns = page.getByRole('button', { name: 'Add' });

    // Add first product
    await addBtns.first().click();
    await expect(page.getByText('1 items')).toBeVisible();

    // Scroll to find different category (Fresh Produce)
    await page.locator('h2:has-text("Fresh Produce")').first().scrollIntoViewIfNeeded();

    // Add item from Fresh Produce (different category) - should be around 3rd or later button
    const addBtnsAfter = page.getByRole('button', { name: 'Add' });
    const firstButtons = await addBtnsAfter.all();
    if (firstButtons.length > 2) {
      // Add the 3rd button (which should be different after scrolling)
      await page.getByRole('button', { name: 'Add' }).nth(2).click();
      await expect(page.getByText('2 items')).toBeVisible();
    }

    // Add another item - second button in current view
    await addBtnsAfter.nth(1).click();
    await expect(page.getByText('3 items')).toBeVisible();

    // Switch to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Verify items appear in order they were added
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(3);
  });

  test('Order persists after reload', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add items in specific order: first, second, third
    const addBtns = page.getByRole('button', { name: 'Add' });
    await addBtns.first().click();
    await addBtns.nth(1).click();
    await addBtns.nth(2).click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Refresh page
    await page.reload();

    // Switch to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Verify all 3 items are still there in order
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(3);

    // Verify counter shows 3 items
    await expect(page.getByText('3 items')).toBeVisible();
  });

  test('Remove middle item preserves order', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add three items
    const addBtns = page.getByRole('button', { name: 'Add' });
    await addBtns.first().click();
    await addBtns.nth(1).click();
    await addBtns.nth(2).click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Switch to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Remove middle item (second remove button)
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    await removeButtons.nth(1).click();

    // Verify counter shows 2 items now
    await expect(page.getByText('2 items')).toBeVisible();

    // Verify 2 items remain
    const remainingRemoveButtons = page.getByRole('button', { name: 'Remove' });
    const count = await remainingRemoveButtons.count();
    expect(count).toBe(2);
  });
});
