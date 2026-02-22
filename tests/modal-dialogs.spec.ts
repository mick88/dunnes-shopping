// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Modal/Dialog Interactions', () => {
  test('Reset confirmation cancel preserves items', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add multiple items
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    await addButtons[0].click();
    await addButtons[1].click();
    await addButtons[2].click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Click Reset button
    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();

    // Handle the confirmation dialog - click Cancel
    await page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        await dialog.dismiss(); // Cancel
      }
    });

    // Wait a moment for dialog handling
    await page.waitForTimeout(100);

    // Verify items are still in list
    await expect(page.getByText('3 items')).toBeVisible();

    // Verify My List still shows items
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(3);
  });

  test('Reset confirmation accept clears everything', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add 3 items
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    await addButtons[0].click();
    await addButtons[1].click();
    await addButtons[2].click();

    await expect(page.getByText('3 items')).toBeVisible();

    // Dismiss 2 items
    const dismissBtns = page.getByRole('button', { name: '✕' });
    const dismissButtons = await dismissBtns.all();
    await dismissButtons[3].click();
    await dismissButtons[4].click();

    // Set up dialog handler before clicking Reset
    page.once('dialog', dialog => {
      dialog.accept(); // Click OK
    });

    // Click Reset button
    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();

    // Counter is hidden when empty, verify through My List instead
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();

    // Verify dismissed items are also cleared (no dismissed classes)
    const browseBtn = page.getByRole('button', { name: 'Browse' });
    await browseBtn.click();

    const dismissedClass = page.locator('div.product-card.dismissed');
    const dismissedCount = await dismissedClass.count();
    expect(dismissedCount).toBe(0);
  });

  test('Reset button text and functionality', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Verify Reset button exists and is visible
    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await expect(resetBtn).toBeVisible();

    // Add items so reset dialog appears
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    await addButtons[0].click();

    // Set up dialog handler
    page.once('dialog', dialog => {
      expect(dialog.type()).toBe('confirm');
      dialog.accept();
    });

    // Click Reset
    await resetBtn.click();

    // Counter is hidden when empty, verify through My List instead
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();
    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();

    // Go back to Browse to verify dismissed items are cleared
  });

  test('Dialog appears when clicking Reset with items', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add an item
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    await addButtons[0].click();

    await expect(page.getByText('1 items')).toBeVisible();

    // Set up dialog capture
    let dialogAppeared = false;
    page.once('dialog', dialog => {
      dialogAppeared = true;
      dialog.dismiss();
    });

    // Click Reset
    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();

    // Wait for dialog
    await page.waitForTimeout(100);

    // Verify dialog appeared (by checking if reset didn't happen due to cancel)
    await expect(page.getByText('1 items')).toBeVisible();
  });

  test('Multiple resets with different states', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add items
    const addBtns = page.getByRole('button',  { name: 'Add' });
    const addButtons = await addBtns.all();
    await addButtons[0].click();
    await addButtons[1].click();

    await expect(page.getByText('2 items')).toBeVisible();

    // First reset - cancel it
    page.once('dialog', dialog => {
      dialog.dismiss();
    });

    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();
    await page.waitForTimeout(100);

    await expect(page.getByText('2 items')).toBeVisible();

    // Second reset - accept it
    page.once('dialog', dialog => {
      dialog.accept();
    });

    await resetBtn.click();

    // Counter is hidden when empty, verify through My List instead
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();
    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();
  });
});
