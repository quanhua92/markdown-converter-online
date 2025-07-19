const { chromium } = require('playwright');

async function testInlineStyle() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Testing with forced style injection...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check what's happening with the styles
    console.log('🔍 Checking computed styles and CSS variables...');
    
    const cssCheck = await page.evaluate(() => {
      const root = document.documentElement;
      const mainDiv = document.querySelector('.min-h-screen');
      
      // Check if CSS variables are available
      const style = getComputedStyle(root);
      const darkBg = style.getPropertyValue('--color-dark-background');
      const slateColors = {};
      for (let i = 50; i <= 950; i += 50) {
        slateColors[i] = style.getPropertyValue(`--color-slate-${i}`);
      }
      
      return {
        darkClass: root.classList.contains('dark'),
        darkBackground: darkBg,
        slateColors: slateColors,
        mainClasses: mainDiv ? mainDiv.className : 'not found'
      };
    });
    
    console.log('📋 CSS Check results:', cssCheck);
    
    // Switch to dark mode
    const darkModeButton = page.locator('button:has-text("Dark")');
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    
    // Check again after dark mode switch
    const cssCheckDark = await page.evaluate(() => {
      const root = document.documentElement;
      const mainDiv = document.querySelector('.min-h-screen');
      const style = getComputedStyle(root);
      const mainStyle = mainDiv ? getComputedStyle(mainDiv) : null;
      
      return {
        darkClass: root.classList.contains('dark'),
        darkBackground: style.getPropertyValue('--color-dark-background'),
        mainBgColor: mainStyle ? mainStyle.backgroundColor : 'not found',
        mainBgImage: mainStyle ? mainStyle.backgroundImage : 'not found'
      };
    });
    
    console.log('🌙 Dark mode CSS check:', cssCheckDark);
    
    // Try to manually set the background style to test if it works
    await page.evaluate(() => {
      const mainDiv = document.querySelector('.min-h-screen');
      if (mainDiv && document.documentElement.classList.contains('dark')) {
        mainDiv.style.backgroundColor = '#0f172a';
        console.log('🎨 Manually set dark background');
      }
    });
    
    await page.screenshot({ 
      path: 'test-with-manual-style.png',
      fullPage: true
    });
    console.log('📸 Screenshot with manual style saved');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testInlineStyle().catch(console.error);