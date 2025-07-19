import { chromium } from 'playwright';

async function testFooterBuild() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // Get all text content from the page
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('Page text contains 1510dfc:', pageText.includes('1510dfc'));
    console.log('Page text contains Git:', pageText.includes('Git:'));
    
    // Check footer specifically
    const footerText = await page.locator('div.mt-8 p').textContent();
    console.log('Footer text:', footerText);
    
    // Check if there's a build info section
    const buildInfo = await page.locator('.bg-purple-500').textContent();
    console.log('Build info:', buildInfo);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testFooterBuild().catch(console.error);