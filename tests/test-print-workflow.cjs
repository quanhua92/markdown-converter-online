#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');

async function testPrintWorkflow() {
  console.log('🧪 Testing complete print workflow...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to main page and load Ultimate template
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('📚 Loading Ultimate template...');
    await page.click('button[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('text=Ultimate Showcase');
    await page.waitForTimeout(3000);
    
    // Wait for Mermaid diagrams to render in main preview
    await page.waitForTimeout(3000);
    
    // Count diagrams in main preview
    const previewDiagrams = await page.locator('.mermaid-diagram svg').count();
    console.log(`📊 Main preview has ${previewDiagrams} rendered Mermaid diagrams`);
    
    // Now test print mode by simulating the print button click
    console.log('🖨️ Testing print mode...');
    
    // Set up popup handler before clicking print
    const printPagePromise = context.waitForEvent('page');
    
    // Click the print button
    await page.click('text=Print/PDF');
    
    // Wait for print page to open
    const printPage = await printPagePromise;
    await printPage.waitForLoadState('networkidle');
    
    // Wait for Mermaid to render in print mode
    await printPage.waitForTimeout(5000);
    
    // Count diagrams in print mode
    const printDiagrams = await printPage.locator('.mermaid-diagram').count();
    const printSvgDiagrams = await printPage.locator('.mermaid-diagram svg').count();
    
    console.log(`📊 Print mode has ${printDiagrams} diagram containers`);
    console.log(`✅ Print mode has ${printSvgDiagrams} rendered SVG diagrams`);
    
    // Check if content exists in print mode
    const printContent = await printPage.textContent('body');
    const hasUltimateContent = printContent.includes('Ultimate Markdown & Mermaid Showcase');
    console.log(`📝 Print mode has Ultimate content: ${hasUltimateContent ? 'YES' : 'NO'}`);
    
    // Take screenshots
    const printScreenshotPath = path.join(__dirname, 'screenshots', 'print-workflow-test.png');
    await printPage.screenshot({ 
      path: printScreenshotPath, 
      fullPage: true 
    });
    console.log(`📸 Print workflow screenshot saved: ${printScreenshotPath}`);
    
    // Summary
    if (previewDiagrams > 0 && printSvgDiagrams > 0 && hasUltimateContent) {
      console.log(`✅ SUCCESS: Print workflow works! Preview: ${previewDiagrams} diagrams, Print: ${printSvgDiagrams} diagrams`);
    } else {
      console.log(`⚠️  ISSUE: Print workflow has problems. Preview: ${previewDiagrams}, Print: ${printSvgDiagrams}, Content: ${hasUltimateContent}`);
    }
    
    await printPage.close();
    
  } catch (error) {
    console.error('🚨 Test error:', error);
  } finally {
    await browser.close();
  }
}

testPrintWorkflow().then(() => {
  console.log('🎉 Print workflow test completed!');
}).catch(console.error);