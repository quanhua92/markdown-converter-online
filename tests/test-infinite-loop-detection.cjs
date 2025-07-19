const { chromium } = require('playwright');

async function testInfiniteLoopDetection() {
  console.log('🔍 Testing for infinite loop detection in mobile workspace...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Track console messages for infinite loop patterns
  const consoleMessages = [];
  const hookCallCounts = new Map();
  let infiniteLoopDetected = false;
  let reactErrorDetected = false;
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    // Log all console messages
    console.log(`📟 Console [${type}]:`, text);
    consoleMessages.push({ type, text, timestamp: Date.now() });
    
    // Track useWorkspaceManager hook calls
    if (text.includes('useWorkspaceManager: Hook called')) {
      const currentCount = hookCallCounts.get('useWorkspaceManager') || 0;
      hookCallCounts.set('useWorkspaceManager', currentCount + 1);
      
      if (currentCount > 5) {
        infiniteLoopDetected = true;
        console.log('🚨 INFINITE LOOP DETECTED: useWorkspaceManager called too many times');
      }
    }
    
    // Track updateWorkspaceFiles calls 
    if (text.includes('updateWorkspaceFiles: Updating')) {
      const currentCount = hookCallCounts.get('updateWorkspaceFiles') || 0;
      hookCallCounts.set('updateWorkspaceFiles', currentCount + 1);
      
      if (currentCount > 5) {
        infiniteLoopDetected = true;
        console.log('🚨 INFINITE LOOP DETECTED: updateWorkspaceFiles called too many times');
      }
    }
    
    // Check for React error #185
    if (text.includes('Maximum update depth exceeded') || 
        text.includes('Error #185') ||
        type === 'error' && text.includes('update')) {
      reactErrorDetected = true;
      console.log('❌ REACT ERROR #185 DETECTED:', text);
    }
  });
  
  page.on('pageerror', error => {
    console.log('❌ Page error:', error.message);
    if (error.message.includes('Maximum update depth') || 
        error.message.includes('update depth exceeded')) {
      reactErrorDetected = true;
      infiniteLoopDetected = true;
    }
  });
  
  try {
    console.log('🚀 Starting infinite loop detection test...');
    
    // Navigate to root first
    await page.goto('http://localhost:3000/');
    console.log('📍 Navigated to root page');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Take screenshot of root page
    await page.screenshot({ 
      path: 'tests/screenshots/infinite-loop-test-root.png', 
      fullPage: true 
    });
    
    // Check page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.textContent?.substring(0, 200),
        hasReactRoot: !!document.querySelector('#root'),
        reactRootContent: document.querySelector('#root')?.textContent?.substring(0, 200),
        allLinks: Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.textContent })),
        allButtons: Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent, className: b.className }))
      };
    });
    
    console.log('📄 Page content:', JSON.stringify(pageContent, null, 2));
    
    // Try to navigate to explorer using React Router
    console.log('🔗 Trying to navigate to explorer...');
    
    // Try direct static file access first
    console.log('🔗 Testing static file access...');
    const staticResponse = await page.goto('http://localhost:3000/assets/index-BWM8v9bV.js');
    console.log('📁 Static file response:', staticResponse?.status());
    
    // Method 1: Direct URL navigation to root and wait for React to load
    await page.goto('http://localhost:3000/');
    console.log('🔗 Waiting for React app to load...');
    
    // Wait for React to render by looking for #app with content
    await page.waitForFunction(() => {
      const app = document.querySelector('#app');
      return app && app.children.length > 0;
    }, { timeout: 10000 }).catch(() => {
      console.log('⚠️ React app did not load within 10 seconds');
    });
    
    await page.waitForTimeout(2000);
    
    // Check if we're on explorer page
    const explorerContent = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasFileTree: !!document.querySelector('[data-testid*="file"], .file-tree, [class*="file"]'),
        hasWorkspace: !!document.querySelector('[class*="workspace"], [data-testid*="workspace"]'),
        bodyText: document.body.textContent?.substring(0, 300)
      };
    });
    
    console.log('🗂️ Explorer page content:', JSON.stringify(explorerContent, null, 2));
    
    // Wait for initial load and watch for immediate infinite loops
    console.log('⏱️  Waiting 5 seconds for initial load and monitoring...');
    await page.waitForTimeout(5000);
    
    // Check hook call counts after initial load
    console.log('📊 Hook call counts after initial load:');
    for (const [hook, count] of hookCallCounts.entries()) {
      console.log(`  ${hook}: ${count} calls`);
      if (count > 3) {
        console.log(`  ⚠️  ${hook} called ${count} times - potential issue`);
      }
    }
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/infinite-loop-test-initial.png', 
      fullPage: true 
    });
    
    // Reset counters for mobile interaction test
    hookCallCounts.clear();
    console.log('🔄 Cleared counters, testing mobile file tree interaction...');
    
    // Find and click the file tree button to trigger mobile sheet
    const fileTreeButton = await page.locator('button[title*="Open file tree"], button[data-testid*="file"]').first();
    const buttonExists = await fileTreeButton.count() > 0;
    
    if (buttonExists) {
      console.log('🖱️  Found file tree button, clicking...');
      await fileTreeButton.click();
      
      // Monitor for 10 seconds after clicking for infinite loops
      console.log('⏱️  Monitoring for 10 seconds after click...');
      let monitoringInterval;
      const startTime = Date.now();
      
      // Check for rapid hook calls every 500ms
      monitoringInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 10000) {
          clearInterval(monitoringInterval);
          return;
        }
        
        // Check if we've detected rapid consecutive calls
        const recentMessages = consoleMessages.filter(msg => 
          msg.timestamp > Date.now() - 1000 && 
          msg.text.includes('useWorkspaceManager')
        );
        
        if (recentMessages.length > 3) {
          infiniteLoopDetected = true;
          console.log('🚨 RAPID HOOK CALLS DETECTED - INFINITE LOOP');
          clearInterval(monitoringInterval);
        }
      }, 500);
      
      await page.waitForTimeout(10000);
      clearInterval(monitoringInterval);
      
      // Take screenshot after interaction
      await page.screenshot({ 
        path: 'tests/screenshots/infinite-loop-test-after-click.png', 
        fullPage: true 
      });
      
    } else {
      console.log('❌ No file tree button found');
    }
    
    // Final analysis
    console.log('\n📊 FINAL ANALYSIS:');
    console.log('================');
    
    console.log('Hook call counts during mobile interaction:');
    for (const [hook, count] of hookCallCounts.entries()) {
      console.log(`  ${hook}: ${count} calls`);
    }
    
    console.log(`\nTotal console messages: ${consoleMessages.length}`);
    console.log(`Infinite loop detected: ${infiniteLoopDetected}`);
    console.log(`React error detected: ${reactErrorDetected}`);
    
    // Check for patterns in console messages
    const useWorkspaceManagerCalls = consoleMessages.filter(msg => 
      msg.text.includes('useWorkspaceManager: Hook called')
    ).length;
    
    const updateFilesCalls = consoleMessages.filter(msg => 
      msg.text.includes('updateWorkspaceFiles: Updating')
    ).length;
    
    console.log(`\nPattern Analysis:`);
    console.log(`  useWorkspaceManager calls: ${useWorkspaceManagerCalls}`);
    console.log(`  updateWorkspaceFiles calls: ${updateFilesCalls}`);
    
    if (useWorkspaceManagerCalls > 5 || updateFilesCalls > 5) {
      console.log('🚨 EXCESSIVE FUNCTION CALLS - LIKELY INFINITE LOOP');
      infiniteLoopDetected = true;
    }
    
    // Final verdict
    if (infiniteLoopDetected || reactErrorDetected) {
      console.log('\n❌ TEST FAILED: Infinite loop or React error detected');
      console.log('Recent console messages (last 10):');
      consoleMessages.slice(-10).forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
      process.exit(1);
    } else {
      console.log('\n✅ TEST PASSED: No infinite loops detected');
      console.log('Mobile workspace functionality appears stable');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testInfiniteLoopDetection().catch(console.error);