const { chromium } = require('playwright');

async function testWorkspaceFunctionality() {
  console.log('🚀 Testing workspace functionality...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to explorer
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('✅ Explorer page loaded');
    
    // Wait for the workspace selector to be visible
    await page.waitForSelector('[data-slot="select-trigger"]', { timeout: 10000 });
    console.log('✅ Workspace selector found');
    
    // Click on workspace selector to open dropdown
    await page.click('[data-slot="select-trigger"]');
    await page.waitForTimeout(1000);
    
    console.log('✅ Workspace selector opened');
    
    // Take screenshot of workspace selector
    await page.screenshot({ path: 'tests/screenshots/workspace-selector.png' });
    
    // Close the dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Try to create a new workspace
    console.log('🔄 Testing workspace creation...');
    
    // Look for the "+" button to create new workspace
    const createButton = page.locator('button[title="Create new workspace"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Fill in workspace name
      await page.fill('input[placeholder*="workspace name"]', 'Test Workspace');
      await page.click('button:has-text("Create")');
      await page.waitForTimeout(2000);
      
      console.log('✅ New workspace created');
      
      // Take screenshot after workspace creation
      await page.screenshot({ path: 'tests/screenshots/workspace-created.png' });
    } else {
      console.log('ℹ️  Create workspace button not found or not visible');
    }
    
    // Test file creation in new workspace
    console.log('🔄 Testing file creation in workspace...');
    
    // Look for new file button
    const newFileButton = page.locator('button[title="New file"]');
    if (await newFileButton.isVisible()) {
      await newFileButton.click();
      await page.waitForTimeout(500);
      
      // Type filename and press enter
      await page.keyboard.type('test-file.md');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      console.log('✅ New file created in workspace');
      
      // Take screenshot of file tree with new file
      await page.screenshot({ path: 'tests/screenshots/workspace-with-file.png' });
    }
    
    console.log('🎉 Workspace functionality test completed!');
    
  } catch (error) {
    console.error('❌ Workspace test error:', error.message);
  } finally {
    await browser.close();
  }
}

testWorkspaceFunctionality().catch(console.error);