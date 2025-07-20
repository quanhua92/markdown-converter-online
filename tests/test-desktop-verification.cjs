const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🖥️ DESKTOP VERIFICATION - Desktop 3-dots Menu Testing');
  console.log('Testing 3-dots menu functionality on desktop viewport with hover');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Listen for console logs to capture toggle operations
  page.on('console', msg => {
    if (msg.type() === 'log' && (msg.text().includes('🔧') || msg.text().includes('handleMenuAction'))) {
      console.log(`🖥️ DESKTOP LOG: ${msg.text()}`);
    }
  });

  try {
    console.log('\n1️⃣ Loading on desktop viewport...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/screenshots/desktop-step1-initial.png' });
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/screenshots/desktop-step2-welcome.png' });
    
    console.log('2️⃣ Creating workspace on desktop...');
    
    const projectTemplate = page.locator('[data-testid="quick-template-project-notes"]');
    await projectTemplate.click();
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'tests/screenshots/desktop-step3-workspace-loaded.png' });
    
    console.log('3️⃣ Testing hover to reveal 3-dots menu...');
    
    const docsFolder = page.locator('[data-testid="file-tree-item-docs"]');
    await docsFolder.hover();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'tests/screenshots/desktop-step4-hover-docs.png' });
    
    console.log('4️⃣ Clicking 3-dots menu on desktop...');
    
    // Find and click the 3-dots button
    const moreButton = docsFolder.locator('button').last();
    if (await moreButton.isVisible()) {
      console.log('   3-dots button visible, clicking...');
      await moreButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'tests/screenshots/desktop-step5-dropdown-open.png' });
      
      // Check dropdown options
      const collapseBtn = page.locator('button:has-text("Collapse")');
      const expandBtn = page.locator('button:has-text("Expand")');
      const renameBtn = page.locator('button:has-text("Rename")');
      const deleteBtn = page.locator('button:has-text("Delete")');
      const newFileBtn = page.locator('button:has-text("New File")');
      const newFolderBtn = page.locator('button:has-text("New Folder")');
      
      const hasCollapse = await collapseBtn.isVisible();
      const hasExpand = await expandBtn.isVisible();
      const hasRename = await renameBtn.isVisible();
      const hasDelete = await deleteBtn.isVisible();
      const hasNewFile = await newFileBtn.isVisible();
      const hasNewFolder = await newFolderBtn.isVisible();
      
      console.log('   Dropdown options found:');
      console.log(`     Collapse: ${hasCollapse}`);
      console.log(`     Expand: ${hasExpand}`);
      console.log(`     Rename: ${hasRename}`);
      console.log(`     Delete: ${hasDelete}`);
      console.log(`     New File: ${hasNewFile}`);
      console.log(`     New Folder: ${hasNewFolder}`);
      
      if (hasCollapse) {
        console.log('5️⃣ Testing collapse functionality...');
        await collapseBtn.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'tests/screenshots/desktop-step6-after-collapse.png' });
        
        // Test expand
        await docsFolder.hover();
        await page.waitForTimeout(500);
        const moreButton2 = docsFolder.locator('button').last();
        await moreButton2.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: 'tests/screenshots/desktop-step7-expand-menu.png' });
        
        const expandBtn2 = page.locator('button:has-text("Expand")');
        if (await expandBtn2.isVisible()) {
          console.log('   Testing expand functionality...');
          await expandBtn2.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'tests/screenshots/desktop-step8-after-expand.png' });
        }
      }
    } else {
      console.log('   3-dots button not visible');
      
      // Try to find any buttons in the docs folder row
      const allButtons = docsFolder.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`   Total buttons in docs folder row: ${buttonCount}`);
      
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const isVisible = await button.isVisible();
        const title = await button.getAttribute('title');
        console.log(`     Button ${i}: visible=${isVisible}, title="${title}"`);
      }
    }
    
    console.log('6️⃣ Testing notes folder...');
    
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    await notesFolder.hover();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'tests/screenshots/desktop-step9-hover-notes.png' });
    
    const notesMoreBtn = notesFolder.locator('button').last();
    if (await notesMoreBtn.isVisible()) {
      await notesMoreBtn.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: 'tests/screenshots/desktop-step10-notes-dropdown.png' });
      
      const notesCollapseBtn = page.locator('button:has-text("Collapse")');
      if (await notesCollapseBtn.isVisible()) {
        await notesCollapseBtn.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'tests/screenshots/desktop-step11-notes-collapsed.png' });
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/desktop-step12-final-state.png' });
    
    console.log('\n✅ DESKTOP TESTING COMPLETED');
    console.log('🖥️ All desktop interaction screenshots saved');

  } catch (error) {
    console.log('❌ Desktop test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/desktop-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Desktop test screenshots saved to tests/screenshots/desktop-step*.png');

})();