const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  console.log('🔍 Testing simple folder toggle with console capture...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Capture ALL console logs
  page.on('console', (msg) => {
    console.log(`BROWSER: ${msg.text()}`);
  });

  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('📂 Looking for notes folder...');
    
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    const notesFolderExists = await notesFolder.isVisible();
    
    if (notesFolderExists) {
      console.log('✅ Found notes folder');
      
      // Check initial state
      const folderContainer = notesFolder.locator('xpath=..');
      const toggleButton = folderContainer.locator('button').first();
      
      // Get initial chevron state
      const initialChevronDown = await toggleButton.locator('.lucide-chevron-down').isVisible();
      const initialChevronRight = await toggleButton.locator('.lucide-chevron-right').isVisible();
      console.log(`Initial chevron state: Down=${initialChevronDown}, Right=${initialChevronRight}`);
      
      // Check if child is visible
      const childFile = page.locator('[data-testid="file-tree-item-ideas.md"]');
      const initialChildVisible = await childFile.isVisible();
      console.log(`Initial child visible: ${initialChildVisible}`);
      
      console.log('🖱️ Clicking toggle button and waiting for logs...');
      await toggleButton.click();
      
      // Wait longer for any console logs
      await page.waitForTimeout(3000);
      
      // Check state after click
      const afterChevronDown = await toggleButton.locator('.lucide-chevron-down').isVisible();
      const afterChevronRight = await toggleButton.locator('.lucide-chevron-right').isVisible();
      const afterChildVisible = await childFile.isVisible();
      
      console.log(`After click chevron state: Down=${afterChevronDown}, Right=${afterChevronRight}`);
      console.log(`After click child visible: ${afterChildVisible}`);
      
      // Try clicking the chevron icon directly
      console.log('🖱️ Trying to click chevron icon directly...');
      const chevronIcon = toggleButton.locator('svg').first();
      await chevronIcon.click();
      await page.waitForTimeout(3000);
      
      // Final state check
      const finalChevronDown = await toggleButton.locator('.lucide-chevron-down').isVisible();
      const finalChevronRight = await toggleButton.locator('.lucide-chevron-right').isVisible();
      const finalChildVisible = await childFile.isVisible();
      
      console.log(`Final chevron state: Down=${finalChevronDown}, Right=${finalChevronRight}`);
      console.log(`Final child visible: ${finalChildVisible}`);
      
    } else {
      console.log('❌ Notes folder not found');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  await page.close();
  await browser.close();
  console.log('\\n✅ Simple Toggle Test Complete!');
})();