const { chromium } = require('playwright');

async function testIssues() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('🚀 Navigating to app...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Test 1: Dark mode background and text readability
    console.log('🌙 Testing dark mode background and text readability...');
    
    // Take light mode screenshot first
    await page.screenshot({ 
      path: 'test-light-mode.png',
      fullPage: true
    });
    console.log('📸 Light mode screenshot saved');
    
    // Switch to dark mode
    const darkModeButton = page.locator('button:has-text("Dark")');
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    
    // Take dark mode screenshot
    await page.screenshot({ 
      path: 'test-dark-mode.png',
      fullPage: true
    });
    console.log('📸 Dark mode screenshot saved');
    
    // Check background color of main container
    const mainBg = await page.locator('div.min-h-screen').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage
      };
    });
    console.log('🎨 Main background styles:', mainBg);
    
    // Check card background colors
    const cardBg = await page.locator('[data-slot="card"]').first().evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        color: styles.color
      };
    });
    console.log('🃏 Card background styles:', cardBg);
    
    // Test 2: Print/PDF functionality
    console.log('🖨️ Testing Print/PDF functionality...');
    
    // Add some test content first
    const textarea = page.locator('textarea');
    await textarea.fill('# Test Document\n\nThis is a test for print functionality.\n\n## Sample Content\n\n- Item 1\n- Item 2\n- Item 3');
    await page.waitForTimeout(500);
    
    // Try to click Print/PDF button
    const printButton = page.locator('button:has-text("Print")');
    const printButtonExists = await printButton.count() > 0;
    console.log('🔍 Print button exists:', printButtonExists);
    
    if (printButtonExists) {
      console.log('🖱️ Clicking Print/PDF button...');
      
      // Listen for new page (popup)
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        printButton.click()
      ]);
      
      console.log('📄 New print page opened:', newPage.url());
      
      // Wait for the print page to load
      await newPage.waitForLoadState('networkidle');
      
      // Take screenshot of print page
      await newPage.screenshot({ 
        path: 'test-print-page.png',
        fullPage: true
      });
      console.log('📸 Print page screenshot saved');
      
      await newPage.close();
    } else {
      console.log('❌ Print button not found');
      
      // Look for any buttons containing "Print"
      const allButtons = await page.locator('button').allTextContents();
      console.log('🔍 All buttons found:', allButtons);
    }
    
    // Test navigation and check if Print button is in settings or elsewhere
    console.log('🔍 Checking if Print button is in settings...');
    const settingsButton = page.locator('button:has-text("Settings")');
    const settingsExists = await settingsButton.count() > 0;
    
    if (settingsExists) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      
      const printInSettings = page.locator('button:has-text("Print")');
      const printInSettingsExists = await printInSettings.count() > 0;
      console.log('🔍 Print button in settings:', printInSettingsExists);
      
      if (printInSettingsExists) {
        console.log('🖱️ Clicking Print/PDF in settings...');
        
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          printInSettings.click()
        ]);
        
        console.log('📄 Print page from settings opened:', newPage.url());
        await newPage.close();
      }
    }
    
    console.log('✅ Testing completed');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testIssues().catch(console.error);