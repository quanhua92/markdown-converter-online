const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('📱 MOBILE FILE TREE ACCESS TEST');
  console.log('Testing how to access and use the mobile file tree with nested folders');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro

  // Listen for console logs to capture toggle operations
  page.on('console', msg => {
    if (msg.type() === 'log' && (msg.text().includes('🔧') || msg.text().includes('handleMenuAction'))) {
      console.log(`📱 MOBILE TOGGLE: ${msg.text()}`);
    }
  });

  try {
    console.log('\n1️⃣ Loading mobile viewport and creating workspace...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/screenshots/mobile-access-step1-welcome.png', fullPage: true });
    
    // Create Project Notes workspace
    const projectTemplate = page.locator('[data-testid="quick-template-project-notes"]');
    await projectTemplate.click();
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'tests/screenshots/mobile-access-step2-workspace-created.png', fullPage: true });
    
    console.log('2️⃣ Looking for mobile menu button...');
    
    // Look for the hamburger menu button (should be visible on mobile)
    const mobileMenuButton = page.locator('button[title="Open file tree"]');
    const menuButtonVisible = await mobileMenuButton.isVisible();
    console.log(`   Mobile menu button visible: ${menuButtonVisible}`);
    
    if (menuButtonVisible) {
      console.log('3️⃣ Opening mobile file tree via hamburger menu...');
      
      await mobileMenuButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'tests/screenshots/mobile-access-step3-menu-opened.png', fullPage: true });
      
      // Now check if file tree is visible in the sheet
      const docsFolder = page.locator('[data-testid="file-tree-item-docs"]');
      const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
      
      const docsFolderVisible = await docsFolder.isVisible();
      const notesFolderVisible = await notesFolder.isVisible();
      
      console.log(`   docs folder visible in mobile sheet: ${docsFolderVisible}`);
      console.log(`   notes folder visible in mobile sheet: ${notesFolderVisible}`);
      
      if (docsFolderVisible) {
        console.log('4️⃣ Testing mobile 3-dots menu functionality...');
        
        // Test tapping on docs folder to access 3-dots menu
        await docsFolder.tap();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'tests/screenshots/mobile-access-step4-docs-tapped.png', fullPage: true });
        
        // Look for the 3-dots button in mobile
        const docsMoreButton = docsFolder.locator('button').last();
        const moreButtonVisible = await docsMoreButton.isVisible();
        console.log(`   3-dots button visible on mobile: ${moreButtonVisible}`);
        
        if (moreButtonVisible) {
          console.log('5️⃣ Opening 3-dots dropdown on mobile...');
          
          await docsMoreButton.tap();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ path: 'tests/screenshots/mobile-access-step5-dropdown-open.png', fullPage: true });
          
          // Check for toggle options
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
          
          console.log('   Mobile dropdown options:');
          console.log(`     Collapse: ${hasCollapse}`);
          console.log(`     Expand: ${hasExpand}`);
          console.log(`     Rename: ${hasRename}`);
          console.log(`     Delete: ${hasDelete}`);
          console.log(`     New File: ${hasNewFile}`);
          console.log(`     New Folder: ${hasNewFolder}`);
          
          if (hasCollapse) {
            console.log('6️⃣ Testing COLLAPSE on mobile...');
            
            // Check which files are visible before collapse
            const archFile = page.locator('[data-testid*="architecture.md"]');
            const apiFile = page.locator('[data-testid*="api.md"]');
            const archBefore = await archFile.isVisible();
            const apiBefore = await apiFile.isVisible();
            console.log(`     Files before collapse - architecture.md: ${archBefore}, api.md: ${apiBefore}`);
            
            await collapseBtn.tap();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ path: 'tests/screenshots/mobile-access-step6-after-collapse.png', fullPage: true });
            
            // Check files after collapse
            const archAfter = await archFile.isVisible();
            const apiAfter = await apiFile.isVisible();
            console.log(`     Files after collapse - architecture.md: ${archAfter}, api.md: ${apiAfter}`);
            
            if (!archAfter && !apiAfter && (archBefore || apiBefore)) {
              console.log('     ✅ MOBILE COLLAPSE SUCCESSFUL!');
              
              console.log('7️⃣ Testing EXPAND on mobile...');
              
              // Re-open the dropdown to test expand
              await docsFolder.tap();
              await page.waitForTimeout(500);
              const docsMoreButton2 = docsFolder.locator('button').last();
              await docsMoreButton2.tap();
              await page.waitForTimeout(500);
              
              await page.screenshot({ path: 'tests/screenshots/mobile-access-step7-expand-menu.png', fullPage: true });
              
              const expandBtn2 = page.locator('button:has-text("Expand")');
              if (await expandBtn2.isVisible()) {
                await expandBtn2.tap();
                await page.waitForTimeout(2000);
                
                await page.screenshot({ path: 'tests/screenshots/mobile-access-step8-after-expand.png', fullPage: true });
                
                const archExpanded = await archFile.isVisible();
                const apiExpanded = await apiFile.isVisible();
                console.log(`     Files after expand - architecture.md: ${archExpanded}, api.md: ${apiExpanded}`);
                
                if (archExpanded || apiExpanded) {
                  console.log('     ✅ MOBILE EXPAND SUCCESSFUL!');
                } else {
                  console.log('     ❌ Mobile expand failed');
                }
              }
            } else {
              console.log('     ❌ Mobile collapse failed');
            }
          } else if (hasExpand) {
            console.log('6️⃣ Testing EXPAND on mobile (folder starts collapsed)...');
            
            await expandBtn.tap();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ path: 'tests/screenshots/mobile-access-step6-after-expand.png', fullPage: true });
          }
          
          console.log('8️⃣ Testing notes folder on mobile...');
          
          // Close current dropdown first
          await page.tap('body');
          await page.waitForTimeout(500);
          
          const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
          if (await notesFolder.isVisible()) {
            await notesFolder.tap();
            await page.waitForTimeout(500);
            
            const notesMoreBtn = notesFolder.locator('button').last();
            if (await notesMoreBtn.isVisible()) {
              await notesMoreBtn.tap();
              await page.waitForTimeout(500);
              
              await page.screenshot({ path: 'tests/screenshots/mobile-access-step9-notes-dropdown.png', fullPage: true });
              
              const notesCollapseBtn = page.locator('button:has-text("Collapse")');
              if (await notesCollapseBtn.isVisible()) {
                await notesCollapseBtn.tap();
                await page.waitForTimeout(2000);
                
                await page.screenshot({ path: 'tests/screenshots/mobile-access-step10-notes-collapsed.png', fullPage: true });
              }
            }
          }
        } else {
          console.log('   ❌ 3-dots button not visible on mobile');
        }
      } else {
        console.log('   ❌ File tree not visible in mobile sheet');
      }
      
      // Final screenshot
      await page.screenshot({ path: 'tests/screenshots/mobile-access-step11-final.png', fullPage: true });
      
    } else {
      console.log('   ❌ Mobile menu button not found');
      
      // Look for alternative mobile navigation
      const menuIcon = page.locator('button:has([data-lucide="menu"])');
      const hamburgerBtn = page.locator('button').filter({ hasText: '☰' });
      
      const menuIconVisible = await menuIcon.isVisible();
      const hamburgerVisible = await hamburgerBtn.isVisible();
      
      console.log(`   Menu icon button visible: ${menuIconVisible}`);
      console.log(`   Hamburger button visible: ${hamburgerVisible}`);
    }
    
    console.log('\n✅ MOBILE FILE TREE ACCESS TEST COMPLETED');
    console.log('📱 Check screenshots to verify mobile functionality');

  } catch (error) {
    console.log('❌ Mobile access test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/mobile-access-error.png', fullPage: true });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Mobile access test screenshots saved to tests/screenshots/mobile-access-step*.png');

})();