#!/usr/bin/env node

const { chromium } = require('playwright');

async function testVisualWorkspace() {
  console.log('🚀 Testing visual workspace creation...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📂 Navigate to app...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    console.log('🧹 Clear storage...');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('📝 Create workspace...');
    await page.click('text=Create New Workspace');
    await page.waitForTimeout(1000);
    
    await page.fill('input[placeholder*="Project"]', 'Visual Test');
    await page.waitForTimeout(500);
    
    await page.click('text=Create Workspace');
    
    console.log('⏳ Waiting for file tree...');
    await page.waitForTimeout(3000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'tests/screenshots/workspace-success.png' });
    
    // Check if file tree is visible
    const welcomeFile = await page.locator('text=Welcome.md').isVisible();
    const notesFile = await page.locator('text=Notes.md').isVisible();
    
    console.log('📊 Welcome.md visible:', welcomeFile);
    console.log('📊 Notes.md visible:', notesFile);
    
    if (welcomeFile && notesFile) {
      console.log('✅ SUCCESS: File tree is visible with both default files!');
    } else {
      console.log('❌ ISSUE: File tree is not fully visible');
    }
    
    console.log('🔍 Keeping browser open for 10 seconds to verify...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testVisualWorkspace();
}

module.exports = { testVisualWorkspace };