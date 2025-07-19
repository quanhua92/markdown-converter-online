const { chromium } = require('playwright');

async function testDarkElements() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Testing dark mode on different elements...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Switch to dark mode first
    const darkModeButton = page.locator('button:has-text("Dark")');
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    
    // Test various elements to see if any dark classes work
    const elementTests = await page.evaluate(() => {
      const elements = [
        { name: 'main container', selector: '.min-h-screen' },
        { name: 'card', selector: '[data-slot="card"]' },
        { name: 'button', selector: 'button' },
        { name: 'title text', selector: 'h1' },
        { name: 'max-w container', selector: '.max-w-4xl' }
      ];
      
      const results = [];
      
      elements.forEach(({ name, selector }) => {
        const el = document.querySelector(selector);
        if (el) {
          const styles = getComputedStyle(el);
          results.push({
            name,
            selector,
            classes: el.className,
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            backgroundImage: styles.backgroundImage
          });
        }
      });
      
      return results;
    });
    
    console.log('🎨 Element styles in dark mode:');
    elementTests.forEach(test => {
      console.log(`📋 ${test.name}:`);
      console.log(`   Classes: ${test.classes}`);
      console.log(`   Background: ${test.backgroundColor}`);
      console.log(`   Color: ${test.color}`);
      console.log(`   BG Image: ${test.backgroundImage}`);
      console.log('');
    });
    
    // Check if we can manually apply a working dark class
    console.log('🧪 Testing manual dark class application...');
    const manualTest = await page.evaluate(() => {
      // Try adding a simple text color class that should work
      const title = document.querySelector('h1');
      if (title) {
        const originalClasses = title.className;
        title.className = originalClasses + ' text-white';
        const newStyles = getComputedStyle(title);
        return {
          original: originalClasses,
          new: title.className,
          color: newStyles.color
        };
      }
      return null;
    });
    
    console.log('🧪 Manual test result:', manualTest);
    
    // Take screenshot after manual test
    await page.screenshot({ 
      path: 'test-dark-elements.png',
      fullPage: true
    });
    console.log('📸 Dark elements test screenshot saved');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testDarkElements().catch(console.error);