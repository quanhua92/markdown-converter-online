const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🔍 Examining Notes Folder Buttons in Detail...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to explorer
    console.log('1️⃣ Loading explorer page...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    // Look specifically at the notes folder
    console.log('2️⃣ Examining notes folder in detail...');
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    
    if (await notesFolder.isVisible()) {
      console.log('✅ Notes folder found');
      
      // Get the parent row container
      const notesRow = notesFolder.locator('..');
      
      // Count and examine all buttons in the notes row
      const buttons = await notesRow.locator('button').all();
      console.log(`   Total buttons in notes row: ${buttons.length}`);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        
        try {
          const title = await button.getAttribute('title');
          const className = await button.getAttribute('class');
          const innerHTML = await button.innerHTML();
          const isVisible = await button.isVisible();
          const boundingBox = await button.boundingBox();
          
          console.log(`\n   Button ${i + 1}:`);
          console.log(`     Title: ${title || 'none'}`);
          console.log(`     Class: ${className || 'none'}`);
          console.log(`     Visible: ${isVisible}`);
          console.log(`     Size: ${boundingBox ? `${boundingBox.width}x${boundingBox.height}` : 'null'}`);
          console.log(`     HTML: ${innerHTML.substring(0, 150)}...`);
        } catch (error) {
          console.log(`   Button ${i + 1}: Error examining - ${error.message}`);
        }
      }
      
      // Look for any MoreVertical icons specifically
      const moreVerticalInRow = await notesRow.locator('svg').all();
      console.log(`\n   SVG icons in notes row: ${moreVerticalInRow.length}`);
      
      for (let i = 0; i < moreVerticalInRow.length; i++) {
        const svg = moreVerticalInRow[i];
        try {
          const classes = await svg.getAttribute('class');
          const innerHTML = await svg.innerHTML();
          console.log(`   SVG ${i + 1}: ${classes || 'no class'} - ${innerHTML.substring(0, 100)}...`);
        } catch (error) {
          console.log(`   SVG ${i + 1}: Error examining - ${error.message}`);
        }
      }
      
      // Take a focused screenshot of just the notes row
      await notesRow.screenshot({ path: 'tests/screenshots/notes-folder-detailed.png' });
      
      // Try to click on the notes folder to expand it and see if children appear
      console.log('\n3️⃣ Testing click on notes folder...');
      await notesFolder.click();
      await page.waitForTimeout(1000);
      
      const notesChildren = await page.locator('[data-testid^="file-tree-item-notes/"]').count();
      console.log(`   Children after click: ${notesChildren}`);
      
      await page.screenshot({ path: 'tests/screenshots/notes-folder-after-click.png' });
      
    } else {
      console.log('❌ Notes folder not found');
    }
    
    // Also check if MoreVertical icon is imported in any JavaScript files
    console.log('\n4️⃣ Checking for MoreVertical in page source...');
    const pageSource = await page.content();
    const hasMoreVertical = pageSource.includes('MoreVertical');
    const hasMoreActions = pageSource.includes('More actions');
    const hasIsMenuOpen = pageSource.includes('isMenuOpen');
    
    console.log(`   Page contains "MoreVertical": ${hasMoreVertical}`);
    console.log(`   Page contains "More actions": ${hasMoreActions}`);
    console.log(`   Page contains "isMenuOpen": ${hasIsMenuOpen}`);
    
    console.log('\n✅ Notes folder examination completed');

  } catch (error) {
    console.log('❌ Test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/notes-folder-error.png' });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Screenshots saved in tests/screenshots/notes-folder-*');
  console.log('🔍 Check console output for detailed button analysis.');

})();