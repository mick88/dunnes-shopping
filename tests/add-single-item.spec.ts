// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Add Items to Cart Test Plan', () => {
  test('Add single item to shopping list', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Verify Add buttons are visible
    const firstAddButton = page.getByRole('button', { name: 'Add' }).first();
    await expect(firstAddButton).toBeVisible();

    // Click the first Add button for Dunnes Stores Irish Whole Milk 1 Litre
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Verify the item counter shows '1 items'
    await expect(page.getByText('1 items')).toBeVisible();

    // Verify the product card is highlighted with green background
    const productCard = page.locator('div.product-card').first();
    await expect(productCard).toHaveClass(/added/);

    // Click the My List tab to view the shopping list
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Verify the item is displayed in the list
    await expect(page.getByText(/Dunnes Stores Irish Whole Milk|Milk/)).toBeVisible();

    // Verify the Remove button appears next to the item
    const removeButton = page.getByRole('button', { name: 'Remove' }).first();
    await expect(removeButton).toBeVisible();
  });

  test('Add multiple items from different categories', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Verify Browse tab is active and products are displayed
    await expect(page.getByRole('button', { name: 'Browse' })).toHaveClass(/active/);

    // Click the Add button for Łaciate 2,0% UHT Milk 1.5 Litre (second item)
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.nth(1).click();

    // Verify the item counter shows '1 items'
    await expect(page.getByText('1 items')).toBeVisible();

    // Scroll down to view PANTRY items
    await page.locator('main').evaluate((el) => {
      el.scrollTop = el.scrollHeight / 2;
    });

    // Click an Add button for a PANTRY item (approximated as 5th button)
    const allAddButtons = await page.locator('button:has-text("Add")').all();
    if (allAddButtons.length > 4) {
      await allAddButtons[4].click();
    }

    // Verify the item counter shows '2 items'
    await expect(page.getByText('2 items')).toBeVisible();

    // Click on items until we have 3 items added
    if (allAddButtons.length > 5) {
      await allAddButtons[5].click();
    }

    // Verify the item counter shows '3 items'
    await expect(page.getByText('3 items')).toBeVisible();

    // Navigate to the My List tab
    const myListButton = page.getByRole('button', { name: /My List/ });
    await myListButton.click();

    // Verify all items are displayed in My List
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const removeCount = await removeButtons.count();
    expect(removeCount).toBeGreaterThanOrEqual(3);
  });

  test('Toggle item addition (add then remove by clicking Add again)', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Click Add button for first product
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Verify item was added - counter shows '1 items'
    await expect(page.getByText('1 items')).toBeVisible();

    // Click Add button again to toggle it off
    await addButtons.first().click();

    // Verify item was removed - counter shows '0 items' or hidden
    const itemCounter = page.getByText('1 items');
    await expect(itemCounter).not.toBeVisible();
  });

  test('Add item that was previously dismissed', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('https://mick88.github.io/dunnes-shopping/');

    // Find and click dismiss button for first product
    const dismissButtons = page.locator('button:has-text("✕")');
    await dismissButtons.first().click();

    // Verify the product card is dismissed (faded)
    const firstProduct = page.locator('div.product-card').first();
    await expect(firstProduct).toHaveClass(/dismissed/);

    // Click the Add button for the same dismissed product
    const addButtons = page.locator('button:has-text("Add")');
    await addButtons.first().click();

    // Verify the dismissed state is removed and item is added
    await expect(firstProduct).not.toHaveClass(/dismissed/);
    await expect(firstProduct).toHaveClass(/added/);

    // Verify item counter shows '1 items'
    await expect(page.getByText('1 items')).toBeVisible();
  });
});
