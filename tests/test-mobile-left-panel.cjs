const { chromium } = require('playwright');

async function testMobileLeftPanel() {
  console.log('📱 Testing mobile left panel in explorer...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
  
  // Track any errors
  let hasErrors = false;
  let errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    console.log(`📟 Console [${type}]:`, text);
    
    if (type === 'error' || text.includes('error') || text.includes('Error')) {
      hasErrors = true;
      errors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    console.log('❌ Page error:', error.message);
    hasErrors = true;
    errors.push(error.message);
  });
  
  try {
    // Navigate to explorer
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(5000); // Wait for full load
    
    console.log('📍 Navigated to explorer page on mobile viewport');
    
    // Take screenshot of initial mobile state
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-explorer-initial.png', 
      fullPage: true 
    });
    console.log('📸 Initial mobile screenshot taken');
    
    // Look for mobile menu button or hamburger button to open left panel
    const mobileMenuButton = await page.evaluate(() => {
      // Look for common mobile menu patterns
      const buttons = Array.from(document.querySelectorAll('button'));
      
      // Check for hamburger menu, menu button, or file tree toggle
      const menuButton = buttons.find(btn => {
        const text = btn.textContent || '';
        const classes = btn.className || '';
        const title = btn.title || '';
        
        return text.includes('Menu') || 
               text.includes('Files') ||
               classes.includes('menu') ||
               classes.includes('hamburger') ||
               title.includes('menu') ||
               title.includes('files') ||
               btn.getAttribute('data-testid')?.includes('menu') ||
               btn.getAttribute('data-testid')?.includes('file');
      });
      
      if (menuButton) {
        return {
          found: true,
          text: menuButton.textContent,
          className: menuButton.className,
          title: menuButton.title,
          testId: menuButton.getAttribute('data-testid')
        };
      }
      
      return { found: false };
    });
    
    console.log('🔍 Mobile menu button search result:', JSON.stringify(mobileMenuButton, null, 2));
    
    // Check for any sheet or drawer components
    const mobileSheetInfo = await page.evaluate(() => {
      // Look for sheet/drawer components
      const sheets = document.querySelectorAll('[data-testid*="sheet"], [class*="sheet"], [class*="drawer"], [class*="mobile"]');
      const dialogs = document.querySelectorAll('[role="dialog"], [data-testid*="dialog"]');
      
      return {
        sheetsFound: sheets.length,
        dialogsFound: dialogs.length,
        sheetElements: Array.from(sheets).map(el => ({
          tagName: el.tagName,
          className: el.className,
          testId: el.getAttribute('data-testid'),
          visible: el.offsetParent !== null
        })),
        dialogElements: Array.from(dialogs).map(el => ({
          tagName: el.tagName,
          className: el.className,
          testId: el.getAttribute('data-testid'),
          visible: el.offsetParent !== null
        }))
      };
    });
    
    console.log('📋 Mobile sheet/dialog info:', JSON.stringify(mobileSheetInfo, null, 2));
    
    // Look for workspace selector elements
    const workspaceInfo = await page.evaluate(() => {
      const workspaceElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        const className = el.className || '';
        return text.includes('Default Workspace') || 
               text.includes('Current workspace') ||
               text.includes('Unknown') ||
               (typeof className === 'string' && className.includes('workspace'));
      });
      
      return workspaceElements.map(el => ({
        tagName: el.tagName,
        className: el.className || '',
        textContent: el.textContent?.substring(0, 100),
        visible: el.offsetParent !== null,
        boundingBox: el.getBoundingClientRect()
      }));
    });
    
    console.log('💼 Workspace elements found:', JSON.stringify(workspaceInfo, null, 2));
    
    // Try to find and click any button that might open the left panel
    const clickableButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map((btn, index) => ({
        index,
        text: btn.textContent?.trim(),
        className: btn.className,
        title: btn.title,
        testId: btn.getAttribute('data-testid'),
        visible: btn.offsetParent !== null
      })).filter(btn => btn.visible);
    });
    
    console.log('🔘 Visible buttons found:', JSON.stringify(clickableButtons, null, 2));
    
    // Try clicking the file tree button specifically
    const fileTreeButton = clickableButtons.find(btn => 
      btn.title && btn.title.includes('Open file tree')
    );
    
    if (fileTreeButton) {
      console.log(`🖱️  Found file tree button - clicking index ${fileTreeButton.index}`);
      
      try {
        await page.click(`button >> nth=${fileTreeButton.index}`);
        await page.waitForTimeout(3000); // Wait longer for sheet to open
        
        // Take screenshot after clicking
        await page.screenshot({ 
          path: 'tests/screenshots/mobile-after-filetree-click.png', 
          fullPage: true 
        });
        console.log('📸 Screenshot taken after clicking file tree button');
        
        // Check if sheet opened
        const afterClick = await page.evaluate(() => {
          const sheets = document.querySelectorAll('[data-testid*="sheet"], [class*="sheet"], [class*="drawer"], [role="dialog"]');
          const workspaceElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent || '';
            return text.includes('Default Workspace') || text.includes('Current workspace');
          });
          
          return {
            sheetsVisible: Array.from(sheets).filter(el => el.offsetParent !== null).length,
            sheetsTotal: sheets.length,
            workspaceElementsVisible: workspaceElements.filter(el => el.offsetParent !== null).length,
            workspaceElementsTotal: workspaceElements.length,
            sheetDetails: Array.from(sheets).map(el => ({
              tagName: el.tagName,
              className: el.className || '',
              visible: el.offsetParent !== null,
              style: el.style.cssText,
              testId: el.getAttribute('data-testid')
            }))
          };
        });
        
        console.log('📊 After clicking file tree button:', JSON.stringify(afterClick, null, 2));
        
        // Check for any errors that might have occurred
        const errorCheck = await page.evaluate(() => {
          const errorMessages = [];
          
          // Check for React errors in console
          if (window.console && window.console.error) {
            // This won't work in practice, just for demonstration
          }
          
          // Check for visible error elements
          const errorElements = document.querySelectorAll('[class*="error"], .error-message, [data-testid*="error"]');
          return Array.from(errorElements).map(el => ({
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent?.substring(0, 100),
            visible: el.offsetParent !== null
          }));
        });
        
        if (errorCheck.length > 0) {
          console.log('⚠️  Error elements found:', JSON.stringify(errorCheck, null, 2));
        }
        
      } catch (error) {
        console.log(`❌ Failed to click file tree button:`, error.message);
        
        // Take screenshot of the error state
        await page.screenshot({ 
          path: 'tests/screenshots/mobile-click-error.png', 
          fullPage: true 
        });
      }
    } else {
      console.log('❌ No file tree button found');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-explorer-final.png', 
      fullPage: true 
    });
    
    // Report error status
    if (hasErrors) {
      console.log('\n🚨 ERRORS DETECTED:');
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ No errors detected in mobile view');
    }
    
    console.log('\n📱 Mobile left panel test completed');
    
  } catch (error) {
    console.error('❌ Mobile test error:', error.message);
  } finally {
    await browser.close();
  }
}

testMobileLeftPanel().catch(console.error);