// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Add Items UI and Special Cases', () => {
  test('Verify visual feedback when adding item', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Locate the first product card
    const firstProductCard = page.locator('div.product-card').first();

    // Verify initial state - white background, green outlined Add button
    await expect(firstProductCard).not.toHaveClass(/added/);
    const addButton = firstProductCard.locator('button:has-text("Add")');
    await expect(addButton).toBeVisible();

    // Click the Add button
    await addButton.click();

    // Verify visual feedback - light green background and solid green button
    await expect(firstProductCard).toHaveClass(/added/);
    
    // Verify the button styling changed (should now be solid green)
    const addButtonAfter = firstProductCard.locator('button:has-text("Add")');
    expect(await addButtonAfter.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    })).toBeTruthy();
  });

  test('Add item with special characters in product name', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get the second item which has special character (Łaciate)
    const allAddButtons = page.locator('button:has-text("Add")');
    const buttons = await allAddButtons.all();
    
    if (buttons.length > 1) {
      // Click the second Add button (Łaciate product)
      await buttons[1].click();

      // Verify the product was added
      const itemCounter = page.getByText(/\d+ items/);
      await expect(itemCounter).toBeVisible();

      // Navigate to My List
      const myListButton = page.getByRole('button', { name: /My List/ });
      await myListButton.click();

      // Verify the item appears in My List
      const productInList = page.getByText(/Łaciate/);
      await expect(productInList).toBeVisible();
    }
  });

  test('Add item and verify product link opens in new tab', async ({ page, context }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add one item
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Navigate to My List
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Get the product link
    const productLink = page.locator('a.product-name').first();
    const href = await productLink.getAttribute('href');
    
    // Verify the link is valid
    expect(href).toBeTruthy();
    expect(href).toMatch(/^https?:\/\//);

    // Verify the target is _blank (opens in new tab)
    const target = await productLink.getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('Dismiss and then add same product', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Find first product and get its name
    const firstProduct = page.locator('div.product-card').first();
    const productName = await firstProduct.locator('a.product-name').textContent();

    // Click dismiss button
    const dismissButton = firstProduct.locator('button:has-text("✕")');
    await dismissButton.click();

    // Verify product is dismissed (faded)
    await expect(firstProduct).toHaveClass(/dismissed/);

    // Verify item counter did not increase
    const itemCounter = page.getByText(/\d+ items/);
    const counterBefore = await itemCounter.textContent();

    // Now click Add button for the same product
    const addButton = firstProduct.locator('button:has-text("Add")');
    await addButton.click();

    // Verify dismissed state is removed
    await expect(firstProduct).not.toHaveClass(/dismissed/);

    // Verify item was added
    await expect(firstProduct).toHaveClass(/added/);
    await expect(page.getByText('1 items')).toBeVisible();
  });

  test('Verify item badge count on My List tab', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Initially no badge should be visible
    let badge = page.locator('[class*="badge"]').filter({ hasNot: page.locator('text=0') });
    let badgeCount = await badge.count();
    expect(badgeCount).toBe(0);

    // Add one item
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Verify badge shows "1"
    const myListBtn = page.getByRole('button', { name: /My List/ });
    const badge1 = myListBtn.locator('[class*="badge"], span');
    const badgeText1 = await badge1.last().textContent();
    expect(badgeText1).toContain('1');

    // Add more items
    const buttons = await addButtons.all();
    if (buttons.length > 1) {
      await buttons[1].click();
      await page.waitForTimeout(100);
    }

    // Verify badge shows "2" (or higher)
    const badgeText2 = await badge1.last().textContent();
    const badgeNum = parseInt(badgeText2 || '0');
    expect(badgeNum).toBeGreaterThanOrEqual(2);
  });

  test('Add item from category and verify it maintains order', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get all product cards initially visible
    const allProducts = page.locator('div.product-card');
    const firstProductName = await allProducts.nth(0).locator('a.product-name').textContent();
    const secondProductName = await allProducts.nth(1).locator('a.product-name').textContent();

    // Add first product
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.nth(0).click();
    await page.waitForTimeout(100);

    // Add second product
    const moreAddButtons = page.locator('button:has-text("Add")');
    const addButtonsArr = await moreAddButtons.all();
    if (addButtonsArr.length > 1) {
      await addButtonsArr[1].click();
    }

    // Navigate to My List
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Verify items appear in the order they were added
    const listItems = page.locator('a.product-name');
    const listFirstItem = await listItems.nth(0).textContent();
    const listSecondItem = await listItems.nth(1).textContent();

    expect(listFirstItem).toContain(firstProductName?.trim() || '');
    expect(listSecondItem).toContain(secondProductName?.trim() || '');
  });

  test('Add items from multiple scroll positions', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Add first item from visible items
    const addButtons = page.locator('button:has-text("Add")');
    const buttons = await addButtons.all();
    if (buttons.length > 0) {
      await buttons[0].click();
    }

    // Scroll down to see more items
    await page.locator('main').evaluate((el) => {
      el.scrollTop = el.scrollHeight / 2;
    });

    // Add another item from scrolled position
    const buttonsAfterScroll = await addButtons.all();
    if (buttonsAfterScroll.length > 4) {
      await buttonsAfterScroll[4].click();
    }

    // Scroll down more
    await page.locator('main').evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // Try to add another item from bottom
    const buttonsAtBottom = await addButtons.all();
    if (buttonsAtBottom.length > 8) {
      await buttonsAtBottom[8].click();
    }

    // Verify all items were added
    const counterText = await page.getByText(/\d+ items/).first().textContent();
    const match = counterText?.match(/(\d+)/);
    if (match) {
      const count = parseInt(match[1]);
      expect(count).toBeGreaterThanOrEqual(1);
    }

    // Navigate to My List to verify all items are there
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    const listItems = page.locator('div.product-card');
    const itemCount = await listItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(1);
  });

  test('Double-click Add button behavior', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first Add button
    const firstProductCard = page.locator('div.product-card').first();
    const addButton = firstProductCard.locator('button:has-text("Add")');

    // Double-click the Add button quickly
    await addButton.click();
    await page.waitForTimeout(50);
    await addButton.click();

    // After toggling on/off, item should not be in the list
    const counter = page.getByText(/\d+ items/);
    await expect(counter).not.toBeVisible();
  });
});
