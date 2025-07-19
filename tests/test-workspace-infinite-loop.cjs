const { chromium } = require('playwright');

async function testWorkspaceInfiniteLoop() {
  console.log('🔍 Testing workspace infinite loop on desktop and mobile...');
  
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  
  // Test 1: Desktop infinite loop
  console.log('\n📱 TESTING DESKTOP INFINITE LOOP...');
  const desktopPage = await browser.newPage();
  await testDesktopInfiniteLoop(desktopPage);
  
  // Test 2: Mobile left panel crash
  console.log('\n📱 TESTING MOBILE LEFT PANEL CRASH...');
  const mobilePage = await browser.newPage();
  await testMobileLeftPanelCrash(mobilePage);
  
  await browser.close();
}

async function testDesktopInfiniteLoop(page) {
  // Set desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  
  const consoleMessages = [];
  const hookCallCounts = new Map();
  let infiniteLoopDetected = false;
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    console.log(`🖥️  Desktop [${type}]:`, text);
    consoleMessages.push({ type, text, timestamp: Date.now() });
    
    // Track useWorkspaceManager hook calls
    if (text.includes('useWorkspaceManager: Hook called')) {
      const currentCount = hookCallCounts.get('useWorkspaceManager') || 0;
      hookCallCounts.set('useWorkspaceManager', currentCount + 1);
      
      if (currentCount > 3) {
        infiniteLoopDetected = true;
        console.log('🚨 DESKTOP INFINITE LOOP DETECTED');
      }
    }
  });
  
  page.on('pageerror', error => {
    console.log('❌ Desktop page error:', error.message);
  });
  
  try {
    // Navigate to the app - try multiple approaches
    console.log('🔗 Navigating to application...');
    
    // Try root first
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check if React app loaded
    const hasReactApp = await page.evaluate(() => {
      return document.querySelector('#app') || document.querySelector('#root') || document.querySelector('[data-reactroot]');
    });
    
    if (!hasReactApp) {
      console.log('❌ React app not found, trying direct explorer access...');
      // If the server has issues, try to bypass by using the file directly
      await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    
    // Look for explorer navigation
    console.log('🔍 Looking for explorer navigation...');
    
    // Try multiple selectors for explorer navigation
    const explorerSelectors = [
      'a[href*="explorer"]',
      'a:has-text("Explorer")',
      'button:has-text("Explorer")', 
      '[data-testid*="explorer"]',
      'nav a:has-text("File")',
      'a:has-text("File Explorer")'
    ];
    
    let foundExplorer = false;
    for (const selector of explorerSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Found explorer with selector: ${selector}`);
        await element.click();
        foundExplorer = true;
        break;
      }
    }
    
    if (!foundExplorer) {
      console.log('⚠️ No explorer nav found, trying URL navigation...');
      await page.goto('http://localhost:3000/#/explorer', { waitUntil: 'networkidle' });
    }
    
    await page.waitForTimeout(3000);
    
    // Check if we're in explorer
    const inExplorer = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Workspace') || text.includes('File') || 
             text.includes('Default Workspace') || text.includes('explorer');
    });
    
    console.log(`📍 In explorer: ${inExplorer}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/desktop-infinite-loop-test.png', 
      fullPage: true 
    });
    
    // Monitor for 10 seconds to detect infinite loop
    console.log('⏱️ Monitoring desktop for 10 seconds...');
    await page.waitForTimeout(10000);
    
    // Final analysis
    console.log('📊 Desktop Hook call counts:');
    for (const [hook, count] of hookCallCounts.entries()) {
      console.log(`  ${hook}: ${count} calls`);
    }
    
    if (infiniteLoopDetected) {
      console.log('❌ DESKTOP TEST FAILED: Infinite loop detected');
    } else {
      console.log('✅ DESKTOP TEST PASSED: No infinite loop detected');
    }
    
    return !infiniteLoopDetected;
    
  } catch (error) {
    console.error('❌ Desktop test error:', error.message);
    return false;
  }
}

async function testMobileLeftPanelCrash(page) {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  let crashDetected = false;
  let reactErrorDetected = false;
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    console.log(`📱 Mobile [${type}]:`, text);
    
    if (text.includes('Maximum update depth') || 
        text.includes('Error #185') ||
        text.includes('Something went wrong')) {
      crashDetected = true;
      console.log('🚨 MOBILE CRASH DETECTED');
    }
  });
  
  page.on('pageerror', error => {
    console.log('❌ Mobile page error:', error.message);
    if (error.message.includes('Maximum update depth')) {
      crashDetected = true;
      reactErrorDetected = true;
    }
  });
  
  try {
    // Navigate to explorer
    console.log('🔗 Mobile: Navigating to explorer...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Try to get to explorer
    try {
      await page.goto('http://localhost:3000/#/explorer', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log('⚠️ Direct navigation failed, continuing...');
    }
    
    // Take initial mobile screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-before-click.png', 
      fullPage: true 
    });
    
    // Look for mobile file tree/left panel button
    console.log('🔍 Looking for mobile left panel button...');
    
    const mobileButtonSelectors = [
      'button[title*="file"]',
      'button[title*="Open file tree"]',
      'button[title*="menu"]',
      'button[data-testid*="mobile"]',
      'button[data-testid*="file"]',
      'button[data-testid*="sheet"]',
      '[data-testid*="sheet-trigger"]',
      'button:has-text("Files")',
      'button:has-text("Menu")',
      // Look for hamburger icons or menu icons
      'button svg',
      'button[aria-label*="menu"]',
      'button[aria-label*="file"]'
    ];
    
    let buttonFound = false;
    for (const selector of mobileButtonSelectors) {
      const button = page.locator(selector).first();
      if (await button.count() > 0) {
        const isVisible = await button.isVisible().catch(() => false);
        if (isVisible) {
          console.log(`✅ Found mobile button with selector: ${selector}`);
          
          // Click the button that should trigger the crash
          console.log('🖱️ Clicking mobile left panel button...');
          await button.click();
          buttonFound = true;
          break;
        }
      }
    }
    
    if (!buttonFound) {
      console.log('❌ No mobile left panel button found');
      // Try clicking any visible button
      const anyButton = page.locator('button').first();
      if (await anyButton.count() > 0) {
        console.log('🖱️ Trying any available button...');
        await anyButton.click();
      }
    }
    
    // Wait and monitor for crash
    console.log('⏱️ Waiting for potential crash...');
    await page.waitForTimeout(5000);
    
    // Take screenshot after click
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-after-click.png', 
      fullPage: true 
    });
    
    // Check for error boundary or crash indicators
    const errorIndicators = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return {
        hasErrorBoundary: text.includes('Something went wrong'),
        hasReactError: text.includes('Error #185'),
        hasMaxDepthError: text.includes('Maximum update depth'),
        bodyText: text.substring(0, 500)
      };
    });
    
    console.log('🔍 Error indicators:', errorIndicators);
    
    if (crashDetected || reactErrorDetected || errorIndicators.hasErrorBoundary) {
      console.log('❌ MOBILE TEST RESULT: Crash detected (expected behavior - confirms bug exists)');
      return true; // Crash detected means the bug is present
    } else {
      console.log('✅ MOBILE TEST RESULT: No crash detected (bug may be fixed)');
      return false; // No crash means bug might be fixed
    }
    
  } catch (error) {
    console.error('❌ Mobile test error:', error.message);
    return true; // Error in test might indicate crash
  }
}

testWorkspaceInfiniteLoop().catch(console.error);