const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  console.log('🔍 Testing enhanced folder toggle functionality...');

  const page = await browser.newPage();
  
  // Test both desktop and mobile viewports
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 375, height: 667, name: 'Mobile' }
  ];

  for (const viewport of viewports) {
    console.log(`\n📱 Testing on ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    try {
      await page.goto('http://localhost:3000/explorer');
      await page.waitForTimeout(3000);
      
      // Find the notes folder
      const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
      const notesFolderExists = await notesFolder.isVisible();
      
      if (notesFolderExists) {
        console.log('✅ Found notes folder');
        
        // Get the folder container
        const folderContainer = notesFolder.locator('xpath=..');
        
        // Test 1: Click the chevron button directly
        console.log('🖱️ Test 1: Clicking chevron button...');
        const chevronButton = folderContainer.locator('button').first();
        
        // Check initial state
        const initialChevronDown = await chevronButton.locator('.lucide-chevron-down').isVisible();
        const initialChevronRight = await chevronButton.locator('.lucide-chevron-right').isVisible();
        console.log(`  Initial state - Down: ${initialChevronDown}, Right: ${initialChevronRight}`);
        
        // Check if child file is visible initially
        const ideasFile = page.locator('[data-testid="file-tree-item-ideas.md"]');
        const initialIdeasVisible = await ideasFile.isVisible();
        console.log(`  Initial ideas.md visible: ${initialIdeasVisible}`);
        
        // Click chevron button
        await chevronButton.click();
        await page.waitForTimeout(1000);
        
        // Check state after chevron click
        const afterChevronDown = await chevronButton.locator('.lucide-chevron-down').isVisible();
        const afterChevronRight = await chevronButton.locator('.lucide-chevron-right').isVisible();
        const afterIdeasVisible = await ideasFile.isVisible();
        console.log(`  After chevron click - Down: ${afterChevronDown}, Right: ${afterChevronRight}`);
        console.log(`  After chevron click - ideas.md visible: ${afterIdeasVisible}`);
        
        // Test 2: Click the chevron icon directly (mobile-friendly)
        console.log('🖱️ Test 2: Clicking chevron icon directly...');
        const chevronIcon = chevronButton.locator('svg').first();
        await chevronIcon.click();
        await page.waitForTimeout(1000);
        
        const afterIconClickDown = await chevronButton.locator('.lucide-chevron-down').isVisible();
        const afterIconClickRight = await chevronButton.locator('.lucide-chevron-right').isVisible();
        const afterIconIdeasVisible = await ideasFile.isVisible();
        console.log(`  After icon click - Down: ${afterIconClickDown}, Right: ${afterIconClickRight}`);
        console.log(`  After icon click - ideas.md visible: ${afterIconIdeasVisible}`);
        
        // Test 3: Click folder name to toggle (new feature)
        console.log('🖱️ Test 3: Clicking folder name...');
        await notesFolder.click();
        await page.waitForTimeout(1000);
        
        const afterNameClickDown = await chevronButton.locator('.lucide-chevron-down').isVisible();
        const afterNameClickRight = await chevronButton.locator('.lucide-chevron-right').isVisible();
        const afterNameIdeasVisible = await ideasFile.isVisible();
        console.log(`  After name click - Down: ${afterNameClickDown}, Right: ${afterNameClickRight}`);
        console.log(`  After name click - ideas.md visible: ${afterNameIdeasVisible}`);
        
        // Test 4: Check localStorage data
        console.log('📊 Test 4: Checking localStorage...');
        const localStorageData = await page.evaluate(() => {
          const workspaceData = localStorage.getItem('markdown-explorer-workspace-default');
          return workspaceData ? JSON.parse(workspaceData) : null;
        });
        
        if (localStorageData && localStorageData.files) {
          const notesFolder = localStorageData.files.find(f => f.name === 'notes');
          if (notesFolder) {
            console.log(`  localStorage notes folder isExpanded: ${notesFolder.isExpanded}`);
          }
        }
        
        // Test 5: Action buttons visibility (hover test for desktop)
        if (viewport.name === 'Desktop') {
          console.log('🎨 Test 5: Testing action button visibility...');
          
          // Check initial button visibility
          const actionButtons = await folderContainer.locator('button:not(:first-child)').all();
          console.log(`  Found ${actionButtons.length} action buttons`);
          
          for (let i = 0; i < Math.min(actionButtons.length, 3); i++) {
            const button = actionButtons[i];
            const initialOpacity = await button.evaluate((el) => window.getComputedStyle(el).opacity);
            console.log(`    Action button ${i} initial opacity: ${initialOpacity}`);
          }
          
          // Hover over folder
          await folderContainer.hover();
          await page.waitForTimeout(500);
          
          for (let i = 0; i < Math.min(actionButtons.length, 3); i++) {
            const button = actionButtons[i];
            const hoverOpacity = await button.evaluate((el) => window.getComputedStyle(el).opacity);
            console.log(`    Action button ${i} hover opacity: ${hoverOpacity}`);
          }
        }
        
        // Take screenshot for this viewport
        await page.screenshot({ 
          path: `tests/screenshots/enhanced-toggle-${viewport.name.toLowerCase()}.png` 
        });
        
      } else {
        console.log('❌ Notes folder not found');
      }

    } catch (error) {
      console.log(`❌ Test error on ${viewport.name}:`, error.message);
      await page.screenshot({ 
        path: `tests/screenshots/enhanced-toggle-${viewport.name.toLowerCase()}-error.png` 
      });
    }
  }

  await page.close();
  await browser.close();
  console.log('\n✅ Enhanced Folder Toggle Test Complete!');
})();