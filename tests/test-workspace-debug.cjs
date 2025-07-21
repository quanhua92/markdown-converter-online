#!/usr/bin/env node

const { chromium } = require('playwright');

async function debugWorkspaceCreation() {
  console.log('🚀 Starting workspace creation debug...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`🔍 [Browser ${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ [Browser Error]: ${error.message}`);
  });

  try {
    // Navigate to app
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log('📊 Debug: Checking initial state...');
    
    // Check state
    const debugInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasCreateButton: !!document.querySelector('text=Create New Workspace'),
        hasWelcomeText: !!document.querySelector('text=Get started'),
        localStorageKeys: Object.keys(localStorage),
        bodyClasses: document.body.className,
        mainContainers: document.querySelectorAll('main, [role="main"], .main').length
      };
    });
    
    console.log('Debug info:', debugInfo);
    
    // Try to create workspace
    console.log('🔧 Attempting to create workspace...');
    
    const createButton = await page.locator('text=Create New Workspace').first();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    // Fill name
    await page.fill('input[type="text"]', 'Debug Test Workspace');
    await page.waitForTimeout(500);
    
    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check what happened
    const afterCreation = await page.evaluate(() => {
      return {
        url: window.location.href,
        localStorageKeys: Object.keys(localStorage),
        hasFileTree: !!document.querySelector('[data-testid="file-tree"]'),
        hasFileTreeAlt: !!document.querySelector('.file-tree'),
        hasExplorerHeader: !!document.querySelector('[data-testid="enhanced-explorer-header"]'),
        fileElements: document.querySelectorAll('[data-file], .file-item, .tree-item').length,
        hasWelcome: !!document.querySelector('text=Welcome'),
        containers: document.querySelectorAll('div').length,
        currentWorkspaceFromStorage: localStorage.getItem('markdown-explorer-v2-current-workspace')
      };
    });
    
    console.log('After creation:', afterCreation);
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/workspace-debug-detailed.png', fullPage: true });
    
    // Keep browser open for inspection
    console.log('🔍 Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({ path: 'tests/screenshots/workspace-debug-error.png' });
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  debugWorkspaceCreation();
}

module.exports = { debugWorkspaceCreation };