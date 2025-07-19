const { chromium } = require('playwright');

async function testUltimateTemplate() {
  console.log('🚀 Testing Ultimate Template Mermaid Diagrams...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    // Navigate to the application
    console.log('📱 Loading application...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Application loaded successfully\n');

    // Click "Try Ultimate Template" button
    console.log('🎯 Loading Ultimate Template...');
    await page.click('button:has-text("Try Ultimate Template")');
    await page.waitForTimeout(2000); // Wait for template to load
    console.log('✅ Ultimate Template loaded\n');

    // Switch to Preview tab to see rendered content
    console.log('👁️ Switching to Preview...');
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(3000); // Wait for preview to render
    console.log('✅ Preview loaded\n');

    // Wait for Mermaid diagrams to render
    console.log('🔄 Waiting for Mermaid diagrams to render...');
    await page.waitForTimeout(5000); // Give Mermaid time to render

    // Check for failed diagram renderings
    console.log('🔍 Checking for failed Mermaid diagrams...\n');

    // Look for error messages in the preview
    const errorElements = await page.$$('text="Failed to render diagram"');
    const syntaxErrorElements = await page.$$('text="syntax error"');
    const parseErrorElements = await page.$$('text="Parse error"');
    const mermaidErrorElements = await page.$$('.mermaid-error, [data-processed="false"]');

    console.log(`Found ${errorElements.length} "Failed to render diagram" errors`);
    console.log(`Found ${syntaxErrorElements.length} "syntax error" messages`);
    console.log(`Found ${parseErrorElements.length} "Parse error" messages`);
    console.log(`Found ${mermaidErrorElements.length} unprocessed Mermaid elements\n`);

    // Check for Mermaid SVG elements (successful renders)
    const mermaidSvgs = await page.$$('.mermaid svg');
    console.log(`✅ Found ${mermaidSvgs.length} successfully rendered Mermaid diagrams\n`);

    // Scroll through the preview to check all diagrams
    console.log('📜 Scrolling through preview to check all diagrams...');
    
    // Scroll down gradually to load all content
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(500);
    }

    // Final check for errors after scrolling
    const finalErrorCheck = await page.$$('text="Failed to render diagram"');
    const finalSyntaxCheck = await page.$$('text="syntax error"');
    
    console.log('\n📊 Final Results:');
    console.log(`❌ Total diagram errors: ${finalErrorCheck.length + finalSyntaxCheck.length}`);
    console.log(`✅ Successfully rendered diagrams: ${mermaidSvgs.length}`);

    // Take a screenshot for debugging
    await page.screenshot({ 
      path: 'tests/screenshots/ultimate-template-test.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: tests/screenshots/ultimate-template-test.png');

    // Check for specific error messages and log them
    if (finalErrorCheck.length > 0 || finalSyntaxCheck.length > 0) {
      console.log('\n⚠️ ISSUES DETECTED:');
      
      // Get error text content
      for (let errorElement of finalErrorCheck) {
        const errorText = await errorElement.textContent();
        console.log(`   • Error: ${errorText}`);
      }
      
      for (let errorElement of finalSyntaxCheck) {
        const errorText = await errorElement.textContent();
        console.log(`   • Syntax Error: ${errorText}`);
      }

      // Try to get the actual error messages from console
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('mermaid')) {
          console.log(`   • Console Error: ${msg.text()}`);
        }
      });

      console.log('\n🔧 ACTION REQUIRED: Fix Mermaid diagram syntax errors in ultimate template');
    } else {
      console.log('\n🎉 SUCCESS: All Mermaid diagrams rendered correctly!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testUltimateTemplate().catch(console.error);