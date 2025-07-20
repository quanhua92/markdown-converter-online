const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  console.log('🔍 Investigating why toggle button is not working...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('📂 Analyzing DOM structure...');
    
    // Find the notes folder by its test ID
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    
    if (await notesFolder.isVisible()) {
      console.log('✅ Found notes folder');
      
      // Get the parent container
      const container = notesFolder.locator('xpath=..');
      
      // Check the container's classes to confirm 'group' is present
      const containerClasses = await container.getAttribute('class');
      console.log(`Container classes: "${containerClasses}"`);
      
      // Find all buttons in the container
      const buttons = await container.locator('button').all();
      console.log(`Total buttons: ${buttons.length}`);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const buttonHTML = await button.innerHTML();
        const buttonClasses = await button.getAttribute('class');
        
        console.log(`\\nButton ${i}:`);
        console.log(`  HTML: ${buttonHTML}`);
        console.log(`  Classes: ${buttonClasses}`);
        
        // Check if this is the toggle button (first button, contains chevron)
        if (i === 0) {
          console.log(`  This is the TOGGLE button`);
          
          // Try clicking and listen for any JavaScript errors
          page.on('pageerror', (error) => {
            console.log(`❌ JavaScript error: ${error.message}`);
          });
          
          console.log(`  🖱️ Attempting to click toggle button...`);
          await button.click();
          await page.waitForTimeout(1000);
          
          // Check if button HTML changed (chevron direction)
          const buttonHTMLAfter = await button.innerHTML();
          console.log(`  HTML after click: ${buttonHTMLAfter}`);
          
          if (buttonHTML === buttonHTMLAfter) {
            console.log(`  ❌ Toggle button did not change - click event may not be working`);
          } else {
            console.log(`  ✅ Toggle button changed appearance`);
          }
        }
      }
      
      // Check if action buttons have the opacity-0 class
      console.log('\\n🎨 Checking action button visibility...');
      const actionButtons = await container.locator('button:not(:first-child)').all();
      
      for (let i = 0; i < actionButtons.length; i++) {
        const button = actionButtons[i];
        const isVisible = await button.isVisible();
        const computedStyle = await button.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            opacity: style.opacity,
            display: style.display,
            visibility: style.visibility
          };
        });
        
        console.log(`  Action button ${i}: visible=${isVisible}, opacity=${computedStyle.opacity}`);
      }
      
      // Test hover behavior
      console.log('\\n🖱️ Testing hover behavior...');
      await container.hover();
      await page.waitForTimeout(500);
      
      for (let i = 0; i < actionButtons.length; i++) {
        const button = actionButtons[i];
        const computedStyle = await button.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            opacity: style.opacity,
          };
        });
        
        console.log(`  Action button ${i} on hover: opacity=${computedStyle.opacity}`);
      }
      
    } else {
      console.log('❌ Notes folder not found');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  await page.close();
  await browser.close();
  console.log('\\n✅ Investigation Complete!');
})();