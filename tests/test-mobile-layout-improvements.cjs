const { chromium } = require('playwright');

(async () => {
  console.log('📱 Testing mobile layout improvements...');
  
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
    
    // Take screenshot of initial mobile layout
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-layout-initial.png', 
      fullPage: true 
    });
    console.log('📸 Initial mobile layout screenshot taken');
    
    // Create a file to test the layout with content
    const createFileBtn = page.locator('button:has-text("Create New File")');
    if (await createFileBtn.isVisible()) {
      await createFileBtn.click();
      await page.waitForTimeout(1000);
      console.log('📁 Created new file');
      
      // Close the mobile sheet
      const closeButton = page.locator('[data-slot="sheet-close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
        console.log('📋 Closed mobile sheet');
      }
    }
    
    // Test the improved mobile header layout
    const header = page.locator('.bg-white.dark\\:bg-gray-800').first();
    await header.screenshot({ path: 'tests/screenshots/mobile-header-improved.png' });
    console.log('📸 Mobile header screenshot taken');
    
    // Check if the file info is visible
    const fileInfo = page.locator('text=Editing:');
    const fileInfoVisible = await fileInfo.isVisible();
    console.log(`📄 File info visible: ${fileInfoVisible}`);
    
    // Check mobile tabs layout
    const tabsList = page.locator('[data-slot="tabs-list"]');
    const tabsVisible = await tabsList.isVisible();
    console.log(`📋 Mobile tabs visible: ${tabsVisible}`);
    
    // Check mobile action buttons below tabs
    const saveButton = page.locator('button:has-text("Save")');
    const exportButton = page.locator('button:has-text("Export")');
    const printButton = page.locator('button:has-text("Print")');
    
    const saveVisible = await saveButton.isVisible();
    const exportVisible = await exportButton.isVisible();
    const printVisible = await printButton.isVisible();
    
    console.log(`💾 Save button visible: ${saveVisible}`);
    console.log(`📤 Export button visible: ${exportVisible}`);
    console.log(`🖨️  Print button visible: ${printVisible}`);
    
    // Test mobile tabs functionality
    if (tabsVisible) {
      const previewTab = page.locator('[data-slot="tabs-trigger"][value="preview"]');
      if (await previewTab.isVisible()) {
        await previewTab.click();
        await page.waitForTimeout(500);
        console.log('👁️  Switched to preview tab');
        
        await page.screenshot({ 
          path: 'tests/screenshots/mobile-layout-preview.png', 
          fullPage: true 
        });
        console.log('📸 Mobile preview layout screenshot taken');
        
        // Switch back to edit
        const editTab = page.locator('[data-slot="tabs-trigger"][value="edit"]');
        await editTab.click();
        await page.waitForTimeout(500);
        console.log('✏️  Switched back to edit tab');
      }
    }
    
    // Test action buttons functionality
    if (saveVisible) {
      await saveButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Save button clicked successfully');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-layout-final.png', 
      fullPage: true 
    });
    console.log('📸 Final mobile layout screenshot taken');
    
    console.log('🎉 Mobile layout improvements test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();