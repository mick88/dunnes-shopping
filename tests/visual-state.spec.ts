// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Visual State Integrity', () => {
  test('Badge count matches list length', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Verify badge is hidden initially (0 items)
    const badge = page.locator('#nav-badge');
    const badgeHidden = await badge.evaluate(el => el.classList.contains('hidden'));
    expect(badgeHidden).toBe(true);

    // Add 5 items
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    for (let i = 0; i < 5 && i < addButtons.length; i++) {
      await addButtons[i].click();
    }

    // Verify badge shows 5
    const badgeText = await badge.textContent();
    expect(badgeText?.trim()).toBe('5');

    // Remove 2 items via My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    await removeButtons.nth(0).click();
    await removeButtons.nth(0).click(); // Remove second item (first has shifted)

    // Verify badge now shows 3
    const badgeText2 = await badge.textContent();
    expect(badgeText2?.trim()).toBe('3');

    // Reset all
    page.once('dialog', dialog => {
      dialog.accept();
    });

    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();

    // Verify badge is hidden again
    const badgeHidden2 = await badge.evaluate(el => el.classList.contains('hidden'));
    expect(badgeHidden2).toBe(true);
  });

  test('Added class applied to product cards', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add first product and stay on Browse
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();
    await firstAddBtn.click();

    // Verify product card has "added" class
    const firstCard = page.locator('div.product-card').first();
    await expect(firstCard).toHaveClass(/added/);

    // Navigate to My List
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    // Verify items display without Add buttons (only Remove buttons)
    const addButtons = page.getByRole('button', { name: 'Add' });
    const addCount = await addButtons.count();
    expect(addCount).toBe(0);

    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const removeCount = await removeButtons.count();
    expect(removeCount).toBeGreaterThan(0);

    // Go back to Browse
    const browseBtn = page.getByRole('button', { name: 'Browse' });
    await browseBtn.click();

    // Verify added class is still applied
    await expect(firstCard).toHaveClass(/added/);
  });

  test('Counter text accuracy', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add 1 item
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();
    await firstAddBtn.click();

    // Verify text shows "1 items"
    await expect(page.getByText('1 items')).toBeVisible();

    // Add more items to reach 5
    const addBtns = page.getByRole('button', { name: 'Add' });
    const addButtons = await addBtns.all();
    for (let i = 1; i < 5 && i < addButtons.length; i++) {
      await addButtons[i].click();
    }

    // Verify text shows "5 items"
    await expect(page.getByText('5 items')).toBeVisible();

    // Remove all items via dialog
    page.once('dialog', dialog => {
      dialog.accept();
    });

    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();

    // Verify counter is hidden
    const counter = page.locator('#list-counter');
    const counterHidden = await counter.evaluate(el => el.classList.contains('hidden'));
    expect(counterHidden).toBe(true);
  });

  test('Counter visibility toggles with items', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get counter element
    const counter = page.locator('#list-counter');

    // Initially should be hidden (0 items)
    let isHidden = await counter.evaluate(el => el.classList.contains('hidden'));
    expect(isHidden).toBe(true);

    // Add first item
    const firstAddBtn = page.getByRole('button', { name: 'Add' }).first();
    await firstAddBtn.click();

    // Counter should now be visible
    isHidden = await counter.evaluate(el => el.classList.contains('hidden'));
    expect(isHidden).toBe(false);

    // Go to My List and remove the item
    const myListBtn = page.getByRole('button', { name: /My List/ });
    await myListBtn.click();

    const removeBtn = page.getByRole('button', { name: 'Remove' }).first();
    await removeBtn.click();

    // Counter should be hidden again
    isHidden = await counter.evaluate(el => el.classList.contains('hidden'));
    expect(isHidden).toBe(true);
  });

  test('Browse and My List tabs have active class', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Verify Browse tab is active
    const browseBtn = page.getByRole('button', { name: 'Browse' });
    await expect(browseBtn).toHaveClass(/active/);

    // My List should not be active
    const myListBtn = page.getByRole('button', { name: /My List/ });
    const hasActive = await myListBtn.evaluate(el => el.classList.contains('active'));
    expect(hasActive).toBe(false);

    // Click My List
    await myListBtn.click();

    // Verify My List is active
    await expect(myListBtn).toHaveClass(/active/);

    // Browse should not be active
    const browseBtnActive = await browseBtn.evaluate(el => el.classList.contains('active'));
    expect(browseBtnActive).toBe(false);

    // Click Browse
    await browseBtn.click();

    // Verify Browse is active again
    await expect(browseBtn).toHaveClass(/active/);
  });

  test('Dismissed class visual feedback', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first product card
    const firstCard = page.locator('div.product-card').first();

    // Initially should not have dismissed class
    let hasClass = await firstCard.evaluate(el => el.classList.contains('dismissed'));
    expect(hasClass).toBe(false);

    // Click dismiss
    const firstDismissBtn = page.getByRole('button', { name: '✕' }).first();
    await firstDismissBtn.click();

    // Should now have dismissed class
    hasClass = await firstCard.evaluate(el => el.classList.contains('dismissed'));
    expect(hasClass).toBe(true);

    // Click dismiss again to undismiss
    await firstDismissBtn.click();

    // Should no longer have dismissed class
    hasClass = await firstCard.evaluate(el => el.classList.contains('dismissed'));
    expect(hasClass).toBe(false);
  });
});
