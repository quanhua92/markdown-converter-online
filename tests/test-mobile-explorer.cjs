const { chromium } = require('playwright');

(async () => {
  console.log('📱 Testing mobile explorer functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE size
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  try {
    // Navigate to explorer route
    await page.goto('http://localhost:3000/explorer');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully');
    
    // Test mobile menu button visibility
    const mobileMenuButton = page.locator('button[title="Open file tree"]');
    const isVisible = await mobileMenuButton.isVisible();
    console.log(`📱 Mobile menu button visible: ${isVisible}`);
    
    // Test if desktop collapsible panel is hidden
    const desktopPanel = page.locator('.hidden.lg\\:block');
    const desktopHidden = await desktopPanel.count() > 0;
    console.log(`🖥️  Desktop panel properly hidden on mobile: ${desktopHidden}`);
    
    // Test mobile sheet functionality
    if (isVisible) {
      console.log('🔄 Testing mobile sheet functionality...');
      await mobileMenuButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Check if sheet content is visible
      const sheetContent = page.locator('[data-slot="sheet-content"]');
      const sheetVisible = await sheetContent.isVisible();
      console.log(`📋 Mobile sheet opened: ${sheetVisible}`);
      
      // Check if file tree is present in sheet
      if (sheetVisible) {
        const fileTreeInSheet = await sheetContent.locator('h2:has-text("Files")').isVisible();
        console.log(`📂 File tree visible in sheet: ${fileTreeInSheet}`);
        
        // Test closing the sheet
        const closeButton = page.locator('[data-slot="sheet-close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(300);
          const sheetClosed = !(await sheetContent.isVisible());
          console.log(`❌ Sheet closes properly: ${sheetClosed}`);
        }
      }
    }
    
    // Create a file to enable mobile tabs
    const createFileBtn = page.locator('button:has-text("Create New File")');
    if (await createFileBtn.isVisible()) {
      await createFileBtn.click();
      await page.waitForTimeout(1000);
      console.log('📁 Created new file for testing');
      
      // Close the sheet by clicking the close button or outside
      const closeButton = page.locator('[data-slot="sheet-close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
        console.log('📋 Closed mobile sheet after file creation');
      }
    }

    // Test mobile tab functionality
    console.log('📋 Testing mobile tab functionality...');
    const tabsList = page.locator('[data-slot="tabs-list"]');
    const editTab = page.locator('[data-slot="tabs-trigger"][value="edit"]');
    const previewTab = page.locator('[data-slot="tabs-trigger"][value="preview"]');
    
    const tabsListVisible = await tabsList.isVisible();
    const editTabVisible = await editTab.isVisible();
    const previewTabVisible = await previewTab.isVisible();
    
    console.log(`📋 Tabs container visible: ${tabsListVisible}`);
    console.log(`✏️  Edit tab visible: ${editTabVisible}`);
    console.log(`👁️  Preview tab visible: ${previewTabVisible}`);
    
    if (editTabVisible && previewTabVisible) {
      // Test tab switching
      await previewTab.click();
      await page.waitForTimeout(500);
      
      const previewState = await previewTab.getAttribute('data-state');
      console.log(`🎯 Preview tab activation working: ${previewState === 'active'}`);
      
      // Switch back to edit
      await editTab.click();
      await page.waitForTimeout(500);
      
      const editState = await editTab.getAttribute('data-state');
      console.log(`✏️  Edit tab activation working: ${editState === 'active'}`);
    }
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-explorer.png', 
      fullPage: true 
    });
    console.log('📸 Mobile screenshot saved');
    
    console.log('🎉 Mobile explorer test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();