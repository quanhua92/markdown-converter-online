const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testToggleFixVerification() {
  console.log('🔧 TESTING TOGGLE FIX VERIFICATION');
  console.log('📋 Goal: Verify that the toggleFolder function signature fix works');
  
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
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
      path: path.join(screenshotsDir, 'fix-verification-step1-initial.png'),
      fullPage: true 
    });

    console.log('2️⃣ Testing toggle on "docs" folder with the fix...');
    
    // Check initial state
    console.log('   📊 Checking initial state...');
    const architectureInitial = await page.locator('text="architecture.md"').isVisible();
    const apiInitial = await page.locator('text="api.md"').isVisible();
    console.log(`   📄 Initial - architecture.md visible: ${architectureInitial}, api.md visible: ${apiInitial}`);

    // Find and click docs folder More actions button
    const docsText = await page.locator('text="docs"').first();
    const docsContainer = docsText.locator('xpath=../..');
    const docsMoreActionsButton = docsContainer.locator('button[title="More actions"]').first();
    
    console.log('   🔄 Clicking docs folder More actions...');
    await docsMoreActionsButton.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'fix-verification-step2-docs-menu.png'),
      fullPage: true 
    });

    // Click the Collapse button
    const collapseBtn = await page.locator('button:has-text("Collapse")').first();
    if (await collapseBtn.count() > 0) {
      console.log('   📦 Clicking Collapse button...');
      await collapseBtn.click();
      await page.waitForTimeout(2000); // Wait longer for the toggle to take effect

      await page.screenshot({ 
        path: path.join(screenshotsDir, 'fix-verification-step3-after-collapse.png'),
        fullPage: true 
      });

      // Check if files are hidden after collapse
      const architectureAfter = await page.locator('text="architecture.md"').isVisible();
      const apiAfter = await page.locator('text="api.md"').isVisible();
      console.log(`   📄 After collapse - architecture.md visible: ${architectureAfter}, api.md visible: ${apiAfter}`);

      if (architectureInitial && apiInitial && !architectureAfter && !apiAfter) {
        console.log('   ✅ SUCCESS! Toggle fix is working - files were properly hidden');
        
        // Test expand functionality
        console.log('   📂 Testing expand functionality...');
        
        const docsTextAfter = await page.locator('text="docs"').first();
        const docsContainerAfter = docsTextAfter.locator('xpath=../..');
        const docsMoreActionsButtonAfter = docsContainerAfter.locator('button[title="More actions"]').first();
        
        await docsMoreActionsButtonAfter.click();
        await page.waitForTimeout(1500);

        await page.screenshot({ 
          path: path.join(screenshotsDir, 'fix-verification-step4-expand-menu.png'),
          fullPage: true 
        });

        const expandBtn = await page.locator('button:has-text("Expand")').first();
        if (await expandBtn.count() > 0) {
          console.log('   📂 Clicking Expand button...');
          await expandBtn.click();
          await page.waitForTimeout(2000);

          await page.screenshot({ 
            path: path.join(screenshotsDir, 'fix-verification-step5-after-expand.png'),
            fullPage: true 
          });

          const architectureExpanded = await page.locator('text="architecture.md"').isVisible();
          const apiExpanded = await page.locator('text="api.md"').isVisible();
          console.log(`   📄 After expand - architecture.md visible: ${architectureExpanded}, api.md visible: ${apiExpanded}`);

          if (architectureExpanded && apiExpanded) {
            console.log('   ✅ COMPLETE SUCCESS! Expand functionality is also working');
            console.log('   🎉 TOGGLE FIX IS FULLY OPERATIONAL!');
          } else {
            console.log('   ⚠️ Expand functionality not working properly');
          }
        } else {
          console.log('   ❌ Expand button not found');
        }
        
      } else if (!architectureInitial || !apiInitial) {
        console.log('   ⚠️ Files were not visible initially, test inconclusive');
      } else {
        console.log('   ❌ Toggle fix not working - files still visible after collapse');
      }
    } else {
      console.log('   ❌ Collapse button not found');
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'fix-verification-final.png'),
      fullPage: true 
    });

    console.log('✅ Toggle fix verification completed!');

  } catch (error) {
    console.error('❌ Toggle fix verification failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'fix-verification-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/fix-verification-*');
}

// Run the test
testToggleFixVerification().catch(console.error);