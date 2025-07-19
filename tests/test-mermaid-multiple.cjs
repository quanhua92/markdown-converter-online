#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testMultipleMermaidCharts() {
  console.log('🧪 Testing multiple Mermaid charts in Ultimate template...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Load Ultimate template
    console.log('📚 Loading Ultimate template...');
    // First click the dropdown trigger
    await page.click('[data-testid="template-select"], .select-trigger, button[role="combobox"]');
    await page.waitForTimeout(500);
    // Then click the Ultimate Showcase option
    await page.click('text=Ultimate Showcase');
    await page.waitForTimeout(3000); // Wait for template to load
    
    // Wait for any existing Mermaid diagrams to render
    await page.waitForTimeout(5000);
    
    // Count how many Mermaid diagrams are visible
    const mermaidDiagrams = await page.locator('.mermaid-diagram').count();
    console.log(`📊 Found ${mermaidDiagrams} Mermaid diagram containers`);
    
    // Count how many have actual SVG content
    const mermaidWithSvg = await page.locator('.mermaid-diagram svg').count();
    console.log(`✅ Found ${mermaidWithSvg} Mermaid diagrams with SVG content`);
    
    // Get details about each diagram
    for (let i = 0; i < mermaidDiagrams; i++) {
      const diagram = page.locator('.mermaid-diagram').nth(i);
      const hasContent = await diagram.locator('svg').count() > 0;
      const innerHTML = await diagram.innerHTML();
      console.log(`🔍 Diagram ${i + 1}: ${hasContent ? 'HAS SVG' : 'NO SVG'} (content length: ${innerHTML.length})`);
      
      if (innerHTML.length < 50) {
        console.log(`   Content: ${innerHTML}`);
      }
    }
    
    // Take screenshot for visual inspection
    const screenshotPath = path.join(__dirname, 'screenshots', 'mermaid-multiple-test.png');
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Check console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit more to catch any console errors
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('🚨 Console errors found:');
      errors.forEach(error => console.log(`   ${error}`));
    }
    
    // Summary
    if (mermaidWithSvg === 0) {
      console.log('❌ ISSUE: No Mermaid diagrams rendered!');
    } else if (mermaidWithSvg < mermaidDiagrams) {
      console.log(`⚠️  ISSUE: Only ${mermaidWithSvg} out of ${mermaidDiagrams} Mermaid diagrams rendered!`);
    } else {
      console.log(`✅ SUCCESS: All ${mermaidDiagrams} Mermaid diagrams rendered correctly!`);
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error);
  } finally {
    await browser.close();
  }
}

testMultipleMermaidCharts().then(() => {
  console.log('🎉 Multiple Mermaid test completed!');
}).catch(console.error);