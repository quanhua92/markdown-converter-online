const { chromium } = require('playwright');

async function testDebugConsole() {
  console.log('🔍 Starting debug session with extensive console logging...');
  
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage();
  
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Capture ALL console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    console.log(`📟 [${type.toUpperCase()}] ${text}`);
    if (location.url) {
      console.log(`    📍 ${location.url}:${location.lineNumber}:${location.columnNumber}`);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('💥 PAGE ERROR:', error.message);
    console.log('    Stack:', error.stack);
  });
  
  // Capture request failures
  page.on('requestfailed', request => {
    console.log('🌐 REQUEST FAILED:', request.url());
    console.log('    Failure:', request.failure().errorText);
  });
  
  try {
    console.log('🚀 Navigating to explorer...');
    await page.goto('http://localhost:3000/explorer');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(10000); // Wait longer
    
    console.log('📱 Looking for workspace manager logs...');
    
    // Wait for workspace manager initialization
    await page.waitForFunction(() => {
      // Look for workspace manager console logs
      return true; // Let it timeout naturally
    }, { timeout: 5000 }).catch(() => {
      console.log('⏰ Timeout waiting for workspace manager');
    });
    
    console.log('🔎 Checking for workspace elements...');
    
    // Get all elements with workspace-related text
    const workspaceElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements
        .filter(el => {
          const text = el.textContent || '';
          return text.includes('workspace') || 
                 text.includes('Workspace') || 
                 text.includes('Default') ||
                 text.includes('Files');
        })
        .map(el => ({
          tagName: el.tagName,
          textContent: el.textContent?.substring(0, 100),
          className: el.className || '',
          visible: el.offsetParent !== null
        }))
        .slice(0, 10); // Limit to first 10
    });
    
    console.log('💼 Workspace elements found:', JSON.stringify(workspaceElements, null, 2));
    
    console.log('🔍 Looking for buttons...');
    
    // Get all buttons
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button'))
        .map((btn, index) => ({
          index,
          text: btn.textContent?.trim(),
          className: btn.className,
          visible: btn.offsetParent !== null,
          title: btn.title
        }))
        .filter(btn => btn.visible)
        .slice(0, 5); // First 5 visible buttons
    });
    
    console.log('🔘 Visible buttons:', JSON.stringify(buttons, null, 2));
    
    // Try to find and click mobile menu
    const menuButtonFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const menuButton = buttons.find(btn => {
        const classes = btn.className || '';
        const title = btn.title || '';
        return classes.includes('lg:hidden') || 
               title.includes('file') || 
               title.includes('menu') ||
               classes.includes('menu');
      });
      
      if (menuButton) {
        console.log('🎯 Found menu button, clicking...');
        menuButton.click();
        return true;
      }
      return false;
    });
    
    if (menuButtonFound) {
      console.log('✅ Clicked menu button, waiting for sheet...');
      await page.waitForTimeout(3000);
      
      // Check for errors after clicking
      console.log('🔍 Checking for React errors after menu click...');
    } else {
      console.log('❌ No menu button found');
    }
    
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ 
      path: 'tests/screenshots/debug-console-final.png', 
      fullPage: true 
    });
    
  } catch (error) {
    console.error('💥 Debug error:', error.message);
  } finally {
    console.log('🏁 Debug session complete - leaving browser open for manual inspection');
    // Don't close browser automatically - let user inspect
    // await browser.close();
  }
}

testDebugConsole();