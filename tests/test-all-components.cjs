const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🎨 Testing all components for light/dark mode support...');
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Add content with Mermaid diagram
  const testMarkdown = `# Heading 1
This is a paragraph under heading 1.

## Heading 2
This is a paragraph under heading 2.

**Bold text** and *italic text* for testing.

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

> This is a blockquote for testing.`;

  const textarea = await page.locator('textarea').first();
  await textarea.clear();
  await textarea.fill(testMarkdown);
  
  await page.waitForTimeout(1000);
  
  // Enable preview to see Mermaid diagram
  await page.click('button:has-text("Preview")');
  await page.waitForTimeout(3000); // Wait for Mermaid to render
  
  // Test light mode
  console.log('📊 Testing light mode components...');
  
  // Check card backgrounds (using data-slot attribute)
  const lightCardBg = await page.locator('[data-slot="card"]').first().evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor,
      borderColor: computed.borderColor,
      boxShadow: computed.boxShadow
    };
  });
  console.log('Light mode card background:', lightCardBg);
  
  // Check if Mermaid diagram exists and get its background
  const mermaidExists = await page.locator('.mermaid-diagram svg').count() > 0;
  console.log('Mermaid diagram exists:', mermaidExists);
  
  if (mermaidExists) {
    const mermaidBg = await page.locator('.mermaid-diagram').first().evaluate(el => {
      const computed = window.getComputedStyle(el);
      const svg = el.querySelector('svg');
      const svgComputed = svg ? window.getComputedStyle(svg) : null;
      return {
        containerBg: computed.backgroundColor,
        svgBg: svgComputed ? svgComputed.backgroundColor : 'none',
        svgFill: svgComputed ? svgComputed.fill : 'none'
      };
    });
    console.log('Light mode Mermaid styles:', mermaidBg);
  }
  
  await page.screenshot({ path: 'light-mode-components.png', fullPage: true });
  console.log('📸 Light mode components screenshot taken');
  
  // Toggle to dark mode (look for theme toggle button with title attribute)
  const themeButton = await page.locator('button[title*="mode"]').first();
  await themeButton.click();
  await page.waitForTimeout(2000);
  
  console.log('🌙 Testing dark mode components...');
  
  // Check if dark class is applied
  const isDarkModeActive = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark');
  });
  console.log('Dark mode class applied:', isDarkModeActive);
  
  // Check card backgrounds in dark mode (using data-slot attribute)
  const darkCardBg = await page.locator('[data-slot="card"]').first().evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor,
      borderColor: computed.borderColor,
      boxShadow: computed.boxShadow,
      className: el.className
    };
  });
  console.log('Dark mode card background:', darkCardBg);
  
  if (mermaidExists) {
    const darkMermaidBg = await page.locator('.mermaid-diagram').first().evaluate(el => {
      const computed = window.getComputedStyle(el);
      const svg = el.querySelector('svg');
      const svgComputed = svg ? window.getComputedStyle(svg) : null;
      return {
        containerBg: computed.backgroundColor,
        svgBg: svgComputed ? svgComputed.backgroundColor : 'none',
        svgFill: svgComputed ? svgComputed.fill : 'none'
      };
    });
    console.log('Dark mode Mermaid styles:', darkMermaidBg);
  }
  
  await page.screenshot({ path: 'dark-mode-components.png', fullPage: true });
  console.log('📸 Dark mode components screenshot taken');
  
  // Check specific component colors
  const componentCheck = await page.evaluate(() => {
    const results = {};
    
    // Check all cards
    const cards = document.querySelectorAll('[data-slot="card"]');
    if (cards.length > 0) {
      const card = cards[0];
      const computed = window.getComputedStyle(card);
      results.cardBackground = computed.backgroundColor;
    }
    
    // Check buttons
    const buttons = document.querySelectorAll('button');
    if (buttons.length > 0) {
      const button = Array.from(buttons).find(b => b.textContent.includes('Preview'));
      if (button) {
        const computed = window.getComputedStyle(button);
        results.buttonBackground = computed.backgroundColor;
        results.buttonColor = computed.color;
      }
    }
    
    // Check input/textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const computed = window.getComputedStyle(textarea);
      results.textareaBackground = computed.backgroundColor;
      results.textareaBorder = computed.borderColor;
    }
    
    return results;
  });
  
  console.log('Dark mode component check:', componentCheck);
  
  // Compare light vs dark
  console.log('');
  console.log('📋 Component Comparison:');
  
  if (lightCardBg.backgroundColor !== darkCardBg.backgroundColor) {
    console.log('✅ Card backgrounds change between modes');
  } else {
    console.log('❌ Card backgrounds stay the same - needs fixing');
  }
  
  console.log('');
  console.log('🔍 Visual Inspection:');
  console.log('   Compare these screenshots:');
  console.log('   - light-mode-components.png vs dark-mode-components.png');
  console.log('   - Cards should be white in light mode, dark in dark mode');
  console.log('   - Mermaid diagrams should adapt to theme');
  
  await browser.close();
  console.log('🎉 Component test completed!');
})();