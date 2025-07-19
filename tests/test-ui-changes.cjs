#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');

async function testUIChanges() {
  console.log('🧪 Testing UI changes...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Check if the Export .md button exists
    const exportButton = await page.locator('text=Export .md').count();
    console.log(`✅ Export .md button found: ${exportButton > 0 ? 'YES' : 'NO'}`);
    
    // Check if the Print/PDF button exists in editor section
    const printButtonInEditor = await page.locator('.flex.gap-2.mb-4 >> text=Print/PDF').count();
    console.log(`✅ Print/PDF button in editor section: ${printButtonInEditor > 0 ? 'YES' : 'NO'}`);
    
    // Check if the old "Export MD and settings" text is gone
    const oldExportText = await page.locator('text=Export MD and settings').count();
    console.log(`✅ Old "Export MD and settings" text removed: ${oldExportText === 0 ? 'YES' : 'NO'}`);
    
    // Take screenshot of the editor section
    const editorCard = page.locator('.shadow-2xl').first();
    const screenshotPath = path.join(__dirname, 'screenshots', 'ui-changes-test.png');
    await editorCard.screenshot({ 
      path: screenshotPath
    });
    console.log(`📸 Editor section screenshot saved: ${screenshotPath}`);
    
    // Take full page screenshot
    const fullPageScreenshotPath = path.join(__dirname, 'screenshots', 'ui-changes-full-page.png');
    await page.screenshot({ 
      path: fullPageScreenshotPath, 
      fullPage: true 
    });
    console.log(`📸 Full page screenshot saved: ${fullPageScreenshotPath}`);
    
    // Summary
    if (exportButton > 0 && printButtonInEditor > 0 && oldExportText === 0) {
      console.log('✅ SUCCESS: All UI changes applied correctly!');
    } else {
      console.log('⚠️  ISSUE: Some UI changes may not have been applied correctly.');
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error);
  } finally {
    await browser.close();
  }
}

testUIChanges().then(() => {
  console.log('🎉 UI changes test completed!');
}).catch(console.error);