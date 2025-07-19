const { chromium } = require('playwright');

async function debugWorkspace() {
  console.log('🔍 Debugging workspace functionality...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Track React errors specifically
  let hasReactError = false;
  let reactErrorDetails = null;
  
  // Listen for console messages
  page.on('console', msg => {
    const text = msg.text();
    console.log('🖥️  Console:', msg.type(), text);
    
    // Check for React error #185
    if (text.includes('Minified React error #185') || text.includes('React error #185')) {
      hasReactError = true;
      reactErrorDetails = text;
      console.log('🚨 REACT ERROR #185 DETECTED:', text);
    }
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.log('❌ Page error:', error.message);
    if (error.message.includes('React error #185')) {
      hasReactError = true;
      reactErrorDetails = error.message;
    }
  });
  
  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(5000);
    
    // Check localStorage for workspace data
    const workspaceData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('workspace')) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
    
    console.log('💾 Workspace localStorage:', JSON.stringify(workspaceData, null, 2));
    
    // Check if useFileSystem returns workspace functions
    const hasWorkspaceFunctions = await page.evaluate(() => {
      // Try to find any workspace-related UI elements
      const workspaceElements = document.querySelectorAll('*[data-testid*="workspace"], *[class*="workspace"], select, [data-slot="select-trigger"]');
      return {
        workspaceElementsCount: workspaceElements.length,
        workspaceElements: Array.from(workspaceElements).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          textContent: el.textContent?.substring(0, 50)
        }))
      };
    });
    
    console.log('🔍 Workspace UI elements:', JSON.stringify(hasWorkspaceFunctions, null, 2));
    
    // Check if file tree exists
    const fileTreeExists = await page.evaluate(() => {
      const fileTree = document.querySelector('[class*="file"], [data-testid*="file"]');
      return {
        exists: !!fileTree,
        html: fileTree ? fileTree.outerHTML.substring(0, 200) : 'Not found'
      };
    });
    
    console.log('📁 File tree check:', JSON.stringify(fileTreeExists, null, 2));
    
    await page.screenshot({ path: 'tests/screenshots/workspace-debug.png', fullPage: true });
    
    // Report React error status
    if (hasReactError) {
      console.log('🚨 CRITICAL: React error #185 is still occurring!');
      console.log('📝 Error details:', reactErrorDetails);
      console.log('❌ TEST FAILURE: Workspace functionality has React errors');
    } else {
      console.log('✅ No React errors detected - workspace functionality appears stable');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
  }
}

debugWorkspace().catch(console.error);