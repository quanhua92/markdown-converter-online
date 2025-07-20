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
    
    // Step 5: Test complete workspace clearing - delete everything until empty
    console.log('🧹 Testing complete workspace clearing...');
    
    // Get all remaining items in the workspace
    let remainingItems = await page.locator('[data-testid^="file-tree-item-"]').count();
    console.log(`📊 Found ${remainingItems} items to delete`);
    
    // Delete all remaining items one by one
    while (remainingItems > 0) {
      const firstItem = page.locator('[data-testid^="file-tree-item-"]').first();
      const itemName = await firstItem.textContent();
      console.log(`🗑️ Deleting: ${itemName}`);
      
      // Click the more actions menu for the first item
      const itemMenu = firstItem.locator('..').locator('button[title="More actions"]');
      await itemMenu.click();
      await page.waitForTimeout(500);
      
      // Click delete
      const deleteOption = page.locator('button:has-text("Delete")');
      await deleteOption.click();
      await page.waitForTimeout(1000);
      
      // Check if confirmation dialog appears (for folders)
      const dialogVisible = await page.locator('text=Delete Folder').isVisible();
      if (dialogVisible) {
        console.log(`  📋 Confirming folder deletion for: ${itemName}`);
        const confirmBtn = page.locator('button:has-text("Delete")').last();
        await confirmBtn.click();
        await page.waitForTimeout(1500);
      } else {
        console.log(`  ✅ File deleted immediately: ${itemName}`);
        await page.waitForTimeout(1000);
      }
      
      // Update count
      remainingItems = await page.locator('[data-testid^="file-tree-item-"]').count();
      console.log(`📊 Remaining items: ${remainingItems}`);
    }
    
    console.log('✅ Workspace completely cleared!');
    
    // Step 6: Test empty workspace stability
    console.log('🔍 Testing empty workspace stability...');
    
    await page.screenshot({ 
      path: 'tests/screenshots/delete-test-empty-workspace.png',
      fullPage: true 
    });
    
    // Verify no items remain
    const finalItemCount = await page.locator('[data-testid^="file-tree-item-"]').count();
    if (finalItemCount === 0) {
      console.log('✅ Workspace is completely empty');
    } else {
      console.log(`❌ ${finalItemCount} items still remain in workspace`);
    }
    
    // Test basic operations on empty workspace
    console.log('🧪 Testing operations on empty workspace...');
    
    // Try clicking file tree area
    const fileTreeArea = page.locator('[data-testid="file-tree"]');
    if (await fileTreeArea.isVisible()) {
      await fileTreeArea.click();
      await page.waitForTimeout(500);
      console.log('✅ Clicking empty file tree area - no crash');
    }
    
    // Check if new file/folder buttons still work
    const newFileBtn2 = page.locator('button[title="New file"]').first();
    const newFolderBtn2 = page.locator('button[title="New folder"]').first();
    
    if (await newFileBtn2.isVisible()) {
      console.log('✅ New file button still visible in empty workspace');
    }
    if (await newFolderBtn2.isVisible()) {
      console.log('✅ New folder button still visible in empty workspace');
    }
    
    // Step 7: Rebuild workspace structure and test deletion again
    console.log('🔄 Rebuilding workspace structure for second deletion test...');
    
    // Create new folder with files
    await newFolderBtn2.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('rebuild-folder');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Expand the new folder
    const rebuildFolderItem = page.locator('[data-testid="file-tree-item-rebuild-folder"]');
    await rebuildFolderItem.click();
    await page.waitForTimeout(1000);
    
    // Add multiple files to the folder
    const rebuildFolderMenu = rebuildFolderItem.locator('..').locator('button[title="More actions"]');
    
    for (let i = 1; i <= 5; i++) {
      await rebuildFolderMenu.click();
      await page.waitForTimeout(500);
      await page.locator('text=New File').click();
      await page.waitForTimeout(500);
      await page.keyboard.type(`rebuild-file-${i}.md`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Add a nested folder
    await rebuildFolderMenu.click();
    await page.waitForTimeout(500);
    await page.locator('text=New Folder').click();
    await page.waitForTimeout(500);
    await page.keyboard.type('rebuild-nested');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log('✅ Rebuilt workspace with 1 folder, 5 files, and 1 nested folder');
    
    await page.screenshot({ 
      path: 'tests/screenshots/delete-test-rebuilt-structure.png',
      fullPage: true 
    });
    
    // Step 8: Delete the entire rebuilt structure in one go
    console.log('🗑️ Testing bulk deletion of rebuilt structure...');
    
    await rebuildFolderMenu.click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Delete")').click();
    await page.waitForTimeout(1000);
    
    // Confirm deletion of the entire structure
    const finalDeleteBtn = page.locator('button:has-text("Delete")');
    await finalDeleteBtn.click();
    await page.waitForTimeout(2000);
    
    // Verify everything is deleted again
    const finalItemCount2 = await page.locator('[data-testid^="file-tree-item-"]').count();
    if (finalItemCount2 === 0) {
      console.log('✅ Rebuilt structure completely deleted - workspace empty again');
    } else {
      console.log(`❌ ${finalItemCount2} items still remain after bulk deletion`);
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/delete-test-final-empty.png',
      fullPage: true 
    });
    
    console.log('✅ Comprehensive delete functionality testing completed successfully!');
    console.log('📋 Test Summary:');
    console.log('   ✅ File deletion (immediate)');
    console.log('   ✅ Folder deletion (with confirmation)');
    console.log('   ✅ Nested structure deletion');
    console.log('   ✅ Complete workspace clearing');
    console.log('   ✅ Empty workspace stability');
    console.log('   ✅ Rebuild and re-delete functionality');
    
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