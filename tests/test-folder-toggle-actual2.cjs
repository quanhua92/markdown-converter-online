const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  console.log('🔍 Testing actual folder toggle behavior - v2...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('📂 Looking for "notes" folder specifically...');
    
    // Look for the notes folder by its data-testid
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    const notesFolderExists = await notesFolder.isVisible();
    console.log(`Notes folder exists: ${notesFolderExists}`);
    
    if (notesFolderExists) {
      const folderText = await notesFolder.textContent();
      console.log(`Notes folder text: "${folderText?.trim()}"`);
      
      // Get the parent container of the notes folder
      const folderContainer = notesFolder.locator('xpath=..');
      
      // Look for ALL buttons in this container
      const allButtons = await folderContainer.locator('button').all();
      console.log(`Total buttons in notes folder container: ${allButtons.length}`);
      
      // Analyze each button
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const isVisible = await button.isVisible();
        const buttonHTML = await button.innerHTML();
        const className = await button.getAttribute('class');
        console.log(`Button ${i}: visible=${isVisible}`);
        console.log(`  HTML: ${buttonHTML}`);
        console.log(`  Class: ${className}`);
        console.log(`  ---`);
      }
      
      // Check if there's a chevron icon (toggle button)
      const chevronDown = folderContainer.locator('.lucide-chevron-down');
      const chevronRight = folderContainer.locator('.lucide-chevron-right');
      const hasChevronDown = await chevronDown.isVisible();
      const hasChevronRight = await chevronRight.isVisible();
      
      console.log(`Chevron indicators - Down: ${hasChevronDown}, Right: ${hasChevronRight}`);
      
      // Take initial screenshot
      await page.screenshot({ path: 'tests/screenshots/actual2-initial.png' });
      
      // Try clicking the first button (should be toggle if it exists)
      if (allButtons.length > 0) {
        const firstButton = allButtons[0];
        console.log('🖱️ Clicking first button (potential toggle)...');
        
        await firstButton.click();
        await page.waitForTimeout(1000);
        
        // Check state after click
        const hasChevronDownAfter = await chevronDown.isVisible();
        const hasChevronRightAfter = await chevronRight.isVisible();
        console.log(`After click - Down: ${hasChevronDownAfter}, Right: ${hasChevronRightAfter}`);
        
        // Take screenshot after click
        await page.screenshot({ path: 'tests/screenshots/actual2-after-click.png' });
        
        // Check for children visibility
        console.log('📁 Checking for folder children...');
        
        // Look for ideas.md which should be a child of notes folder
        const ideasFile = page.locator('[data-testid="file-tree-item-ideas.md"]');
        const ideasVisible = await ideasFile.isVisible();
        console.log(`Ideas.md file visible: ${ideasVisible}`);
        
        // Click again to see if it toggles back
        console.log('🖱️ Clicking toggle again...');
        await firstButton.click();
        await page.waitForTimeout(1000);
        
        const ideasVisibleAfterSecondClick = await ideasFile.isVisible();
        console.log(`Ideas.md visible after second click: ${ideasVisibleAfterSecondClick}`);
        
        await page.screenshot({ path: 'tests/screenshots/actual2-after-second-click.png' });
      }
      
      // Test hover behavior
      console.log('🖱️ Testing hover to see action buttons...');
      await notesFolder.hover();
      await page.waitForTimeout(500);
      
      // Check buttons again after hover
      const buttonsAfterHover = await folderContainer.locator('button').all();
      console.log(`Buttons visible after hover: ${buttonsAfterHover.length}`);
      
      // Look for opacity classes that might hide/show buttons
      for (let i = 0; i < buttonsAfterHover.length; i++) {
        const button = buttonsAfterHover[i];
        const isVisible = await button.isVisible();
        const title = await button.getAttribute('title');
        console.log(`Hover button ${i}: visible=${isVisible}, title="${title}"`);
      }
      
      await page.screenshot({ path: 'tests/screenshots/actual2-with-hover.png' });
      
    } else {
      console.log('❌ Notes folder not found');
      
      // Let's see the full file tree structure
      const fileTreeContent = await page.locator('.space-y-1').innerHTML();
      console.log('File tree structure:');
      console.log(fileTreeContent.substring(0, 500) + '...');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/actual2-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\\n✅ Actual Folder Toggle Test v2 Complete!');
  console.log('Check screenshots in tests/screenshots/:');
  console.log('- actual2-initial.png');
  console.log('- actual2-after-click.png');
  console.log('- actual2-after-second-click.png');
  console.log('- actual2-with-hover.png');

})();