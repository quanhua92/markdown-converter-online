const { chromium } = require('playwright');

async function testMobileDeleteCorrectWorkflow() {
  console.log('📱 Testing mobile delete functionality with correct workflow...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set mobile viewport to reproduce the issue
  await page.setViewportSize({ width: 375, height: 667 });
  
  try {
    // Navigate to explorer
    await page.goto('http://localhost:3000/explorer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Explorer page loaded on mobile viewport');
    
    // Check if we're in the welcome screen or already in a workspace
    const welcomeCard = page.locator('[data-testid="create-workspace-card"]');
    const isWelcomeScreen = await welcomeCard.isVisible();
    
    if (isWelcomeScreen) {
      console.log('📝 Creating new workspace for mobile testing...');
      
      // Create a new workspace
      await welcomeCard.click();
      await page.waitForTimeout(1000);
      
      // Fill in workspace name
      await page.fill('[data-testid="workspace-name-input"]', 'Mobile Delete Test');
      await page.click('[data-testid="create-workspace-btn"]');
      await page.waitForTimeout(2000);
      
      console.log('✅ Test workspace created');
    }
    
    // Take screenshot of initial mobile state
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-delete-correct-initial.png',
      fullPage: true 
    });
    
    // Step 1: Find the hamburger menu button (should be visible on mobile)
    console.log('🍔 Looking for mobile hamburger menu button...');
    
    // The hamburger menu is typically in the header with lg:hidden class
    const hamburgerSelectors = [
      'button.lg\\:hidden', // Hidden on desktop, visible on mobile
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]',
      'button[title*="menu"]',
      'button[title*="Open file tree"]',
      'button:has(svg):visible' // Look for visible buttons with SVG icons
    ];
    
    let hamburgerBtn = null;
    for (const selector of hamburgerSelectors) {
      console.log(`🔍 Trying hamburger selector: ${selector}`);
      const btn = page.locator(selector).first();
      const count = await btn.count();
      const isVisible = count > 0 ? await btn.isVisible() : false;
      console.log(`  Found ${count} elements, visible: ${isVisible}`);
      
      if (count > 0 && isVisible) {
        // Check if this looks like a menu button
        const title = await btn.getAttribute('title');
        console.log(`  Button title: "${title}"`);
        
        if (title && (title.includes('menu') || title.includes('file tree') || title.includes('Open'))) {
          hamburgerBtn = btn;
          console.log(`✅ Found hamburger menu button: ${title}`);
          break;
        }
      }
    }
    
    // If still not found, list all visible buttons to debug
    if (!hamburgerBtn) {
      console.log('🔍 Hamburger not found, listing all visible buttons:');
      const allButtons = await page.locator('button:visible').all();
      
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const btn = allButtons[i];
        const title = await btn.getAttribute('title');
        const ariaLabel = await btn.getAttribute('aria-label');
        const classes = await btn.getAttribute('class');
        console.log(`  Button ${i}: title="${title}", aria-label="${ariaLabel}"`);
        console.log(`    classes="${classes}"`);
        
        // Look for mobile-specific indicators
        if (classes && classes.includes('lg:hidden')) {
          hamburgerBtn = btn;
          console.log(`✅ Found mobile button with lg:hidden class`);
          break;
        }
      }
    }
    
    if (!hamburgerBtn) {
      throw new Error('❌ Could not find hamburger menu button on mobile');
    }
    
    // Step 2: Click hamburger menu to open file tree sheet
    console.log('👆 Clicking hamburger menu to open file tree sheet...');
    await hamburgerBtn.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot of opened sheet
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-delete-correct-sheet-opened.png',
      fullPage: true 
    });
    
    // Step 3: Debug what's actually in the mobile sheet
    console.log('📄 Analyzing mobile sheet contents...');
    
    // Take detailed screenshot of the opened sheet
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-sheet-detailed.png',
      fullPage: true 
    });
    
    // Check all buttons in the sheet
    const allButtons = await page.locator('button').all();
    console.log(`🔍 Found ${allButtons.length} total buttons in page`);
    
    let visibleButtons = 0;
    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      const isVisible = await btn.isVisible();
      if (isVisible) {
        visibleButtons++;
        const title = await btn.getAttribute('title');
        const text = await btn.textContent();
        console.log(`  Visible button ${visibleButtons}: title="${title}", text="${text?.trim()}"`);
      }
    }
    
    // Specifically look for "New file" buttons
    const newFileButtons = page.locator('button[title="New file"]');
    const newFileCount = await newFileButtons.count();
    console.log(`📄 Found ${newFileCount} "New file" buttons`);
    
    for (let i = 0; i < newFileCount; i++) {
      const btn = newFileButtons.nth(i);
      const isVisible = await btn.isVisible();
      const boundingBox = await btn.boundingBox();
      console.log(`  New file button ${i}: visible=${isVisible}, boundingBox=${JSON.stringify(boundingBox)}`);
    }
    
    // Try to find any visible "New file" button
    let newFileBtn = null;
    for (let i = 0; i < newFileCount; i++) {
      const btn = newFileButtons.nth(i);
      const isVisible = await btn.isVisible();
      if (isVisible) {
        newFileBtn = btn;
        console.log(`✅ Found visible "New file" button at index ${i}`);
        break;
      }
    }
    
    if (!newFileBtn) {
      console.log('❌ No visible "New file" buttons found');
      
      // Try to force click the first button anyway
      if (newFileCount > 0) {
        console.log('💪 Attempting force click on first "New file" button...');
        newFileBtn = newFileButtons.first();
      } else {
        throw new Error('❌ No "New file" buttons found at all');
      }
    }
    
    await newFileBtn.click();
    await page.waitForTimeout(1000);
    
    await page.keyboard.type('mobile-test-file.md');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    console.log('✅ Created mobile-test-file.md');
    
    // Take screenshot after file creation
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-delete-correct-file-created.png',
      fullPage: true 
    });
    
    // Step 4: Now test the mobile delete functionality
    console.log('🗑️ Testing mobile delete functionality...');
    
    // Find the created file in the mobile sheet specifically
    // Use the dialog container to target the mobile sheet version
    const mobileDialog = page.getByRole('dialog');
    const testFileItem = mobileDialog.locator('[data-testid="file-tree-item-mobile-test-file.md"]');
    await testFileItem.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Found test file in mobile sheet');
    
    // Find the more actions button for this file
    const moreActionsBtn = testFileItem.locator('xpath=..').locator('button[title="More actions"]');
    
    // Check if more actions button is visible
    const isMoreActionsVisible = await moreActionsBtn.isVisible();
    console.log(`📐 More actions button visible: ${isMoreActionsVisible}`);
    
    if (!isMoreActionsVisible) {
      console.log('❌ ISSUE CONFIRMED: More actions button not visible on mobile!');
      
      // Check if button exists but is hidden
      const moreActionsCount = await moreActionsBtn.count();
      console.log(`📊 More actions button count: ${moreActionsCount}`);
      
      if (moreActionsCount > 0) {
        // Button exists but is hidden - this is the root cause
        const buttonElement = moreActionsBtn.first();
        const styles = await buttonElement.getAttribute('style');
        const classes = await buttonElement.getAttribute('class');
        const boundingBox = await buttonElement.boundingBox();
        
        console.log('🔍 Hidden button analysis:');
        console.log(`  Styles: ${styles}`);
        console.log(`  Classes: ${classes}`);
        console.log(`  Bounding box: ${JSON.stringify(boundingBox)}`);
        
        // Try to force click the hidden button
        console.log('💪 Attempting force click on hidden more actions button...');
        await moreActionsBtn.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Check if delete menu appeared
        const deleteOption = page.locator('button:has-text("Delete")');
        const deleteVisible = await deleteOption.isVisible();
        console.log(`🗑️ Delete option visible after force click: ${deleteVisible}`);
        
        if (deleteVisible) {
          console.log('✅ Force click worked - clicking delete...');
          await deleteOption.click();
          await page.waitForTimeout(2000);
          
          // Check if file was deleted
          const fileStillExists = await testFileItem.isVisible();
          if (!fileStillExists) {
            console.log('✅ SUCCESS: File deleted with force click method');
          } else {
            console.log('❌ FAILED: File still exists after delete attempt');
          }
        } else {
          console.log('❌ FAILED: Delete menu did not appear even with force click');
        }
      } else {
        console.log('❌ FAILED: More actions button does not exist at all');
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/mobile-delete-correct-force-attempt.png',
        fullPage: true 
      });
      
    } else {
      // Normal workflow if button is visible
      console.log('👆 Clicking more actions button...');
      await moreActionsBtn.click();
      await page.waitForTimeout(1000);
      
      const deleteOption = page.locator('button:has-text("Delete")');
      const deleteVisible = await deleteOption.isVisible();
      console.log(`🗑️ Delete option visible: ${deleteVisible}`);
      
      if (deleteVisible) {
        await deleteOption.click();
        await page.waitForTimeout(2000);
        
        const fileStillExists = await testFileItem.isVisible();
        if (!fileStillExists) {
          console.log('✅ SUCCESS: File deleted normally');
        } else {
          console.log('❌ FAILED: File still exists after delete');
        }
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-delete-correct-final.png',
      fullPage: true 
    });
    
    console.log('📱 Mobile delete test completed');
    
  } catch (error) {
    console.error('❌ Mobile delete test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-delete-correct-error.png',
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testMobileDeleteCorrectWorkflow().catch(console.error);