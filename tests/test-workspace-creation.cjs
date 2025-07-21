#!/usr/bin/env node

const { chromium } = require('playwright');

async function testWorkspaceCreation() {
  console.log('🚀 Testing workspace creation with enhanced manager...');
  
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
    const text = msg.text();
    if (text.includes('Created local workspace') || text.includes('Workspace created') || text.includes('Failed')) {
      console.log(`🔍 ${text}`);
    }
  });
  
  // Listen for errors
  page.on('pageerror', err => {
    console.error('❌ Page error:', err.message);
  });
  
  try {
    console.log('📂 Navigate to app...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('📊 Check initial state...');
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/current-state.png' });
    
    const hasWelcomeScreen = await page.locator('text=Welcome to Markdown Explorer').isVisible();
    const hasFileTree = await page.locator('text=Welcome.md').isVisible();
    const hasLeaveButton = await page.locator('text=Leave Workspace').isVisible();
    
    console.log('📊 Welcome screen visible:', hasWelcomeScreen);
    console.log('📊 File tree visible:', hasFileTree);
    console.log('📊 Leave button visible:', hasLeaveButton);
    
    // Check what text is actually on the page
    const pageText = await page.textContent('body');
    console.log('📊 Page contains Welcome Explorer:', pageText.includes('Welcome to Markdown Explorer'));
    console.log('📊 Page contains Create:', pageText.includes('Create'));
    console.log('📊 Page contains File:', pageText.includes('file'));
    
    if (hasWelcomeScreen) {
      console.log('📝 Click Create New Workspace...');
      await page.click('text=Create New Workspace');
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'tests/screenshots/after-click.png' });
      
      // Check if input is visible (try multiple selectors)
      const inputText = await page.locator('input[type="text"]').isVisible();
      const inputGeneric = await page.locator('input').isVisible();
      const inputByPlaceholder = await page.locator('input[placeholder*="Project"]').isVisible();
      
      console.log('📊 Input field visible (type=text):', inputText);
      console.log('📊 Input field visible (generic):', inputGeneric);
      console.log('📊 Input field visible (placeholder):', inputByPlaceholder);
      
      if (inputByPlaceholder) {
        console.log('📝 Fill workspace name...');
        await page.fill('input[placeholder*="Project"]', 'Enhanced Test');
      } else if (inputGeneric) {
        console.log('📝 Fill workspace name (generic input)...');
        await page.fill('input', 'Enhanced Test');
      } else {
        console.log('❌ Input field not found, dialog may not have opened');
      }
      await page.waitForTimeout(500);
      
      console.log('✅ Submit workspace creation...');
      
      // Try different button selectors
      const submitButton = await page.locator('button[type="submit"]').isVisible();
      const createButton = await page.locator('text=Create Workspace').isVisible();
      
      console.log('📊 Submit button visible:', submitButton);
      console.log('📊 Create button visible:', createButton);
      
      if (createButton) {
        await page.click('text=Create Workspace');
      } else if (submitButton) {
        await page.click('button[type="submit"]');
      } else {
        console.log('❌ No submit button found');
      }
      
      // Wait for workspace creation
      console.log('⏳ Waiting for workspace creation...');
      await page.waitForTimeout(2000);
      
      // Try to wait for the file tree to appear (indicates success)
      console.log('🔍 Waiting for file tree or error...');
      try {
        await page.waitForSelector('text=Welcome.md', { timeout: 8000 });
        console.log('✅ File tree appeared!');
      } catch (e) {
        console.log('⚠️ No file tree found, checking for other indicators...');
      }
      
      // Check if we see the file tree
      const hasFileTree = await page.locator('text=Welcome.md').isVisible();
      console.log('📊 File tree visible:', hasFileTree);
      
      // Check storage
      const storageCheck = await page.evaluate(() => {
        return {
          currentWorkspace: localStorage.getItem('markdown-explorer-v2-current-workspace'),
          storageKeys: Object.keys(localStorage).filter(k => k.includes('markdown')),
          bodyText: document.body.textContent.includes('Welcome.md')
        };
      });
      
      console.log('📊 Storage check:', storageCheck);
      
      if (hasFileTree || storageCheck.bodyText) {
        console.log('✅ Workspace creation successful!');
      } else {
        console.log('❌ Workspace creation failed - no file tree visible');
      }
    } else {
      console.log('❌ Welcome screen not found');
    }
    
    console.log('🔍 Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testWorkspaceCreation();
}

module.exports = { testWorkspaceCreation };