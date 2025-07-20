const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🗂️ Testing Folder Toggle Fix...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to explorer
    console.log('1️⃣ Loading explorer page...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/folder-fix-initial.png' });
    
    // Look for folders in the file tree
    console.log('2️⃣ Finding folders to test...');
    const folders = await page.locator('[data-testid^="file-tree-item-"][data-testid$="/"]').all();
    
    if (folders.length === 0) {
      console.log('⚠️ No folders found - skipping test');
      return;
    }
    
    console.log(`📁 Found ${folders.length} folders to test`);
    
    // Test each folder
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      const folderTestId = await folder.getAttribute('data-testid');
      const folderName = folderTestId.replace('file-tree-item-', '').replace('/', '');
      
      console.log(`\n   Testing folder: "${folderName}"`);
      
      // Check initial state
      const initialExpanded = await folder.getAttribute('aria-expanded');
      console.log(`   Initial state: ${initialExpanded}`);
      
      // Look for children before toggle
      const folderPath = folderName;
      const initialChildren = await page.locator(`[data-testid^="file-tree-item-${folderPath}/"]`).all();
      console.log(`   Initial children visible: ${initialChildren.length}`);
      
      // Find and click the toggle button
      const toggleButton = folder.locator('button').first();
      
      if (await toggleButton.isVisible()) {
        console.log('   Clicking folder toggle...');
        await toggleButton.click();
        await page.waitForTimeout(500);
        
        // Check state after toggle
        const afterToggleExpanded = await folder.getAttribute('aria-expanded');
        console.log(`   After toggle state: ${afterToggleExpanded}`);
        
        // Check children visibility after toggle
        const afterToggleChildren = await page.locator(`[data-testid^="file-tree-item-${folderPath}/"]`).all();
        console.log(`   After toggle children visible: ${afterToggleChildren.length}`);
        
        // Verify the fix works
        if (afterToggleExpanded === 'false' && afterToggleChildren.length === 0) {
          console.log('   ✅ PASS: Folder collapsed and children hidden');
        } else if (afterToggleExpanded === 'true' && afterToggleChildren.length > 0) {
          console.log('   ✅ PASS: Folder expanded and children visible');
        } else if (afterToggleExpanded === 'false' && afterToggleChildren.length > 0) {
          console.log('   ❌ FAIL: Folder shows collapsed but children still visible (BUG!)');
        } else {
          console.log('   ⚠️ UNCLEAR: Unexpected state combination');
        }
        
        // Toggle back and test again
        console.log('   Testing toggle back...');
        await toggleButton.click();
        await page.waitForTimeout(500);
        
        const finalExpanded = await folder.getAttribute('aria-expanded');
        const finalChildren = await page.locator(`[data-testid^="file-tree-item-${folderPath}/"]`).all();
        console.log(`   Final state: ${finalExpanded}, children: ${finalChildren.length}`);
        
        if (finalExpanded === 'false' && finalChildren.length === 0) {
          console.log('   ✅ PASS: Second toggle - Folder collapsed and children hidden');
        } else if (finalExpanded === 'true' && finalChildren.length > 0) {
          console.log('   ✅ PASS: Second toggle - Folder expanded and children visible');
        } else {
          console.log('   ❌ FAIL: Second toggle inconsistent state');
        }
        
        await page.screenshot({ path: `tests/screenshots/folder-fix-${folderName}-test.png` });
      } else {
        console.log('   ⚠️ No toggle button found for this folder');
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/folder-fix-final.png' });
    console.log('\n✅ Folder toggle fix test completed');

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/folder-fix-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/folder-fix-*');
  console.log('🔍 Check console output to see if the folder toggle fix works correctly.');

})();