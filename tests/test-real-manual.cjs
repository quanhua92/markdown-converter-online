const { chromium } = require('playwright');

async function testRealManual() {
  console.log('🔍 REAL MANUAL TEST - Opening browser for inspection...');
  console.log('📱 This will open Chrome on mobile viewport');
  console.log('🚨 Check console for React error #185 and workspace logs');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show real browser
    slowMo: 100       // Slow down for observation
  });
  
  const page = await browser.newPage();
  
  // Set mobile viewport to trigger mobile behavior
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Capture ALL console messages with timestamps
  page.on('console', msg => {
    const timestamp = new Date().toLocaleTimeString();
    const type = msg.type().toUpperCase();
    const text = msg.text();
    
    // Highlight important logs
    if (text.includes('useWorkspaceManager') || text.includes('🚀') || text.includes('💾') || text.includes('📦')) {
      console.log(`\n🎯 [${timestamp}] WORKSPACE: ${text}`);
    } else if (text.includes('React error') || text.includes('error #185') || text.includes('infinite')) {
      console.log(`\n🚨 [${timestamp}] REACT ERROR: ${text}`);
    } else if (type === 'ERROR') {
      console.log(`\n❌ [${timestamp}] ERROR: ${text}`);
    } else {
      console.log(`📟 [${timestamp}] [${type}] ${text}`);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n💥 [${timestamp}] PAGE ERROR: ${error.message}`);
    if (error.message.includes('185')) {
      console.log('🚨🚨🚨 REACT ERROR #185 DETECTED! 🚨🚨🚨');
    }
  });
  
  try {
    console.log('\n🚀 STEP 1: Navigate to explorer...');
    
    // Try both Docker (3000) and potential local dev server
    let url = 'http://localhost:3000/explorer';
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      console.log(`✅ Successfully loaded: ${url}`);
    } catch (error) {
      console.log(`❌ Failed to load ${url}, trying port 5173...`);
      url = 'http://localhost:5173/explorer';
      await page.goto(url, { waitUntil: 'networkidle' });
      console.log(`✅ Successfully loaded: ${url}`);
    }
    
    console.log('\n⏳ STEP 2: Wait for workspace manager initialization...');
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 STEP 3: Look for mobile menu button...');
    
    // Find mobile menu button
    const mobileMenuFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const menuButton = buttons.find(btn => {
        const classes = btn.className || '';
        const title = btn.title || '';
        return classes.includes('lg:hidden') || 
               title.includes('file') || 
               title.includes('menu') ||
               title.includes('Open file tree');
      });
      
      if (menuButton) {
        console.log('🎯 Found mobile menu button:', menuButton.title || menuButton.className);
        return true;
      }
      return false;
    });
    
    if (mobileMenuFound) {
      console.log('\n✅ STEP 4: Mobile menu button found! Clicking to test React error...');
      
      // Click the mobile menu button to trigger the Sheet dialog
      await page.click('button[title*="file"], button[title*="menu"], button.lg\\:hidden');
      
      console.log('\n⏳ STEP 5: Waiting for Sheet dialog and potential React error...');
      await page.waitForTimeout(2000);
      
      // Check if any workspace elements are visible
      const workspaceVisible = await page.isVisible('text=Default Workspace').catch(() => false);
      const filesVisible = await page.isVisible('text=Files').catch(() => false);
      
      if (workspaceVisible || filesVisible) {
        console.log('\n🎉 SUCCESS: Mobile left panel opened without React error!');
        console.log('✅ Workspace elements are visible');
      } else {
        console.log('\n⚠️  Mobile panel state unclear - check browser manually');
      }
      
    } else {
      console.log('\n❌ No mobile menu button found');
    }
    
    console.log('\n📊 STEP 6: Final status check...');
    await page.waitForTimeout(2000);
    
    console.log('\n🔍 BROWSER IS OPEN FOR MANUAL INSPECTION');
    console.log('👉 Check the browser window for:');
    console.log('   1. Console errors (especially React error #185)');
    console.log('   2. Workspace debug logs with emojis');
    console.log('   3. Mobile left panel functionality');
    console.log('   4. Click the hamburger menu to test');
    console.log('\n⏸️  Press Ctrl+C to close when done...');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(300000); // 5 minutes
    
  } catch (error) {
    console.error('\n💥 Test error:', error.message);
    console.log('\n🔍 Browser is still open for inspection...');
    await page.waitForTimeout(60000); // Keep open for 1 minute on error
  } finally {
    console.log('\n🏁 Closing browser...');
    await browser.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Manual test interrupted by user');
  process.exit(0);
});

testRealManual();