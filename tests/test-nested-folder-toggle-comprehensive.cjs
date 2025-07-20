const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testNestedFolderToggle() {
  console.log('🗂️ Testing nested folder toggle functionality comprehensively...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log('1️⃣ Setting up clean workspace...');
    await page.goto('http://localhost:3000/explorer');
    
    // Clear localStorage completely
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

    console.log('2️⃣ Creating workspace...');
    const welcomeCard = page.locator('[data-testid="create-workspace-card"]').first();
    await welcomeCard.waitFor({ state: 'visible', timeout: 10000 });
    await welcomeCard.click();
    await page.waitForTimeout(1000);
    
    const nameInput = await page.locator('[data-testid="workspace-name-input"]');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('Nested Folder Test');
    
    const createBtn = await page.locator('[data-testid="create-workspace-btn"]');
    await createBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'nested-toggle-step1-workspace-created.png'),
      fullPage: true 
    });

    console.log('3️⃣ Creating nested folder structure...');
    
    // Create root folder "Projects"
    console.log('   Creating root folder "Projects"...');
    const newFolderBtn = await page.locator('button:has-text("New Folder")').first();
    await newFolderBtn.click();
    await page.waitForTimeout(500);
    
    const folderNameInput = await page.locator('input[placeholder*="folder name"]').first();
    await folderNameInput.fill('Projects');
    await folderNameInput.press('Enter');
    await page.waitForTimeout(1000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'nested-toggle-step2-projects-folder.png'),
      fullPage: true 
    });

    // Find the Projects folder and create a subfolder inside it
    console.log('   Looking for Projects folder 3-dots menu...');
    
    // Wait for Projects folder to appear
    await page.waitForSelector('text="Projects"', { timeout: 5000 });
    
    // Find the Projects folder row and its 3-dots menu
    const projectsFolder = await page.locator('text="Projects"').locator('..').first();
    const projectsMenuButton = await projectsFolder.locator('button:has(svg[data-lucide="more-vertical"])').first();
    
    console.log('   Clicking Projects folder 3-dots menu...');
    await projectsMenuButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'nested-toggle-step3-projects-menu-opened.png'),
      fullPage: true 
    });

    // Click "New Folder" in the dropdown
    console.log('   Creating subfolder "Web Apps"...');
    const newFolderMenuOption = await page.locator('button:has-text("New Folder")').first();
    await newFolderMenuOption.click();
    await page.waitForTimeout(500);
    
    const subfolderNameInput = await page.locator('input[placeholder*="folder name"]').first();
    await subfolderNameInput.fill('Web Apps');
    await subfolderNameInput.press('Enter');
    await page.waitForTimeout(1000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'nested-toggle-step4-web-apps-created.png'),
      fullPage: true 
    });

    // Create another nested folder inside "Web Apps"
    console.log('   Creating sub-subfolder "React Projects"...');
    
    // Find Web Apps folder and its 3-dots menu
    const webAppsFolder = await page.locator('text="Web Apps"').locator('..').first();
    const webAppsMenuButton = await webAppsFolder.locator('button:has(svg[data-lucide="more-vertical"])').first();
    
    await webAppsMenuButton.click();
    await page.waitForTimeout(1000);
    
    const newSubfolderMenuOption = await page.locator('button:has-text("New Folder")').first();
    await newSubfolderMenuOption.click();
    await page.waitForTimeout(500);
    
    const subSubfolderNameInput = await page.locator('input[placeholder*="folder name"]').first();
    await subSubfolderNameInput.fill('React Projects');
    await subSubfolderNameInput.press('Enter');
    await page.waitForTimeout(1000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'nested-toggle-step5-react-projects-created.png'),
      fullPage: true 
    });

    console.log('4️⃣ Testing toggle functionality on nested folders...');
    
    // Test 1: Collapse the Projects folder (should hide all children)
    console.log('   Test 1: Collapsing Projects folder...');
    
    const projectsFolderUpdated = await page.locator('text="Projects"').locator('..').first();
    const projectsMenuButtonUpdated = await projectsFolderUpdated.locator('button:has(svg[data-lucide="more-vertical"])').first();
    
    await projectsMenuButtonUpdated.click();
    await page.waitForTimeout(1000);
    
    // Look for the toggle button - should show "Collapse" since folder is expanded
    const toggleButton1 = await page.locator('button:has-text("Collapse")').first();
    const isCollapseVisible = await toggleButton1.isVisible();
    console.log(`     "Collapse" button visible: ${isCollapseVisible}`);
    
    if (isCollapseVisible) {
      await toggleButton1.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'nested-toggle-step6-projects-collapsed.png'),
        fullPage: true 
      });
      
      // Verify that Web Apps and React Projects are hidden
      const webAppsVisible = await page.locator('text="Web Apps"').isVisible();
      const reactProjectsVisible = await page.locator('text="React Projects"').isVisible();
      
      console.log(`     After collapse - Web Apps visible: ${webAppsVisible}`);
      console.log(`     After collapse - React Projects visible: ${reactProjectsVisible}`);
      
      if (!webAppsVisible && !reactProjectsVisible) {
        console.log('     ✅ Collapse functionality working correctly!');
      } else {
        console.log('     ❌ Collapse functionality not working - children still visible');
      }
    } else {
      console.log('     ❌ "Collapse" button not found');
    }

    // Test 2: Expand the Projects folder again
    console.log('   Test 2: Expanding Projects folder...');
    
    await page.waitForTimeout(1000);
    const projectsFolderCollapsed = await page.locator('text="Projects"').locator('..').first();
    const projectsMenuButtonCollapsed = await projectsFolderCollapsed.locator('button:has(svg[data-lucide="more-vertical"])').first();
    
    await projectsMenuButtonCollapsed.click();
    await page.waitForTimeout(1000);
    
    // Now should show "Expand" button
    const toggleButton2 = await page.locator('button:has-text("Expand")').first();
    const isExpandVisible = await toggleButton2.isVisible();
    console.log(`     "Expand" button visible: ${isExpandVisible}`);
    
    if (isExpandVisible) {
      await toggleButton2.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'nested-toggle-step7-projects-expanded.png'),
        fullPage: true 
      });
      
      // Verify that Web Apps is visible again
      const webAppsVisibleAgain = await page.locator('text="Web Apps"').isVisible();
      console.log(`     After expand - Web Apps visible: ${webAppsVisibleAgain}`);
      
      if (webAppsVisibleAgain) {
        console.log('     ✅ Expand functionality working correctly!');
      } else {
        console.log('     ❌ Expand functionality not working - children not visible');
      }
    } else {
      console.log('     ❌ "Expand" button not found');
    }

    // Test 3: Test toggle on deeper nested folder (Web Apps)
    console.log('   Test 3: Testing toggle on Web Apps folder...');
    
    if (await page.locator('text="Web Apps"').isVisible()) {
      const webAppsFolderFinal = await page.locator('text="Web Apps"').locator('..').first();
      const webAppsMenuButtonFinal = await webAppsFolderFinal.locator('button:has(svg[data-lucide="more-vertical"])').first();
      
      await webAppsMenuButtonFinal.click();
      await page.waitForTimeout(1000);
      
      const webAppsToggleButton = await page.locator('button:has([class*="chevron"]), button:has-text("Collapse"), button:has-text("Expand")').first();
      const webAppsToggleText = await webAppsToggleButton.textContent();
      console.log(`     Web Apps toggle button text: "${webAppsToggleText}"`);
      
      await webAppsToggleButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'nested-toggle-step8-web-apps-toggled.png'),
        fullPage: true 
      });
      
      const reactProjectsVisibilityAfterToggle = await page.locator('text="React Projects"').isVisible();
      console.log(`     After Web Apps toggle - React Projects visible: ${reactProjectsVisibilityAfterToggle}`);
      
      if (webAppsToggleText?.includes('Collapse') && !reactProjectsVisibilityAfterToggle) {
        console.log('     ✅ Web Apps collapse working correctly!');
      } else if (webAppsToggleText?.includes('Expand') && reactProjectsVisibilityAfterToggle) {
        console.log('     ✅ Web Apps expand working correctly!');
      } else {
        console.log('     ⚠️ Web Apps toggle behavior unclear');
      }
    }

    // Final state screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'nested-toggle-final-state.png'),
      fullPage: true 
    });

    console.log('✅ Nested folder toggle test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'nested-toggle-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/nested-toggle-*');
}

// Run the test
testNestedFolderToggle().catch(console.error);