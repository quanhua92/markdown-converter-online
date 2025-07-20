const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testRealFolderCreation() {
  console.log('📁 Testing real folder creation and toggle functionality...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log('1️⃣ Setting up workspace...');
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

    // Create workspace
    const welcomeCard = page.locator('[data-testid="create-workspace-card"]').first();
    await welcomeCard.waitFor({ state: 'visible', timeout: 10000 });
    await welcomeCard.click();
    await page.waitForTimeout(1000);
    
    const nameInput = await page.locator('[data-testid="workspace-name-input"]');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('Real Folder Test');
    
    const createBtn = await page.locator('[data-testid="create-workspace-btn"]');
    await createBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'real-folder-step1-workspace.png'),
      fullPage: true 
    });

    console.log('2️⃣ Attempting to create folder through 3-dots menu of existing folder...');
    
    // Since we know Welcome.md and Notes.md exist as files, let's see if we can create a folder
    // by using the 3-dots menu of an existing item to create a "New Folder"
    
    console.log('   Looking for any existing 3-dots menu...');
    const welcomeFileRow = await page.locator('text="Welcome.md"').locator('..').first();
    const welcomeMenuButton = await welcomeFileRow.locator('button:has(svg[data-lucide="more-vertical"])').first();
    
    if (await welcomeMenuButton.count() > 0) {
      console.log('   Found 3-dots menu on Welcome.md, checking for folder creation option...');
      await welcomeMenuButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: path.join(screenshotsDir, 'real-folder-step2-menu-opened.png'),
        fullPage: true 
      });

      // Look for "New Folder" option in the menu
      const newFolderOption = await page.locator('button:has-text("New Folder")').first();
      if (await newFolderOption.count() > 0) {
        console.log('   Found "New Folder" option, clicking...');
        await newFolderOption.click();
        await page.waitForTimeout(1000);
        
        // Look for folder name input
        const folderNameInput = await page.locator('input[placeholder*="folder"], input[placeholder*="name"]').first();
        if (await folderNameInput.isVisible()) {
          console.log('   Creating "Projects" folder...');
          await folderNameInput.fill('Projects');
          await folderNameInput.press('Enter');
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'real-folder-step3-projects-created.png'),
            fullPage: true 
          });
        }
      } else {
        console.log('   ❌ "New Folder" option not found in file menu');
        
        // Close the menu and try the folder icon in Files header
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        console.log('   Trying folder icon in Files header...');
        const filesHeader = await page.locator('text="Files"').locator('..').first();
        
        // Look for folder icon (might be the second button after +)
        const folderIcon = await filesHeader.locator('button').nth(1); // Second button might be folder
        if (await folderIcon.count() > 0) {
          console.log('   Found potential folder creation button...');
          await folderIcon.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'real-folder-step3-alt-folder-button.png'),
            fullPage: true 
          });
          
          // Look for folder name input after clicking folder button
          const folderNameInput = await page.locator('input').first();
          if (await folderNameInput.isVisible()) {
            console.log('   Creating "Projects" folder via folder button...');
            await folderNameInput.fill('Projects');
            await folderNameInput.press('Enter');
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
              path: path.join(screenshotsDir, 'real-folder-step3-projects-created-alt.png'),
              fullPage: true 
            });
          }
        }
      }
    }

    console.log('3️⃣ Testing toggle functionality on created folder...');
    
    // Look for the Projects folder
    const projectsFolder = await page.locator('text="Projects"').first();
    if (await projectsFolder.count() > 0) {
      console.log('   Found Projects folder! Testing toggle...');
      
      const projectsFolderRow = await projectsFolder.locator('..').first();
      const projectsMenuButton = await projectsFolderRow.locator('button:has(svg[data-lucide="more-vertical"])').first();
      
      if (await projectsMenuButton.count() > 0) {
        console.log('   Found 3-dots menu on Projects folder...');
        await projectsMenuButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'real-folder-step4-projects-menu.png'),
          fullPage: true 
        });

        // Look for toggle options
        const expandButton = await page.locator('button:has-text("Expand")').first();
        const collapseButton = await page.locator('button:has-text("Collapse")').first();
        const toggleButton = await page.locator('button:has-text("Toggle")').first();
        
        const expandCount = await expandButton.count();
        const collapseCount = await collapseButton.count();
        const toggleCount = await toggleButton.count();
        
        console.log(`     Expand buttons: ${expandCount}`);
        console.log(`     Collapse buttons: ${collapseCount}`);
        console.log(`     Toggle buttons: ${toggleCount}`);
        
        if (expandCount > 0) {
          console.log('   Testing Expand functionality...');
          await expandButton.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'real-folder-step5-after-expand.png'),
            fullPage: true 
          });
        } else if (collapseCount > 0) {
          console.log('   Testing Collapse functionality...');
          await collapseButton.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'real-folder-step5-after-collapse.png'),
            fullPage: true 
          });
        } else if (toggleCount > 0) {
          console.log('   Testing Toggle functionality...');
          await toggleButton.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, 'real-folder-step5-after-toggle.png'),
            fullPage: true 
          });
        } else {
          console.log('   ❌ No toggle-related buttons found');
        }
        
        // Test the toggle state change by reopening menu
        console.log('   Testing toggle state change...');
        await page.waitForTimeout(1000);
        
        const projectsFolderRowUpdated = await page.locator('text="Projects"').locator('..').first();
        const projectsMenuButtonUpdated = await projectsFolderRowUpdated.locator('button:has(svg[data-lucide="more-vertical"])').first();
        
        await projectsMenuButtonUpdated.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'real-folder-step6-toggle-state-check.png'),
          fullPage: true 
        });
        
        const expandButtonUpdated = await page.locator('button:has-text("Expand")').count();
        const collapseButtonUpdated = await page.locator('button:has-text("Collapse")').count();
        
        console.log(`     After toggle - Expand buttons: ${expandButtonUpdated}`);
        console.log(`     After toggle - Collapse buttons: ${collapseButtonUpdated}`);
        
        if ((expandCount > 0 && collapseButtonUpdated > 0) || (collapseCount > 0 && expandButtonUpdated > 0)) {
          console.log('   ✅ Toggle state successfully changed!');
        } else {
          console.log('   ❌ Toggle state did not change');
        }
        
      } else {
        console.log('   ❌ 3-dots menu not found on Projects folder');
      }
    } else {
      console.log('   ❌ Projects folder not found');
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'real-folder-final.png'),
      fullPage: true 
    });

    console.log('✅ Real folder creation and toggle test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'real-folder-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/real-folder-*');
}

// Run the test
testRealFolderCreation().catch(console.error);