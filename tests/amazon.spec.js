const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'parallel' });

async function searchAndAddToCart(page, url, searchTerm, itemName, currencySymbol = '$') {
  console.log(`\n Starting Test Case: ${itemName} Search and Add to Cart`);
  console.log('='.repeat(60));
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    
    await page.waitForSelector('#twotabsearchtextbox', { timeout: 30000 });
    await page.fill('#twotabsearchtextbox', searchTerm);
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 30000 });
    console.log(` Search results loaded for ${itemName}`);
    
    await page.locator('[data-component-type="s-search-result"] .a-link-normal').first().click();
    await page.waitForLoadState('domcontentloaded');
    console.log(' Product page loaded');
    
    let price = '';
    try {
      const priceWhole = page.locator('.a-price-whole').first();
      await priceWhole.waitFor({ timeout: 10000 });
      price = await priceWhole.textContent();
    } catch {
      try {
        const priceSpan = page.locator('#priceblock_ourprice, #priceblock_dealprice, .a-price').first();
        price = await priceSpan.textContent();
      } catch {
        price = 'Price not found';
      }
    }
    console.log(` ${itemName} Price: ${currencySymbol}` + (price ? price.trim() : 'Unknown'));
    
    try {
      await page.waitForSelector('#add-to-cart-button, #add-to-cart-button-ubb, [data-csa-c-type="addToCart"]', { timeout: 10000 });
      await page.click('#add-to-cart-button');
      console.log(` ${itemName} added to cart successfully!`);
    } catch {
      // Try alternative add to cart button
      await page.click('button[name="submit.addToCart"], input[name="submit.addToCart"]');
      console.log(` ${itemName} added to cart (alternative button)!`);
    }
    
    // Verify cart
    await page.waitForTimeout(2000);
    const cartCount = await page.locator('#nav-cart-count').textContent();
    console.log(' Cart items: ' + cartCount);
    console.log('='.repeat(60));
    console.log(` Test Case ${itemName} COMPLETED SUCCESSFULLY!\n`);
    
  } catch (error) {
    console.log(` Test Case ${itemName} FAILED:`, error.message);
    console.log('='.repeat(60));
    throw error;
  }
}


// Problem : when I used Amazon.com as URL, Its open Iphone 17 pro 1st of the search list . those Iphone 17 pro is not deliver in India (my location), so I am not able to access Add to cart button these reason, my script can't goes proceed to next step , I use Amazon.in.
// Test Case 1 
test('Test Case 1: iPhone (India)', async ({ page }) => {
  await searchAndAddToCart(page, 'https://www.amazon.in', 'iPhone', 'iPhone', '₹');
});

// Test Case 2  : All country 
test('Test Case 2: Galaxy (US)', async ({ page }) => {
  await searchAndAddToCart(page, 'https://www.amazon.com', 'Samsung Galaxy', 'Galaxy', '$');
});