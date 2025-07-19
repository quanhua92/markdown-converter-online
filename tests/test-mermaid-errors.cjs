const { chromium } = require('playwright');

async function testMermaidErrors() {
  console.log('🔍 Debugging Mermaid Errors in Ultimate Template...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  // Capture console logs
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Click "Try Ultimate Template" button
    await page.click('button:has-text("Try Ultimate Template")');
    await page.waitForTimeout(2000);

    // Switch to Preview
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(5000); // Give more time for Mermaid

    // Get the raw markdown content to see what's wrong
    console.log('📝 Getting markdown content...');
    await page.click('button:has-text("Edit")');
    await page.waitForTimeout(1000);
    
    const markdownTextarea = await page.$('textarea');
    const markdownContent = await markdownTextarea.inputValue();
    
    // Find Mermaid blocks in markdown
    const mermaidBlocks = markdownContent.match(/```mermaid[\s\S]*?```/g);
    console.log(`Found ${mermaidBlocks ? mermaidBlocks.length : 0} Mermaid blocks in markdown\n`);

    if (mermaidBlocks) {
      mermaidBlocks.forEach((block, index) => {
        console.log(`--- Mermaid Block ${index + 1} ---`);
        console.log(block.substring(0, 200) + (block.length > 200 ? '...' : ''));
        console.log('');
      });
    }

    // Switch back to preview and check errors
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(3000);

    // Look for specific error containers
    const errorElements = await page.$$('.mermaid-error, .mermaid-parse-error, pre:has-text("Failed to render diagram")');
    
    console.log(`Found ${errorElements.length} error elements\n`);

    // Get error details
    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      console.log(`Error ${i + 1}:`);
      console.log(errorText);
      console.log('---\n');
    }

    // Check console messages for Mermaid errors
    console.log('Console Messages:');
    const mermaidErrors = consoleMessages.filter(msg => 
      msg.toLowerCase().includes('mermaid') || 
      msg.toLowerCase().includes('parse') ||
      msg.toLowerCase().includes('diagram')
    );
    
    mermaidErrors.forEach(msg => {
      console.log(`  ${msg}`);
    });

    if (mermaidErrors.length === 0) {
      console.log('  No Mermaid-related console errors found');
    }

    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mermaid-debug.png', 
      fullPage: true 
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testMermaidErrors().catch(console.error);