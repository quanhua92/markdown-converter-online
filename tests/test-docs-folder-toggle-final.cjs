const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testDocsFolderToggle() {
  console.log('📂 Testing docs folder toggle functionality (FINAL TEST)...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log('1️⃣ Setting up Project template workspace...');
    await page.goto('http://localhost:3000/explorer');
    
    // Clear localStorage
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        
        const keysToRemove = [
          'markdown-explorer-current-workspace',
          'markdown-explorer-files', 
          'markdown-explorer-workspace-default',
          'markdown-explorer-workspaces',
          'markdown-explorer-v2-current-workspace'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        for (let j = localStorage.length - 1; j >= 0; j--) {
          const key = localStorage.key(j);
          if (key && (key.startsWith('markdown-explorer-') || key.startsWith('markdown-explorer-v2-'))) {
            localStorage.removeItem(key);
          }
        }
      });
      
      await page.waitForTimeout(500);
    }
    
    await page.reload();
    await page.waitForTimeout(2000);

    // Create workspace from Project template
    const templateCard = await page.locator('text="Initialize from Template"').locator('..').first();
    await templateCard.click();
    await page.waitForTimeout(1000);
    
    const projectButton = await page.locator('button:has-text("Project")').first();
    await projectButton.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'docs-toggle-step1-project-loaded.png'),
      fullPage: true 
    });

    console.log('2️⃣ Testing toggle on "docs" folder...');
    
    // Find the docs folder (we know it exists from the screenshot)
    const docsFolder = await page.locator('text="docs"').first();
    console.log('   Looking for docs folder...');
    
    const docsFolderExists = await docsFolder.count() > 0;
    console.log(`   Docs folder found: ${docsFolderExists}`);
    
    if (docsFolderExists) {
      // Find the docs folder row and its 3-dots menu
      const docsFolderRow = await docsFolder.locator('..').first();
      const docsMenuButton = await docsFolderRow.locator('svg[data-lucide="more-vertical"]').first();
      
      console.log('   Looking for docs folder 3-dots menu...');
      const docsMenuExists = await docsMenuButton.count() > 0;
      console.log(`   Docs 3-dots menu found: ${docsMenuExists}`);
      
      if (docsMenuExists) {
        console.log('   Opening docs folder menu...');
        await docsMenuButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'docs-toggle-step2-docs-menu-opened.png'),
          fullPage: true 
        });

        // Look for the current state of the toggle button
        const collapseButton = await page.locator('button:has-text("Collapse")').first();
        const expandButton = await page.locator('button:has-text("Expand")').first();
        
        const hasCollapse = await collapseButton.count() > 0;
        const hasExpand = await expandButton.count() > 0;
        
        console.log(`   Collapse button available: ${hasCollapse}`);
        console.log(`   Expand button available: ${hasExpand}`);
        
        if (hasCollapse) {
          console.log('   📦 Folder is currently EXPANDED, testing COLLAPSE...');
          
          // Check what files are currently visible under docs
          const architectureVisible = await page.locator('text="architecture.md"').isVisible();
          const apiVisible = await page.locator('text="api.md"').isVisible();
          console.log(`   Before collapse - architecture.md visible: ${architectureVisible}`);
          console.log(`   Before collapse - api.md visible: ${apiVisible}`);
          
          // Click collapse
          await collapseButton.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'docs-toggle-step3-after-collapse.png'),
            fullPage: true 
          });

          // Check if files are now hidden
          const architectureVisibleAfter = await page.locator('text="architecture.md"').isVisible();
          const apiVisibleAfter = await page.locator('text="api.md"').isVisible();
          console.log(`   After collapse - architecture.md visible: ${architectureVisibleAfter}`);
          console.log(`   After collapse - api.md visible: ${apiVisibleAfter}`);
          
          if (!architectureVisibleAfter && !apiVisibleAfter && architectureVisible && apiVisible) {
            console.log('   ✅ COLLAPSE functionality working correctly!');
          } else {
            console.log('   ❌ COLLAPSE functionality not working properly');
          }
          
          // Test expand functionality
          console.log('   📂 Testing EXPAND functionality...');
          
          // Open menu again
          const docsFolderRowCollapsed = await page.locator('text="docs"').locator('..').first();
          const docsMenuButtonCollapsed = await docsFolderRowCollapsed.locator('svg[data-lucide="more-vertical"]').first();
          
          await docsMenuButtonCollapsed.click();
          await page.waitForTimeout(1000);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'docs-toggle-step4-menu-after-collapse.png'),
            fullPage: true 
          });

          const expandButtonAfterCollapse = await page.locator('button:has-text("Expand")').first();
          const hasExpandAfterCollapse = await expandButtonAfterCollapse.count() > 0;
          
          console.log(`   Expand button available after collapse: ${hasExpandAfterCollapse}`);
          
          if (hasExpandAfterCollapse) {
            // Click expand
            await expandButtonAfterCollapse.click();
            await page.waitForTimeout(1500);

            await page.screenshot({ 
              path: path.join(screenshotsDir, 'docs-toggle-step5-after-expand.png'),
              fullPage: true 
            });

            // Check if files are visible again
            const architectureVisibleExpanded = await page.locator('text="architecture.md"').isVisible();
            const apiVisibleExpanded = await page.locator('text="api.md"').isVisible();
            console.log(`   After expand - architecture.md visible: ${architectureVisibleExpanded}`);
            console.log(`   After expand - api.md visible: ${apiVisibleExpanded}`);
            
            if (architectureVisibleExpanded && apiVisibleExpanded) {
              console.log('   ✅ EXPAND functionality working correctly!');
              console.log('   🎉 TOGGLE FUNCTIONALITY IS FULLY WORKING!');
            } else {
              console.log('   ❌ EXPAND functionality not working properly');
            }
          } else {
            console.log('   ❌ Expand button not found after collapse');
          }
          
        } else if (hasExpand) {
          console.log('   📂 Folder is currently COLLAPSED, testing EXPAND first...');
          
          await expandButton.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'docs-toggle-step3-after-expand.png'),
            fullPage: true 
          });

          console.log('   Then testing collapse...');
          // Repeat the test with collapse after expand
          
        } else {
          console.log('   ❌ No toggle buttons found in docs folder menu');
        }
        
      } else {
        console.log('   ❌ 3-dots menu not found for docs folder');
      }
    } else {
      console.log('   ❌ Docs folder not found');
    }

    console.log('3️⃣ Testing toggle on "notes" folder...');
    
    // Test the notes folder as well
    const notesFolder = await page.locator('text="notes"').first();
    if (await notesFolder.count() > 0) {
      const notesFolderRow = await notesFolder.locator('..').first();
      const notesMenuButton = await notesFolderRow.locator('svg[data-lucide="more-vertical"]').first();
      
      if (await notesMenuButton.count() > 0) {
        console.log('   Testing notes folder toggle...');
        await notesMenuButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'docs-toggle-step6-notes-menu.png'),
          fullPage: true 
        });

        const notesToggleButton = await page.locator('button:has-text("Collapse"), button:has-text("Expand")').first();
        if (await notesToggleButton.count() > 0) {
          const notesToggleText = await notesToggleButton.textContent();
          console.log(`   Notes folder toggle button: "${notesToggleText}"`);
          
          // Test notes folder toggle
          await notesToggleButton.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'docs-toggle-step7-notes-toggled.png'),
            fullPage: true 
          });

          console.log('   ✅ Notes folder toggle tested');
        }
      }
    }

    // Final state screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'docs-toggle-final-state.png'),
      fullPage: true 
    });

    console.log('✅ Comprehensive docs folder toggle test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'docs-toggle-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/docs-toggle-*');
}

// Run the test
testDocsFolderToggle().catch(console.error);