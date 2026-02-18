# Shopping List - Add Items to Cart Test Plan

## Application Overview

The Shopping List app is a web application that allows users to browse a catalog of grocery items organized by category (Fridge, Pantry, etc.) and add them to a personal shopping list. Users can add items from the Browse view, view their selections in the My List tab, remove items, dismiss items they don't need, and reset their entire list. The app persists user selections using browser localStorage.

## Test Scenarios

### 1. Adding Items to Shopping List - Happy Path

**Seed:** `seed.spec.ts`

#### 1.1. Add single item to shopping list

**File:** `tests/add-items/single-item.spec.ts`

**Steps:**
  1. Start with a fresh shopping list (no items previously added). Navigate to the Browse tab at the bottom of the page.
    - expect: The Browse tab is active (highlighted in green)
    - expect: Product list is displayed organized by categories (FRIDGE, PANTRY, etc.)
    - expect: Item counter in header shows 'Reset' link but no item count visible
    - expect: My List badge shows no number
  2. Locate the first product (Dunnes Stores Irish Whole Milk 1 Litre) in the FRIDGE section and click the green 'Add' button.
    - expect: The product card gets a light green background highlighting
    - expect: The 'Add' button changes color to solid green
    - expect: The header now displays '1 items' in green text
    - expect: The 'My List' tab shows a badge with the number '1'
  3. Click on the 'My List' tab to view the shopping list.
    - expect: The My List tab becomes active
    - expect: The Dunnes Stores Irish Whole Milk 1 Litre item is displayed in the list
    - expect: A red 'Remove' button appears next to the item
    - expect: The list shows only 1 item
  4. Verify the item persists by closing and reopening the browser or refreshing the page (if testing persistence).
    - expect: The shopping list still contains the milk item
    - expect: The item counter still shows '1 items'
    - expect: The My List badge still shows '1'

#### 1.2. Add multiple items from different categories

**File:** `tests/add-items/multiple-items-categories.spec.ts`

**Steps:**
  1. Start from the Browse view with an empty shopping list.
    - expect: Browse tab is active
    - expect: No items are highlighted with green background
  2. Click the 'Add' button for Łaciate 2,0% UHT Milk 1.5 Litre (second item in FRIDGE).
    - expect: Item card highlights in light green
    - expect: Item counter updates to '1 items'
    - expect: My List badge shows '1'
  3. Scroll down to find an item in the PANTRY category (e.g., Dunnes Stores Organic Spelt Sourdough 720g) and click its 'Add' button.
    - expect: The Pantry item card highlights in light green
    - expect: Item counter updates to '2 items'
    - expect: My List badge shows '2'
  4. Add one more item from FRIDGE (e.g., Dunnes Stores 12 Irish Free Range Eggs Medium) by clicking its 'Add' button.
    - expect: The item card highlights in light green
    - expect: Item counter updates to '3 items'
    - expect: My List badge shows '3'
  5. Navigate to the 'My List' tab.
    - expect: All 3 items are displayed in the list in the order they were added
    - expect: Each item shows with its emoji and full product name
    - expect: Each item has a 'Remove' button

#### 1.3. Toggle item addition (add then remove by clicking Add again)

**File:** `tests/add-items/toggle-item.spec.ts`

**Steps:**
  1. From Browse view, click 'Add' button for any product (e.g., Dunnes Stores Irish Whole Milk 1 Litre).
    - expect: Item is added with green highlighting
    - expect: Item counter shows '1 items'
    - expect: My List badge shows '1'
  2. Click the 'Add' button again for the same product (button should still be visible and clickable).
    - expect: The green highlighting is removed from the item card
    - expect: The 'Add' button returns to its outlined state
    - expect: Item counter decreases to '0 items'
    - expect: My List badge disappears
    - expect: The item is removed from the shopping list

#### 1.4. Add item that was previously dismissed

**File:** `tests/add-items/add-after-dismiss.spec.ts`

**Steps:**
  1. From Browse view, click the red '✕' (dismiss) button for any product.
    - expect: The product card becomes faded/semi-transparent (opacity reduced)
    - expect: The item is not added to the shopping list
  2. Click the 'Add' button for the same dismissed product.
    - expect: The product card highlighting is removed (item is no longer dismissed)
    - expect: The product card gets a light green background
    - expect: Item counter shows '1 items'
    - expect: My List badge shows '1'
    - expect: The item appears in My List

### 2. Adding Items - Edge Cases and Error Handling

**Seed:** `seed.spec.ts`

#### 2.1. Add maximum items to shopping list

**File:** `tests/add-items/add-many-items.spec.ts`

**Steps:**
  1. Start from Browse view. Click 'Add' button for at least 10-15 different products across multiple categories.
    - expect: Each item is successfully added with green highlighting
    - expect: Item counter increments correctly after each addition
    - expect: My List badge updates with the correct count
    - expect: No errors appear in the console or UI
  2. Navigate to My List to view all added items.
    - expect: All items are displayed in the list in the order they were added
    - expect: The list is scrollable if it exceeds the viewport
    - expect: Each item has a Remove button and is properly formatted

#### 2.2. Add items when shopping list already has items

**File:** `tests/add-items/add-to-existing-list.spec.ts`

**Steps:**
  1. From Browse view, add 5 products to the shopping list.
    - expect: All 5 items are added successfully
    - expect: Item counter shows '5 items'
  2. Continue browsing and add 3 more products without clearing the list.
    - expect: The new items are appended to the existing list
    - expect: Item counter shows '8 items'
    - expect: My List displays all 8 items in order

#### 2.3. Add items and verify localStorage persistence

**File:** `tests/add-items/persistence.spec.ts`

