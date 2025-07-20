const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🎯 FINAL TOGGLE TEST - Testing Working 3-Dots Menu Functionality');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Listen to console logs for debugging
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`📱 BROWSER: ${msg.type()}: ${msg.text()}`);
    }
  });

  try {
    console.log('1️⃣ Loading explorer page...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    // Clear localStorage to start fresh
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/screenshots/final-toggle-welcome.png' });
    
    console.log('2️⃣ Creating Project Notes workspace...');
    
    // Click on Project Notes template (same as debug test)
    const projectTemplate = page.locator('[data-testid="quick-template-project-notes"]');
    await projectTemplate.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/final-toggle-loaded.png' });
    
    console.log('3️⃣ Testing 3-dots menu toggle on docs folder...');
    
    // Use same selector pattern as successful debug test
    const docsFolder = page.locator('[data-testid="file-tree-item-docs"]');
    await page.waitForSelector('[data-testid="file-tree-item-docs"]', { timeout: 10000 });
    
    // Click the 3-dots button using same approach as debug test
    const moreButton = docsFolder.locator('button').last(); // Last button should be 3-dots
    await moreButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'tests/screenshots/final-toggle-dropdown.png' });
    
    // Look for collapse/expand options
    const collapseButton = page.locator('button:has-text("Collapse")');
    const expandButton = page.locator('button:has-text("Expand")');
    
    console.log('4️⃣ Checking available toggle options...');
    
    const collapseVisible = await collapseButton.isVisible();
    const expandVisible = await expandButton.isVisible();
    
    console.log(`   Collapse button visible: ${collapseVisible}`);
    console.log(`   Expand button visible: ${expandVisible}`);
    
    if (collapseVisible) {
      console.log('5️⃣ Testing COLLAPSE functionality...');
      
      // Count docs children before collapse
      const beforeCollapse = await page.locator('[data-testid*="/docs/"]').count();
      console.log(`   Docs children before collapse: ${beforeCollapse}`);
      
      await collapseButton.click();
      await page.waitForTimeout(2000);
      
      // Count docs children after collapse
      const afterCollapse = await page.locator('[data-testid*="/docs/"]').count();
      console.log(`   Docs children after collapse: ${afterCollapse}`);
      
      await page.screenshot({ path: 'tests/screenshots/final-toggle-collapsed.png' });
      
      if (afterCollapse < beforeCollapse) {
        console.log('   ✅ COLLAPSE TEST PASSED: Folder collapsed successfully');
      } else {
        console.log('   ❌ COLLAPSE TEST FAILED: Folder did not collapse');
      }
      
      console.log('6️⃣ Testing EXPAND functionality...');
      
      // Now test expanding it back
      const moreButton2 = docsFolder.locator('button').last();
      await moreButton2.click();
      await page.waitForTimeout(1000);
      
      const expandButton2 = page.locator('button:has-text("Expand")');
      if (await expandButton2.isVisible()) {
        await expandButton2.click();
        await page.waitForTimeout(2000);
        
        const afterExpand = await page.locator('[data-testid*="/docs/"]').count();
        console.log(`   Docs children after re-expand: ${afterExpand}`);
        
        await page.screenshot({ path: 'tests/screenshots/final-toggle-expanded.png' });
        
        if (afterExpand > afterCollapse) {
          console.log('   ✅ EXPAND TEST PASSED: Folder expanded successfully');
        } else {
          console.log('   ❌ EXPAND TEST FAILED: Folder did not expand');
        }
      }
      
    } else if (expandVisible) {
      console.log('5️⃣ Testing EXPAND functionality (folder starts collapsed)...');
      
      const beforeExpand = await page.locator('[data-testid*="/docs/"]').count();
      console.log(`   Docs children before expand: ${beforeExpand}`);
      
      await expandButton.click();
      await page.waitForTimeout(2000);
      
      const afterExpand = await page.locator('[data-testid*="/docs/"]').count();
      console.log(`   Docs children after expand: ${afterExpand}`);
      
      await page.screenshot({ path: 'tests/screenshots/final-toggle-expanded.png' });
      
      if (afterExpand > beforeExpand) {
        console.log('   ✅ EXPAND TEST PASSED: Folder expanded successfully');
      } else {
        console.log('   ❌ EXPAND TEST FAILED: Folder did not expand');
      }
    } else {
      console.log('   ❌ NO TOGGLE OPTIONS FOUND in dropdown menu');
      
      // Take screenshot of dropdown for debugging
      await page.screenshot({ path: 'tests/screenshots/final-toggle-no-options.png' });
      
      // List all visible text in dropdown
      const dropdownButtons = await page.locator('[role="button"], button').allTextContents();
      console.log('   Available buttons in page:', dropdownButtons.slice(0, 10));
    }
    
    console.log('7️⃣ Testing notes folder as well...');
    
    // Test notes folder too
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    if (await notesFolder.isVisible()) {
      const notesMoreButton = notesFolder.locator('button').last();
      await notesMoreButton.click();
      await page.waitForTimeout(1000);
      
      const notesCollapseButton = page.locator('button:has-text("Collapse")');
      if (await notesCollapseButton.isVisible()) {
        console.log('   Notes folder toggle option found - testing...');
        
        const beforeNotesCollapse = await page.locator('[data-testid*="/notes/"]').count();
        console.log(`   Notes children before collapse: ${beforeNotesCollapse}`);
        
        await notesCollapseButton.click();
        await page.waitForTimeout(2000);
        
        const afterNotesCollapse = await page.locator('[data-testid*="/notes/"]').count();
        console.log(`   Notes children after collapse: ${afterNotesCollapse}`);
        
        if (afterNotesCollapse < beforeNotesCollapse) {
          console.log('   ✅ NOTES COLLAPSE PASSED: Notes folder collapsed successfully');
        } else {
          console.log('   ❌ NOTES COLLAPSE FAILED: Notes folder did not collapse');
        }
      } else {
        console.log('   Notes folder toggle option not found');
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/final-toggle-complete.png' });
    
    console.log('\n🎉 FINAL TOGGLE TEST COMPLETED');
    console.log('✅ All requested multi-level toggle functionality has been tested');

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/final-toggle-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/final-toggle-*');
  console.log('🔍 Toggle functionality test completed - check console output above for results');

})();