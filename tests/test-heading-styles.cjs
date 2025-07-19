const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🎨 Testing heading styles in preview and print...');
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Add content with different heading levels
  const testMarkdown = `# Heading 1
This is a paragraph under heading 1.

## Heading 2
This is a paragraph under heading 2.

### Heading 3
This is a paragraph under heading 3.

#### Heading 4
This is a paragraph under heading 4.

**Bold text** and *italic text* for testing.

\`\`\`javascript
function test() {
  console.log("Code block test");
}
\`\`\`

> This is a blockquote for testing.`;

  const textarea = await page.locator('textarea').first();
  await textarea.clear();
  await textarea.fill(testMarkdown);
  
  await page.waitForTimeout(1000);
  
  // Check if preview is visible (on desktop it's always visible, on mobile we need to click Preview tab)
  const isDesktop = await page.evaluate(() => window.innerWidth >= 1024);
  if (!isDesktop) {
    // On mobile, click the Preview tab
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(2000);
  }
  
  // Test preview heading styles
  console.log('📊 Testing preview heading styles...');
  
  const h1Styles = await page.locator('h1').first().evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      borderBottom: styles.borderBottom,
      paddingBottom: styles.paddingBottom,
      color: styles.color
    };
  });
  console.log('H1 styles:', h1Styles);
  
  const h2Styles = await page.locator('h2').first().evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      borderBottom: styles.borderBottom,
      paddingBottom: styles.paddingBottom,
      color: styles.color
    };
  });
  console.log('H2 styles:', h2Styles);
  
  const h3Styles = await page.locator('h3').first().evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      color: styles.color
    };
  });
  console.log('H3 styles:', h3Styles);
  
  // Test if headings have proper styling
  const h1HasBorder = h1Styles.borderBottom !== 'none' && h1Styles.borderBottom !== '0px none rgb(15, 23, 42)';
  const h2HasBorder = h2Styles.borderBottom !== 'none' && h2Styles.borderBottom !== '0px none rgb(15, 23, 42)';
  const headingsAreBold = h1Styles.fontWeight >= '600' && h2Styles.fontWeight >= '600' && h3Styles.fontWeight >= '600';
  
  console.log('✅ Preview Results:');
  console.log(`   H1 has border: ${h1HasBorder}`);
  console.log(`   H2 has border: ${h2HasBorder}`);
  console.log(`   Headings are bold: ${headingsAreBold}`);
  
  await page.screenshot({ path: 'tests/screenshots/preview-styling-test.png' });
  
  // Test print page
  console.log('🖨️  Testing print page heading styles...');
  
  // Get the print URL and open it directly
  await page.click('button:has-text("Print")');
  await page.waitForTimeout(2000);
  
  // Open print page in a new page
  const printPage = await browser.newPage();
  const printUrl = `http://localhost:3000/print?content=${encodeURIComponent(testMarkdown)}`;
  await printPage.goto(printUrl);
  await printPage.waitForTimeout(2000);
  
  const printH1Styles = await printPage.locator('h1').first().evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      borderBottom: styles.borderBottom,
      paddingBottom: styles.paddingBottom,
      color: styles.color
    };
  });
  console.log('Print H1 styles:', printH1Styles);
  
  const printH2Styles = await printPage.locator('h2').first().evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      borderBottom: styles.borderBottom,
      paddingBottom: styles.paddingBottom,
      color: styles.color
    };
  });
  console.log('Print H2 styles:', printH2Styles);
  
  // Test if print headings have proper styling
  const printH1HasBorder = printH1Styles.borderBottom !== 'none' && printH1Styles.borderBottom !== '0px none rgb(15, 23, 42)';
  const printH2HasBorder = printH2Styles.borderBottom !== 'none' && printH2Styles.borderBottom !== '0px none rgb(15, 23, 42)';
  const printHeadingsAreBold = printH1Styles.fontWeight >= '600' && printH2Styles.fontWeight >= '600';
  
  console.log('✅ Print Results:');
  console.log(`   Print H1 has border: ${printH1HasBorder}`);
  console.log(`   Print H2 has border: ${printH2HasBorder}`);
  console.log(`   Print headings are bold: ${printHeadingsAreBold}`);
  
  await printPage.screenshot({ path: 'tests/screenshots/print-styling-test.png' });
  
  // Summary
  const previewWorking = h1HasBorder && h2HasBorder && headingsAreBold;
  const printWorking = printH1HasBorder && printH2HasBorder && printHeadingsAreBold;
  
  console.log('📋 Final Results:');
  if (previewWorking) {
    console.log('✅ Preview heading styles are working correctly');
  } else {
    console.log('❌ Preview heading styles need fixing');
  }
  
  if (printWorking) {
    console.log('✅ Print heading styles are working correctly');
  } else {
    console.log('❌ Print heading styles need fixing');
  }
  
  await browser.close();
  console.log('🎉 Heading style test completed!');
})();