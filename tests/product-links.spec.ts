// spec: specs/add-items-to-cart.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shopping List - Product Link Verification', () => {
  test('Product link opens in new tab', async ({ page, context }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first product link
    const firstProductLink = page.locator('a.product-name').first();

    // Verify href attribute exists
    const href = await firstProductLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).not.toBe('');

    // Verify target="_blank" is set
    const target = await firstProductLink.getAttribute('target');
    expect(target).toBe('_blank');

    // Verify href starts with http, https, or data
    expect(href).toMatch(/^(https?:|data:)/);
  });

  test('All product links have valid URLs', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get all product links
    const productLinks = page.locator('a.product-name');
    const count = await productLinks.count();

    // Check first 5 links
    for (let i = 0; i < Math.min(5, count); i++) {
      const link = productLinks.nth(i);
      
      // Verify href exists and is not empty
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href?.length).toBeGreaterThan(0);

      // Verify target="_blank"
      const target = await link.getAttribute('target');
      expect(target).toBe('_blank');

      // Verify href is a valid URL or search URL
      expect(href).toMatch(/^(https?:|data:)|(google\.com|dunnesstoresgrocery)/);
    }
  });

  test('Product link text contains emoji', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first product link
    const firstProductLink = page.locator('a.product-name').first();

    // Get the text content
    const text = await firstProductLink.textContent();
    expect(text).toBeTruthy();

    // Verify text contains emoji (starts with emoji)
    // Emojis are typically 1 or 2 characters, followed by space and product name
    expect(text).toMatch(/^[🥛🥚🧀🧈🥣🥕🍞🍫🍪🍚🥫🍶☕🥤🥩🍳]/);
  });

  test('Multiple product links are clickable', async ({ page, context }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get all product links
    const productLinks = page.locator('a.product-name');
    const count = await productLinks.count();

    expect(count).toBeGreaterThan(0);

    // Verify first 3 links are visible and have proper attributes
    for (let i = 0; i < Math.min(3, count); i++) {
      const link = productLinks.nth(i);
      await expect(link).toBeVisible();

      // Verify it's a proper link
      const role = await link.getAttribute('role');
      const href = await link.getAttribute('href');
      
      expect(href).toBeTruthy();
      expect(typeof href).toBe('string');
    }
  });

  test('Product links include product names', async ({ page }) => {
    // Navigate to the shopping list app
    await page.goto('file://' + __dirname + '/../index.html');

    // Get first product link
    const firstProductLink = page.locator('a.product-name').first();

    // Get text which should be: "🧀 Product Name"
    const text = await firstProductLink.textContent();
    expect(text).toBeTruthy();
    
    // Should have at least emoji + space + product name
    expect(text?.length).toBeGreaterThan(3);

    // Should contain actual product name (not just emoji)
    const parts = text?.split(' ');
    expect(parts?.length).toBeGreaterThan(1);
  });
});