**Steps:**
  1. Add 3-4 items to the shopping list from the Browse view.
    - expect: Item counter shows the correct count
    - expect: My List badge shows the correct count
  2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R) to clear the page cache.
    - expect: The shopping list is preserved after refresh
    - expect: All previously added items are still in My List
    - expect: Item counter still shows the same count
    - expect: My List badge still shows the same count

#### 2.4. Add item with special characters in product name

**File:** `tests/add-items/special-characters.spec.ts`

**Steps:**
  1. Browse through the product list to find an item with special characters (e.g., 'Łaciate', item with '&' character).
    - expect: Product name is displayed correctly with special characters
    - expect: Special characters are properly rendered
  2. Click 'Add' button for that product.
    - expect: Item is added successfully without any character encoding issues
    - expect: Item appears correctly in My List with special characters intact

#### 2.5. Add item and verify link opens in new tab

**File:** `tests/add-items/product-link.spec.ts`

**Steps:**
  1. From My List view, click on a product name link (the blue underlined text with emoji).
    - expect: A new browser tab opens
    - expect: The new tab navigates to the Dunnes Stores product page or Google search result
    - expect: The original Shopping List tab remains open and unchanged

### 3. Adding Items - User Interface and Visual Feedback

**Seed:** `seed.spec.ts`

#### 3.1. Verify visual feedback when adding item

**File:** `tests/add-items/visual-feedback.spec.ts`

**Steps:**
  1. From Browse view, locate any product with an outlined green 'Add' button (not yet added).
    - expect: The 'Add' button has a green outline and green text
    - expect: The product card has a white background
  2. Click the 'Add' button.
    - expect: The product card immediately changes to light green background
    - expect: The 'Add' button changes to solid green background with white text
    - expect: The button is still clickable for toggling off

#### 3.2. Verify item counter display format

**File:** `tests/add-items/counter-format.spec.ts`

**Steps:**
  1. Add 1 item to the shopping list.
    - expect: The counter displays '1 items' (note: even for singular, it says 'items')
  2. Add more items to reach 5, 10, or more.
    - expect: Counter displays '5 items', '10 items', etc.
    - expect: The format remains consistent

#### 3.3. Verify that items display with correct emoji icons

**File:** `tests/add-items/emoji-display.spec.ts`

**Steps:**
  1. Browse through the product list and look for items with emojis (e.g., 🥛 for milk, 🧀 for cheese, 🍞 for bread).
    - expect: Each product displays with an appropriate emoji based on its category/type
    - expect: Emojis render correctly without encoding issues
  2. Add an item with an emoji and view it in the My List.
    - expect: The emoji is preserved when displayed in My List
    - expect: Emoji displays consistently across Browse and My List views

### 4. Adding Items - Integration with Reset and Clear Functions

**Seed:** `seed.spec.ts`

#### 4.1. Add items then reset all selections

**File:** `tests/add-items/add-then-reset.spec.ts`

**Steps:**
  1. From Browse view, add 5-6 items to the shopping list.
    - expect: All items are displayed with green highlighting
    - expect: Item counter shows '5 items' (or 6)
  2. Click the 'Reset' button in the header.
    - expect: A confirmation dialog appears asking 'Are you sure you want to reset all selections?' (or similar message)
  3. Click 'OK' or 'Yes' to confirm the reset.
    - expect: All green highlighting is removed from product cards
    - expect: Item counter disappears from the header
    - expect: My List badge disappears
    - expect: Shopping list is completely empty
  4. Navigate to My List tab.
    - expect: An empty state message appears (e.g., 'Your shopping list is empty.')

#### 4.2. Cancel reset operation

**File:** `tests/add-items/cancel-reset.spec.ts`

**Steps:**
  1. From Browse view, add 3-4 items to the shopping list.
    - expect: Items are displayed with green highlighting
  2. Click the 'Reset' button.
    - expect: Confirmation dialog appears
  3. Click 'Cancel' or 'No' to reject the reset.
    - expect: The confirmation dialog closes
    - expect: All items remain in the shopping list with green highlighting
    - expect: Item counter is unchanged

### 5. Adding Items - Navigation Between Views

**Seed:** `seed.spec.ts`

#### 5.1. Add items, navigate between Browse and My List

**File:** `tests/add-items/navigation-between-views.spec.ts`

**Steps:**
  1. Start on Browse view. Add 3 items from different categories.
    - expect: Items are highlighted in green
    - expect: Counter shows '3 items'
  2. Click on the 'My List' tab.
    - expect: My List view loads showing all 3 items
    - expect: Items appear in the order they were added
  3. Click back on the 'Browse' tab.
    - expect: Browse view reloads
    - expect: The same 3 items still show green highlighting
    - expect: Counter still shows '3 items'
  4. Add 2 more items from Browse view.
    - expect: New items are highlighted in green
    - expect: Counter updates to '5 items'
  5. Switch to My List to verify all 5 items are there.
    - expect: My List shows all 5 items
    - expect: The 2 newly added items appear at the end of the list

#### 5.2. Switch views while scrolled in product list

**File:** `tests/add-items/switch-views-scrolled.spec.ts`

**Steps:**
  1. On Browse view, scroll down to view products from the PANTRY category.
    - expect: PANTRY products are visible on screen
  2. Add 2-3 items from the visible PANTRY section.
    - expect: Items are added successfully
    - expect: Counter updates
  3. Click on 'My List' tab.
    - expect: My List view loads and displays the added items
    - expect: The view scrolls to the top of the list
  4. Switch back to Browse.
    - expect: Browse view displays from the top (scrolled back to FRIDGE section)
    - expect: Added items still show green highlighting
