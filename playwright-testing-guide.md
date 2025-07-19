# Playwright Testing Guide

This guide shows how to use Playwright for automated testing in this project.

## Installation

```bash
# Playwright is already included in package.json
pnpm install

# Install browsers (if needed)
npx playwright install
```

## Basic Usage

### 1. Simple Test Script

```javascript
import { chromium } from 'playwright';

async function basicTest() {
  // Launch browser (headless: false shows the browser window)
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to your app
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    
  } finally {
    await browser.close();
  }
}

basicTest().catch(console.error);
```

### 2. Element Interaction

```javascript
// Find elements by text, selector, or other methods
const button = await page.locator('button:has-text("Convert")');
const textarea = await page.locator('textarea').first();
const specificDiv = await page.locator('.css-class-name');

// Check if element exists and is visible
const isVisible = await button.isVisible();
const exists = await button.count() > 0;

// Click elements
await button.click();

// Fill forms
await textarea.fill('# My Markdown Content');

// Get text content
const text = await button.textContent();
```

### 3. Waiting for Elements

```javascript
// Wait for element to appear
await page.waitForSelector('button:has-text("Download")');

// Wait for element to be visible
await page.waitForSelector('.download-button', { state: 'visible' });

// Wait with timeout
await page.waitForTimeout(5000); // Wait 5 seconds

// Wait for page load
await page.waitForLoadState('networkidle');
```

### 4. Console Logging and Debugging

```javascript
// Listen to browser console logs
page.on('console', msg => {
  console.log('Browser console:', msg.type(), msg.text());
});

// Execute JavaScript in browser context
const result = await page.evaluate(() => {
  const body = document.body.textContent;
  return {
    hasText: body.includes('some text'),
    elementCount: document.querySelectorAll('.item').length
  };
});
```

## Real Examples from This Project

### Testing Git Commit Hash Display

```javascript
import { chromium } from 'playwright';

async function testGitCommitHash() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    console.log('🔧 Browser console:', msg.type(), msg.text());
  });
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check if git commit hash appears in footer
    const gitHashInContent = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      return {
        hasHash: bodyText.includes('c4eb159'),
        footerText: bodyText.match(/Powered by.*?Git:[^•]*/)?.[0] || 'Footer not found'
      };
    });
    
    console.log('Git hash results:', gitHashInContent);
    
  } finally {
    await browser.close();
  }
}
```

### Testing Form Functionality

```javascript
async function testMarkdownConversion() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    
    // Fill markdown textarea
    const textarea = await page.locator('textarea').first();
    await textarea.fill('# Test\\n\\nThis is a test.');
    
    // Click convert button
    const convertButton = await page.locator('button:has-text("Convert")').first();
    await convertButton.click();
    
    // Wait for conversion result (with timeout)
    let converted = false;
    for (let i = 0; i < 30; i++) {
      const downloadButton = await page.locator('button:has-text("Download")').first();
      if (await downloadButton.isVisible()) {
        console.log('✅ Conversion completed!');
        converted = true;
        break;
      }
      await page.waitForTimeout(1000);
    }
    
    if (!converted) {
      console.log('❌ Conversion failed or timed out');
    }
    
  } finally {
    await browser.close();
  }
}
```

### Testing Multiple Elements

```javascript
async function testUIElements() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    
    // Test multiple buttons
    const buttonTests = {
      'Converter': 'button:has-text("Converter")',
      'Guides': 'button:has-text("Guides")',
      'Clear': 'button:has-text("Clear")'
    };
    
    for (const [name, selector] of Object.entries(buttonTests)) {
      const button = await page.locator(selector).first();
      const isVisible = await button.isVisible();
      console.log(`${name} button: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
    }
    
    // Test all buttons on page
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons total`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`Button ${i + 1}: "${text}" - Visible: ${isVisible}`);
    }
    
  } finally {
    await browser.close();
  }
}
```

## Running Tests

### 1. Start Your Application
```bash
# Make sure your app is running
docker compose up -d
# or
pnpm dev
```

### 2. Run Individual Tests
```bash
# Run specific test files
node playwright-test.js
node playwright-console-test.js
node playwright-conversion-test.js
```

### 3. Using with npm scripts
Add to your `package.json`:
```json
{
  "scripts": {
    "test:ui": "node playwright-test.js",
    "test:conversion": "node playwright-conversion-test.js",
    "test:all": "node playwright-test.js && node playwright-conversion-test.js"
  }
}
```

Then run:
```bash
pnpm test:ui
pnpm test:conversion
pnpm test:all
```

## Best Practices

### 1. Use Page Object Pattern
```javascript
class MarkdownConverterPage {
  constructor(page) {
    this.page = page;
    this.textarea = page.locator('textarea').first();
    this.convertButton = page.locator('button:has-text("Convert")');
    this.downloadButton = page.locator('button:has-text("Download")');
  }
  
  async fillMarkdown(content) {
    await this.textarea.fill(content);
  }
  
  async clickConvert() {
    await this.convertButton.click();
  }
  
  async waitForConversion() {
    await this.downloadButton.waitFor({ state: 'visible', timeout: 30000 });
  }
}
```

### 2. Error Handling
```javascript
try {
  await page.goto('http://localhost:3000');
  // ... test code
} catch (error) {
  console.error('Test failed:', error);
  await page.screenshot({ path: 'error-screenshot.png' });
} finally {
  await browser.close();
}
```

### 3. Debugging Tips
```javascript
// Enable slow motion
const browser = await chromium.launch({ 
  headless: false, 
  slowMo: 1000 // 1 second delay between actions
});

// Keep browser open for debugging
const browser = await chromium.launch({ 
  headless: false,
  devtools: true // Open dev tools
});

// Take screenshots at key points
await page.screenshot({ path: 'before-click.png' });
await button.click();
await page.screenshot({ path: 'after-click.png' });
```

## Common Selectors

```javascript
// By text content
page.locator('button:has-text("Convert")')
page.locator('text=Download')

// By CSS class
page.locator('.btn-primary')
page.locator('.card .title')

// By HTML attributes
page.locator('[data-testid="submit-button"]')
page.locator('input[type="email"]')

// By position
page.locator('button').first()
page.locator('button').last()
page.locator('button').nth(2)

// Complex selectors
page.locator('div:has(h2:has-text("Title"))')
page.locator('button:visible')
page.locator('input:enabled')
```

This testing approach helps ensure your application works correctly across different scenarios and provides confidence when making changes.