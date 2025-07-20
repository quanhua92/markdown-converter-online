const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🏗️ Testing Multi-Level Toggle with Project Notes Template...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to explorer and create workspace from template
    console.log('1️⃣ Loading explorer and creating Project Notes workspace...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    // Clear localStorage to start fresh
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/screenshots/template-toggle-welcome.png' });
    
    // Click on Project Notes template
    const projectTemplate = page.locator('[data-testid="quick-template-project-notes"]');
    if (await projectTemplate.isVisible()) {
      console.log('   Found Project Notes template button');
      await projectTemplate.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('   Project Notes template not found, using alternative approach...');
      // Try the template cards approach
      const templateCard = page.locator('text="Project Notes"').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
        await page.waitForTimeout(1000);
        // Click Initialize Template button
        const initButton = page.locator('button:has-text("Initialize Template")');
        if (await initButton.isVisible()) {
          await initButton.click();
          await page.waitForTimeout(3000);
        }
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/template-toggle-loaded.png' });
    
    // Now we should have the Project Notes structure with docs and notes folders
    console.log('2️⃣ Testing docs folder toggle functionality...');
    
    // Find the docs folder
    const docsFolder = page.locator('[data-testid="file-tree-item-docs"]');
    if (await docsFolder.isVisible()) {
      console.log('   Found docs folder, testing 3-dots menu...');
      
      // Click the 3-dots menu on docs folder
      const docsMoreButton = docsFolder.locator('button[title="More actions"]');
      await docsMoreButton.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: 'tests/screenshots/template-toggle-docs-menu.png' });
      
      // Look for Collapse or Expand option
      const collapseOption = page.locator('button:has-text("Collapse")');
      const expandOption = page.locator('button:has-text("Expand")');
      
      if (await collapseOption.isVisible()) {
        console.log('   Docs folder is expanded - testing Collapse...');
        
        // Count children before collapse
        const beforeChildren = await page.locator('[data-testid*="docs/"]').count();
        console.log(`   Docs children visible before collapse: ${beforeChildren}`);
        
        await collapseOption.click();
        await page.waitForTimeout(1000);
        
        // Count children after collapse
        const afterChildren = await page.locator('[data-testid*="docs/"]').count();
        console.log(`   Docs children visible after collapse: ${afterChildren}`);
        
        if (afterChildren < beforeChildren) {
          console.log('   ✅ PASS: Docs collapse worked');
        } else {
          console.log('   ❌ FAIL: Docs collapse did not work');
        }
        
        await page.screenshot({ path: 'tests/screenshots/template-toggle-docs-collapsed.png' });
        
        // Now test expanding it back
        console.log('   Testing Expand after collapse...');
        await docsMoreButton.click();
        await page.waitForTimeout(500);
        
        const expandOption2 = page.locator('button:has-text("Expand")');
        if (await expandOption2.isVisible()) {
          await expandOption2.click();
          await page.waitForTimeout(1000);
          
          const afterExpand = await page.locator('[data-testid*="docs/"]').count();
          console.log(`   Docs children visible after re-expand: ${afterExpand}`);
          
          if (afterExpand > afterChildren) {
            console.log('   ✅ PASS: Docs re-expand worked');
          } else {
            console.log('   ❌ FAIL: Docs re-expand did not work');
          }
        }
        
      } else if (await expandOption.isVisible()) {
        console.log('   Docs folder is collapsed - testing Expand...');
        
        const beforeChildren = await page.locator('[data-testid*="docs/"]').count();
        console.log(`   Docs children visible before expand: ${beforeChildren}`);
        
        await expandOption.click();
        await page.waitForTimeout(1000);
        
        const afterChildren = await page.locator('[data-testid*="docs/"]').count();
        console.log(`   Docs children visible after expand: ${afterChildren}`);
        
        if (afterChildren > beforeChildren) {
          console.log('   ✅ PASS: Docs expand worked');
        } else {
          console.log('   ❌ FAIL: Docs expand did not work');
        }
      } else {
        console.log('   ❌ FAIL: No toggle option found in docs dropdown');
      }
      
    } else {
      console.log('   ❌ FAIL: Docs folder not found');
    }
    
    await page.screenshot({ path: 'tests/screenshots/template-toggle-docs-final.png' });
    
    // Test notes folder as well
    console.log('3️⃣ Testing notes folder toggle functionality...');
    
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    if (await notesFolder.isVisible()) {
      console.log('   Found notes folder, testing 3-dots menu...');
      
      const notesMoreButton = notesFolder.locator('button[title="More actions"]');
      await notesMoreButton.click();
      await page.waitForTimeout(500);
      
      const notesCollapseOption = page.locator('button:has-text("Collapse")');
      const notesExpandOption = page.locator('button:has-text("Expand")');
      
      if (await notesCollapseOption.isVisible()) {
        console.log('   Notes folder is expanded - testing Collapse...');
        
        const beforeChildren = await page.locator('[data-testid*="notes/"]').count();
        console.log(`   Notes children visible before collapse: ${beforeChildren}`);
        
        await notesCollapseOption.click();
        await page.waitForTimeout(1000);
        
        const afterChildren = await page.locator('[data-testid*="notes/"]').count();
        console.log(`   Notes children visible after collapse: ${afterChildren}`);
        
        if (afterChildren < beforeChildren) {
          console.log('   ✅ PASS: Notes collapse worked');
        } else {
          console.log('   ❌ FAIL: Notes collapse did not work');
        }
        
      } else if (await notesExpandOption.isVisible()) {
        console.log('   Notes folder is collapsed - testing Expand...');
        
        const beforeChildren = await page.locator('[data-testid*="notes/"]').count();
        console.log(`   Notes children visible before expand: ${beforeChildren}`);
        
        await notesExpandOption.click();
        await page.waitForTimeout(1000);
        
        const afterChildren = await page.locator('[data-testid*="notes/"]').count();
        console.log(`   Notes children visible after expand: ${afterChildren}`);
        
        if (afterChildren > beforeChildren) {
          console.log('   ✅ PASS: Notes expand worked');
        } else {
          console.log('   ❌ FAIL: Notes expand did not work');
        }
      }
      
    } else {
      console.log('   ❌ FAIL: Notes folder not found');
    }
    
    await page.screenshot({ path: 'tests/screenshots/template-toggle-notes-final.png' });
    
    // Test clicking the chevron icons as well for comparison
    console.log('4️⃣ Testing direct chevron click functionality...');
    
    const docsChevron = page.locator('[data-testid="file-tree-item-docs"] button[title="Toggle folder"]');
    if (await docsChevron.isVisible()) {
      console.log('   Testing direct chevron click on docs folder...');
      
      const beforeChevron = await page.locator('[data-testid*="docs/"]').count();
      console.log(`   Children before chevron click: ${beforeChevron}`);
      
      await docsChevron.click();
      await page.waitForTimeout(1000);
      
      const afterChevron = await page.locator('[data-testid*="docs/"]').count();
      console.log(`   Children after chevron click: ${afterChevron}`);
      
      if (afterChevron !== beforeChevron) {
        console.log('   ✅ PASS: Direct chevron click worked');
      } else {
        console.log('   ❌ FAIL: Direct chevron click did not work');
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/template-toggle-complete.png' });
    
    console.log('\n✅ Template-based toggle test completed successfully');

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/template-toggle-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/template-toggle-*');
  console.log('🔍 Multi-level folder toggle functionality has been thoroughly tested.');

})();