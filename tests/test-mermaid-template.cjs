const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🧪 Testing Ultimate template Mermaid diagrams...');
  
  // Listen for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Load the Ultimate Showcase template
  console.log('📋 Loading Ultimate Showcase template...');
  
  // Click on the template dropdown
  await page.click('text=Load Template');
  await page.waitForTimeout(1000);
  
  // Select Ultimate Showcase
  await page.click('text=Ultimate Showcase');
  await page.waitForTimeout(3000); // Wait longer for Mermaid to render
  
  console.log('🔍 Checking for Mermaid errors...');
  
  // Check for Mermaid error elements
  const mermaidErrors = await page.locator('.text-red-500').count();
  console.log(`Found ${mermaidErrors} Mermaid error messages`);
  
  if (mermaidErrors > 0) {
    console.log('❌ Mermaid errors found:');
    for (let i = 0; i < mermaidErrors; i++) {
      const errorText = await page.locator('.text-red-500').nth(i).textContent();
      console.log(`   Error ${i + 1}: ${errorText}`);
    }
  }
  
  // Check console errors
  if (consoleErrors.length > 0) {
    console.log('❌ Console errors found:');
    consoleErrors.forEach((error, i) => {
      console.log(`   Console Error ${i + 1}: ${error}`);
    });
  }
  
  // Count successful Mermaid diagrams
  const mermaidDiagrams = await page.locator('.mermaid-diagram svg').count();
  console.log(`✅ Successfully rendered ${mermaidDiagrams} Mermaid diagrams`);
  
  // Take a screenshot for inspection
  await page.screenshot({ path: 'tests/screenshots/mermaid-template-test.png', fullPage: true });
  console.log('📸 Screenshot saved for visual inspection');
  
  // Summary
  if (mermaidErrors === 0 && consoleErrors.length === 0) {
    console.log('🎉 All Mermaid diagrams rendered successfully!');
  } else {
    console.log('⚠️  Some Mermaid diagrams have errors and need fixing');
  }
  
  await browser.close();
  console.log('🎉 Mermaid template test completed!');
})();