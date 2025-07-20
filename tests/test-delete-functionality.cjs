const { chromium } = require('playwright');

async function testDeleteFunctionality() {
  console.log('🚀 Testing file and folder deletion functionality...');
  
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
      console.log('📝 Creating new workspace for testing...');
      
      // Create a new workspace
      await welcomeCard.click();
      await page.waitForTimeout(1000);
      
      // Fill in workspace name
      await page.fill('[data-testid="workspace-name-input"]', 'Delete Test Workspace');
      await page.click('[data-testid="create-workspace-btn"]');
      await page.waitForTimeout(2000);
      
      console.log('✅ Test workspace created');
    }
    
    // Step 1: Create test files and folders structure
    console.log('📁 Creating test file structure...');
    
    // Create root folder "test-folder"
    const newFolderBtn = page.locator('button[title="New folder"]').first();
    await newFolderBtn.click();
    await page.waitForTimeout(500);
    
    // Type folder name
    await page.keyboard.type('test-folder');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log('✅ Created test-folder');
    
    // Create a file in root "test-file.md"
    const newFileBtn = page.locator('button[title="New file"]').first();
    await newFileBtn.click();
    await page.waitForTimeout(500);
    
    await page.keyboard.type('test-file.md');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log('✅ Created test-file.md');
    
    // Expand the test-folder to create nested content
    const testFolderItem = page.locator('[data-testid="file-tree-item-test-folder"]');
    await testFolderItem.click();
    await page.waitForTimeout(1000);
    
    // Create nested file in test-folder
    const testFolderMenu = testFolderItem.locator('..').locator('button[title="More actions"]');
    await testFolderMenu.click();
    await page.waitForTimeout(500);
    
    // Click "New File" from menu
    const newFileOption = page.locator('text=New File');
    await newFileOption.click();
    await page.waitForTimeout(500);
    
    await page.keyboard.type('nested-file.md');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log('✅ Created nested-file.md inside test-folder');
    
    // Create nested folder in test-folder
    await testFolderMenu.click();
    await page.waitForTimeout(500);
    
    const newFolderOption = page.locator('text=New Folder');
    await newFolderOption.click();
    await page.waitForTimeout(500);
    
    await page.keyboard.type('nested-folder');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log('✅ Created nested-folder inside test-folder');
    
    // Take screenshot of initial structure
    await page.screenshot({ 
      path: 'tests/screenshots/delete-test-initial-structure.png',
      fullPage: true 
    });
    
    // Step 2: Test file deletion (should delete immediately)
    console.log('🗑️ Testing file deletion...');
    
    const testFileItem = page.locator('[data-testid="file-tree-item-test-file.md"]');
    const testFileMenu = testFileItem.locator('..').locator('button[title="More actions"]');
    
    await testFileMenu.click();
    await page.waitForTimeout(500);
    
    const deleteFileOption = page.locator('button:has-text("Delete")');
    await deleteFileOption.click();
    await page.waitForTimeout(1000);
    
    // Verify file is deleted immediately (no dialog)
    const fileStillExists = await testFileItem.isVisible();
    if (!fileStillExists) {
      console.log('✅ File deleted immediately without confirmation dialog');
    } else {
      console.log('❌ File was not deleted');
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/delete-test-after-file-deletion.png',
      fullPage: true 
    });
    
    // Step 3: Test folder deletion (should show confirmation dialog)
    console.log('🗑️ Testing folder deletion with confirmation...');
    
    const testFolderMenu2 = testFolderItem.locator('..').locator('button[title="More actions"]');
    await testFolderMenu2.click();
    await page.waitForTimeout(500);
    
    const deleteFolderOption = page.locator('button:has-text("Delete")');
    await deleteFolderOption.click();
    await page.waitForTimeout(1000);
    
    // Check if confirmation dialog appears
    const deleteDialog = page.locator('text=Delete Folder');
    const isDialogVisible = await deleteDialog.isVisible();
    
    if (isDialogVisible) {
      console.log('✅ Delete confirmation dialog appeared for folder');
      
      // Check dialog content
      const dialogDescription = page.locator('text=Are you sure you want to delete the folder "test-folder" and all its contents?');
      const isDescriptionVisible = await dialogDescription.isVisible();
      
      if (isDescriptionVisible) {
        console.log('✅ Dialog shows proper warning about deleting all contents');
      }
      
      // Take screenshot of dialog
      await page.screenshot({ 
        path: 'tests/screenshots/delete-test-confirmation-dialog.png',
        fullPage: true 
      });
      
      // Test canceling deletion
      const cancelBtn = page.locator('button:has-text("Cancel")');
      await cancelBtn.click();
      await page.waitForTimeout(1000);
      
      // Verify folder still exists after cancel
      const folderStillExists = await testFolderItem.isVisible();
      if (folderStillExists) {
        console.log('✅ Folder deletion canceled successfully');
      }
      
      // Now test actual deletion
      await testFolderMenu2.click();
      await page.waitForTimeout(500);
      
      await page.locator('button:has-text("Delete")').click();
      await page.waitForTimeout(1000);
      
      // Confirm deletion
      const deleteBtn = page.locator('button:has-text("Delete")');
      await deleteBtn.click();
      await page.waitForTimeout(2000);
      
      // Verify folder and all its contents are deleted
      const folderDeleted = !(await testFolderItem.isVisible());
      if (folderDeleted) {
        console.log('✅ Folder and all contents deleted successfully');
      } else {
        console.log('❌ Folder was not deleted');
      }
      
    } else {
      console.log('❌ Delete confirmation dialog did not appear for folder');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/delete-test-final-state.png',
      fullPage: true 
    });
    
    // Step 4: Test error handling - try to create and delete deeply nested structure
    console.log('🧪 Testing deletion of deeply nested structure...');
    
    // Create a deeply nested structure
    await newFolderBtn.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('deep-folder');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Expand and create nested structure
    const deepFolderItem = page.locator('[data-testid="file-tree-item-deep-folder"]');
    await deepFolderItem.click();
    await page.waitForTimeout(1000);
    
    const deepFolderMenu = deepFolderItem.locator('..').locator('button[title="More actions"]');
    
    // Create multiple nested items
    for (let i = 1; i <= 3; i++) {
      // Create nested folder
      await deepFolderMenu.click();
      await page.waitForTimeout(500);
      await page.locator('text=New Folder').click();
      await page.waitForTimeout(500);
      await page.keyboard.type(`nested-level-${i}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Create nested file
      await deepFolderMenu.click();
      await page.waitForTimeout(500);
      await page.locator('text=New File').click();
      await page.waitForTimeout(500);
      await page.keyboard.type(`file-level-${i}.md`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ Created deeply nested structure');
    
    // Now delete the entire deep structure
    await deepFolderMenu.click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Delete")').click();
    await page.waitForTimeout(1000);
    
    // Confirm deletion of deep structure
    const deleteDeepBtn = page.locator('button:has-text("Delete")');
    await deleteDeepBtn.click();
    await page.waitForTimeout(2000);
    
    const deepFolderDeleted = !(await deepFolderItem.isVisible());
    if (deepFolderDeleted) {
      console.log('✅ Deeply nested structure deleted successfully');
    } else {
      console.log('❌ Deeply nested structure was not deleted');
    }
    
    console.log('✅ Delete functionality testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/delete-test-error.png',
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testDeleteFunctionality().catch(console.error);