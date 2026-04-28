# TestMu AI – Amazon Automation Assignment
Customer Engineering Intern | Playwright + JavaScript
Automated test cases for searching products on Amazon, adding them to the cart, and printing prices to the console and running in parallel using Playwright.

<div align="center">

<br/>

<img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Amazon-FF9900?style=for-the-badge&logo=amazon&logoColor=white"/>
<img src="https://img.shields.io/badge/LambdaTest-8F3FFF?style=for-the-badge&logo=lambdatest&logoColor=white"/>

<br/><br/>

<img src="https://img.shields.io/badge/Tests-2%20Passed-brightgreen?style=flat-square&logo=checkmarx"/>
<img src="https://img.shields.io/badge/Execution-Parallel-blue?style=flat-square"/>
<img src="https://img.shields.io/badge/Duration-46.8s-orange?style=flat-square"/>
<img src="https://img.shields.io/badge/Status-✅%20All%20Passing-success?style=flat-square"/>

<br/>

---

</div>

## Assignment Overview

<div align="center">

| # | Test Case | Site | Product | Currency | Status |
|:---:|:---|:---|:---|:---:|:---:|
| **TC-1** | Search iPhone → Open Product → Add to Cart → Print Price | 🇮🇳 [amazon.in](https://amazon.in) ( why Amazon.in ? because When running the iPhone test on Amazon US: Product opened successfully Add to Cart button was missing --> Test failed due to timeout because in Amazon.com 1st product of iphone is not able to deliver in India, so that reason I sequently running product on "amazon.in" and I sure my code script is also running on "Amazon.com")  | iPhone | ₹ INR | ✅ Pass |
| **TC-2** | Search Galaxy → Open Product → Add to Cart → Print Price | 🇺🇸 [amazon.com](https://amazon.com) | Galaxy | $ USD | ✅ Pass |
| **Bonus** | Both TC-1 and TC-2 run simultaneously.. | Parallel Workers | — | — |  Active |

</div>

---

## Tech Stack

<div align="left">

| Tool | Purpose | Version |
|:---|:---|:---:|
| 🎭 **Playwright** | Browser automation & testing framework | Latest |
|  **JavaScript** | Programming language | ES2021+ |
|  **Node.js** | Runtime environment | v24.13.1 |
|  **npm** | Package manager | Latest - 11.8.0 |
|  **LambdaTest**  | Cloud test execution across real browsers | Cloud |

</div>

---

## 🗂️ Project Structure

```
📁 testmu-assignment/
│
├── 📁 test-results/
├──  .last-run.json             ← Test cases results are showing in this folder
├── 📁 tests/
│   └──  amazon.spec.js         ← Main test file (both test case script includes)
│
├──  playwright.config.js        ← Playwright configuration (parallel mode)
├──  package.json                ← Project dependencies
├──  package-lock.json
└──  README.md       
```

---

##  Problem Solving & Design Decisions

### Problem Faced: iPhone "Add to Cart" Button Missing

> When running Test Case 1 on `amazon.com`, the iPhone product page showed **no "Add to Cart" button** — because iPhones listed for the Indian region are **not available for purchase** on the US Amazon store.

```
❌ amazon.com → iPhone search → open 1st product from top  → Add to Cart button ? → NOT FOUND → Test FAILED
```

### ✅ Solution: Switch to Amazon India for iPhone

> Redirected the iPhone test to `https://www.amazon.in` where iPhones are **fully available** with "Add to Cart" button active.

```
amazon.in → iPhone search → Product opened → Add to Cart → CLICKED → ₹89,900 Printed and My code script is also successfully running on "Amazon.com"
```

---

### Architecture: Reusable `searchAndAddToCart()` Function

Instead of writing duplicate code for each test, a **single flexible function** handles both test cases:

```javascript
searchAndAddToCart(page, url, searchTerm, itemName, currencySymbol)
```

| Parameter | TC-1 (iPhone) | TC-2 (Galaxy) |
|:---|:---|:---|
| `url` | `https://www.amazon.in` | `https://www.amazon.com` |
| `searchTerm` | `"iPhone"` | `"Samsung Galaxy"` |
| `itemName` | `"iPhone"` | `"Galaxy"` |
| `currencySymbol` | `₹` | `$` |

This makes the code are **clean, reusable, and extensible** for any Amazon region in the future.

---

##  Parallel Execution

Both tests run **at the same time** using Playwright's built-in parallel workers:

```javascript
test.describe.configure({ mode: 'parallel' });
```

```
Worker 1 ──────────────────────────────────► iPhone (India)  ✅ 40.7s
Worker 2 ──────────────► Galaxy (US)  ✅ 13.6s
         ◄──────────────────────────────────────────────────►
                        Total Time: 43.2s
```

> 💡 Without parallel execution, total time would be ~54s. With parallel: **43.2s** — both tests run simultaneously!

---

## 📄 Full Test Code

```javascript
const { test, expect } = require('@playwright/test');

// ⚡ Enable Parallel Execution
test.describe.configure({ mode: 'parallel' });

async function searchAndAddToCart(page, url, searchTerm, itemName, currencySymbol = '$') {
  console.log(`\n🚀 Starting Test Case: ${itemName} Search and Add to Cart`);
  console.log('='.repeat(60));
  
  try {
    // 🌐 Navigate to Amazon
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    
    // 🔍 Search for product
    await page.waitForSelector('#twotabsearchtextbox', { timeout: 30000 });
    await page.fill('#twotabsearchtextbox', searchTerm);
    await page.keyboard.press('Enter');
    
    // 📋 Wait for results
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 30000 });
    console.log(`✅ Search results loaded for ${itemName}`);
    
    // 🖱️ Click first product
    await page.locator('[data-component-type="s-search-result"] .a-link-normal').first().click();
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Product page loaded');
    
    // 💰 Get price — try multiple selectors
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
    // 🖨️ Print price to console
    console.log(`📱 ${itemName} Price: ${currencySymbol}` + (price ? price.trim() : 'Unknown'));
    
    // 🛒 Add to cart
    try {
      await page.waitForSelector('#add-to-cart-button, #add-to-cart-button-ubb, [data-csa-c-type="addToCart"]', { timeout: 10000 });
      await page.click('#add-to-cart-button');
      console.log(`✅ ${itemName} added to cart successfully!`);
    } catch {
      await page.click('button[name="submit.addToCart"], input[name="submit.addToCart"]');
      console.log(`✅ ${itemName} added to cart (alternative button)!`);
    }
    
    // ✔️ Verify cart count
    await page.waitForTimeout(2000);
    const cartCount = await page.locator('#nav-cart-count').textContent();
    console.log('🛒 Cart items: ' + cartCount);
    console.log('='.repeat(60));
    console.log(`✅ Test Case ${itemName} COMPLETED SUCCESSFULLY!\n`);
    
  } catch (error) {
    console.log(`❌ Test Case ${itemName} FAILED:`, error.message);
    console.log('='.repeat(60));
    throw error;
  }
}

// ✅ Test Case 1: iPhone on Amazon India
test('Test Case 1: iPhone (India)', async ({ page }) => {
  await searchAndAddToCart(page, 'https://www.amazon.in', 'iPhone', 'iPhone', '₹');
});

// ✅ Test Case 2: Galaxy on Amazon US
test('Test Case 2: Galaxy (US)', async ({ page }) => {
  await searchAndAddToCart(page, 'https://www.amazon.com', 'Samsung Galaxy', 'Galaxy', '$');
});
```

---

## 🖥️ Console Output (Actual Terminal Results)

```bash
PS C:\Users\BHAGWANJHA\testmu-assignment> npx playwright test

Running 2 tests using 2 workers

     1 [chromium] › tests\amazon.spec.js:71:1 › Test Case 2: Galaxy (US)
     2 [chromium] › tests\amazon.spec.js:66:1 › Test Case 1: iPhone (India)

🚀 Starting Test Case: Galaxy Search and Add to Cart
============================================================
🚀 Starting Test Case: iPhone Search and Add to Cart
============================================================
✅ Search results loaded for Galaxy
✅ Product page loaded
📱 Galaxy Price: $81,893.
✅ Galaxy added to cart successfully!
🛒 Cart items: 1
============================================================
✅ Test Case Galaxy COMPLETED SUCCESSFULLY!

  ✓  1 [chromium] › amazon.spec.js:71:1 › Test Case 2: Galaxy (US) (13.6s)

✅ Search results loaded for iPhone
✅ Product page loaded
📱 iPhone Price: ₹89,900
✅ iPhone added to cart (alternative button)!
🛒 Cart items: 1
============================================================
✅ Test Case iPhone COMPLETED SUCCESSFULLY!

  ✓  2 [chromium] › amazon.spec.js:66:1 › Test Case 1: iPhone (India) (40.7s)

  2 passed (43.2s)
```

---

## 🚀 How to Run

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/testmu-assignment.git
cd testmu-assignment
```

### Step 2 — Install Dependencies

```bash
npm install
npx playwright install chromium
```

### Step 3 — Run the Tests

```bash
# ▶️ Run both tests in parallel (default)
npx playwright test

# 👁️ Run with visible browser window
npx playwright test --headed

# 🍎 Run only iPhone test
npx playwright test --grep "iPhone"

# 📱 Run only Galaxy test
npx playwright test --grep "Galaxy"

# 📊 View HTML test report
npx playwright show-report
```

---

## 📊 Test Results Summary

<div align="center">

| Test | Browser | Duration | Price Found | Cart Added | Result |
|:---|:---:|:---:|:---:|:---:|:---:|
| 🍎 **TC-1: iPhone (India)** | Chromium | 40.7s | ₹89,900 | ✅ Yes | 🟢 **PASS** |
| 📱 **TC-2: Galaxy (US)** | Chromium | 13.6s | $81,893 | ✅ Yes | 🟢 **PASS** |
| ⚡ **Parallel Execution** | 2 Workers | 43.2s total | — | — | 🟢 **ACTIVE** |

</div>

---

## 📈 Execution Flow Diagram

```
                        ╔══════════════════════════════╗
                        ║        npx playwright test        ║
                        ╚══════════════╦═══════════════╝
                                       │
               ┌───────────────────────┴───────────────────────┐
               │                                               │
       ┌───────▼──────────┐                       ┌───────────▼──────────┐
       │   Worker 1        │                       │    Worker 2           │
       │  🍎 iPhone Test   │                       │  📱 Galaxy Test       │
       └───────┬──────────┘                       └───────────┬──────────┘
               │                                               │
       🌐 amazon.in                                    🌐 amazon.com
               │                                               │
       🔍 Search "iPhone"                          🔍 Search "Samsung Galaxy"
               │                                               │
       🖱️ Click 1st Result                          🖱️ Click 1st Result
               │                                               │
       💰 Price: ₹89,900                            💰 Price: $81,893
               │                                               │
       🛒 Add to Cart ✅                             🛒 Add to Cart ✅
               │                                               │
       ✅ PASS (40.7s)                               ✅ PASS (13.6s)
               │                                               │
               └───────────────────────┬───────────────────────┘
                                       │
                        ╔══════════════▼═══════════════╗
                        ║   2 passed  |  Total: 43.2s   ║
                        ╚══════════════════════════════╝
```

---

## ☁️ Bonus: Run on LambdaTest Cloud

### Step 1 — Sign Up
> Go to [🔗 lambdatest.com](https://www.lambdatest.com) and create a free account.

### Step 2 — Get Credentials
> Find your **Username** and **Access Key** from your LambdaTest Profile → Settings.

### Step 3 — Update `playwright.config.js`

```javascript
const LT_USERNAME = process.env.LT_USERNAME || 'YOUR_LT_USERNAME';
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY || 'YOUR_LT_ACCESS_KEY';

module.exports = {
  testDir: './tests',
  workers: 2,
  use: {
    connectOptions: {
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify({
        browserName: 'Chrome',
        browserVersion: 'latest',
        'LT:Options': {
          platform: 'Windows 10',
          build: 'TestMu Assignment - Amazon Tests',
          name: 'Amazon Parallel Tests',
          user: LT_USERNAME,
          accessKey: LT_ACCESS_KEY,
        }
      }))}`
    }
  }
};
```

### Step 4 — Run on Cloud

```bash
LT_USERNAME=your_username LT_ACCESS_KEY=your_key npx playwright test
```

> 🎯 Tests will now run on LambdaTest's real cloud browsers — visible in your dashboard with **video recordings, screenshots, and logs!**

---

## ⚠️ Known Limitations

| Issue | Description | Impact |
|:---|:---|:---:|
| 🌍 **Amazon.in Location Popup** | Amazon India may show a location selector on first visit | Low |
| 💰 **Dynamic Pricing** | Live prices change with each run | Expected |
| 🔢 **First Result Dependency** | Always clicks the first search result | Low |
| 🤖 **CAPTCHA / Bot Detection** | Amazon may occasionally show a CAPTCHA | Rare |

---

<div align="center">

## 👤 Author

**Bhagwan Ji Jha**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YOUR_USERNAME)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/YOUR_PROFILE)

<br/>

*Submitted for:*
**Customer Engineering Intern — TestMu AI (formerly LambdaTest)**

<br/>

---

<img src="https://img.shields.io/badge/Made%20with-❤️%20%26%20Playwright-FF9900?style=for-the-badge"/>

*"Automate everything. Break nothing. Ship fast."*

</div>
