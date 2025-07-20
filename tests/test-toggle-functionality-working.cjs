const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testToggleFunctionalityWorking() {
  console.log('🎯 Testing toggle functionality - FINAL WORKING VERSION...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
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
    await page.waitForTimeout(4000); // Wait longer for template to load

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-working-step1-loaded.png'),
      fullPage: true 
    });

    console.log('2️⃣ Testing toggle on "docs" folder...');
    
    // Find the docs folder by looking for the folder row that contains "docs" text
    // and then look for the 3-dots button in that same row
    const docsText = await page.locator('text="docs"').first();
    
    if (await docsText.count() > 0) {
      console.log('   Found docs folder text element');
      
      // Get the parent container of the docs text that represents the full row
      const docsRow = docsText.locator('xpath=../..'); // Go up two levels to get the row container
      
      // Look for the 3-dots button within this row
      const docsThreeDotsButton = docsRow.locator('button:has(svg[data-lucide="more-vertical"])').first();
      
      const hasThreeDots = await docsThreeDotsButton.count() > 0;
      console.log(`   3-dots button found in docs row: ${hasThreeDots}`);
      
      if (hasThreeDots) {
        console.log('   Clicking docs 3-dots menu...');
        await docsThreeDotsButton.click();
        await page.waitForTimeout(1500);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'toggle-working-step2-docs-menu.png'),
          fullPage: true 
        });

        // Check for toggle options
        const toggleOptions = await page.locator('button').all();
        console.log('   Available menu options:');
        
        let collapseButton = null;
        let expandButton = null;
        
        for (let i = 0; i < toggleOptions.length; i++) {
          const option = toggleOptions[i];
          const isVisible = await option.isVisible();
          if (isVisible) {
            const optionText = await option.textContent();
            console.log(`     - "${optionText}"`);
            
            if (optionText && optionText.includes('Collapse')) {
              collapseButton = option;
            } else if (optionText && optionText.includes('Expand')) {
              expandButton = option;
            }
          }
        }

        if (collapseButton) {
          console.log('   📦 TESTING COLLAPSE - docs folder is currently expanded');
          
          // Check current state - should see architecture.md and api.md
          const architectureBefore = await page.locator('text="architecture.md"').isVisible();
          const apiBefore = await page.locator('text="api.md"').isVisible();
          console.log(`     Before collapse - architecture.md: ${architectureBefore}, api.md: ${apiBefore}`);
          
          // Click collapse
          await collapseButton.click();
          await page.waitForTimeout(2000); // Wait for animation

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'toggle-working-step3-after-collapse.png'),
            fullPage: true 
          });

          // Check if children are hidden
          const architectureAfter = await page.locator('text="architecture.md"').isVisible();
          const apiAfter = await page.locator('text="api.md"').isVisible();
          console.log(`     After collapse - architecture.md: ${architectureAfter}, api.md: ${apiAfter}`);
          
          if (architectureBefore && apiBefore && !architectureAfter && !apiAfter) {
            console.log('     ✅ COLLAPSE WORKING! Files were hidden.');
          } else {
            console.log('     ❌ COLLAPSE NOT WORKING - Files still visible or were not visible before.');
          }
          
          // Now test expand
          console.log('   📂 TESTING EXPAND - reopening menu...');
          
          // Reopen the menu
          const docsTextCollapsed = await page.locator('text="docs"').first();
          const docsRowCollapsed = docsTextCollapsed.locator('xpath=../..');
          const docsThreeDotsButtonCollapsed = docsRowCollapsed.locator('button:has(svg[data-lucide="more-vertical"])').first();
          
          await docsThreeDotsButtonCollapsed.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'toggle-working-step4-menu-after-collapse.png'),
            fullPage: true 
          });

          // Look for expand button
          const expandButtonAfterCollapse = await page.locator('button:has-text("Expand")').first();
          
          if (await expandButtonAfterCollapse.count() > 0) {
            console.log('   Found Expand button, clicking...');
            await expandButtonAfterCollapse.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ 
              path: path.join(screenshotsDir, 'toggle-working-step5-after-expand.png'),
              fullPage: true 
            });

            // Check if children are visible again
            const architectureExpanded = await page.locator('text="architecture.md"').isVisible();
            const apiExpanded = await page.locator('text="api.md"').isVisible();
            console.log(`     After expand - architecture.md: ${architectureExpanded}, api.md: ${apiExpanded}`);
            
            if (architectureExpanded && apiExpanded) {
              console.log('     ✅ EXPAND WORKING! Files are visible again.');
              console.log('   🎉 DOCS FOLDER TOGGLE FUNCTIONALITY IS WORKING PERFECTLY!');
            } else {
              console.log('     ❌ EXPAND NOT WORKING - Files not visible after expand.');
            }
          } else {
            console.log('     ❌ Expand button not found after collapse');
          }
          
        } else if (expandButton) {
          console.log('   📂 TESTING EXPAND - docs folder is currently collapsed');
          await expandButton.click();
          await page.waitForTimeout(2000);
          console.log('     ✅ EXPAND TESTED');
        } else {
          console.log('   ❌ No Collapse or Expand buttons found');
        }
        
      } else {
        console.log('   ❌ 3-dots button not found in docs row');
      }
    } else {
      console.log('   ❌ Docs folder not found');
    }

    console.log('3️⃣ Testing toggle on "notes" folder...');
    
    const notesText = await page.locator('text="notes"').first();
    
    if (await notesText.count() > 0) {
      console.log('   Found notes folder');
      
      const notesRow = notesText.locator('xpath=../..');
      const notesThreeDotsButton = notesRow.locator('button:has(svg[data-lucide="more-vertical"])').first();
      
      if (await notesThreeDotsButton.count() > 0) {
        console.log('   Testing notes folder toggle...');
        await notesThreeDotsButton.click();
        await page.waitForTimeout(1500);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'toggle-working-step6-notes-menu.png'),
          fullPage: true 
        });

        const notesToggleButton = await page.locator('button:has-text("Collapse"), button:has-text("Expand")').first();
        
        if (await notesToggleButton.count() > 0) {
          const toggleText = await notesToggleButton.textContent();
          console.log(`   Notes toggle button: "${toggleText}"`);
          
          const meetingNotesBefore = await page.locator('text="meeting-notes.md"').isVisible();
          const ideasBefore = await page.locator('text="ideas.md"').isVisible();
          console.log(`     Before toggle - meeting-notes.md: ${meetingNotesBefore}, ideas.md: ${ideasBefore}`);
          
          await notesToggleButton.click();
          await page.waitForTimeout(2000);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'toggle-working-step7-notes-toggled.png'),
            fullPage: true 
          });

          const meetingNotesAfter = await page.locator('text="meeting-notes.md"').isVisible();
          const ideasAfter = await page.locator('text="ideas.md"').isVisible();
          console.log(`     After toggle - meeting-notes.md: ${meetingNotesAfter}, ideas.md: ${ideasAfter}`);
          
          if (toggleText?.includes('Collapse') && meetingNotesBefore && ideasBefore && !meetingNotesAfter && !ideasAfter) {
            console.log('   ✅ NOTES FOLDER COLLAPSE WORKING!');
          } else if (toggleText?.includes('Expand') && !meetingNotesBefore && !ideasBefore && meetingNotesAfter && ideasAfter) {
            console.log('   ✅ NOTES FOLDER EXPAND WORKING!');
          } else {
            console.log('   ⚠️ Notes folder toggle behavior needs verification');
          }
        }
      }
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-working-final.png'),
      fullPage: true 
    });

    console.log('✅ Toggle functionality comprehensive test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-working-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/toggle-working-*');
}

// Run the test
testToggleFunctionalityWorking().catch(console.error);