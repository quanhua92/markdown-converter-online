const { chromium } = require('playwright');

async function debugAnchors() {
  console.log('🔍 Debugging anchor IDs in Ultimate Template...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to main page and load template
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("✨ Try Ultimate Template ✨")');
    await page.waitForTimeout(2000);
    
    // Click Print Preview button
    const printButton = page.locator('button:has-text("Print Preview")');
    await printButton.click();
    await page.waitForTimeout(3000);
    
    // Switch to print page
    const pages = context.pages();
    const printPage = pages[pages.length - 1];
    await printPage.waitForLoadState('networkidle');

    // Get all headings with IDs
    console.log('📋 Found headings with IDs:');
    const headings = await printPage.locator('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').all();
    
    for (const heading of headings) {
      const id = await heading.getAttribute('id');
      const text = await heading.textContent();
      console.log(`  ID: "${id}" -> Text: "${text}"`);
    }

    console.log('\n📋 All anchor links in document:');
    const links = await printPage.locator('a[href^="#"]').all();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`  Link: "${href}" -> Text: "${text}"`);
    }

    // Check which links actually work
    console.log('\n🧪 Testing which links have matching targets:');
    const tocLinks = [
      '#text-formatting',
      '#headers--structure', 
      '#lists--organization',
      '#code--syntax',
      '#links--media',
      '#tables--data',
      '#blockquotes--callouts',
      '#mermaid-diagrams',
      '#advanced-features'
    ];

    for (const href of tocLinks) {
      const targetId = href.substring(1); // Remove the #
      const target = await printPage.locator(`[id="${targetId}"]`).count();
      const status = target > 0 ? '✅' : '❌';
      console.log(`  ${status} ${href} -> ${target > 0 ? 'Found' : 'Missing'}`);
    }

    await printPage.screenshot({ 
      path: 'tests/screenshots/debug-anchors.png', 
      fullPage: true 
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugAnchors().catch(console.error);