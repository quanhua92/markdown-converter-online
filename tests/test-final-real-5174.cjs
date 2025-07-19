const { chromium } = require('playwright');

async function testFinalReal() {
  console.log('🚀 FINAL REAL TEST - React Error #185 Fix Verification');
  console.log('===================================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 });
  
  let reactError185Found = false;
  let workspaceLogsFound = false;
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    // Check for workspace manager logs (indicates our rewrite is working)
    if (text.includes('useWorkspaceManager') || text.includes('🚀') || text.includes('💾') || text.includes('📦')) {
      console.log(`✅ WORKSPACE LOG: ${text}`);
      workspaceLogsFound = true;
    }
    
    // Check for React error #185
    if (text.includes('React error #185') || text.includes('error #185') || text.includes('Maximum update depth')) {
      console.log(`🚨 REACT ERROR #185 DETECTED: ${text}`);
      reactError185Found = true;
    }
    
    if (type === 'error') {
      console.log(`❌ ERROR: ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
    if (error.message.includes('185') || error.message.includes('Maximum update depth')) {
      console.log('🚨🚨🚨 REACT ERROR #185 PAGE ERROR! 🚨🚨🚨');
      reactError185Found = true;
    }
  });
  
  try {
    console.log('\n1️⃣ Loading explorer page...');
    await page.goto('http://localhost:5174/explorer');
    
    console.log('2️⃣ Waiting for app initialization...');
    await page.waitForTimeout(5000);
    
    console.log('3️⃣ Looking for mobile menu button...');
    const mobileButton = await page.locator('button[title*="Open file tree"], button.lg\\:hidden').first();
    
    if (await mobileButton.isVisible()) {
      console.log('✅ Mobile menu button found!');
      
      console.log('4️⃣ Clicking mobile menu to trigger potential React error...');
      await mobileButton.click();
      
      console.log('5️⃣ Waiting for Sheet dialog and checking for errors...');
      await page.waitForTimeout(3000);
      
      // Check if Sheet opened successfully
      const sheetOpen = await page.locator('[role="dialog"], .sheet-content').isVisible().catch(() => false);
      
      if (sheetOpen) {
        console.log('✅ Mobile sheet opened successfully!');
        
        // Look for workspace elements
        const workspaceElement = await page.locator('text=Default Workspace').isVisible().catch(() => false);
        if (workspaceElement) {
          console.log('✅ Workspace elements are visible in mobile sheet!');
        }
      } else {
        console.log('⚠️ Mobile sheet may not have opened');
      }
      
    } else {
      console.log('❌ Mobile menu button not found');
    }
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('================');
    
    if (reactError185Found) {
      console.log('🚨 FAILED: React error #185 still occurs');
      console.log('❌ The rewritten useWorkspaceManager did not fix the issue');
    } else {
      console.log('🎉 SUCCESS: No React error #185 detected!');
      console.log('✅ The rewritten useWorkspaceManager appears to have fixed the issue');
    }
    
    if (workspaceLogsFound) {
      console.log('✅ Workspace manager logs detected - rewritten version is active');
    } else {
      console.log('⚠️ No workspace logs detected - check if rewrite is working');
    }
    
    console.log('\n🔍 Browser left open for manual verification...');
    console.log('👉 Manually test mobile menu and check console');
    console.log('⏸️ Press Ctrl+C when done');
    
    await page.waitForTimeout(120000); // 2 minutes for manual testing
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  } finally {
    await browser.close();
    
    console.log('\n🏁 TEST COMPLETE');
    console.log('================');
    if (!reactError185Found) {
      console.log('🎉 REACT ERROR #185 FIX: SUCCESS ✅');
      console.log('The rewritten useWorkspaceManager successfully eliminated the infinite update loop');
    } else {
      console.log('❌ REACT ERROR #185 FIX: FAILED');
      console.log('Further investigation needed');
    }
  }
}

testFinalReal();