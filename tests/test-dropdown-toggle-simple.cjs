const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🔽 Testing Existing Folder Dropdown Toggle...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to explorer
    console.log('1️⃣ Loading explorer page...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/dropdown-simple-initial.png' });
    
    // Look for the "notes" folder specifically
    console.log('2️⃣ Finding "notes" folder...');
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    
    if (await notesFolder.isVisible()) {
      console.log('✅ Found "notes" folder');
      
      // Check initial state - look for children
      const initialChildren = await page.locator('[data-testid^="file-tree-item-notes/"]').count();
      console.log(`   Initial children visible: ${initialChildren}`);
      
      // Find the 3-dots menu button within the notes folder
      const moreButton = notesFolder.locator('button').filter({ hasText: '' }).last(); // MoreVertical button should be last
      
      if (await moreButton.isVisible()) {
        console.log('✅ Found 3-dots menu button');
        
        // Click the 3-dots menu
        await moreButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'tests/screenshots/dropdown-simple-menu-open.png' });
        
        // Look for toggle option (Expand or Collapse)
        const expandOption = page.locator('button:has-text("Expand")');
        const collapseOption = page.locator('button:has-text("Collapse")');
        
        if (await expandOption.isVisible()) {
          console.log('✅ Found "Expand" option - folder is currently collapsed');
          
          // Click expand
          await expandOption.click();
          await page.waitForTimeout(1000);
          
          // Check if children are now visible
          const afterExpandChildren = await page.locator('[data-testid^="file-tree-item-notes/"]').count();
          console.log(`   After expand children visible: ${afterExpandChildren}`);
          
          if (afterExpandChildren > initialChildren) {
            console.log('✅ PASS: Expand worked - more children visible');
          } else {
            console.log('❌ FAIL: Expand did not work - no new children visible');
          }
          
          await page.screenshot({ path: 'tests/screenshots/dropdown-simple-after-expand.png' });
          
          // Test collapse now
          await moreButton.click();
          await page.waitForTimeout(500);
          
          const collapseOption2 = page.locator('button:has-text("Collapse")');
          if (await collapseOption2.isVisible()) {
            console.log('✅ Found "Collapse" option after expand');
            
            await collapseOption2.click();
            await page.waitForTimeout(1000);
            
            const afterCollapseChildren = await page.locator('[data-testid^="file-tree-item-notes/"]').count();
            console.log(`   After collapse children visible: ${afterCollapseChildren}`);
            
            if (afterCollapseChildren < afterExpandChildren) {
              console.log('✅ PASS: Collapse worked - fewer children visible');
            } else {
              console.log('❌ FAIL: Collapse did not work - children still visible');
            }
            
            await page.screenshot({ path: 'tests/screenshots/dropdown-simple-after-collapse.png' });
          } else {
            console.log('❌ FAIL: No "Collapse" option found after expand');
          }
          
        } else if (await collapseOption.isVisible()) {
          console.log('✅ Found "Collapse" option - folder is currently expanded');
          
          // Click collapse
          await collapseOption.click();
          await page.waitForTimeout(1000);
          
          // Check if children are now hidden
          const afterCollapseChildren = await page.locator('[data-testid^="file-tree-item-notes/"]').count();
          console.log(`   After collapse children visible: ${afterCollapseChildren}`);
          
          if (afterCollapseChildren < initialChildren) {
            console.log('✅ PASS: Collapse worked - fewer children visible');
          } else {
            console.log('❌ FAIL: Collapse did not work - same number of children visible');
          }
          
          await page.screenshot({ path: 'tests/screenshots/dropdown-simple-after-collapse.png' });
          
        } else {
          console.log('❌ FAIL: No toggle option (Expand/Collapse) found in dropdown');
          await page.screenshot({ path: 'tests/screenshots/dropdown-simple-no-toggle.png' });
        }
        
      } else {
        console.log('❌ FAIL: 3-dots menu button not found');
        await page.screenshot({ path: 'tests/screenshots/dropdown-simple-no-button.png' });
      }
      
    } else {
      console.log('❌ FAIL: "notes" folder not found');
    }
    
    await page.screenshot({ path: 'tests/screenshots/dropdown-simple-final.png' });
    console.log('\n✅ Simple dropdown toggle test completed');

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/dropdown-simple-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/dropdown-simple-*');
  console.log('🔍 Check console output and screenshots to verify dropdown toggle functionality.');

})();