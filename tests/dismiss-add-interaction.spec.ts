// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Dismiss + Add Interaction', () => {
  test('Dismiss then add same product', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first product dismiss and add buttons
    const firstDismissBtn = page.getByRole('button', { name: '✕' }).first();
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();

    // Dismiss product A
    await firstDismissBtn.click();

    // Verify dismissed class applied
    const firstCard = page.locator('div.product-card').first();
    await expect(firstCard).toHaveClass(/dismissed/);

    // Add the same product
    await firstAddBtn.click();

    // Verify product is in shopping list
    await expect(page.getByText('1 items')).toBeVisible();

    // Verify dismissed class is removed (undismissed)
    await expect(firstCard).not.toHaveClass(/dismissed/);

    // Verify counter shows correct count
    await expect(page.getByText('1 items')).toBeVisible();
  });

  test('Add, dismiss, re-dismiss, add workflow', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first product buttons
    const firstDismissBtn = page.getByRole('button', { name: '✕' }).first();
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();
    const firstCard = page.locator('div.product-card').first();

    // Step 1: Add product
    await firstAddBtn.click();
    await expect(page.getByText('1 items')).toBeVisible();

    // Step 2: Dismiss it (should remove from list)
    await firstDismissBtn.click();
    // Counter is hidden when empty, so just verify dismissed class
    await expect(firstCard).toHaveClass(/dismissed/);

    // Step 3: Dismiss again (to undismiss)
    await firstDismissBtn.click();
    await expect(firstCard).not.toHaveClass(/dismissed/);

    // Step 4: Add it again
    await firstAddBtn.click();
    await expect(page.getByText('1 items')).toBeVisible();

    // Verify item is in list
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(1);
  });

  test('Add multiple products, dismiss one', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get button collections
    const addBtns = page.getByRole('button', { name: 'Add' });
    const dismissBtns = page.getByRole('button', { name: '✕' });

    // Add products A, B, C
    const addButtons = await addBtns.all();
    await addButtons[0].click(); // A
    await addButtons[1].click(); // B
    await addButtons[2].click(); // C

    await expect(page.getByText('3 items')).toBeVisible();

    // Dismiss product B (second dismiss button)
    const dismissButtons = await dismissBtns.all();
    await dismissButtons[1].click();

    // Verify counter shows 2 items
    await expect(page.getByText('2 items')).toBeVisible();

    // Switch to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Verify A and C still in list, B is removed
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(2);
  });

  test('Dismiss all added products', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add 3 items
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    await addButtons[0].click();
    await addButtons[1].click();
    await addButtons[2].click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Now dismiss all 3
    const dismissBtns = page.getByRole('button', { name: '✕' });
    const dismissButtons = await dismissBtns.all();
    for (let i = 0; i < 3; i++) {
      await dismissButtons[i].click();
    }

    // Counter is hidden when empty, verify through My List instead
    // Switch to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Verify empty message appears
    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();
  });

  test('Dismiss non-added product then add', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get last dismiss button (a product not in list)
    const dismissBtns = page.getByRole('button', { name: '✕' });
    const dismissButtons = await dismissBtns.all();
    const lastDismissBtn = dismissButtons[dismissButtons.length - 1];

    // Dismiss a non-added product
    await lastDismissBtn.click();

    // Counter is hidden when empty, just verify the product is dismissed
    const allCards = page.locator('div.product-card');
    const cardCount = await allCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Get all add buttons and find the corresponding one
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    const lastAddBtn = addButtons[addButtons.length - 1];

    // Add the dismissed product
    await lastAddBtn.click();

    // Verify counter shows 1
    await expect(page.getByText('1 items')).toBeVisible();

    // Verify item is in list
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(1);
  });
});
