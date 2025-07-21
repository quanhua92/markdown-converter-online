#!/usr/bin/env node

const { chromium } = require('playwright');

async function testTemplate() {
  console.log('🚀 Testing template functionality...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('📝 Click Initialize from Template...');
    await page.click('text=Initialize from Template');
    await page.waitForTimeout(1000);
    
    console.log('📝 Click Project Notes template...');
    await page.click('text=Project Notes');
    await page.waitForTimeout(2000);
    
    // Check if it works or shows error
    const hasError = await page.locator('text=coming soon').isVisible();
    const hasFileTree = await page.locator('text=Welcome.md').isVisible();
    
    console.log('📊 Has error message:', hasError);
    console.log('📊 Has file tree:', hasFileTree);
    
    if (hasError) {
      console.log('⚠️ Template functionality shows "coming soon" message');
    } else if (hasFileTree) {
      console.log('✅ Template functionality works!');
    } else {
      console.log('❓ Template functionality unclear');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testTemplate();
}

module.exports = { testTemplate };