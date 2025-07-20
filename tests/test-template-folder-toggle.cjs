const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testTemplateFolderToggle() {
  console.log('📋 Testing folder toggle using workspace templates...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log('1️⃣ Setting up workspace with template (templates have folders)...');
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

    console.log('2️⃣ Creating workspace from Project template...');
    
    // Click on "Initialize from Template" card
    const templateCard = await page.locator('text="Initialize from Template"').locator('..').first();
    await templateCard.click();
    await page.waitForTimeout(1000);
    
    // Click on "Project" template button
    const projectButton = await page.locator('button:has-text("Project")').first();
    await projectButton.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'template-toggle-step1-project-template.png'),
      fullPage: true 
    });

    console.log('3️⃣ Looking for folders in the project template...');
    
    // Wait a bit more for the template to fully load
    await page.waitForTimeout(2000);
    
    // Take another screenshot to see the full file tree
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'template-toggle-step2-full-tree.png'),
      fullPage: true 
    });
    
    // Look for any folders in the file tree
    const allFileTreeItems = await page.locator('[data-testid*="file-tree-item"]').all();
    console.log(`   Found ${allFileTreeItems.length} file tree items`);
    
    let folderFound = false;
    let folderName = '';
    
    for (let i = 0; i < allFileTreeItems.length; i++) {
      const item = allFileTreeItems[i];
      const itemText = await item.textContent();
      
      // Look for this item's row and check if it has a folder icon or different styling
      const itemRow = await item.locator('..').first();
      const hasChevron = await itemRow.locator('svg[data-lucide="chevron-right"], svg[data-lucide="chevron-down"]').count() > 0;
      const hasFolderIcon = await itemRow.locator('svg[data-lucide="folder"], svg[data-lucide="folder-open"]').count() > 0;
      
      console.log(`     Item: "${itemText}" - HasChevron: ${hasChevron}, HasFolderIcon: ${hasFolderIcon}`);
      
      if (hasChevron || hasFolderIcon) {
        folderFound = true;
        folderName = itemText || '';
        console.log(`   ✅ Found folder: "${folderName}"`);
        break;
      }
    }

    if (folderFound && folderName) {
      console.log(`4️⃣ Testing toggle functionality on folder: "${folderName}"`);
      
      // Find the folder row and its 3-dots menu
      const folderItem = await page.locator(`[data-testid="file-tree-item-${folderName}"]`).first();
      const folderRow = await folderItem.locator('..').first();
      const menuButton = await folderRow.locator('button:has(svg[data-lucide="more-vertical"])').first();
      
      if (await menuButton.count() > 0) {
        console.log(`   Found 3-dots menu for "${folderName}", opening menu...`);
        await menuButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'template-toggle-step3-folder-menu.png'),
          fullPage: true 
        });

        // Look for toggle options
        const toggleOptions = await page.locator('button:has-text("Toggle"), button:has-text("Expand"), button:has-text("Collapse")').all();
        console.log(`   Found ${toggleOptions.length} toggle-related options`);

        for (let i = 0; i < toggleOptions.length; i++) {
          const option = toggleOptions[i];
          const optionText = await option.textContent();
          console.log(`     Option ${i + 1}: "${optionText}"`);
        }

        if (toggleOptions.length > 0) {
          console.log('   Testing toggle functionality...');
          const firstToggle = toggleOptions[0];
          const initialText = await firstToggle.textContent();
          
          console.log(`   Clicking "${initialText}" button...`);
          await firstToggle.click();
          await page.waitForTimeout(1500); // Wait a bit longer for toggle to take effect

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'template-toggle-step4-after-toggle.png'),
            fullPage: true 
          });

          // Check if folder state changed by looking for children visibility changes
          console.log('   Checking if folder children visibility changed...');
          
          // Reopen the menu to see if the toggle button text changed
          await page.waitForTimeout(1000);
          const folderRowUpdated = await page.locator(`[data-testid="file-tree-item-${folderName}"]`).locator('..').first();
          const menuButtonUpdated = await folderRowUpdated.locator('button:has(svg[data-lucide="more-vertical"])').first();
          
          await menuButtonUpdated.click();
          await page.waitForTimeout(1000);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'template-toggle-step5-menu-after-toggle.png'),
            fullPage: true 
          });

          const toggleOptionsUpdated = await page.locator('button:has-text("Toggle"), button:has-text("Expand"), button:has-text("Collapse")').all();
          
          if (toggleOptionsUpdated.length > 0) {
            const newText = await toggleOptionsUpdated[0].textContent();
            console.log(`   Toggle button text changed: "${initialText}" → "${newText}"`);
            
            if (initialText !== newText) {
              console.log('   ✅ Toggle functionality is working - button text changed!');
            } else {
              console.log('   ❌ Toggle functionality may not be working - button text unchanged');
            }
          }

          // Test clicking the toggle again to see full cycle
          console.log('   Testing toggle cycle by clicking again...');
          if (toggleOptionsUpdated.length > 0) {
            await toggleOptionsUpdated[0].click();
            await page.waitForTimeout(1500);

            await page.screenshot({ 
              path: path.join(screenshotsDir, 'template-toggle-step6-second-toggle.png'),
              fullPage: true 
            });
          }

        } else {
          console.log('   ❌ No toggle options found in folder menu');
          
          // Debug: Check what options ARE available
          const allMenuOptions = await page.locator('button').all();
          console.log('   Available menu options:');
          for (let i = 0; i < Math.min(allMenuOptions.length, 10); i++) {
            const option = allMenuOptions[i];
            const isVisible = await option.isVisible();
            if (isVisible) {
              const optionText = await option.textContent();
              console.log(`     - "${optionText}"`);
            }
          }
        }
      } else {
        console.log(`   ❌ No 3-dots menu found for folder "${folderName}"`);
      }
    } else {
      console.log('   ❌ No folders found in the template');
      
      // Debug: Show all available items
      console.log('   Available file tree items:');
      for (let i = 0; i < Math.min(allFileTreeItems.length, 10); i++) {
        const item = allFileTreeItems[i];
        const itemText = await item.textContent();
        console.log(`     - "${itemText}"`);
      }
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'template-toggle-final.png'),
      fullPage: true 
    });

    console.log('✅ Template folder toggle test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'template-toggle-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/template-toggle-*');
}

// Run the test
testTemplateFolderToggle().catch(console.error);