const { chromium } = require('playwright');

async function testTableOfContents() {
  console.log('🧪 Testing Table of Contents links in Ultimate Template...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the main page
    console.log('📍 Navigating to main page...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Load the Ultimate Template
    console.log('📝 Loading Ultimate Template...');
    await page.click('button:has-text("✨ Try Ultimate Template ✨")');
    await page.waitForTimeout(2000); // Wait for template to load

    // Debug: Check what buttons are available
    console.log('🔍 Looking for Print button...');
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons on page`);
    
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const text = await allButtons[i].textContent();
      console.log(`  Button ${i + 1}: "${text}"`);
    }
    
    // Look for Print button with different possible text variations
    let printButton = page.locator('button:has-text("Print Preview")');
    let buttonFound = await printButton.count() > 0;
    
    if (!buttonFound) {
      printButton = page.locator('button:has-text("Print")');
      buttonFound = await printButton.count() > 0;
      console.log('🖨️ Found Print button');
    } else {
      console.log('🖨️ Found Print Preview button');
    }
    
    if (!buttonFound) {
      throw new Error('Print button not found');
    }
    
    await printButton.click();
    
    // Wait for print page to open in new tab
    await page.waitForTimeout(3000);
    
    // Get all pages and switch to the print page
    const pages = context.pages();
    const printPage = pages[pages.length - 1]; // Get the last opened page (print page)
    
    await printPage.waitForLoadState('networkidle');
    console.log('✅ Print page loaded successfully\n');

    // Test each table of contents link
    const tocLinks = [
      { text: 'Text Formatting', target: '#text-formatting' },
      { text: 'Headers & Structure', target: '#headers--structure' },
      { text: 'Lists & Organization', target: '#lists--organization' },
      { text: 'Code & Syntax', target: '#code--syntax' },
      { text: 'Links & Media', target: '#links--media' },
      { text: 'Tables & Data', target: '#tables--data' },
      { text: 'Blockquotes & Callouts', target: '#blockquotes--callouts' },
      { text: 'Mermaid Diagrams', target: '#mermaid-diagrams' },
      { text: 'Advanced Features', target: '#advanced-features' }
    ];

    console.log('🎯 Testing Table of Contents links:\n');
    
    for (const link of tocLinks) {
      try {
        console.log(`📌 Testing: "${link.text}" -> ${link.target}`);
        
        // Scroll back to top to find the TOC
        await printPage.evaluate(() => window.scrollTo(0, 0));
        await printPage.waitForTimeout(500);
        
        // Find and click the TOC link
        const tocLink = printPage.locator(`a[href="${link.target}"]`).first();
        
        // Check if the link exists
        const linkExists = await tocLink.count() > 0;
        if (!linkExists) {
          console.log(`   ❌ Link not found: ${link.target}`);
          continue;
        }
        
        // Get initial scroll position
        const initialY = await printPage.evaluate(() => window.pageYOffset);
        
        // Click the link
        await tocLink.click();
        await printPage.waitForTimeout(1000);
        
        // Check if we scrolled to a different position
        const newY = await printPage.evaluate(() => window.pageYOffset);
        const scrolled = Math.abs(newY - initialY) > 50; // Consider 50px difference as successful scroll
        
        if (scrolled) {
          console.log(`   ✅ Successfully navigated (scrolled from ${initialY}px to ${newY}px)`);
          
          // Try to find the target heading
          const targetHeading = await printPage.locator(`h2:has-text("${link.text.replace(' & ', ' & ')}")`).first();
          const headingVisible = await targetHeading.isVisible().catch(() => false);
          
          if (headingVisible) {
            console.log(`   📍 Target heading "${link.text}" is visible`);
          } else {
            console.log(`   ⚠️  Target heading "${link.text}" not visible (may be further down)`);
          }
        } else {
          console.log(`   ❌ No navigation detected (stayed at ${initialY}px)`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error testing "${link.text}": ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }

    // Take a screenshot for verification
    console.log('📸 Taking screenshot of print page...');
    await printPage.screenshot({ 
      path: 'tests/screenshots/table-of-contents-test.png', 
      fullPage: true 
    });

    console.log('✅ Table of Contents test completed!');
    console.log('📸 Screenshot saved: tests/screenshots/table-of-contents-test.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testTableOfContents().catch(console.error);