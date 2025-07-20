const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function test3DotsMenuComprehensive() {
  console.log('🔧 Testing 3-dots menu comprehensive functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1️⃣ Clearing localStorage and loading page...');
    await page.goto('http://localhost:3000/explorer');
    
    // Clear localStorage completely
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(1000);

    console.log('2️⃣ Creating new workspace...');
    const createButton = await page.locator('button:has-text("Create New Workspace")').first();
    await createButton.click();
    await page.waitForTimeout(500);

    const nameInput = await page.locator('input[placeholder*="workspace name"]').first();
    await nameInput.fill('Test Workspace');
    
    const confirmButton = await page.locator('button:has-text("Create")').first();
    await confirmButton.click();
    await page.waitForTimeout(1000);

    console.log('3️⃣ Creating a test folder...');
    const newFolderButton = await page.locator('button:has-text("New Folder")').first();
    await newFolderButton.click();
    await page.waitForTimeout(500);

    const folderNameInput = await page.locator('input[placeholder*="folder name"]').first();
    await folderNameInput.fill('Test Folder');
    await folderNameInput.press('Enter');
    await page.waitForTimeout(1000);

    console.log('4️⃣ Looking for 3-dots menu (MoreVertical icons)...');
    
    // Take screenshot before looking for menu
    await page.screenshot({ 
      path: path.join(screenshotsDir, '3dots-before-search.png'),
      fullPage: true 
    });

    // Look for MoreVertical icons specifically
    const moreVerticalIcons = await page.locator('svg[data-lucide="more-vertical"]').count();
    console.log(`   Found ${moreVerticalIcons} MoreVertical icons`);

    // Look for any buttons with "More actions" or similar
    const moreActionsButtons = await page.locator('button:has-text("More actions")').count();
    console.log(`   Found ${moreActionsButtons} "More actions" buttons`);

    // Look for any clickable 3-dots related elements
    const threeDotElements = await page.locator('[aria-label*="more"], [title*="more"], [aria-label*="menu"], [title*="menu"]').count();
    console.log(`   Found ${threeDotElements} elements with more/menu aria-labels`);

    // Check page source for key terms
    const pageContent = await page.content();
    const hasMoreVertical = pageContent.includes('MoreVertical') || pageContent.includes('more-vertical');
    const hasMenuState = pageContent.includes('isMenuOpen') || pageContent.includes('menuOpen');
    const hasMenuAction = pageContent.includes('handleMenuAction') || pageContent.includes('menuAction');
    
    console.log(`   Page contains MoreVertical references: ${hasMoreVertical}`);
    console.log(`   Page contains menu state references: ${hasMenuState}`);
    console.log(`   Page contains menu action references: ${hasMenuAction}`);

    console.log('5️⃣ Looking for file tree items and their action buttons...');
    
    // Find all file tree items
    const fileTreeItems = await page.locator('[class*="file-tree"] li, [class*="FileTree"] li, .file-item, .folder-item').all();
    console.log(`   Found ${fileTreeItems.length} file tree items`);

    for (let i = 0; i < fileTreeItems.length; i++) {
      console.log(`   Examining item ${i + 1}:`);
      const item = fileTreeItems[i];
      const itemText = await item.textContent();
      console.log(`     Text: "${itemText?.trim()}"`);
      
      // Look for any clickable elements within this item
      const clickables = await item.locator('button, [role="button"], svg').all();
      console.log(`     Found ${clickables.length} clickable elements`);
      
      for (let j = 0; j < clickables.length; j++) {
        const clickable = clickables[j];
        const tagName = await clickable.evaluate(el => el.tagName);
        const classes = await clickable.getAttribute('class') || '';
        const ariaLabel = await clickable.getAttribute('aria-label') || '';
        const title = await clickable.getAttribute('title') || '';
        console.log(`       Clickable ${j + 1}: ${tagName} class="${classes}" aria-label="${ariaLabel}" title="${title}"`);
      }
    }

    console.log('6️⃣ Testing if we can find and click any menu trigger...');
    
    // Try to find the Test Folder specifically
    const testFolder = await page.locator('text="Test Folder"').first();
    if (await testFolder.count() > 0) {
      console.log('   Found Test Folder, looking for associated menu...');
      
      // Look for menu trigger near the folder
      const folderContainer = await testFolder.locator('..').first();
      const menuTriggers = await folderContainer.locator('button, svg').all();
      
      console.log(`   Found ${menuTriggers.length} potential menu triggers near Test Folder`);
      
      for (let i = 0; i < menuTriggers.length; i++) {
        const trigger = menuTriggers[i];
        const isVisible = await trigger.isVisible();
        const classes = await trigger.getAttribute('class') || '';
        const ariaLabel = await trigger.getAttribute('aria-label') || '';
        console.log(`     Trigger ${i + 1}: visible=${isVisible} class="${classes}" aria-label="${ariaLabel}"`);
        
        if (isVisible && (classes.includes('more') || ariaLabel.includes('more') || classes.includes('menu'))) {
          console.log(`     🎯 Attempting to click potential menu trigger...`);
          try {
            await trigger.click();
            await page.waitForTimeout(500);
            
            // Check if a menu appeared
            const menuItems = await page.locator('[role="menu"], .dropdown, .popup, [class*="menu"]').count();
            console.log(`       Menu items appeared: ${menuItems}`);
            
            if (menuItems > 0) {
              console.log('       ✅ Menu successfully opened!');
              break;
            }
          } catch (e) {
            console.log(`       ❌ Failed to click: ${e.message}`);
          }
        }
      }
    }

    // Take final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, '3dots-comprehensive-final.png'),
      fullPage: true 
    });

    if (moreVerticalIcons > 0) {
      console.log('✅ 3-dots menu implementation found!');
    } else {
      console.log('❌ No 3-dots menu implementation detected');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '3dots-comprehensive-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('✅ 3-dots menu comprehensive test completed');
  console.log('📁 Screenshots saved in tests/screenshots/3dots-comprehensive-*');
}

// Run the test
test3DotsMenuComprehensive().catch(console.error);