const { chromium } = require('playwright');

async function takeHeaderScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Take light mode header screenshot
    console.log('📸 Taking light mode header screenshot...');
    await page.screenshot({ 
      path: 'light-header-improved.png',
      clip: { x: 0, y: 0, width: 1400, height: 400 }
    });
    
    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1000);
    
    // Take dark mode header screenshot
    console.log('📸 Taking dark mode header screenshot...');
    await page.screenshot({ 
      path: 'dark-header-improved.png',
      clip: { x: 0, y: 0, width: 1400, height: 400 }
    });
    
    console.log('✅ Header screenshots saved');
    
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeHeaderScreenshots().catch(console.error);