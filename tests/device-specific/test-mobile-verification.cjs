const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('📱 MOBILE VERIFICATION - Real Mobile Testing');
  console.log('Testing 3-dots menu functionality on actual mobile viewport');

  const page = await browser.newPage();
  
  // Set actual mobile viewport (iPhone 12 Pro)
  await page.setViewportSize({ width: 390, height: 844 });
  
  // Set mobile user agent
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  // Listen for console logs to capture toggle operations
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log(`📱 MOBILE LOG: ${msg.text()}`);
    }
  });

  try {
    console.log('\n1️⃣ Loading on mobile viewport...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/mobile-step1-initial-load.png', fullPage: true });
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/mobile-step2-welcome-screen.png', fullPage: true });
    
    console.log('2️⃣ Creating workspace on mobile...');
    
    // Try to create Project Notes workspace
    const projectTemplate = page.locator('[data-testid="quick-template-project-notes"]');
    if (await projectTemplate.isVisible()) {
      console.log('   Found project template button');
      await projectTemplate.click();
      await page.waitForTimeout(4000);
    } else {
      console.log('   Template button not found, checking for alternatives...');
      // Try alternative selectors
      const altTemplate = page.locator('button:has-text("Project Notes")');
      if (await altTemplate.isVisible()) {
        await altTemplate.click();
        await page.waitForTimeout(4000);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/mobile-step3-workspace-created.png', fullPage: true });
    
    console.log('3️⃣ Testing mobile file tree visibility...');
    
    // Check if file tree is visible on mobile
    const fileTree = page.locator('[data-testid="file-tree-item-docs"]');
    const fileTreeVisible = await fileTree.isVisible();
    console.log(`   File tree visible: ${fileTreeVisible}`);
    
    if (!fileTreeVisible) {
      console.log('   File tree not visible, checking if hidden by mobile layout...');
      // Look for mobile menu toggle
      const mobileMenuBtn = page.locator('button[aria-label*="menu"], button:has-text("☰"), [data-testid*="mobile-menu"]');
      if (await mobileMenuBtn.isVisible()) {
        console.log('   Found mobile menu button, clicking...');
        await mobileMenuBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/mobile-step4-file-tree-check.png', fullPage: true });
    
    console.log('4️⃣ Testing 3-dots menu on mobile...');
    
    // Try to interact with docs folder
    const docsFolder = page.locator('[data-testid="file-tree-item-docs"]');
    if (await docsFolder.isVisible()) {
      console.log('   docs folder found, testing touch interaction...');
      
      // On mobile, we need to tap instead of hover
      await docsFolder.tap();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'tests/screenshots/mobile-step5-folder-tapped.png', fullPage: true });
      
      // Look for 3-dots button
      const moreButton = docsFolder.locator('button').last();
      if (await moreButton.isVisible()) {
        console.log('   Found 3-dots button, tapping...');
        await moreButton.tap();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'tests/screenshots/mobile-step6-dropdown-opened.png', fullPage: true });
        
        // Look for toggle options
        const collapseBtn = page.locator('button:has-text("Collapse")');
        const expandBtn = page.locator('button:has-text("Expand")');
        
        const hasCollapse = await collapseBtn.isVisible();
        const hasExpand = await expandBtn.isVisible();
        
        console.log(`   Collapse button visible: ${hasCollapse}`);
        console.log(`   Expand button visible: ${hasExpand}`);
        
        if (hasCollapse) {
          console.log('   Testing collapse on mobile...');
          await collapseBtn.tap();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'tests/screenshots/mobile-step7-after-collapse.png', fullPage: true });
          
          // Test expand again
          await docsFolder.tap();
          await page.waitForTimeout(500);
          const moreButton2 = docsFolder.locator('button').last();
          await moreButton2.tap();
          await page.waitForTimeout(1000);
          
          const expandBtn2 = page.locator('button:has-text("Expand")');
          if (await expandBtn2.isVisible()) {
            console.log('   Testing expand on mobile...');
            await expandBtn2.tap();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ path: 'tests/screenshots/mobile-step8-after-expand.png', fullPage: true });
          }
        } else if (hasExpand) {
          console.log('   Testing expand on mobile...');
          await expandBtn.tap();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'tests/screenshots/mobile-step7-after-expand.png', fullPage: true });
        } else {
          console.log('   No toggle options found in dropdown');
          await page.screenshot({ path: 'tests/screenshots/mobile-step7-no-toggle-options.png', fullPage: true });
        }
      } else {
        console.log('   3-dots button not found');
        await page.screenshot({ path: 'tests/screenshots/mobile-step6-no-more-button.png', fullPage: true });
      }
    } else {
      console.log('   docs folder not found');
      await page.screenshot({ path: 'tests/screenshots/mobile-step5-no-docs-folder.png', fullPage: true });
    }
    
    console.log('5️⃣ Testing notes folder on mobile...');
    
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    if (await notesFolder.isVisible()) {
      console.log('   notes folder found, testing...');
      await notesFolder.tap();
      await page.waitForTimeout(500);
      
      const notesMoreBtn = notesFolder.locator('button').last();
      if (await notesMoreBtn.isVisible()) {
        await notesMoreBtn.tap();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'tests/screenshots/mobile-step9-notes-dropdown.png', fullPage: true });
        
        // Try notes toggle
        const notesCollapseBtn = page.locator('button:has-text("Collapse")');
        if (await notesCollapseBtn.isVisible()) {
          await notesCollapseBtn.tap();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'tests/screenshots/mobile-step10-notes-collapsed.png', fullPage: true });
        }
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/mobile-step11-final-state.png', fullPage: true });
    
    console.log('\n✅ MOBILE TESTING COMPLETED');
    console.log('📱 All mobile interaction screenshots saved');
    console.log('🔍 Check screenshots to verify mobile functionality');

  } catch (error) {
    console.log('❌ Mobile test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/mobile-error.png', fullPage: true });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Mobile test screenshots saved to tests/screenshots/mobile-step*.png');

})();