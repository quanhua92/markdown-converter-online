const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function inspectHtmlStructure() {
  console.log('🔍 INSPECTING HTML STRUCTURE - Finding 3-dots buttons...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log('1️⃣ Setting up Project template workspace...');
    await page.goto('http://localhost:3000/explorer');
    
    // Clear localStorage
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        
        const keysToRemove = [
          'markdown-explorer-current-workspace',
          'markdown-explorer-files', 
          'markdown-explorer-workspace-default',
          'markdown-explorer-workspaces',
          'markdown-explorer-v2-current-workspace'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        for (let j = localStorage.length - 1; j >= 0; j--) {
          const key = localStorage.key(j);
          if (key && (key.startsWith('markdown-explorer-') || key.startsWith('markdown-explorer-v2-'))) {
            localStorage.removeItem(key);
          }
        }
      });
      
      await page.waitForTimeout(500);
    }
    
    await page.reload();
    await page.waitForTimeout(2000);

    // Create workspace from Project template
    const templateCard = await page.locator('text="Initialize from Template"').locator('..').first();
    await templateCard.click();
    await page.waitForTimeout(1000);
    
    const projectButton = await page.locator('button:has-text("Project")').first();
    await projectButton.click();
    await page.waitForTimeout(4000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'inspect-step1-project-loaded.png'),
      fullPage: true 
    });

    console.log('2️⃣ Inspecting HTML structure for 3-dots buttons...');
    
    // Try multiple approaches to find the 3-dots buttons
    const approaches = [
      'svg[data-lucide="more-vertical"]',
      'svg[class*="more-vertical"]', 
      'button:has(svg)',
      'button[title*="More"]',
      'button[title*="actions"]',
      'button[aria-label*="More"]',
      'button[aria-label*="actions"]',
      '[data-testid*="more"]',
      '[data-testid*="menu"]'
    ];
    
    for (const selector of approaches) {
      const elements = await page.locator(selector).all();
      console.log(`   Selector "${selector}": Found ${elements.length} elements`);
      
      if (elements.length > 0) {
        console.log(`     Testing first element of "${selector}"`);
        const firstElement = elements[0];
        const isVisible = await firstElement.isVisible();
        const tagName = await firstElement.evaluate(el => el.tagName);
        const classes = await firstElement.getAttribute('class') || '';
        const title = await firstElement.getAttribute('title') || '';
        const ariaLabel = await firstElement.getAttribute('aria-label') || '';
        
        console.log(`       Visible: ${isVisible}, Tag: ${tagName}, Classes: "${classes}", Title: "${title}", AriaLabel: "${ariaLabel}"`);
        
        if (isVisible && selector === 'button:has(svg)') {
          console.log(`     🎯 Found buttons with SVGs! Testing the first one...`);
          
          // Click the first button with SVG
          await firstElement.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'inspect-step2-clicked-button.png'),
            fullPage: true 
          });

          // Check if a menu appeared
          const menuElements = await page.locator('button').all();
          console.log(`       After click, found ${menuElements.length} total buttons on page`);
          
          // Look for specific menu items
          const menuOptions = ['Collapse', 'Expand', 'Toggle', 'Rename', 'Delete', 'New File', 'New Folder'];
          for (const option of menuOptions) {
            const optionButton = await page.locator(`button:has-text("${option}")`).count();
            if (optionButton > 0) {
              console.log(`         ✅ Found menu option: "${option}"`);
            }
          }
          
          // Test the Toggle functionality if found
          const toggleButton = await page.locator('button:has-text("Toggle")').first();
          const collapseButton = await page.locator('button:has-text("Collapse")').first();
          const expandButton = await page.locator('button:has-text("Expand")').first();
          
          if (await toggleButton.count() > 0) {
            console.log(`       🔄 Found Toggle button! Testing...`);
            await toggleButton.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ 
              path: path.join(screenshotsDir, 'inspect-step3-after-toggle.png'),
              fullPage: true 
            });

            console.log(`       ✅ Toggle button clicked successfully!`);
            
          } else if (await collapseButton.count() > 0) {
            console.log(`       📦 Found Collapse button! Testing...`);
            await collapseButton.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ 
              path: path.join(screenshotsDir, 'inspect-step3-after-collapse.png'),
              fullPage: true 
            });

            console.log(`       ✅ Collapse button clicked successfully!`);
            
          } else if (await expandButton.count() > 0) {
            console.log(`       📂 Found Expand button! Testing...`);
            await expandButton.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ 
              path: path.join(screenshotsDir, 'inspect-step3-after-expand.png'),
              fullPage: true 
            });

            console.log(`       ✅ Expand button clicked successfully!`);
          }
          
          break; // Exit the loop once we've successfully tested
        }
      }
    }

    console.log('3️⃣ Additional HTML inspection...');
    
    // Get the HTML content around the file tree to see the actual structure
    const fileTreeHTML = await page.evaluate(() => {
      const fileTree = document.querySelector('[data-testid*="file"], .file-tree, .Files, [class*="file"]');
      return fileTree ? fileTree.outerHTML.substring(0, 2000) : 'File tree not found';
    });
    
    console.log('   File tree HTML (first 2000 chars):');
    console.log(fileTreeHTML.substring(0, 500) + '...');

    // Find all buttons and their attributes
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.slice(0, 20).map(btn => ({
        text: btn.textContent?.trim() || '',
        className: btn.className,
        title: btn.title,
        ariaLabel: btn.getAttribute('aria-label'),
        hasChildren: btn.children.length
      }));
    });
    
    console.log('   First 20 buttons on page:');
    allButtons.forEach((btn, i) => {
      console.log(`     ${i + 1}. Text: "${btn.text}", Class: "${btn.className}", Title: "${btn.title}", Children: ${btn.hasChildren}`);
    });

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'inspect-final.png'),
      fullPage: true 
    });

    console.log('✅ HTML structure inspection completed!');

  } catch (error) {
    console.error('❌ Inspection failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'inspect-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/inspect-*');
}

// Run the inspection
inspectHtmlStructure().catch(console.error);