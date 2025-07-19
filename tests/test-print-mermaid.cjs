#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');

async function testPrintMermaidRendering() {
  console.log('🧪 Testing print mode Mermaid rendering...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // First, navigate to main page and load Ultimate template
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('📚 Loading Ultimate template in main page...');
    // Click the dropdown trigger and select Ultimate template
    await page.click('button[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('text=Ultimate Showcase');
    await page.waitForTimeout(3000);
    
    // Now open print mode by directly navigating to print URL
    console.log('🖨️ Opening print mode...');
    const printPage = await browser.newPage();
    
    // Set the Ultimate template content in localStorage for print mode
    const ultimateTemplate = `# 📚 Ultimate Markdown & Mermaid Showcase

## 🎨 Mermaid Diagrams

### 1. Flowchart - System Architecture
\`\`\`mermaid
flowchart TD
    A[User Request] --> B{Authentication?}
    B -->|Valid| C[Load Balancer]
    B -->|Invalid| D[Error Response]
    C --> E[API Gateway]
\`\`\`

### 2. Sequence Diagram - User Authentication Flow
\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant A as Auth Service
    
    U->>C: Enter credentials
    C->>A: POST /login
    A-->>C: JWT Token
    C-->>U: Login successful
\`\`\`

### 3. Class Diagram
\`\`\`mermaid
classDiagram
    class User {
        -String id
        -String email
        +login() Boolean
    }
\`\`\`
`;
    
    await printPage.goto('http://localhost:3000/print');
    
    // Set localStorage content
    await printPage.evaluate((content) => {
      localStorage.setItem('markdownDraft', content);
    }, ultimateTemplate);
    
    // Reload to pick up the content
    await printPage.reload();
    await printPage.waitForLoadState('networkidle');
    
    // Wait for content to load and Mermaid to render
    await printPage.waitForTimeout(5000);
    
    // Count Mermaid diagrams in print mode
    const mermaidDiagrams = await printPage.locator('.mermaid-diagram').count();
    console.log(`📊 Found ${mermaidDiagrams} Mermaid diagram containers in print mode`);
    
    const mermaidWithSvg = await printPage.locator('.mermaid-diagram svg').count();
    console.log(`✅ Found ${mermaidWithSvg} Mermaid diagrams with SVG content in print mode`);
    
    // Get details about each diagram
    for (let i = 0; i < mermaidDiagrams; i++) {
      const diagram = printPage.locator('.mermaid-diagram').nth(i);
      const hasContent = await diagram.locator('svg').count() > 0;
      const innerHTML = await diagram.innerHTML();
      console.log(`🔍 Print Diagram ${i + 1}: ${hasContent ? 'HAS SVG' : 'NO SVG'} (content length: ${innerHTML.length})`);
      
      if (innerHTML.length < 50) {
        console.log(`   Content: ${innerHTML}`);
      }
    }
    
    // Take screenshot of print mode
    const screenshotPath = path.join(__dirname, 'screenshots', 'print-mermaid-test.png');
    await printPage.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`📸 Print mode screenshot saved: ${screenshotPath}`);
    
    // Summary
    if (mermaidWithSvg === 0) {
      console.log('❌ ISSUE: No Mermaid diagrams rendered in print mode!');
    } else if (mermaidWithSvg < mermaidDiagrams) {
      console.log(`⚠️  ISSUE: Only ${mermaidWithSvg} out of ${mermaidDiagrams} Mermaid diagrams rendered in print mode!`);
    } else {
      console.log(`✅ SUCCESS: All ${mermaidDiagrams} Mermaid diagrams rendered correctly in print mode!`);
    }
    
    await printPage.close();
    
  } catch (error) {
    console.error('🚨 Test error:', error);
  } finally {
    await browser.close();
  }
}

testPrintMermaidRendering().then(() => {
  console.log('🎉 Print mode Mermaid test completed!');
}).catch(console.error);