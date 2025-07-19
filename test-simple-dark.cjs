const { chromium } = require('playwright');

async function testSimpleDark() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Testing simple dark mode...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check light mode
    const lightBg = await page.locator('div.min-h-screen').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage
      };
    });
    console.log('☀️ Light mode background:', lightBg);
    
    // Switch to dark mode
    const darkModeButton = page.locator('button:has-text("Dark")');
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    
    // Check dark mode
    const darkBg = await page.locator('div.min-h-screen').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage
      };
    });
    console.log('🌙 Dark mode background:', darkBg);
    
    // Take screenshots
    await page.screenshot({ 
      path: 'test-simple-dark.png',
      fullPage: true
    });
    console.log('📸 Simple dark mode screenshot saved');
    
    // Check if the classes are correctly applied
    const mainClasses = await page.locator('div.min-h-screen').getAttribute('class');
    console.log('📋 Main container classes:', mainClasses);
    
    // Check HTML dark class
    const htmlHasDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    console.log('🔍 HTML has dark class:', htmlHasDark);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testSimpleDark().catch(console.error);