const { chromium } = require('playwright');

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000); // Wait for app to load
    
    // Add some sample content for better screenshots
    const sampleMarkdown = `# Welcome to Markdown Converter
    
This is a **beautiful** markdown converter that supports both light and dark modes.

## Features
- Live preview
- Multiple export formats  
- Responsive design
- Beautiful typography

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote with some *italic* text.

1. First item
2. Second item
3. Third item

---

**Bold text** and *italic text* with [links](https://example.com).`;

    // Fill in the markdown input
    const textarea = page.locator('textarea');
    await textarea.fill(sampleMarkdown);
    await page.waitForTimeout(1000);
    
    // Take light mode screenshot
    console.log('📸 Taking light mode screenshot...');
    await page.screenshot({ 
      path: 'light-mode-improved.png',
      fullPage: false
    });
    
    // Switch to dark mode
    const darkModeToggle = page.locator('[data-theme-toggle]').or(page.locator('button:has-text("🌙")').or(page.locator('button:has-text("☀️")')));
    
    try {
      await darkModeToggle.click();
      await page.waitForTimeout(1000);
    } catch (e) {
      // If no toggle found, manually add dark class
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      await page.waitForTimeout(1000);
    }
    
    // Take dark mode screenshot
    console.log('📸 Taking dark mode screenshot...');
    await page.screenshot({ 
      path: 'dark-mode-improved.png',
      fullPage: false
    });
    
    console.log('✅ Screenshots saved as light-mode-improved.png and dark-mode-improved.png');
    
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);