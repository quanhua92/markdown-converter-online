import { chromium } from 'playwright';

async function runTests() {
  console.log('🎭 Starting Playwright tests...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Navigating to application...');
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    console.log('📄 Page title:', await page.title());
    
    // Check if the debug banner is visible
    console.log('🔍 Checking for debug banner...');
    const debugBanner = await page.locator('.bg-red-500').first();
    if (await debugBanner.isVisible()) {
      console.log('✅ Debug banner is visible');
      const bannerText = await debugBanner.textContent();
      console.log('Debug banner text:', bannerText);
    } else {
      console.log('❌ Debug banner is NOT visible');
    }
    
    // Check for navigation buttons
    console.log('🔍 Checking for navigation buttons...');
    const navButtons = await page.locator('button').all();
    console.log(`Found ${navButtons.length} buttons on the page`);
    
    for (let i = 0; i < Math.min(navButtons.length, 10); i++) {
      const button = navButtons[i];
      const isVisible = await button.isVisible();
      const text = await button.textContent();
      console.log(`Button ${i + 1}: "${text}" - Visible: ${isVisible}`);
    }
    
    // Check for specific buttons we're looking for
    console.log('🔍 Checking for specific buttons...');
    const buttons = {
      'Converter': await page.locator('button:has-text("Converter")').first(),
      'Guides': await page.locator('button:has-text("Guides")').first(),
      'Editor': await page.locator('button:has-text("Editor")').first(),
      'Preview': await page.locator('button:has-text("Preview")').first(),
      'Print': await page.locator('button:has-text("Print")').first(),
      'Clear': await page.locator('button:has-text("Clear")').first()
    };
    
    for (const [name, button] of Object.entries(buttons)) {
      const isVisible = await button.isVisible();
      console.log(`${name} button: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
    }
    
    // Check the textarea
    console.log('🔍 Checking for markdown textarea...');
    const textarea = await page.locator('textarea').first();
    const textareaVisible = await textarea.isVisible();
    console.log(`Textarea visible: ${textareaVisible ? '✅ Yes' : '❌ No'}`);
    
    // Test typing in textarea
    if (textareaVisible) {
      console.log('✏️ Testing textarea input...');
      await textarea.fill('# Test Markdown\n\nThis is a test.');
      console.log('✅ Successfully typed in textarea');
    }
    
    // Test conversion
    console.log('🔄 Testing conversion...');
    const convertButton = await page.locator('button:has-text("Convert")').first();
    if (await convertButton.isVisible()) {
      console.log('Convert button found, clicking...');
      await convertButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Conversion button clicked');
    } else {
      console.log('❌ Convert button not found');
    }
    
    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'playwright-test-screenshot.png', fullPage: true });
    console.log('✅ Screenshot saved as playwright-test-screenshot.png');
    
    // Check console logs
    console.log('🔍 Checking browser console logs...');
    const logs = await page.evaluate(() => {
      return window.console.log.toString();
    });
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);