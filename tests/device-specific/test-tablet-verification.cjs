const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('📱 TABLET VERIFICATION - iPad Testing');
  console.log('Testing 3-dots menu functionality on tablet viewport');

  const page = await browser.newPage();
  
  // Set iPad viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  
  // Set iPad user agent
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  try {
    console.log('\n1️⃣ Loading on tablet viewport...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/tablet-step1-initial.png', fullPage: true });
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/screenshots/tablet-step2-welcome.png', fullPage: true });
    
    console.log('2️⃣ Creating workspace on tablet...');
    
    const projectTemplate = page.locator('[data-testid="quick-template-project-notes"]');
    if (await projectTemplate.isVisible()) {
      await projectTemplate.click();
      await page.waitForTimeout(4000);
    }
    
    await page.screenshot({ path: 'tests/screenshots/tablet-step3-workspace-loaded.png', fullPage: true });
    
    console.log('3️⃣ Testing touch interaction on tablet...');
    
    const docsFolder = page.locator('[data-testid="file-tree-item-docs"]');
    if (await docsFolder.isVisible()) {
      // On tablet, tap instead of hover
      await docsFolder.tap();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'tests/screenshots/tablet-step4-docs-tapped.png', fullPage: true });
      
      // Look for 3-dots button
      const moreButton = docsFolder.locator('button').last();
      if (await moreButton.isVisible()) {
        console.log('   Found 3-dots button on tablet');
        await moreButton.tap();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'tests/screenshots/tablet-step5-dropdown-open.png', fullPage: true });
        
        // Test collapse
        const collapseBtn = page.locator('button:has-text("Collapse")');
        if (await collapseBtn.isVisible()) {
          await collapseBtn.tap();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'tests/screenshots/tablet-step6-collapsed.png', fullPage: true });
        }
      }
    }
    
    console.log('\n✅ TABLET TESTING COMPLETED');

  } catch (error) {
    console.log('❌ Tablet test error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/tablet-error.png', fullPage: true });
  }

  await page.close();
  await browser.close();

  console.log('\n📁 Tablet test screenshots saved to tests/screenshots/tablet-step*.png');

})();