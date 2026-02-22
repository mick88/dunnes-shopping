// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect, Page } from '@playwright/test';

test.describe('Shopping List - Cross-Tab Session Persistence', () => {
  test('localStorage updates persist across reload', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add multiple items
    const addBtns = page.getByRole('button', { name: 'Add' });
    await addBtns.first().click();
    await addBtns.nth(1).click();
    await addBtns.nth(2).click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Verify items are in My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    let removeButtons = page.getByRole('button', { name: 'Remove' });
    let itemCount = await removeButtons.count();
    expect(itemCount).toBe(3);

    // Go back to Browse
    const browseBtn = page.getByRole('button', { name: 'Browse' });
    await browseBtn.click();

    // Reload the page
    await page.reload();

    // Verify shopping list counter shows 3 items still
    await expect(page.getByText('3 items')).toBeVisible();

    // Switch to My List to verify the 3 added items persisted
    await myListBtn.click();

    removeButtons = page.getByRole('button', { name: 'Remove' });
    itemCount = await removeButtons.count();
    // Shopping list should have persisted with 3 items
    expect(itemCount).toBe(3);
  });

  test('State survives full refresh with mixed operations', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add 3 items
    const addBtns = page.getByRole('button', { name: 'Add' });
    await addBtns.first().click();
    await addBtns.nth(1).click();
    await addBtns.nth(2).click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Dismiss 2 items
    const dismissBtns = page.getByRole('button', { name: '✕' });
    await dismissBtns.nth(3).click();
    await dismissBtns.nth(4).click();

    // Perform hard refresh (full page reload)
    await page.reload({ waitUntil: 'load' });

    // Verify both changes are preserved
    await expect(page.getByText('3 items')).toBeVisible();

    // Switch to My List to verify items are still there
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(3);
  });

  test('Multiple operations preserve state', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Operation 1: Add an item
    let addBtns = page.getByRole('button', { name: 'Add' });
    await addBtns.first().click();

    // Operation 2: Switch to My List
    let myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();
    await expect(page.getByText('1 items')).toBeVisible();

    // Operation 3: Switch back to Browse
    let browseBtn = page.getByRole('button', { name: 'Browse' });
    await browseBtn.click();

    // Operation 4: Add more items
    addBtns = page.getByRole('button', { name: 'Add' });
    await addBtns.nth(1).click();
    await addBtns.nth(2).click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Reload
    await page.reload();

    // Verify all state is preserved
    await expect(page.getByText('3 items')).toBeVisible();

    myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(3);
  });
});
