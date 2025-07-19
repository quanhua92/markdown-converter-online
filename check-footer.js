import { chromium } from 'playwright';

async function checkFooter() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    const footer = await page.locator('text=Powered by Marp CLI and Pandoc').first();
    if (await footer.isVisible()) {
      const footerText = await footer.textContent();
      console.log('Footer text:', footerText);
    } else {
      console.log('Footer not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkFooter().catch(console.error);