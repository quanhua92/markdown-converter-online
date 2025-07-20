const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('📱 MOBILE NESTED FOLDER COLLAPSE TEST');
  console.log('Testing: Expand all → Collapse to 1 level → Expand again → Final collapse');

  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 } // iPhone 12 Pro
  });
  const page = await context.newPage();

  // Listen for toggle operations
  page.on('console', msg => {
    if (msg.type() === 'log' && (msg.text().includes('🔧 toggleFolder') || msg.text().includes('handleMenuAction'))) {
      console.log(`📱 MOBILE TOGGLE: ${msg.text()}`);
    }
  });

  try {
    console.log('\n1️⃣ Setting up mobile workspace...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Create Project Notes workspace
    const projectTemplate = page.locator('[data-testid="quick-template-project-notes"]');
    await projectTemplate.click();
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'tests/screenshots/mobile-nested-step1-workspace.png', fullPage: true });
    
    console.log('2️⃣ Opening mobile file tree...');
    
    const mobileMenuButton = page.locator('button[title="Open file tree"]');
    await mobileMenuButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/screenshots/mobile-nested-step2-tree-opened.png', fullPage: true });
    
    console.log('3️⃣ INITIAL STATE: Verifying expanded folders...');
    
    // Target mobile sheet specifically to avoid duplicates
    const mobileSheet = page.locator('[role="dialog"]');
    // Get folder items by their test ID spans and check visibility
    const docsSpan = mobileSheet.locator('[data-testid="file-tree-item-docs"]');
    const notesSpan = mobileSheet.locator('[data-testid="file-tree-item-notes"]');
    const archFile = mobileSheet.locator('[data-testid*="architecture.md"]');
    const ideasFile = mobileSheet.locator('[data-testid*="ideas.md"]');
    
    const docsVisible = await docsSpan.isVisible();
    const notesVisible = await notesSpan.isVisible();
    const archVisible = await archFile.isVisible();
    const ideasVisible = await ideasFile.isVisible();
    
    console.log(`   docs folder: ${docsVisible}`);
    console.log(`   notes folder: ${notesVisible}`);
    console.log(`   architecture.md: ${archVisible}`);
    console.log(`   ideas.md: ${ideasVisible}`);
    
    if (docsVisible && notesVisible && archVisible && ideasVisible) {
      console.log('   ✅ All folders and files visible - good starting state');
      
      console.log('4️⃣ STEP 1: Collapsing docs folder...');
      
      // Find and tap 3-dots menu directly (go to parent div and find the button with MoreVertical)
      const docsParent = docsSpan.locator('..');
      const docsMoreBtn = docsParent.locator('button[title="More actions"]');
      await docsMoreBtn.tap();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'tests/screenshots/mobile-nested-step3-docs-dropdown.png', fullPage: true });
      
      // Tap collapse
      const collapseBtn = page.locator('button:has-text("Collapse")');
      if (await collapseBtn.isVisible()) {
        await collapseBtn.tap();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'tests/screenshots/mobile-nested-step4-docs-collapsed.png', fullPage: true });
        
        // Verify docs files are hidden
        const archAfterCollapse = await archFile.isVisible();
        const apiAfterCollapse = await mobileSheet.locator('[data-testid*="api.md"]').isVisible();
        console.log(`   After docs collapse - architecture.md: ${archAfterCollapse}, api.md: ${apiAfterCollapse}`);
        
        if (!archAfterCollapse && !apiAfterCollapse) {
          console.log('   ✅ Docs folder collapsed successfully');
          
          console.log('5️⃣ STEP 2: Collapsing notes folder...');
          
          // Collapse notes folder
          const notesParent = notesSpan.locator('..');
          const notesMoreBtn = notesParent.locator('button[title="More actions"]');
          await notesMoreBtn.tap();
          await page.waitForTimeout(1000);
          
          const notesCollapseBtn = page.locator('button:has-text("Collapse")');
          if (await notesCollapseBtn.isVisible()) {
            await notesCollapseBtn.tap();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ path: 'tests/screenshots/mobile-nested-step5-all-collapsed.png', fullPage: true });
            
            // Verify notes files are hidden
            const ideasAfterCollapse = await ideasFile.isVisible();
            const meetingAfterCollapse = await mobileSheet.locator('[data-testid*="meeting-notes.md"]').isVisible();
            console.log(`   After notes collapse - ideas.md: ${ideasAfterCollapse}, meeting-notes.md: ${meetingAfterCollapse}`);
            
            if (!ideasAfterCollapse && !meetingAfterCollapse) {
              console.log('   ✅ Notes folder collapsed successfully');
              console.log('   🎯 ACHIEVED: Single level with both folders collapsed');
              
              console.log('6️⃣ STEP 3: Re-expanding docs folder...');
              
              // Re-expand docs
              const docsMoreBtn2 = docsParent.locator('button[title="More actions"]');
              await docsMoreBtn2.tap();
              await page.waitForTimeout(1000);
              
              const expandBtn = page.locator('button:has-text("Expand")');
              if (await expandBtn.isVisible()) {
                await expandBtn.tap();
                await page.waitForTimeout(2000);
                
                await page.screenshot({ path: 'tests/screenshots/mobile-nested-step6-docs-expanded.png', fullPage: true });
                
                const archReExpanded = await archFile.isVisible();
                console.log(`   After docs re-expand - architecture.md: ${archReExpanded}`);
                
                if (archReExpanded) {
                  console.log('   ✅ Docs folder re-expanded successfully');
                  
                  console.log('7️⃣ STEP 4: Re-expanding notes folder...');
                  
                  // Re-expand notes
                  const notesMoreBtn2 = notesParent.locator('button[title="More actions"]');
                  await notesMoreBtn2.tap();
                  await page.waitForTimeout(1000);
                  
                  const expandBtn2 = page.locator('button:has-text("Expand")');
                  if (await expandBtn2.isVisible()) {
                    await expandBtn2.tap();
                    await page.waitForTimeout(2000);
                    
                    await page.screenshot({ path: 'tests/screenshots/mobile-nested-step7-all-expanded.png', fullPage: true });
                    
                    const ideasReExpanded = await ideasFile.isVisible();
                    console.log(`   After notes re-expand - ideas.md: ${ideasReExpanded}`);
                    
                    if (ideasReExpanded) {
                      console.log('   ✅ Notes folder re-expanded successfully');
                      console.log('   🎯 ACHIEVED: All folders re-expanded');
                      
                      console.log('8️⃣ STEP 5: Final collapse to single level...');
                      
                      // Final collapse of both folders
                      const docsMoreBtn3 = docsParent.locator('button[title="More actions"]');
                      await docsMoreBtn3.tap();
                      await page.waitForTimeout(500);
                      const finalCollapseBtn1 = page.locator('button:has-text("Collapse")');
                      if (await finalCollapseBtn1.isVisible()) {
                        await finalCollapseBtn1.tap();
                        await page.waitForTimeout(2000);
                      }
                      
                      const notesMoreBtn3 = notesParent.locator('button[title="More actions"]');
                      await notesMoreBtn3.tap();
                      await page.waitForTimeout(500);
                      const finalCollapseBtn2 = page.locator('button:has-text("Collapse")');
                      if (await finalCollapseBtn2.isVisible()) {
                        await finalCollapseBtn2.tap();
                        await page.waitForTimeout(2000);
                      }
                      
                      await page.screenshot({ path: 'tests/screenshots/mobile-nested-step8-final-collapsed.png', fullPage: true });
                      
                      // Final verification
                      const finalArchHidden = !(await archFile.isVisible());
                      const finalIdeasHidden = !(await ideasFile.isVisible());
                      const docsFolderStillVisible = await docsSpan.isVisible();
                      const notesFolderStillVisible = await notesSpan.isVisible();
                      
                      console.log('\n🎉 MOBILE NESTED FOLDER TEST RESULTS:');
                      console.log(`   docs folder visible: ${docsFolderStillVisible}`);
                      console.log(`   notes folder visible: ${notesFolderStillVisible}`);
                      console.log(`   architecture.md hidden: ${finalArchHidden}`);
                      console.log(`   ideas.md hidden: ${finalIdeasHidden}`);
                      
                      if (docsFolderStillVisible && notesFolderStillVisible && finalArchHidden && finalIdeasHidden) {
                        console.log('\n✅ COMPLETE SUCCESS! Mobile nested folder functionality works perfectly:');
                        console.log('   ✅ Started with expanded folders');
                        console.log('   ✅ Collapsed to single level (folders visible, contents hidden)');
                        console.log('   ✅ Re-expanded all folders');
                        console.log('   ✅ Final collapse to single level');
                        console.log('\n🎯 MOBILE UX IS FULLY FUNCTIONAL with 3-dots menus!');
                      } else {
                        console.log('\n❌ Test failed at final verification');
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      console.log('   ❌ Initial state not correct');
    }

  } catch (error) {
    console.log('❌ Mobile nested test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/mobile-nested-error.png', fullPage: true });
  }

  await page.close();
  await context.close();
  await browser.close();

  console.log('\n📁 Mobile nested test screenshots saved to tests/screenshots/mobile-nested-step*.png');

})();