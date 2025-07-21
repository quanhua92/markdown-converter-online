#!/usr/bin/env node

const { chromium } = require('playwright');

async function testSimpleWorkspace() {
  console.log('🚀 Testing simple workspace creation...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Listen for all console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Enhanced Manager') || text.includes('Created local workspace') || text.includes('IntegratedFS: Hook called with workspace')) {
      console.log(`🔍 ${text}`);
    }
  });
  
  try {
    console.log('📂 Navigate to app...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('🧹 Clear storage...');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log('📝 Create workspace...');
    await page.click('text=Create New Workspace');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="text"]', 'Simple Test');
    await page.waitForTimeout(500);
    
    console.log('✅ Submit...');
    await page.click('button[type="submit"]');
    
    // Wait for workspace creation and logs
    console.log('⏳ Waiting for workspace creation...');
    await page.waitForTimeout(5000);
    
    // Check final state
    const finalState = await page.evaluate(() => {
      return {
        currentWorkspace: localStorage.getItem('markdown-explorer-v2-current-workspace'),
        storageKeys: Object.keys(localStorage),
        hasFiles: document.body.textContent.includes('Welcome.md') || document.body.textContent.includes('file')
      };
    });
    
    console.log('📊 Final state:', finalState);
    
    console.log('🔍 Keeping browser open for 15 seconds...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testSimpleWorkspace();
}

module.exports = { testSimpleWorkspace };