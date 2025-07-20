const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testSimpleToggleFinal() {
  console.log('🚀 SIMPLE TOGGLE TEST - Direct approach...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
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
    await page.waitForTimeout(4000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'simple-toggle-step1-project-ready.png'),
      fullPage: true 
    });

    console.log('2️⃣ Finding all 3-dots buttons and testing them...');
    
    // Find ALL 3-dots buttons in the file tree
    const allThreeDotsButtons = await page.locator('svg[data-lucide="more-vertical"]').all();
    console.log(`   Found ${allThreeDotsButtons.length} three-dots buttons total`);

    for (let i = 0; i < allThreeDotsButtons.length; i++) {
      const button = allThreeDotsButtons[i];
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        console.log(`   📍 Testing button ${i + 1}...`);
        
        // Get the text of the file/folder this button belongs to
        const buttonRow = button.locator('xpath=../..'); // Go up to find the row
        const rowText = await buttonRow.textContent();
        console.log(`     Row text: "${rowText}"`);
        
        // Only test folders (docs, notes) - skip files  
        if (rowText && (rowText.includes('docs') || rowText.includes('notes')) && !rowText.includes('.md')) {
          console.log(`     🗂️ This is a folder! Testing toggle functionality...`);
          
          // Click the 3-dots button
          await button.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: path.join(screenshotsDir, `simple-toggle-step2-menu-${i + 1}.png`),
            fullPage: true 
          });

          // Look for toggle buttons in the opened menu
          const collapseBtn = await page.locator('button:has-text("Collapse")').first();
          const expandBtn = await page.locator('button:has-text("Expand")').first();
          
          const hasCollapse = await collapseBtn.count() > 0;
          const hasExpand = await expandBtn.count() > 0;
          
          console.log(`     Collapse available: ${hasCollapse}, Expand available: ${hasExpand}`);
          
          if (hasCollapse) {
            console.log(`     📦 Testing COLLAPSE for folder in row: "${rowText}"`);
            
            // Before collapse - check children visibility
            const childrenBeforeCollapse = await page.locator('text=".md"').all();
            const visibleChildrenBefore = [];
            for (const child of childrenBeforeCollapse) {
              if (await child.isVisible()) {
                const childText = await child.textContent();
                visibleChildrenBefore.push(childText);
              }
            }
            console.log(`       Visible children before collapse: ${visibleChildrenBefore.length} files`);
            
            // Click collapse
            await collapseBtn.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ 
              path: path.join(screenshotsDir, `simple-toggle-step3-after-collapse-${i + 1}.png`),
              fullPage: true 
            });

            // After collapse - check children visibility
            const childrenAfterCollapse = await page.locator('text=".md"').all();
            const visibleChildrenAfter = [];
            for (const child of childrenAfterCollapse) {
              if (await child.isVisible()) {
                const childText = await child.textContent();
                visibleChildrenAfter.push(childText);
              }
            }
            console.log(`       Visible children after collapse: ${visibleChildrenAfter.length} files`);
            
            if (visibleChildrenBefore.length > visibleChildrenAfter.length) {
              console.log(`       ✅ COLLAPSE WORKING! Hidden ${visibleChildrenBefore.length - visibleChildrenAfter.length} files`);
            } else {
              console.log(`       ❌ COLLAPSE NOT WORKING - Same number of visible files`);
            }
            
            // Test expand by reopening menu
            console.log(`     📂 Testing EXPAND...`);
            
            // Find the same button again (refresh selector)
            const allButtonsRefresh = await page.locator('svg[data-lucide="more-vertical"]').all();
            const sameButton = allButtonsRefresh[i]; // Same index
            
            await sameButton.click();
            await page.waitForTimeout(1500);

            await page.screenshot({ 
              path: path.join(screenshotsDir, `simple-toggle-step4-expand-menu-${i + 1}.png`),
              fullPage: true 
            });

            const expandBtnAfter = await page.locator('button:has-text("Expand")').first();
            
            if (await expandBtnAfter.count() > 0) {
              console.log(`       Found Expand button, clicking...`);
              await expandBtnAfter.click();
              await page.waitForTimeout(2000);

              await page.screenshot({ 
                path: path.join(screenshotsDir, `simple-toggle-step5-after-expand-${i + 1}.png`),
                fullPage: true 
              });

              // Check children visibility after expand
              const childrenAfterExpand = await page.locator('text=".md"').all();
              const visibleChildrenExpanded = [];
              for (const child of childrenAfterExpand) {
                if (await child.isVisible()) {
                  const childText = await child.textContent();
                  visibleChildrenExpanded.push(childText);
                }
              }
              console.log(`       Visible children after expand: ${visibleChildrenExpanded.length} files`);
              
              if (visibleChildrenExpanded.length >= visibleChildrenBefore.length) {
                console.log(`       ✅ EXPAND WORKING! Restored ${visibleChildrenExpanded.length} files`);
                console.log(`       🎉 TOGGLE FUNCTIONALITY CONFIRMED WORKING FOR THIS FOLDER!`);
              } else {
                console.log(`       ❌ EXPAND NOT WORKING - Files not restored`);
              }
            } else {
              console.log(`       ❌ Expand button not found after collapse`);
            }
            
          } else if (hasExpand) {
            console.log(`     📂 Testing EXPAND for folder in row: "${rowText}"`);
            await expandBtn.click();
            await page.waitForTimeout(2000);
            console.log(`     ✅ EXPAND TESTED`);
          } else {
            console.log(`     ❌ No toggle buttons found for folder`);
          }
          
          // Close any open menus before continuing
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          
        } else {
          console.log(`     📄 This is a file, skipping toggle test`);
        }
      }
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'simple-toggle-final.png'),
      fullPage: true 
    });

    console.log('✅ Simple toggle test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'simple-toggle-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/simple-toggle-*');
}

// Run the test
testSimpleToggleFinal().catch(console.error);