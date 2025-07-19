const { chromium } = require('playwright');

async function testDarkModeFix() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Testing dark mode fix...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Take light mode screenshot
    await page.screenshot({ 
      path: 'test-light-fixed.png',
      fullPage: true
    });
    console.log('📸 Light mode screenshot saved');
    
    // Switch to dark mode
    const darkModeButton = page.locator('button:has-text("Dark")');
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    
    // Take dark mode screenshot
    await page.screenshot({ 
      path: 'test-dark-fixed.png',
      fullPage: true
    });
    console.log('📸 Dark mode screenshot saved');
    
    // Check background color after fix
    const mainBg = await page.locator('div.min-h-screen').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        classList: el.className
      };
    });
    console.log('🎨 Main background styles after fix:', mainBg);
    
    // Check if dark class is applied to html
    const htmlDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    console.log('🌙 HTML has dark class:', htmlDarkClass);
    
    // Force reload to test again
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Switch to dark mode again after reload
    const darkModeButton2 = page.locator('button:has-text("Dark")');
    await darkModeButton2.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-dark-after-reload.png',
      fullPage: true
    });
    console.log('📸 Dark mode after reload screenshot saved');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testDarkModeFix().catch(console.error);