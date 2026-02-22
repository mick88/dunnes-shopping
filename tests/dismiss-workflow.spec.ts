// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Dismiss Workflow', () => {
  test('Dismiss single product', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first dismiss button (on first product)
    const firstDismissBtn = page.getByRole('button', { name: '✕' }).first();
    
    // Verify it's visible
    await expect(firstDismissBtn).toBeVisible();

    // Click dismiss button
    await firstDismissBtn.click();

    // Verify the product card has dismissed class
    const productCards = page.locator('div.product-card');
    const firstCard = productCards.first();
    await expect(firstCard).toHaveClass(/dismissed/);

    // Refresh the page
    await page.reload();

    // Verify dismissed state persists after reload
    await expect(firstCard).toHaveClass(/dismissed/);
  });

  test('Re-show dismissed product', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first dismiss button
    const firstDismissBtn = page.getByRole('button', { name: '✕' }).first();

    // Dismiss the product
    await firstDismissBtn.click();
    const firstCard = page.locator('div.product-card').first();
    await expect(firstCard).toHaveClass(/dismissed/);

    // Click dismiss button again to undismiss
    await firstDismissBtn.click();

    // Verify product is shown again (dismissed class removed)
    await expect(firstCard).not.toHaveClass(/dismissed/);
  });

  test('Add then dismiss removes item from list', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add first product
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();
    await firstAddBtn.click();

    // Verify counter shows 1 item
    await expect(page.getByText('1 items')).toBeVisible();

    // Now dismiss the same product (first dismiss button)
    const firstDismissBtn = page.getByRole('button', { name: '✕' }).first();
    await firstDismissBtn.click();

    // Counter is hidden when empty, verify the item was removed from shopping list
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();
    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();
  });

  test('Dismiss then add product', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Dismiss first product
    const firstDismissBtn = page.getByRole('button', { name: '✕' }).first();
    await firstDismissBtn.click();

    // Verify dismissed
    const firstCard = page.locator('div.product-card').first();
    await expect(firstCard).toHaveClass(/dismissed/);

    // Now add the same product (product is still visible even when dismissed)
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();
    await firstAddBtn.click();

    // Verify product is undismissed
    await expect(firstCard).not.toHaveClass(/dismissed/);

    // Verify counter shows 1 item
    await expect(page.getByText('1 items')).toBeVisible();
  });
});
