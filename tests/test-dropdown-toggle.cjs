const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🔽 Testing Dropdown Toggle Functionality...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to explorer
    console.log('1️⃣ Loading explorer page...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/dropdown-toggle-initial.png' });
    
    // Look for folders in the file tree
    console.log('2️⃣ Finding folders to test dropdown toggle...');
    const folders = await page.locator('[data-testid^="file-tree-item-"]').filter({ hasText: /\/$/ }).all();
    
    if (folders.length === 0) {
      console.log('⚠️ No folders found - creating test folder...');
      
      // Create a test folder structure
      const newFolderButton = page.locator('button[title="New folder"]').first();
      await newFolderButton.click();
      await page.waitForTimeout(500);
      
      // Type folder name
      await page.keyboard.type('test-folder');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Create a file inside the folder to test expansion
      const testFolderItem = page.locator('[data-testid="file-tree-item-test-folder"]');
      const moreButton = testFolderItem.locator('button[title="More actions"]');
      await moreButton.click();
      await page.waitForTimeout(500);
      
      const newFileOption = page.locator('text="New File"');
      await newFileOption.click();
      await page.waitForTimeout(500);
      
      await page.keyboard.type('test-file.md');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Find folders again after potential creation
    const testFolders = await page.locator('[data-testid^="file-tree-item-"]').filter({ hasText: /\/$/ }).all();
    console.log(`📁 Found ${testFolders.length} folders to test`);
    
    // Test dropdown toggle for each folder
    for (let i = 0; i < Math.min(testFolders.length, 3); i++) {
      const folder = testFolders[i];
      const folderTestId = await folder.getAttribute('data-testid');
      const folderName = folderTestId.replace('file-tree-item-', '');
      
      console.log(`\n   Testing dropdown toggle for folder: "${folderName}"`);
      
      // Check initial folder state
      const folderContainer = folder.locator('..');
      const initialChildren = await folderContainer.locator('[data-testid^="file-tree-item-"]').filter({ hasText: new RegExp(`^${folderName}/`) }).all();
      console.log(`   Initial children visible: ${initialChildren.length}`);
      
      // Find and click the 3-dots menu button
      const moreButton = folder.locator('button[title="More actions"]');
      
      if (await moreButton.isVisible()) {
        console.log('   Opening 3-dots menu...');
        await moreButton.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: `tests/screenshots/dropdown-toggle-menu-${i}.png` });
        
        // Look for toggle option in dropdown
        const toggleOption = page.locator('button:has-text("Expand"), button:has-text("Collapse")');
        
        if (await toggleOption.isVisible()) {
          const toggleText = await toggleOption.textContent();
          console.log(`   Found toggle option: "${toggleText}"`);
          
          // Click the toggle option
          await toggleOption.click();
          await page.waitForTimeout(1000);
          
          // Check state after dropdown toggle
          const afterToggleChildren = await folderContainer.locator('[data-testid^="file-tree-item-"]').filter({ hasText: new RegExp(`^${folderName}/`) }).all();
          console.log(`   After dropdown toggle children visible: ${afterToggleChildren.length}`);
          
          // Verify toggle worked
          if (toggleText.includes('Expand') && afterToggleChildren.length > initialChildren.length) {
            console.log('   ✅ PASS: Dropdown "Expand" worked - more children visible');
          } else if (toggleText.includes('Collapse') && afterToggleChildren.length < initialChildren.length) {
            console.log('   ✅ PASS: Dropdown "Collapse" worked - fewer children visible');
          } else if (toggleText.includes('Expand') && afterToggleChildren.length === initialChildren.length) {
            console.log('   ❌ FAIL: Dropdown "Expand" did not increase children count');
          } else if (toggleText.includes('Collapse') && afterToggleChildren.length === initialChildren.length) {
            console.log('   ❌ FAIL: Dropdown "Collapse" did not decrease children count (BUG!)');
          } else {
            console.log('   ⚠️ UNCLEAR: Unexpected result from dropdown toggle');
          }
          
          // Test toggle again to verify bidirectional functionality
          console.log('   Testing reverse toggle...');
          await moreButton.click();
          await page.waitForTimeout(500);
          
          const reverseToggleOption = page.locator('button:has-text("Expand"), button:has-text("Collapse")');
          if (await reverseToggleOption.isVisible()) {
            const reverseToggleText = await reverseToggleOption.textContent();
            console.log(`   Reverse toggle option: "${reverseToggleText}"`);
            
            await reverseToggleOption.click();
            await page.waitForTimeout(1000);
            
            const finalChildren = await folderContainer.locator('[data-testid^="file-tree-item-"]').filter({ hasText: new RegExp(`^${folderName}/`) }).all();
            console.log(`   Final children visible: ${finalChildren.length}`);
            
            if (Math.abs(finalChildren.length - initialChildren.length) <= 1) {
              console.log('   ✅ PASS: Bidirectional dropdown toggle works');
            } else {
              console.log('   ❌ FAIL: Bidirectional dropdown toggle inconsistent');
            }
          }
          
          await page.screenshot({ path: `tests/screenshots/dropdown-toggle-after-${i}.png` });
        } else {
          console.log('   ❌ FAIL: No toggle option found in dropdown menu');
          await page.screenshot({ path: `tests/screenshots/dropdown-toggle-no-option-${i}.png` });
        }
      } else {
        console.log('   ⚠️ No 3-dots menu button found for this folder');
      }
      
      // Close any open menus
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ path: 'tests/screenshots/dropdown-toggle-final.png' });
    console.log('\n✅ Dropdown toggle test completed');

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/dropdown-toggle-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/dropdown-toggle-*');
  console.log('🔍 Check console output to see if the dropdown toggle functionality works correctly.');

})();