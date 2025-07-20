const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testToggleFunctionality() {
  console.log('🔄 Debugging toggle functionality...');
  
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
    await nameInput.fill('Toggle Debug Test');
    
    const createBtn = await page.locator('[data-testid="create-workspace-btn"]');
    await createBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-debug-step1-workspace.png'),
      fullPage: true 
    });

    console.log('2️⃣ Creating a new folder using Files header buttons...');
    
    // Look for the + button in the Files section
    const filesHeader = await page.locator('text="Files"').locator('..').first();
    const addButton = await filesHeader.locator('button').first(); // The + button
    
    console.log('   Found Files header, clicking + button...');
    await addButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-debug-step2-after-plus-click.png'),
      fullPage: true 
    });

    // Look for folder creation option - might be in a dropdown or direct input
    const folderButton = await page.locator('button:has-text("Folder"), button:has-text("New Folder")').first();
    if (await folderButton.count() > 0) {
      console.log('   Found folder creation button...');
      await folderButton.click();
      await page.waitForTimeout(500);
    }

    // Look for folder name input
    const folderInput = await page.locator('input').first();
    if (await folderInput.isVisible()) {
      console.log('   Creating "Test Folder"...');
      await folderInput.fill('Test Folder');
      await folderInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-debug-step3-folder-created.png'),
      fullPage: true 
    });

    console.log('3️⃣ Testing 3-dots menu on the created folder...');
    
    // Find the Test Folder and its 3-dots menu
    const testFolder = await page.locator('text="Test Folder"').first();
    if (await testFolder.count() > 0) {
      console.log('   Found Test Folder, looking for 3-dots menu...');
      
      const folderRow = await testFolder.locator('..').first();
      const menuButton = await folderRow.locator('button:has(svg[data-lucide="more-vertical"])').first();
      
      if (await menuButton.count() > 0) {
        console.log('   Found 3-dots menu button, clicking...');
        await menuButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'toggle-debug-step4-menu-opened.png'),
          fullPage: true 
        });

        // Look for toggle button
        const toggleButtons = await page.locator('button:has-text("Toggle"), button:has-text("Expand"), button:has-text("Collapse")').all();
        console.log(`   Found ${toggleButtons.length} toggle-related buttons`);

        for (let i = 0; i < toggleButtons.length; i++) {
          const button = toggleButtons[i];
          const buttonText = await button.textContent();
          console.log(`     Button ${i + 1}: "${buttonText}"`);
        }

        if (toggleButtons.length > 0) {
          console.log('   Testing toggle functionality...');
          const firstToggleButton = toggleButtons[0];
          const buttonText = await firstToggleButton.textContent();
          
          console.log(`   Clicking "${buttonText}" button...`);
          await firstToggleButton.click();
          await page.waitForTimeout(1000);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'toggle-debug-step5-after-toggle.png'),
            fullPage: true 
          });

          // Test clicking the 3-dots menu again to see the updated state
          console.log('   Checking toggle state change...');
          const folderRowUpdated = await page.locator('text="Test Folder"').locator('..').first();
          const menuButtonUpdated = await folderRowUpdated.locator('button:has(svg[data-lucide="more-vertical"])').first();
          
          await menuButtonUpdated.click();
          await page.waitForTimeout(1000);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'toggle-debug-step6-menu-reopened.png'),
            fullPage: true 
          });

          const toggleButtonsUpdated = await page.locator('button:has-text("Toggle"), button:has-text("Expand"), button:has-text("Collapse")').all();
          
          for (let i = 0; i < toggleButtonsUpdated.length; i++) {
            const button = toggleButtonsUpdated[i];
            const updatedButtonText = await button.textContent();
            console.log(`     Updated button ${i + 1}: "${updatedButtonText}"`);
          }

          if (toggleButtonsUpdated.length > 0) {
            const newButtonText = await toggleButtonsUpdated[0].textContent();
            
            if (buttonText !== newButtonText) {
              console.log(`   ✅ Toggle state changed: "${buttonText}" → "${newButtonText}"`);
            } else {
              console.log(`   ❌ Toggle state did not change: still "${buttonText}"`);
            }
          }
        } else {
          console.log('   ❌ No toggle buttons found in menu');
        }
      } else {
        console.log('   ❌ 3-dots menu button not found');
      }
    } else {
      console.log('   ❌ Test Folder not found');
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-debug-final.png'),
      fullPage: true 
    });

    console.log('✅ Toggle functionality debug completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'toggle-debug-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/toggle-debug-*');
}

// Run the test
testToggleFunctionality().catch(console.error);