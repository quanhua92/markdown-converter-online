const { chromium } = require('playwright');

// Function to calculate relative luminance
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Function to calculate contrast ratio
function getContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(color1.r, color1.g, color1.b);
  const l2 = getRelativeLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Function to parse RGB color
function parseRgb(rgbString) {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 Testing text readability in both modes...\n');
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Add more substantial content for testing
  const textarea = await page.locator('textarea').first();
  await textarea.clear();
  await textarea.fill(`# Main Heading Test
## Secondary Heading Test  
### Tertiary Heading Test

This is **regular paragraph text** with some *italic emphasis* and \`inline code\` for readability testing.

> This is a blockquote to test contrast in different contexts.

- List item one
- List item two with **bold text**
- List item three with *italic text*

\`\`\`javascript
// Code block test
function testReadability() {
  return "Testing code syntax highlighting";
}
\`\`\`

[This is a link](https://example.com) to test link readability.

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Data A   | Data B   | Data C   |`);
  
  await page.waitForTimeout(1000);
  
  // Function to test readability in current mode
  async function testCurrentMode(modeName) {
    console.log(`📊 ${modeName} Mode Analysis:`);
    console.log('=' .repeat(50));
    
    // Test different text elements
    const elements = [
      { selector: 'h1', name: 'Main Heading (H1)' },
      { selector: 'h2', name: 'Secondary Heading (H2)' },
      { selector: 'h3', name: 'Tertiary Heading (H3)' },
      { selector: '.prose p', name: 'Paragraph Text' },
      { selector: '.prose strong', name: 'Bold Text' },
      { selector: '.prose em', name: 'Italic Text' },
      { selector: '.prose code', name: 'Inline Code' },
      { selector: '.prose blockquote', name: 'Blockquote' },
      { selector: '.prose li', name: 'List Item' },
      { selector: '.prose a', name: 'Link Text' },
      { selector: '.prose th', name: 'Table Header' },
      { selector: '.prose td', name: 'Table Cell' }
    ];
    
    for (const element of elements) {
      try {
        const elementExists = await page.locator(element.selector).first().count() > 0;
        if (!elementExists) {
          console.log(`   ⚠️  ${element.name}: Element not found`);
          continue;
        }
        
        const styles = await page.locator(element.selector).first().evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            textDecoration: computed.textDecoration
          };
        });
        
        // Get the background color from parent or container if element has transparent bg
        let backgroundElement = await page.locator(element.selector).first().evaluate(el => {
          let current = el;
          let bgColor = window.getComputedStyle(current).backgroundColor;
          
          // Walk up the DOM tree to find a non-transparent background
          while (current && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
            current = current.parentElement;
            if (current) {
              bgColor = window.getComputedStyle(current).backgroundColor;
            }
          }
          
          return {
            backgroundColor: bgColor,
            elementTag: current ? current.tagName : 'UNKNOWN'
          };
        });
        
        const textColor = parseRgb(styles.color);
        const bgColor = parseRgb(backgroundElement.backgroundColor);
        
        if (textColor && bgColor) {
          const contrast = getContrastRatio(textColor, bgColor);
          const wcagLevel = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'AA Large' : 'FAIL';
          const status = contrast >= 4.5 ? '✅' : contrast >= 3 ? '⚠️' : '❌';
          
          console.log(`   ${status} ${element.name}:`);
          console.log(`      Text: rgb(${textColor.r}, ${textColor.g}, ${textColor.b})`);
          console.log(`      Background: rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
          console.log(`      Contrast: ${contrast.toFixed(2)}:1 (${wcagLevel})`);
          console.log(`      Font: ${styles.fontSize} / ${styles.fontWeight}`);
        } else {
          console.log(`   ⚠️  ${element.name}: Could not parse colors`);
          console.log(`      Raw text color: ${styles.color}`);
          console.log(`      Raw bg color: ${backgroundElement.backgroundColor}`);
        }
        console.log();
      } catch (error) {
        console.log(`   ❌ ${element.name}: Error testing - ${error.message}`);
      }
    }
  }
  
  // Test light mode first
  console.log('🌞 LIGHT MODE READABILITY TEST');
  console.log('══════════════════════════════════════════════════════\n');
  await testCurrentMode('Light');
  
  // Take screenshot in light mode
  await page.screenshot({ path: 'tests/screenshots/readability-light-mode.png', fullPage: true });
  console.log('📸 Light mode readability screenshot saved\n');
  
  // Switch to dark mode
  const themeButton = await page.locator('button[title*="Switch to"]').first();
  await themeButton.click();
  await page.waitForTimeout(2000);
  
  console.log('🌙 DARK MODE READABILITY TEST');
  console.log('══════════════════════════════════════════════════════\n');
  await testCurrentMode('Dark');
  
  // Take screenshot in dark mode
  await page.screenshot({ path: 'tests/screenshots/readability-dark-mode.png', fullPage: true });
  console.log('📸 Dark mode readability screenshot saved\n');
  
  console.log('📋 SUMMARY & RECOMMENDATIONS');
  console.log('══════════════════════════════════════════════════════');
  console.log('WCAG Guidelines:');
  console.log('  • AAA: 7:1 contrast ratio (best)');
  console.log('  • AA: 4.5:1 contrast ratio (good)');
  console.log('  • AA Large: 3:1 for large text (minimum)');
  console.log('  • Below 3:1: Poor accessibility');
  console.log('');
  console.log('Check the screenshots for visual confirmation:');
  console.log('  • tests/screenshots/readability-light-mode.png');
  console.log('  • tests/screenshots/readability-dark-mode.png');
  
  await browser.close();
  console.log('\n🎉 Readability test completed!');
})();