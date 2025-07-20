const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🔍 Debugging 3-Dots Menu Button Presence...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to explorer
    console.log('1️⃣ Loading explorer page...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/menu-debug-initial.png' });
    
    // Check if any MoreVertical icons exist on the page
    console.log('2️⃣ Searching for MoreVertical icons...');
    const moreVerticalIcons = await page.locator('svg').all();
    console.log(`   Total SVG icons found: ${moreVerticalIcons.length}`);
    
    // Check for buttons with "More actions" title
    const moreActionButtons = await page.locator('button[title="More actions"]').all();
    console.log(`   Buttons with "More actions" title: ${moreActionButtons.length}`);
    
    // Check for any button with 3 dots or vertical dots
    const threeDotButtons = await page.locator('button:has(svg)').all();
    console.log(`   Buttons containing SVG: ${threeDotButtons.length}`);
    
    // Look at the parent-folder specifically
    console.log('3️⃣ Examining parent-folder structure...');
    const parentFolder = page.locator('[data-testid="file-tree-item-parent-folder"]');
    
    if (await parentFolder.isVisible()) {
      console.log('   ✅ Parent folder found');
      
      // Get the parent container of the parent folder
      const parentContainer = parentFolder.locator('..');
      
      // Look for all buttons in the parent container
      const buttonsInContainer = await parentContainer.locator('button').all();
      console.log(`   Buttons in parent folder container: ${buttonsInContainer.length}`);
      
      for (let i = 0; i < buttonsInContainer.length; i++) {
        const button = buttonsInContainer[i];
        const title = await button.getAttribute('title');
        const className = await button.getAttribute('class');
        const innerHTML = await button.innerHTML();
        console.log(`   Button ${i + 1}:`);
        console.log(`     Title: ${title}`);
        console.log(`     Class: ${className}`);
        console.log(`     HTML: ${innerHTML.substring(0, 100)}...`);
      }
      
      // Take a focused screenshot of the parent folder area
      await parentContainer.screenshot({ path: 'tests/screenshots/menu-debug-parent-area.png' });
      
    } else {
      console.log('   ❌ Parent folder not found');
    }
    
    // Check if there are any elements with MoreVertical class or similar
    console.log('4️⃣ Searching for MoreVertical-related classes...');
    const page_content = await page.content();
    const hasMoreVertical = page_content.includes('MoreVertical');
    console.log(`   Page contains "MoreVertical": ${hasMoreVertical}`);
    
    const hasMenuOpen = page_content.includes('isMenuOpen');
    console.log(`   Page contains "isMenuOpen": ${hasMenuOpen}`);
    
    const hasToggleAction = page_content.includes('toggle');
    console.log(`   Page contains "toggle": ${hasToggleAction}`);
    
    // Check all file tree items for any buttons
    console.log('5️⃣ Checking all file tree items for buttons...');
    const allFileItems = await page.locator('[data-testid^="file-tree-item-"]').all();
    console.log(`   Total file tree items: ${allFileItems.length}`);
    
    for (let i = 0; i < Math.min(allFileItems.length, 5); i++) {
      const item = allFileItems[i];
      const itemName = await item.getAttribute('data-testid');
      const buttonsInItem = await item.locator('..').locator('button').all();
      console.log(`   Item "${itemName}" has ${buttonsInItem.length} buttons`);
    }
    
    await page.screenshot({ path: 'tests/screenshots/menu-debug-final.png' });
    
    console.log('\n✅ Menu button debug completed');

  } catch (error) {
    console.log('❌ Debug error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/menu-debug-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/menu-debug-*');
  console.log('🔍 Check console output to understand 3-dots menu button status.');

})();