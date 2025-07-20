const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  console.log('🔍 Testing actual folder toggle behavior...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('📂 Looking for folders in file tree...');
    
    // Look for any folder in the file tree
    const folders = await page.locator('[data-testid*="file-tree-item"]:has(.lucide-folder, .lucide-folder-open)').all();
    console.log(`Found ${folders.length} folders`);
    
    if (folders.length > 0) {
      const firstFolder = folders[0];
      const folderName = await firstFolder.textContent();
      console.log(`Testing folder: "${folderName?.trim()}"`);
      
      // Find the toggle button (should be first button in the folder row)
      const folderRow = firstFolder.locator('xpath=..');
      const toggleButton = folderRow.locator('button').first();
      
      const toggleExists = await toggleButton.isVisible();
      console.log(`Toggle button visible: ${toggleExists}`);
      
      if (toggleExists) {
        // Get button details
        const buttonHTML = await toggleButton.innerHTML();
        console.log(`Toggle button HTML: ${buttonHTML}`);
        
        // Check initial state
        const hasChevronDown = await toggleButton.locator('.lucide-chevron-down').isVisible();
        const hasChevronRight = await toggleButton.locator('.lucide-chevron-right').isVisible();
        console.log(`Initial state - Down arrow: ${hasChevronDown}, Right arrow: ${hasChevronRight}`);
        
        // Take screenshot before click
        await page.screenshot({ path: 'tests/screenshots/actual-before-toggle.png' });
        
        // Click the toggle button
        console.log('🖱️ Clicking toggle button...');
        await toggleButton.click();
        await page.waitForTimeout(1000);
        
        // Check state after click
        const hasChevronDownAfter = await toggleButton.locator('.lucide-chevron-down').isVisible();
        const hasChevronRightAfter = await toggleButton.locator('.lucide-chevron-right').isVisible();
        console.log(`After click - Down arrow: ${hasChevronDownAfter}, Right arrow: ${hasChevronRightAfter}`);
        
        // Take screenshot after click
        await page.screenshot({ path: 'tests/screenshots/actual-after-toggle.png' });
        
        // Check if children are visible
        const children = await folderRow.locator('xpath=following-sibling::div').all();
        console.log(`Children elements after toggle: ${children.length}`);
        
        // Test what happens when we hover over the folder
        console.log('🖱️ Testing hover behavior...');
        await firstFolder.hover();
        await page.waitForTimeout(500);
        
        // Look for action buttons that appear on hover
        const actionButtons = await folderRow.locator('button:not(:first-child)').all();
        console.log(`Action buttons on hover: ${actionButtons.length}`);
        
        for (let i = 0; i < actionButtons.length; i++) {
          const button = actionButtons[i];
          const buttonTitle = await button.getAttribute('title');
          const buttonHTML = await button.innerHTML();
          console.log(`Action button ${i + 1}: title="${buttonTitle}", HTML=${buttonHTML.substring(0, 50)}...`);
        }
        
        // Take screenshot with hover
        await page.screenshot({ path: 'tests/screenshots/actual-with-hover.png' });
        
        // Check if there's a difference between toggle and action area
        const toggleBounds = await toggleButton.boundingBox();
        console.log(`Toggle button position: x=${toggleBounds?.x}, y=${toggleBounds?.y}, width=${toggleBounds?.width}, height=${toggleBounds?.height}`);
        
      } else {
        console.log('❌ No toggle button found');
        
        // Let's see what buttons are in the folder row
        const allButtons = await folderRow.locator('button').all();
        console.log(`Total buttons in folder row: ${allButtons.length}`);
        
        for (let i = 0; i < allButtons.length; i++) {
          const button = allButtons[i];
          const buttonHTML = await button.innerHTML();
          const isVisible = await button.isVisible();
          console.log(`Button ${i}: visible=${isVisible}, HTML=${buttonHTML.substring(0, 100)}...`);
        }
      }
    } else {
      console.log('❌ No folders found in file tree');
      
      // Let's see what's in the file tree
      const allItems = await page.locator('[data-testid*="file-tree-item"]').all();
      console.log(`Total file tree items: ${allItems.length}`);
      
      for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        const itemText = await item.textContent();
        const testId = await item.getAttribute('data-testid');
        console.log(`Item ${i}: testid="${testId}", text="${itemText?.trim()}"`);
      }
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/actual-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\\n✅ Actual Folder Toggle Test Complete!');
  console.log('Check screenshots in tests/screenshots/:');
  console.log('- actual-before-toggle.png');
  console.log('- actual-after-toggle.png'); 
  console.log('- actual-with-hover.png');

})();