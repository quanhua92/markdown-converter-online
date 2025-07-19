const { chromium } = require('playwright');

async function testWorkspaceSignInOut() {
  console.log('🔐 Testing workspace sign-in/sign-out functionality...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to explorer
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('✅ Explorer page loaded');
    
    // Wait for the workspace selector to be visible
    await page.waitForSelector('div:has-text("Default Workspace")', { timeout: 10000 });
    console.log('✅ Default workspace display found');
    
    // Take screenshot of initial workspace state
    await page.screenshot({ path: 'tests/screenshots/workspace-initial-state.png', fullPage: true });
    
    // Verify current workspace display
    const workspaceDisplay = await page.locator('div:has-text("Current workspace")');
    await expect(workspaceDisplay).toBeVisible();
    console.log('✅ Current workspace badge is visible');
    
    // Test workspace creation flow
    console.log('🔄 Testing workspace creation...');
    
    // Click "Create New" button
    await page.click('button:has-text("Create New")');
    await page.waitForTimeout(1000);
    
    // Fill in workspace name
    await page.fill('input[placeholder*="workspace name"]', 'Test Project');
    
    // Take screenshot of creation dialog
    await page.screenshot({ path: 'tests/screenshots/workspace-create-dialog.png' });
    
    // Click "Create & Join"
    await page.click('button:has-text("Create & Join")');
    await page.waitForTimeout(2000);
    
    console.log('✅ New workspace created');
    
    // Verify we're now in the new workspace
    const newWorkspaceDisplay = await page.locator('div:has-text("Test Project")');
    await expect(newWorkspaceDisplay).toBeVisible();
    console.log('✅ Successfully joined new workspace');
    
    // Take screenshot of new workspace
    await page.screenshot({ path: 'tests/screenshots/workspace-new-joined.png', fullPage: true });
    
    // Test workspace leaving flow
    console.log('🔄 Testing workspace leave...');
    
    // Click "Leave" button
    await page.click('button:has-text("Leave")');
    await page.waitForTimeout(2000);
    
    // Verify we're back to default workspace
    const defaultWorkspaceDisplay = await page.locator('div:has-text("Default Workspace")');
    await expect(defaultWorkspaceDisplay).toBeVisible();
    console.log('✅ Successfully left workspace and returned to default');
    
    // Take screenshot after leaving
    await page.screenshot({ path: 'tests/screenshots/workspace-after-leave.png', fullPage: true });
    
    // Test workspace joining flow
    console.log('🔄 Testing workspace join...');
    
    // Click "Join Workspace" button
    await page.click('button:has-text("Join Workspace")');
    await page.waitForTimeout(1000);
    
    // Take screenshot of join dialog
    await page.screenshot({ path: 'tests/screenshots/workspace-join-dialog.png' });
    
    // Click join button for Test Project workspace
    await page.click('button:has-text("Join"):near(:text("Test Project"))');
    await page.waitForTimeout(2000);
    
    // Verify we're back in Test Project workspace
    const testProjectDisplay = await page.locator('div:has-text("Test Project")');
    await expect(testProjectDisplay).toBeVisible();
    console.log('✅ Successfully joined existing workspace');
    
    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/workspace-rejoined.png', fullPage: true });
    
    // Test localStorage persistence
    const workspaceData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('workspace')) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
    
    console.log('💾 Workspace localStorage structure:');
    console.log(JSON.stringify(workspaceData, null, 2));
    
    // Verify workspace isolation by checking localStorage
    const hasMultipleWorkspaces = Object.keys(workspaceData).filter(key => 
      key.startsWith('markdown-explorer-workspace-')
    ).length > 1;
    
    if (hasMultipleWorkspaces) {
      console.log('✅ Multiple workspaces properly isolated in localStorage');
    } else {
      console.log('❌ Workspace isolation may not be working correctly');
    }
    
    console.log('🎉 Workspace sign-in/sign-out test completed successfully!');
    
  } catch (error) {
    console.error('❌ Workspace sign-in/sign-out test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/workspace-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Helper function for assertions (simplified version)
async function expect(locator) {
  return {
    toBeVisible: async () => {
      const isVisible = await locator.isVisible();
      if (!isVisible) {
        throw new Error(`Element not visible: ${locator}`);
      }
    }
  };
}

testWorkspaceSignInOut().catch(console.error);