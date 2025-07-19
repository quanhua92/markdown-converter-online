const { chromium } = require('playwright');

async function testFixes() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Testing fixes...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Test 1: Check editor is empty by default
    console.log('📝 Testing empty editor by default...');
    const textareaContent = await page.locator('textarea').inputValue();
    console.log('✅ Editor content:', textareaContent === '' ? 'EMPTY (correct)' : 'HAS CONTENT (incorrect)');
    
    // Test 2: Test print with Ultimate Showcase template
    console.log('🖨️ Testing print with Ultimate Showcase template...');
    
    // Load the Ultimate Showcase template
    const selectTrigger = page.locator('button:has-text("Load Template")').first();
    await selectTrigger.click();
    await page.waitForTimeout(500);
    
    const showcaseOption = page.locator('text=Ultimate Showcase');
    await showcaseOption.click();
    await page.waitForTimeout(1000);
    
    // Check that content is loaded
    const showcaseContent = await page.locator('textarea').inputValue();
    console.log('📋 Showcase template loaded:', showcaseContent.length > 1000 ? 'YES (large content)' : 'NO (small content)');
    
    // Test print functionality with large content
    console.log('🖨️ Testing print with large content...');
    
    // Click print button and wait for new page
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('button:has-text("Print")').first().click()
    ]);
    
    console.log('📄 Print page opened:', newPage.url());
    
    // Wait for the print page to load
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(2000);
    
    // Check if content is displayed in print page
    const printContent = await newPage.textContent('body');
    const hasUltimateShowcase = printContent?.includes('Ultimate Markdown & Mermaid Showcase');
    const hasMermaidDiagrams = printContent?.includes('Mermaid Diagrams');
    
    console.log('📋 Print page results:');
    console.log('  - Has showcase title:', hasUltimateShowcase ? 'YES' : 'NO');
    console.log('  - Has mermaid content:', hasMermaidDiagrams ? 'YES' : 'NO');
    console.log('  - Content length:', printContent?.length || 0);
    
    // Take screenshot of print page
    await newPage.screenshot({ 
      path: 'test-print-with-showcase.png',
      fullPage: true
    });
    console.log('📸 Print page screenshot saved');
    
    await newPage.close();
    
    // Test 3: Test editor stays empty after template usage
    console.log('🔄 Testing editor state...');
    
    // Clear the editor
    const clearButton = page.locator('button:has-text("Clear")');
    await clearButton.click();
    await page.waitForTimeout(500);
    
    const clearedContent = await page.locator('textarea').inputValue();
    console.log('✅ Editor after clear:', clearedContent === '' ? 'EMPTY (correct)' : 'STILL HAS CONTENT');
    
    console.log('✅ All tests completed');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testFixes().catch(console.error);