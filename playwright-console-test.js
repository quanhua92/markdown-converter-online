import { chromium } from 'playwright';

(async () => {
  console.log('🎭 Starting console test for git commit hash...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    console.log('🔧 Browser console:', msg.type(), msg.text());
  });
  
  try {
    console.log('🌐 Navigating to application...');
    await page.goto('http://localhost:3000');
    
    // Wait a bit for the page to load and console logs to appear
    await page.waitForTimeout(2000);
    
    console.log('🔍 Checking for git commit hash in page content...');
    
    const gitHashInContent = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      console.log('Page text includes 1510dfc:', bodyText.includes('1510dfc'));
      console.log('Page text includes fallback:', bodyText.includes('1510dfc-fallback'));
      return {
        hasHash: bodyText.includes('1510dfc'),
        hasFallback: bodyText.includes('1510dfc-fallback'),
        footerText: bodyText.match(/Powered by.*?Git:[^•]*/)?.[0] || 'Footer not found'
      };
    });
    
    console.log('📄 Git hash results:', gitHashInContent);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'console-test-screenshot.png', fullPage: true });
    
    console.log('🎉 Console test completed!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await browser.close();
  }
})();