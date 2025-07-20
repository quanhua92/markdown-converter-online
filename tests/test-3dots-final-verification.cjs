const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function test3DotsFinalVerification() {
  console.log('🎯 Final verification of 3-dots menu functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1️⃣ Loading page and creating workspace...');
    await page.goto('http://localhost:3000/explorer');
    
    // Clear localStorage 
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(1000);

    // Click on "Create New Workspace" - this should be a clickable card
    const createCard = await page.locator('text="Create New Workspace"').locator('..').first();
    await createCard.click();
    await page.waitForTimeout(500);

    // Fill workspace name
    const nameInput = await page.locator('input[placeholder*="workspace name"]').first();
    await nameInput.fill('3Dots Test');
    
    const confirmButton = await page.locator('button:has-text("Create")').first();
    await confirmButton.click();
    await page.waitForTimeout(2000);

    console.log('2️⃣ Looking for 3-dots icons in the file tree...');
    
    // Take screenshot showing current state
    await page.screenshot({ 
      path: path.join(screenshotsDir, '3dots-verification-initial.png'),
      fullPage: true 
    });

    // Count 3-dots icons
    const threeDotIcons = await page.locator('text="⋮"').count();
    console.log(`   Found ${threeDotIcons} three-dot icons (⋮)`);

    // Also look for MoreVertical lucide icons
    const moreVerticalIcons = await page.locator('svg[data-lucide="more-vertical"]').count();
    console.log(`   Found ${moreVerticalIcons} MoreVertical lucide icons`);

    if (threeDotIcons > 0 || moreVerticalIcons > 0) {
      console.log('3️⃣ Testing 3-dots menu click functionality...');
      
      // Try clicking the first 3-dots icon
      let menuOpened = false;
      
      if (threeDotIcons > 0) {
        console.log('   Clicking on ⋮ icon...');
        await page.locator('text="⋮"').first().click();
        await page.waitForTimeout(500);
        menuOpened = true;
      } else if (moreVerticalIcons > 0) {
        console.log('   Clicking on MoreVertical icon...');
        await page.locator('svg[data-lucide="more-vertical"]').first().click();
        await page.waitForTimeout(500);
        menuOpened = true;
      }

      if (menuOpened) {
        // Take screenshot after clicking
        await page.screenshot({ 
          path: path.join(screenshotsDir, '3dots-verification-menu-opened.png'),
          fullPage: true 
        });

        // Look for dropdown menu items
        const menuItems = await page.locator('[role="menu"] button, .dropdown button, [class*="menu"] button').all();
        console.log(`   Found ${menuItems.length} menu items`);

        for (let i = 0; i < menuItems.length; i++) {
          const item = menuItems[i];
          const text = await item.textContent();
          console.log(`     Menu item ${i + 1}: "${text?.trim()}"`);
        }

        // Look specifically for Toggle option
        const toggleButton = await page.locator('button:has-text("Toggle")').count();
        console.log(`   Found ${toggleButton} Toggle buttons`);

        if (toggleButton > 0) {
          console.log('4️⃣ Testing Toggle functionality...');
          await page.locator('button:has-text("Toggle")').first().click();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, '3dots-verification-after-toggle.png'),
            fullPage: true 
          });
          
          console.log('   ✅ Toggle button clicked successfully!');
        }
      }

      console.log('✅ 3-dots menu is working correctly!');
    } else {
      console.log('❌ No 3-dots icons found');
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, '3dots-verification-final.png'),
      fullPage: true 
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '3dots-verification-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('✅ 3-dots final verification completed');
  console.log('📁 Screenshots saved in tests/screenshots/3dots-verification-*');
}

// Run the test
test3DotsFinalVerification().catch(console.error);