import { chromium } from 'playwright';

async function debugTest() {
  console.log('🔍 Starting comprehensive debug test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check if we're loading the debug version
    console.log('🔍 Checking for debug elements...');
    
    // Check for debug banner
    const debugBanner = await page.locator('.bg-red-500').count();
    console.log(`Debug banner count: ${debugBanner}`);
    
    // Check for debug boxes
    const debugBoxes = await page.locator('.bg-yellow-300').count();
    console.log(`Debug boxes count: ${debugBoxes}`);
    
    // Check for build info
    const buildInfo = await page.locator('.bg-purple-500').count();
    console.log(`Build info count: ${buildInfo}`);
    
    // Check for Preview/Print buttons in converter view
    console.log('🔍 Looking for Preview/Print buttons...');
    
    // Navigate to Editor view to check if buttons exist there
    const editorButton = await page.locator('button:has-text("Editor")').first();
    const editorExists = await editorButton.isVisible();
    console.log(`Editor button exists: ${editorExists}`);
    
    if (!editorExists) {
      console.log('🔍 Editor button not found in navigation, checking if Editor view is accessible...');
      
      // Try to navigate to editor view directly
      await page.goto('http://localhost:3000/editor');
      await page.waitForTimeout(1000);
      
      const pageTitle = await page.title();
      console.log(`Editor page title: ${pageTitle}`);
      
      // Check for Preview/Print buttons in editor view
      const previewButton = await page.locator('button:has-text("Preview")').count();
      const printButton = await page.locator('button:has-text("Print")').count();
      console.log(`Preview buttons in editor: ${previewButton}`);
      console.log(`Print buttons in editor: ${printButton}`);
      
      // Go back to main page
      await page.goto('http://localhost:3000');
      await page.waitForTimeout(1000);
    }
    
    // Check the actual HTML content
    const htmlContent = await page.content();
    
    // Check for specific debug content
    const hasDebugBanner = htmlContent.includes('GIANT DEBUG BANNER');
    const hasDebugBoxes = htmlContent.includes('Debug Box');
    const hasBuildInfo = htmlContent.includes('BUILD INFO');
    
    console.log(`HTML contains debug banner: ${hasDebugBanner}`);
    console.log(`HTML contains debug boxes: ${hasDebugBoxes}`);
    console.log(`HTML contains build info: ${hasBuildInfo}`);
    
    // Check console logs from the page
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('🔍 Browser console logs:');
    logs.forEach(log => console.log(`  ${log}`));
    
    // Check if we can see the footer
    const footer = await page.locator('text=Powered by Marp CLI and Pandoc').count();
    console.log(`Footer count: ${footer}`);
    
    if (footer > 0) {
      const footerText = await page.locator('text=Powered by Marp CLI and Pandoc').textContent();
      console.log(`Footer text: ${footerText}`);
    }
    
    await page.screenshot({ path: 'playwright-debug-screenshot.png', fullPage: true });
    console.log('✅ Debug screenshot saved as playwright-debug-screenshot.png');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await browser.close();
  }
}

debugTest().catch(console.error);