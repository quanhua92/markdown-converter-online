const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🏗️ Testing Nested Folder Toggle Functionality...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to explorer
    console.log('1️⃣ Loading explorer page...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-initial.png' });
    
    // Create nested folder structure: parent/child/grandchild
    console.log('2️⃣ Creating nested folder structure...');
    
    // Create parent folder
    const newFolderButton = page.locator('button[title="New folder"]').first();
    await newFolderButton.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('parent-folder');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-parent-created.png' });
    
    // Create child folder inside parent
    const parentFolder = page.locator('[data-testid="file-tree-item-parent-folder"]');
    await parentFolder.hover();
    await page.waitForTimeout(500);
    
    // Click the 3-dots menu on parent folder
    const parentMoreButton = parentFolder.locator('button').last(); // Assume 3-dots is last button
    await parentMoreButton.click();
    await page.waitForTimeout(500);
    
    // Click "New Folder" in dropdown
    const newFolderOption = page.locator('button:has-text("New Folder")');
    if (await newFolderOption.isVisible()) {
      await newFolderOption.click();
      await page.waitForTimeout(500);
      await page.keyboard.type('child-folder');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ Could not find "New Folder" option in dropdown, trying alternative approach...');
      await page.keyboard.press('Escape');
      
      // Try clicking on parent folder to expand it first
      await parentFolder.click();
      await page.waitForTimeout(500);
      
      // Try to create folder using the header buttons
      await newFolderButton.click();
      await page.waitForTimeout(500);
      await page.keyboard.type('parent-folder/child-folder');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-child-created.png' });
    
    // Create grandchild folder
    console.log('3️⃣ Creating grandchild folder...');
    const childFolder = page.locator('[data-testid*="child-folder"]').first();
    if (await childFolder.isVisible()) {
      await childFolder.hover();
      await page.waitForTimeout(500);
      
      const childMoreButton = childFolder.locator('button').last();
      await childMoreButton.click();
      await page.waitForTimeout(500);
      
      const newFolderOption2 = page.locator('button:has-text("New Folder")');
      if (await newFolderOption2.isVisible()) {
        await newFolderOption2.click();
        await page.waitForTimeout(500);
        await page.keyboard.type('grandchild-folder');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }
    }
    
    // Add a file in the grandchild folder for better testing
    console.log('4️⃣ Adding test file in grandchild...');
    const grandchildFolder = page.locator('[data-testid*="grandchild-folder"]').first();
    if (await grandchildFolder.isVisible()) {
      await grandchildFolder.hover();
      await page.waitForTimeout(500);
      
      const grandchildMoreButton = grandchildFolder.locator('button').last();
      await grandchildMoreButton.click();
      await page.waitForTimeout(500);
      
      const newFileOption = page.locator('button:has-text("New File")');
      if (await newFileOption.isVisible()) {
        await newFileOption.click();
        await page.waitForTimeout(500);
        await page.keyboard.type('test-file.md');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-structure-complete.png' });
    
    // Now test dropdown toggle functionality at each level
    console.log('5️⃣ Testing dropdown toggle on parent folder...');
    
    // Test parent folder toggle
    await parentFolder.hover();
    await page.waitForTimeout(500);
    
    const parentToggleButton = parentFolder.locator('button').last();
    await parentToggleButton.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-parent-menu.png' });
    
    // Look for toggle option
    const expandOption = page.locator('button:has-text("Expand")');
    const collapseOption = page.locator('button:has-text("Collapse")');
    
    let initialState = 'unknown';
    if (await expandOption.isVisible()) {
      initialState = 'collapsed';
      console.log('   Parent folder is currently collapsed - clicking Expand...');
      
      // Count children before
      const beforeChildren = await page.locator('[data-testid*="parent-folder/"]').count();
      console.log(`   Children visible before expand: ${beforeChildren}`);
      
      await expandOption.click();
      await page.waitForTimeout(1000);
      
      // Count children after
      const afterChildren = await page.locator('[data-testid*="parent-folder/"]').count();
      console.log(`   Children visible after expand: ${afterChildren}`);
      
      if (afterChildren > beforeChildren) {
        console.log('   ✅ PASS: Parent expand worked');
      } else {
        console.log('   ❌ FAIL: Parent expand did not work');
      }
      
    } else if (await collapseOption.isVisible()) {
      initialState = 'expanded';
      console.log('   Parent folder is currently expanded - clicking Collapse...');
      
      // Count children before
      const beforeChildren = await page.locator('[data-testid*="parent-folder/"]').count();
      console.log(`   Children visible before collapse: ${beforeChildren}`);
      
      await collapseOption.click();
      await page.waitForTimeout(1000);
      
      // Count children after
      const afterChildren = await page.locator('[data-testid*="parent-folder/"]').count();
      console.log(`   Children visible after collapse: ${afterChildren}`);
      
      if (afterChildren < beforeChildren) {
        console.log('   ✅ PASS: Parent collapse worked');
      } else {
        console.log('   ❌ FAIL: Parent collapse did not work');
      }
    } else {
      console.log('   ❌ FAIL: No toggle option found in parent dropdown');
    }
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-parent-after.png' });
    
    // Test child folder toggle
    console.log('6️⃣ Testing dropdown toggle on child folder...');
    
    // First ensure parent is expanded so we can see child
    if (initialState === 'collapsed') {
      await parentFolder.hover();
      await page.waitForTimeout(500);
      const parentToggleButton2 = parentFolder.locator('button').last();
      await parentToggleButton2.click();
      await page.waitForTimeout(500);
      const expandOption2 = page.locator('button:has-text("Expand")');
      if (await expandOption2.isVisible()) {
        await expandOption2.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const childFolderVisible = page.locator('[data-testid*="child-folder"]').first();
    if (await childFolderVisible.isVisible()) {
      await childFolderVisible.hover();
      await page.waitForTimeout(500);
      
      const childToggleButton = childFolderVisible.locator('button').last();
      await childToggleButton.click();
      await page.waitForTimeout(500);
      
      const childExpandOption = page.locator('button:has-text("Expand")');
      const childCollapseOption = page.locator('button:has-text("Collapse")');
      
      if (await childExpandOption.isVisible()) {
        console.log('   Child folder is collapsed - clicking Expand...');
        
        const beforeGrandchildren = await page.locator('[data-testid*="grandchild"]').count();
        console.log(`   Grandchildren visible before expand: ${beforeGrandchildren}`);
        
        await childExpandOption.click();
        await page.waitForTimeout(1000);
        
        const afterGrandchildren = await page.locator('[data-testid*="grandchild"]').count();
        console.log(`   Grandchildren visible after expand: ${afterGrandchildren}`);
        
        if (afterGrandchildren > beforeGrandchildren) {
          console.log('   ✅ PASS: Child expand worked');
        } else {
          console.log('   ❌ FAIL: Child expand did not work');
        }
        
      } else if (await childCollapseOption.isVisible()) {
        console.log('   Child folder is expanded - clicking Collapse...');
        
        const beforeGrandchildren = await page.locator('[data-testid*="grandchild"]').count();
        console.log(`   Grandchildren visible before collapse: ${beforeGrandchildren}`);
        
        await childCollapseOption.click();
        await page.waitForTimeout(1000);
        
        const afterGrandchildren = await page.locator('[data-testid*="grandchild"]').count();
        console.log(`   Grandchildren visible after collapse: ${afterGrandchildren}`);
        
        if (afterGrandchildren < beforeGrandchildren) {
          console.log('   ✅ PASS: Child collapse worked');
        } else {
          console.log('   ❌ FAIL: Child collapse did not work');
        }
      } else {
        console.log('   ❌ FAIL: No toggle option found in child dropdown');
      }
    } else {
      console.log('   ⚠️ Child folder not visible - cannot test');
    }
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-child-after.png' });
    
    // Test expanding all levels
    console.log('7️⃣ Testing expand all levels...');
    
    // Expand parent if needed
    const parentStillVisible = page.locator('[data-testid="file-tree-item-parent-folder"]');
    await parentStillVisible.hover();
    await page.waitForTimeout(500);
    
    const parentFinalButton = parentStillVisible.locator('button').last();
    await parentFinalButton.click();
    await page.waitForTimeout(500);
    
    const parentFinalExpand = page.locator('button:has-text("Expand")');
    if (await parentFinalExpand.isVisible()) {
      await parentFinalExpand.click();
      await page.waitForTimeout(1000);
    }
    
    // Expand child if needed
    const childFinalVisible = page.locator('[data-testid*="child-folder"]').first();
    if (await childFinalVisible.isVisible()) {
      await childFinalVisible.hover();
      await page.waitForTimeout(500);
      
      const childFinalButton = childFinalVisible.locator('button').last();
      await childFinalButton.click();
      await page.waitForTimeout(500);
      
      const childFinalExpand = page.locator('button:has-text("Expand")');
      if (await childFinalExpand.isVisible()) {
        await childFinalExpand.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Expand grandchild if needed
    const grandchildFinalVisible = page.locator('[data-testid*="grandchild-folder"]').first();
    if (await grandchildFinalVisible.isVisible()) {
      await grandchildFinalVisible.hover();
      await page.waitForTimeout(500);
      
      const grandchildFinalButton = grandchildFinalVisible.locator('button').last();
      await grandchildFinalButton.click();
      await page.waitForTimeout(500);
      
      const grandchildFinalExpand = page.locator('button:has-text("Expand")');
      if (await grandchildFinalExpand.isVisible()) {
        await grandchildFinalExpand.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Count final visibility
    const finalFiles = await page.locator('[data-testid*="test-file"]').count();
    console.log(`   Final test files visible: ${finalFiles}`);
    
    if (finalFiles > 0) {
      console.log('   ✅ PASS: All levels expanded successfully - test file is visible');
    } else {
      console.log('   ❌ FAIL: Could not expand all levels - test file not visible');
    }
    
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-all-expanded.png' });
    
    console.log('\n✅ Nested folder toggle test completed');

  } catch (error) {
    console.log('❌ Test error:', error.message);
    console.log('Stack trace:', error.stack);
    await page.screenshot({ path: 'tests/screenshots/nested-toggle-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/nested-toggle-*');
  console.log('🔍 Check console output and screenshots to debug dropdown toggle functionality.');

})();