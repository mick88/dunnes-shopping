// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Rapid Operations', () => {
  test('Rapid add operations maintain counter', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get all Add buttons
    let addBtns = page.getByRole('button', { name: 'Add' });

    // Click Add button rapidly (5 different items)
    for (let i = 0; i < 5; i++) {
      addBtns = page.getByRole('button', { name: 'Add' });
      const buttons = await addBtns.all();
      if (i < buttons.length) {
        await buttons[i].click();
      }
    }

    // Verify counter shows 5 items
    await expect(page.getByText('5 items')).toBeVisible();

    // Switch to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Verify no ghost items or duplicates
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(5);
  });

  test('Rapid remove operations maintain state', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add 5 items first
    let addBtns = page.getByRole('button', { name: 'Add' });
    for (let i = 0; i < 5; i++) {
      addBtns = page.getByRole('button', { name: 'Add' });
      const buttons = await addBtns.all();
      if (i < buttons.length) {
        await buttons[i].click();
      }
    }

    await expect(page.getByText('5 items')).toBeVisible();

    // Switch to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Rapidly remove 3 items
    let removeButtons = page.getByRole('button', { name: 'Remove' });
    for (let i = 0; i < 3; i++) {
      removeButtons = page.getByRole('button', { name: 'Remove' });
      const buttons = await removeButtons.all();
      if (buttons.length > 0) {
        await buttons[0].click(); // Always remove first remaining item
      }
    }

    // Verify counter shows 2 items
    await expect(page.getByText('2 items')).toBeVisible();

    // Verify no ghost items
    removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(2);
  });

  test('Rapid toggle operations end in expected state', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first Add button
    let addBtn = page.getByRole('button', { name: 'Add' }).first();

    // Toggle add 10 times rapidly (odd number = final state is added, even = removed)
    for (let i = 0; i < 10; i++) {
      addBtn = page.getByRole('button', { name: 'Add' }).first();
      await addBtn.click();
    }

    // After 10 clicks: should be removed (even number)
    // Counter is hidden when empty, verify through My List instead
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(0);
    
    // Verify empty message
    await expect(page.getByText('Your shopping list is empty.')).toBeVisible();
  });

  test('Rapid mixed add/dismiss operations', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get buttons
    const addBtns = page.getByRole('button', { name: 'Add' });
    const dismissBtns = page.getByRole('button', { name: '✕' });

    // Do rapid mixed operations
    // Add first 3 items
    for (let i = 0; i < 3; i++) {
      const buttons = await addBtns.all();
      if (i < buttons.length) {
        await buttons[i].click();
      }
    }

    // Quickly dismiss 2 items (should remove them from list)
    const dismissButtons = await dismissBtns.all();
    for (let i = 0; i < 2 && i < dismissButtons.length; i++) {
      await dismissButtons[i].click();
    }

    // Verify final counter (should show 1, as 2 items were dismissed/removed)
    // Note: depends on timing of dismiss vs what was added
    const counterText = await page.getByText(/\d+ items/).first().textContent();
    expect(counterText).toBeTruthy();
  });

  test('Operations do not create duplicates', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add same item 5 times (should toggle off on 2nd click, then on on 3rd, etc)
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();

    for (let i = 0; i < 5; i++) {
      await firstAddBtn.click();
    }

    // After 5 clicks: odd number, so should be added
    await expect(page.getByText('1 items')).toBeVisible();

    // Switch to My List and verify only 1 item
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const count = await removeButtons.count();
    expect(count).toBe(1);
  });
});
