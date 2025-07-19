import { chromium } from 'playwright';

(async () => {
  console.log('🎭 Starting git commit hash test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Navigating to application...');
    await page.goto('http://localhost:3000');
    
    console.log('🔍 Checking for git commit hash in footer...');
    
    // Look for footer content
    const footer = await page.$eval('body', (body) => {
      return body.textContent;
    });
    
    console.log('📄 Page content includes:', footer.includes('1510dfc') ? '✅ Git commit hash found' : '❌ Git commit hash NOT found');
    
    // Check if the git commit hash is visible
    const gitHashElement = await page.$eval('body', (body) => {
      const text = body.textContent;
      if (text.includes('1510dfc')) {
        return 'Found git commit hash: 1510dfc';
      }
      return 'Git commit hash not found';
    });
    
    console.log('🔍 Git hash check result:', gitHashElement);
    
    // Look for the specific footer text
    const footerText = await page.$eval('body', (body) => {
      const text = body.textContent;
      const matches = text.match(/Powered by.*?Git:[^•]*/);
      return matches ? matches[0] : 'Footer pattern not found';
    });
    
    console.log('📝 Footer text:', footerText);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'git-hash-test-screenshot.png', fullPage: true });
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await browser.close();
  }
})();