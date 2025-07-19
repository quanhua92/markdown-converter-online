const { chromium } = require('playwright');

async function testSimpleMobile() {
  console.log('🔍 Simple Mobile Test - Checking module exports and basic functionality');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 });
  
  let hasModuleError = false;
  let hasReactError185 = false;
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`📝 Console: ${text}`);
  });
  
  page.on('pageerror', error => {
    console.log(`💥 Page Error: ${error.message}`);
    if (error.message.includes('does not provide an export')) {
      hasModuleError = true;
    }
    if (error.message.includes('185') || error.message.includes('Maximum update depth')) {
      hasReactError185 = true;
    }
  });
  
  try {
    console.log('Loading explorer page...');
    await page.goto('http://localhost:5173/explorer', { waitUntil: 'networkidle' });
    
    console.log('Waiting for page to settle...');
    await page.waitForTimeout(3000);
    
    // Check if the page loaded successfully
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Look for error boundaries or error messages
    const errorBoundary = await page.locator('text=Something went wrong').isVisible().catch(() => false);
    if (errorBoundary) {
      console.log('❌ Error boundary visible');
    } else {
      console.log('✅ No error boundary visible');
    }
    
    // Look for the mobile menu button
    const mobileButton = await page.locator('button[aria-label*="menu"], button[title*="file"], .lg\\\\:hidden button').first();
    const isMobileButtonVisible = await mobileButton.isVisible().catch(() => false);
    
    if (isMobileButtonVisible) {
      console.log('✅ Mobile button found');
      
      // Try clicking it
      await mobileButton.click();
      await page.waitForTimeout(2000);
      
      // Check if sheet opened
      const sheetVisible = await page.locator('[role="dialog"], .sheet-content').isVisible().catch(() => false);
      if (sheetVisible) {
        console.log('✅ Mobile sheet opened successfully');
      } else {
        console.log('⚠️ Mobile sheet may not have opened');
      }
    } else {
      console.log('❌ Mobile button not found');
    }
    
    console.log('\n📊 Results:');
    console.log(`Module Export Error: ${hasModuleError ? '❌ YES' : '✅ NO'}`);
    console.log(`React Error #185: ${hasReactError185 ? '❌ YES' : '✅ NO'}`);
    
    if (!hasModuleError && !hasReactError185) {
      console.log('🎉 SUCCESS: No critical errors detected!');
    } else {
      console.log('⚠️ Issues detected - check logs above');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleMobile();