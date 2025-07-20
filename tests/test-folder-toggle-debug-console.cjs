const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  console.log('🔍 Testing folder toggle with console debugging...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Capture console logs to see debug output
  page.on('console', (msg) => {
    if (msg.text().includes('🔧 toggleFolder')) {
      console.log(`BROWSER LOG: ${msg.text()}`);
    }
  });

  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('📂 Testing toggle with console logging...');
    
    // Find the notes folder
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    const notesFolderExists = await notesFolder.isVisible();
    
    if (notesFolderExists) {
      // Get the folder container and find the toggle button
      const folderContainer = notesFolder.locator('xpath=..');
      const toggleButton = folderContainer.locator('button').first();
      
      console.log('🖱️ Clicking toggle button (should see debug logs)...');
      await toggleButton.click();
      await page.waitForTimeout(2000); // Wait longer to see console logs
      
      // Check localStorage to see if state actually changed
      const localStorageData = await page.evaluate(() => {
        const workspaceData = localStorage.getItem('markdown-explorer-workspace-default');
        return workspaceData ? JSON.parse(workspaceData) : null;
      });
      
      console.log('📊 LocalStorage workspace data:');
      if (localStorageData && localStorageData.files) {
        const notesFolder = localStorageData.files.find(f => f.name === 'notes');
        if (notesFolder) {
          console.log(`  Notes folder isExpanded: ${notesFolder.isExpanded}`);
        } else {
          console.log('  Notes folder not found in localStorage');
        }
      } else {
        console.log('  No workspace data in localStorage');
      }
      
      // Click again to see if it changes
      console.log('🖱️ Clicking toggle again...');
      await toggleButton.click();
      await page.waitForTimeout(2000);
      
      // Check localStorage again
      const localStorageData2 = await page.evaluate(() => {
        const workspaceData = localStorage.getItem('markdown-explorer-workspace-default');
        return workspaceData ? JSON.parse(workspaceData) : null;
      });
      
      console.log('📊 LocalStorage after second click:');
      if (localStorageData2 && localStorageData2.files) {
        const notesFolder = localStorageData2.files.find(f => f.name === 'notes');
        if (notesFolder) {
          console.log(`  Notes folder isExpanded: ${notesFolder.isExpanded}`);
        }
      }
      
    } else {
      console.log('❌ Notes folder not found');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  await page.close();
  await browser.close();
  console.log('\\n✅ Console Debug Test Complete!');
})();