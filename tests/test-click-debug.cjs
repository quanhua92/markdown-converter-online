const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  console.log('🔍 Testing click event handling...');

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Capture all console logs
  page.on('console', (msg) => {
    console.log(`BROWSER CONSOLE: ${msg.text()}`);
  });

  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    console.log('📂 Testing different click methods...');
    
    // Find the notes folder
    const notesFolder = page.locator('[data-testid="file-tree-item-notes"]');
    const notesFolderExists = await notesFolder.isVisible();
    
    if (notesFolderExists) {
      console.log('✅ Found notes folder');
      
      // Get folder container and first button (toggle button)
      const folderContainer = notesFolder.locator('xpath=..');
      const toggleButton = folderContainer.locator('button').first();
      
      // Method 1: Click the button element
      console.log('🖱️ Method 1: Clicking button element...');
      try {
        await toggleButton.click();
        await page.waitForTimeout(2000); // Wait longer for console logs
        console.log('  Button click completed');
      } catch (error) {
        console.log('  Button click failed:', error.message);
      }
      
      // Method 2: Click using JavaScript
      console.log('🖱️ Method 2: Clicking with JavaScript...');
      try {
        await toggleButton.evaluate(button => {
          console.log('🔧 JS: About to click button');
          button.click();
          console.log('🔧 JS: Button clicked');
        });
        await page.waitForTimeout(2000);
        console.log('  JavaScript click completed');
      } catch (error) {
        console.log('  JavaScript click failed:', error.message);
      }
      
      // Method 3: Trigger click event manually
      console.log('🖱️ Method 3: Triggering click event...');
      try {
        await toggleButton.evaluate(button => {
          console.log('🔧 JS: Dispatching click event');
          const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          button.dispatchEvent(event);
          console.log('🔧 JS: Click event dispatched');
        });
        await page.waitForTimeout(2000);
        console.log('  Event dispatch completed');
      } catch (error) {
        console.log('  Event dispatch failed:', error.message);
      }
      
      // Method 4: Check if the button actually has the onClick handler
      console.log('🔍 Method 4: Checking button properties...');
      const buttonInfo = await toggleButton.evaluate(button => {
        return {
          tagName: button.tagName,
          outerHTML: button.outerHTML.substring(0, 200),
          hasOnClick: typeof button.onclick === 'function',
          eventListeners: button.getEventListeners ? Object.keys(button.getEventListeners()) : 'not available'
        };
      });
      console.log('  Button info:', JSON.stringify(buttonInfo, null, 2));
      
    } else {
      console.log('❌ Notes folder not found');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  await page.close();
  await browser.close();
  console.log('\\n✅ Click Debug Test Complete!');
})();