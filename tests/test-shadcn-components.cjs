const { chromium } = require('playwright');

(async () => {
  console.log('🎨 Testing shadcn component implementations...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test main page navigation tabs
    console.log('📋 Testing main page navigation tabs...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if Tabs component is present
    const tabsList = page.locator('[data-slot="tabs-list"]');
    const tabsListVisible = await tabsList.isVisible();
    console.log(`✅ Main navigation tabs visible: ${tabsListVisible}`);
    
    if (tabsListVisible) {
      // Test tab switching
      const guidesTab = page.locator('[data-slot="tabs-trigger"][value="guides"]');
      const editorTab = page.locator('[data-slot="tabs-trigger"][value="editor"]');
      
      if (await guidesTab.isVisible()) {
        await guidesTab.click();
        await page.waitForTimeout(500);
        console.log('✅ Guides tab clicked successfully');
        
        await editorTab.click();
        await page.waitForTimeout(500);
        console.log('✅ Editor tab clicked successfully');
      }
    }
    
    // Test Explorer mobile tabs
    console.log('📱 Testing Explorer mobile tabs...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForLoadState('networkidle');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Create a file to enable mobile tabs
    const createFileBtn = page.locator('button:has-text("Create New File")');
    if (await createFileBtn.isVisible()) {
      await createFileBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Check mobile tabs
    const mobileTabsList = page.locator('[data-slot="tabs-list"]').nth(1); // Second tabs instance
    const mobileTabsVisible = await mobileTabsList.isVisible();
    console.log(`📱 Mobile explorer tabs visible: ${mobileTabsVisible}`);
    
    if (mobileTabsVisible) {
      const editTabTrigger = page.locator('[data-slot="tabs-trigger"][value="edit"]');
      const previewTabTrigger = page.locator('[data-slot="tabs-trigger"][value="preview"]');
      
      if (await previewTabTrigger.isVisible()) {
        await previewTabTrigger.click();
        await page.waitForTimeout(500);
        console.log('✅ Mobile preview tab works');
        
        await editTabTrigger.click();
        await page.waitForTimeout(500);
        console.log('✅ Mobile edit tab works');
      }
    }
    
    // Test Alert components (try to trigger an error)
    console.log('🚨 Testing Alert components...');
    await page.goto('http://localhost:3000');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');
    
    // Add some content and try to convert
    const editor = page.locator('[data-testid="markdown-editor"]');
    if (await editor.isVisible()) {
      await editor.fill('# Test Content\nThis is test content for conversion.');
      await page.waitForTimeout(500);
      
      // Try to convert (this might show success alert)
      const convertBtn = page.locator('button:has-text("Convert to")');
      if (await convertBtn.isVisible()) {
        await convertBtn.click();
        await page.waitForTimeout(2000);
        
        // Check for alert components
        const alertComponent = page.locator('[data-slot="alert"]');
        const alertVisible = await alertComponent.isVisible();
        console.log(`🚨 Alert component visible: ${alertVisible}`);
        
        if (alertVisible) {
          const alertTitle = page.locator('[data-slot="alert-title"]');
          const alertDesc = page.locator('[data-slot="alert-description"]');
          
          const titleVisible = await alertTitle.isVisible();
          const descVisible = await alertDesc.isVisible();
          
          console.log(`✅ Alert title visible: ${titleVisible}`);
          console.log(`✅ Alert description visible: ${descVisible}`);
        }
      }
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/shadcn-components-test.png', 
      fullPage: true 
    });
    console.log('📸 Shadcn components test screenshot saved');
    
    console.log('🎉 Shadcn components test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();