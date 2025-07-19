const { chromium } = require('playwright');

async function testReactErrors() {
  console.log('🔍 Testing for React errors in the application...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let reactErrors = [];
  let consoleErrors = [];
  
  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    console.log(`📟 Console [${type}]:`, text);
    
    // Track React errors
    if (text.includes('React error') || text.includes('Minified React error')) {
      reactErrors.push({ type, text });
    }
    
    // Track any error messages
    if (type === 'error') {
      consoleErrors.push(text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('❌ Page error:', error.message);
    if (error.message.includes('React error')) {
      reactErrors.push({ type: 'pageerror', text: error.message });
    }
  });
  
  try {
    await page.goto('http://localhost:3000/explorer');
    console.log('📍 Navigated to explorer page');
    
    // Wait a bit for any errors to surface
    await page.waitForTimeout(5000);
    
    // Check if workspace selector elements exist
    const workspaceElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="workspace"], [data-testid*="workspace"]');
      const textElements = Array.from(document.querySelectorAll('div')).filter(el => 
        el.textContent && (el.textContent.includes('Default Workspace') || el.textContent.includes('Current workspace'))
      );
      
      const allElements = [...elements, ...textElements];
      return allElements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        textContent: el.textContent?.substring(0, 100),
        visible: el.offsetParent !== null
      }));
    });
    
    console.log('🔍 Workspace elements found:', workspaceElements.length);
    workspaceElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}.${el.className} - "${el.textContent}" (visible: ${el.visible})`);
    });
    
    // Check if file tree is properly rendered
    const fileTreeInfo = await page.evaluate(() => {
      const fileTreeCards = document.querySelectorAll('[class*="card"]');
      const buttons = document.querySelectorAll('button');
      const fileElements = document.querySelectorAll('[data-testid*="file"]');
      
      const filesHeaders = Array.from(document.querySelectorAll('h3, [class*="title"]')).filter(el => 
        el.textContent && el.textContent.includes('Files')
      );
      
      return {
        cards: fileTreeCards.length,
        buttons: buttons.length,
        fileElements: fileElements.length,
        hasFilesHeader: filesHeaders.length > 0
      };
    });
    
    console.log('📁 File tree info:', fileTreeInfo);
    
    // Take screenshot for visual inspection
    await page.screenshot({ path: 'tests/screenshots/react-error-check.png', fullPage: true });
    
    // Report findings
    console.log('\n📊 ERROR ANALYSIS:');
    console.log(`React errors detected: ${reactErrors.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Workspace elements visible: ${workspaceElements.filter(el => el.visible).length}`);
    
    if (reactErrors.length > 0) {
      console.log('\n🚨 REACT ERRORS FOUND:');
      reactErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. [${error.type}] ${error.text}`);
      });
    }
    
    if (consoleErrors.length > 0) {
      console.log('\n⚠️  CONSOLE ERRORS:');
      consoleErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Determine overall status
    if (reactErrors.length > 0) {
      console.log('\n❌ TEST RESULT: React errors detected - workspace functionality is broken');
      return false;
    } else if (workspaceElements.filter(el => el.visible).length === 0) {
      console.log('\n⚠️  TEST RESULT: No React errors, but workspace UI not visible - possible rendering issue');
      return false;
    } else {
      console.log('\n✅ TEST RESULT: No React errors and workspace UI is rendering');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testReactErrors().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});