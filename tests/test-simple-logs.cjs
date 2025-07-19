const { chromium } = require('playwright');

async function testSimpleLogs() {
  console.log('🔍 Simple console log test...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    console.log(`📟 ${text}`);
  });
  
  page.on('pageerror', error => {
    console.log('💥 PAGE ERROR:', error.message);
  });
  
  try {
    console.log('🚀 Navigating to explorer...');
    await page.goto('http://localhost:5173/explorer');
    
    console.log('⏳ Waiting 10 seconds for logs...');
    await page.waitForTimeout(10000);
    
    console.log('✅ Log capture complete');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleLogs();