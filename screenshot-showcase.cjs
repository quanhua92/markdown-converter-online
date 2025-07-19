const { chromium } = require('playwright');

async function takeShowcaseScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Select the Ultimate Showcase template
    console.log('📸 Selecting Ultimate Showcase template...');
    const selectTrigger = page.locator('button:has-text("Load Template")').first();
    await selectTrigger.click();
    await page.waitForTimeout(500);
    
    const showcaseOption = page.locator('text=Ultimate Showcase');
    await showcaseOption.click();
    await page.waitForTimeout(2000);
    
    // Take full page screenshot in light mode
    console.log('📸 Taking showcase light mode screenshot...');
    await page.screenshot({ 
      path: 'showcase-light-mode.png',
      fullPage: true
    });
    
    // Switch to dark mode
    const darkModeButton = page.locator('button:has-text("Dark")');
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    
    // Take full page screenshot in dark mode
    console.log('📸 Taking showcase dark mode screenshot...');
    await page.screenshot({ 
      path: 'showcase-dark-mode.png',
      fullPage: true
    });
    
    // Enable preview mode
    const previewButton = page.locator('button:has-text("Preview")').first();
    await previewButton.click();
    await page.waitForTimeout(2000);
    
    // Take preview mode screenshot
    console.log('📸 Taking showcase preview mode screenshot...');
    await page.screenshot({ 
      path: 'showcase-preview-mode.png',
      fullPage: true
    });
    
    console.log('✅ Showcase screenshots saved');
    
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeShowcaseScreenshots().catch(console.error);