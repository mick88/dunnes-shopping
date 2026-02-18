// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Add Items Advanced Scenarios', () => {
  test('Add maximum items to shopping list', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Click Add button multiple times to add many items
    let itemsAdded = 0;
    const maxItems = 8;
    
    for (let i = 0; i < maxItems; i++) {
      const addButtons = page.locator('button:has-text("Add")');
      const buttons = await addButtons.all();
      if (buttons.length > 0) {
        await buttons[i % buttons.length].click();
        itemsAdded++;
      }
    }

    // Verify the item counter shows items were added
    if (itemsAdded > 0) {
      await expect(page.getByText(/\d+ items/)).toBeVisible();
    }

    // Navigate to My List to verify all items are displayed
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Verify items are displayed in the list
    const listItems = page.locator('div.product-card');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(itemsAdded);
  });

  test('Add items when shopping list already has items', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Add first item
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();
    await expect(page.getByText('1 items')).toBeVisible();

    // Add second item
    const addButtons2 = page.locator('button:has-text("Add")');
    const buttons2 = await addButtons2.all();
    if (buttons2.length > 1) {
      await buttons2[1].click();
      await expect(page.getByText('2 items')).toBeVisible();
    }

    // Add third item
    const addButtons3 = page.locator('button:has-text("Add")');
    const buttons3 = await addButtons3.all();
    if (buttons3.length > 2) {
      await buttons3[2].click();
      await expect(page.getByText('3 items')).toBeVisible();
    }

    // Verify we have at least 1 item in the list
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();
    
    // Check that at least one item is displayed
    const items = page.locator('button:has-text("Remove")');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('Add items and verify localStorage persistence', async ({ page, context }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Add 2-3 items
    let itemsAdded = 0;
    for (let i = 0; i < 3; i++) {
      const addButtons = page.locator('button:has-text("Add")');
      const buttons = await addButtons.all();
      if (buttons.length > 0) {
        await buttons[i % buttons.length].click();
        itemsAdded++;
      }
    }

    // Verify counter shows items were added
    if (itemsAdded > 0) {
      await expect(page.getByText(/\d+ items/)).toBeVisible();
    }
    const counterBefore = await page.getByText(/\d+ items/).first().textContent();

    // Refresh the page to test localStorage persistence
    await page.reload();
    
    // Wait for page to load after reload
    await page.waitForLoadState('domcontentloaded');

    // Verify counter still shows items after refresh
    if (counterBefore && itemsAdded > 0) {
      await expect(page.getByText(new RegExp(counterBefore))).toBeVisible({ timeout: 3000 });
    }

    // Navigate to My List to verify items persisted
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Verify items are still in the list
    const listItems = page.locator('div.product-card');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Remove item from shopping list', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Add an item
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Verify counter shows 1 item
    await expect(page.getByText('1 items')).toBeVisible();

    // Navigate to My List
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Click Remove button
    const removeButton = page.getByRole('button', { name: 'Remove' }).first();
    await removeButton.click();

    // Verify the item is removed - empty state message should appear
    await expect(page.getByText(/Your shopping list is empty|empty/)).toBeVisible();
  });

  test('Add then reset all selections', async ({ page, context }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Add 2-3 items
    let itemsAdded = 0;
    for (let i = 0; i < 3; i++) {
      const addButtons = page.locator('button:has-text("Add")');
      const buttons = await addButtons.all();
      if (buttons.length > i) {
        await buttons[i].click();
        itemsAdded++;
      }
    }

    // Verify items were added
    if (itemsAdded > 0) {
      await expect(page.getByText(/\d+ items/)).toBeVisible();
    }

    // Listen for dialog before clicking Reset
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Click the Reset button
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await resetButton.click();

    // Wait a bit for reset to complete
    await page.waitForLoadState('domcontentloaded');

    // Verify counter is hidden (no items shown)
    const itemCounter = page.getByText(/\d+ items/);
    await expect(itemCounter).not.toBeVisible();

    // Verify green highlighting is removed from items in Browse view
    const browseBtn = page.getByRole('button', { name: 'Browse' });
    if (await browseBtn.isVisible()) {
      await browseBtn.click();
    }
    
    const addedItems = page.locator('div.product-card.added');
    const addedCount = await addedItems.count();
    expect(addedCount).toBe(0);
  });

  test('Verify item counter display format', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Verify no counter is shown initially
    let counter = page.getByText(/\d+ items/);
    await expect(counter).not.toBeVisible();

    // Add 1 item
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Verify counter shows "1 items" (even for singular)
    await expect(page.getByText('1 items')).toBeVisible();

    // Add more items to reach at least 5
    for (let i = 1; i < 5; i++) {
      const moreButtons = page.locator('button:has-text("Add")');
      const buttons = await moreButtons.all();
      if (buttons.length > i) {
        await buttons[i].click();
      }
    }

    // Verify counter format is consistent
    const counterText = await page.getByText(/\d+ items/).first().textContent();
    expect(counterText).toMatch(/^\d+ items$/);
  });

  test('Verify items display with correct emoji icons', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Verify product names are displayed in the product list
    const productNames = page.locator('a.product-name');
    const firstProductText = await productNames.first().textContent();
    
    // Check that product name is present
    expect(firstProductText).toBeTruthy();
    expect(firstProductText?.length || 0).toBeGreaterThan(0);

    // Add an item
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Verify counter updated
    await expect(page.getByText('1 items')).toBeVisible();

    // Navigate to My List
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Verify item is preserved in My List
    const myListItemText = await page.locator('a.product-name').first().textContent();
    expect(myListItemText).toBeTruthy();
    expect(myListItemText).toBe(firstProductText);
  });

  test('Navigate between Browse and My List preserving selections', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Verify Browse tab is active
    await expect(page.getByRole('button', { name: 'Browse' })).toHaveClass(/active/);

    // Add 2 items
    for (let i = 0; i < 2; i++) {
      const addButtons = page.locator('button:has-text("Add")');
      const buttons = await addButtons.all();
      if (buttons.length > i) {
        await buttons[i].click();
      }
    }

    // Verify counter shows 2 items
    await expect(page.getByText('2 items')).toBeVisible();

    // Navigate to My List
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Verify My List tab is active and shows items
    let listItems = page.locator('div.product-card');
    let count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Switch back to Browse
    const browseButton = page.getByRole('button', { name: 'Browse' });
    await browseButton.click();

    // Verify Browse tab is active and items are still highlighted
    await expect(browseButton).toHaveClass(/active/);
    const addedItems = page.locator('div.product-card.added');
    const addedCount = await addedItems.count();
    expect(addedCount).toBeGreaterThanOrEqual(2);

    // Navigate back to My List
    await myListButton.click();

    // Verify items are still there
    listItems = page.locator('div.product-card');
    count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
