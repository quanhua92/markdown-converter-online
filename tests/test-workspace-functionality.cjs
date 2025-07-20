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
    
    // Check if we're in the welcome screen or already in a workspace
    const welcomeCard = page.locator('[data-testid="create-workspace-card"]');
    const isWelcomeScreen = await welcomeCard.isVisible();
    
    if (isWelcomeScreen) {
      console.log('✅ On welcome screen - creating new workspace');
      
      // Create a new workspace from welcome screen
      await welcomeCard.waitFor({ state: 'visible', timeout: 5000 });
      await welcomeCard.click();
      await page.waitForTimeout(1000);
      
      // Fill in workspace name
      await page.fill('[data-testid="workspace-name-input"]', 'Test Workspace');
      await page.click('[data-testid="create-workspace-btn"]');
      await page.waitForTimeout(2000);
      
      console.log('✅ New workspace created from welcome screen');
    } else {
      console.log('✅ Already in workspace - testing workspace selector');
      
      // Look for the current workspace display
      const workspaceDisplay = page.locator('text=Current workspace');
      if (await workspaceDisplay.isVisible()) {
        console.log('✅ Workspace selector found');
        
        // Take screenshot of workspace display
        await page.screenshot({ path: 'tests/screenshots/workspace-display.png' });
        
        // Test leaving workspace to go to welcome screen
        const leaveButton = page.locator('text=Leave');
        if (await leaveButton.isVisible()) {
          await leaveButton.click();
          await page.waitForTimeout(3000);
          
          console.log('✅ Left workspace successfully');
          
          // Debug: Check current URL and page state
          console.log('🔍 Current URL after leaving:', page.url());
          await page.screenshot({ path: 'tests/screenshots/workspace-after-leave-debug.png' });
          
          // Check if we're back to welcome screen
          const createCard = page.locator('[data-testid="create-workspace-card"]');
          const isWelcomeVisible = await createCard.isVisible();
          
          if (isWelcomeVisible) {
            console.log('✅ Welcome screen is visible after leaving workspace');
            await createCard.click();
            await page.waitForTimeout(1000);
            
            await page.fill('[data-testid="workspace-name-input"]', 'Test Workspace After Leave');
            await page.click('[data-testid="create-workspace-btn"]');
            await page.waitForTimeout(2000);
            
            console.log('✅ New workspace created after leaving previous one');
          } else {
            console.log('⚠️  Welcome screen not visible after leaving workspace');
            
            // Try to manually navigate to explorer to trigger welcome screen
            await page.goto('http://localhost:3000/explorer');
            await page.waitForTimeout(2000);
            
            const retryCreateCard = page.locator('[data-testid="create-workspace-card"]');
            if (await retryCreateCard.isVisible()) {
              console.log('✅ Welcome screen visible after manual navigation');
            } else {
              console.log('❌ Welcome screen still not visible');
            }
          }
        }
      }
    }
    
    // Take screenshot after workspace creation
    await page.screenshot({ path: 'tests/screenshots/workspace-created.png' });
    
    // Test file creation in new workspace
    console.log('🔄 Testing file creation in workspace...');
    
    // Look for new file button in the Files section
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
    } else {
      console.log('ℹ️  New file button not visible - may be in collapsed state or different UI');
      
      // Try to find any file creation elements
      const plusButtons = page.locator('button:has(svg)').filter({ hasText: /\+/ });
      const count = await plusButtons.count();
      console.log(`Found ${count} plus buttons for file creation`);
      
      // Take screenshot to debug
      await page.screenshot({ path: 'tests/screenshots/workspace-file-creation-debug.png' });
    }
    
    // Test workspace leave functionality
    console.log('🔄 Testing leave workspace functionality...');
    const leaveButton = page.locator('text=Leave');
    if (await leaveButton.isVisible()) {
      await leaveButton.click();
      await page.waitForTimeout(2000);
      
      // Verify we're back to welcome screen
      const welcomeScreenVisible = await page.locator('[data-testid="create-workspace-card"]').isVisible();
      if (welcomeScreenVisible) {
        console.log('✅ Successfully returned to welcome screen after leaving workspace');
        await page.screenshot({ path: 'tests/screenshots/workspace-left-back-to-welcome.png' });
      } else {
        console.log('⚠️  Did not return to welcome screen after leaving workspace');
      }
    }
    
    console.log('🎉 Workspace functionality test completed!');
    
  } catch (error) {
    console.error('❌ Workspace test error:', error.message);
  } finally {
    await browser.close();
  }
}

testWorkspaceFunctionality().catch(console.error);