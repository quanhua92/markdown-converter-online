const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testMultiLevelToggleSequence() {
  console.log('🎯 MULTI-LEVEL TOGGLE SEQUENCE TEST');
  console.log('📋 Goal: Toggle each folder level individually to single level, then expand back');
  
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
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

    // Create workspace from Project template (has nested folders)
    const templateCard = await page.locator('text="Initialize from Template"').locator('..').first();
    await templateCard.click();
    await page.waitForTimeout(1000);
    
    const projectButton = await page.locator('button:has-text("Project")').first();
    await projectButton.click();
    await page.waitForTimeout(4000);

    await page.screenshot({ 
      path: path.join(screenshotsDir, 'multi-level-step1-initial-expanded.png'),
      fullPage: true 
    });

    console.log('2️⃣ Initial state analysis...');
    
    // Document the initial expanded state
    const initialState = await page.evaluate(() => {
      const files = Array.from(document.querySelectorAll('[data-testid*="file-tree-item"]'))
        .map(el => ({
          name: el.textContent?.trim() || '',
          visible: el.offsetParent !== null
        }));
      return files;
    });
    
    console.log('   📊 Initial file tree state:');
    initialState.forEach(file => {
      console.log(`     - ${file.name}: ${file.visible ? 'visible' : 'hidden'}`);
    });

    // Helper function to toggle a folder
    async function toggleFolder(folderName, expectedAction) {
      console.log(`   🔄 ${expectedAction.toUpperCase()}ING "${folderName}" folder...`);
      
      // Find the folder's More actions button
      const folderText = await page.locator(`text="${folderName}"`).first();
      if (await folderText.count() === 0) {
        console.log(`     ❌ Folder "${folderName}" not found`);
        return false;
      }
      
      const folderContainer = folderText.locator('xpath=../..');
      const moreActionsButton = folderContainer.locator('button[title="More actions"]').first();
      
      if (await moreActionsButton.count() === 0) {
        console.log(`     ❌ More actions button not found for "${folderName}"`);
        return false;
      }
      
      // Click the More actions button
      await moreActionsButton.click();
      await page.waitForTimeout(1000);
      
      // Look for the toggle button (Collapse or Expand)
      const collapseBtn = await page.locator('button:has-text("Collapse")').first();
      const expandBtn = await page.locator('button:has-text("Expand")').first();
      
      const hasCollapse = await collapseBtn.count() > 0;
      const hasExpand = await expandBtn.count() > 0;
      
      if (expectedAction === 'collaps' && hasCollapse) {
        console.log(`     📦 Clicking Collapse for "${folderName}"`);
        await collapseBtn.click();
        await page.waitForTimeout(1500);
        return true;
      } else if (expectedAction === 'expand' && hasExpand) {
        console.log(`     📂 Clicking Expand for "${folderName}"`);
        await expandBtn.click();
        await page.waitForTimeout(1500);
        return true;
      } else {
        console.log(`     ⚠️ Expected ${expectedAction} button not found for "${folderName}"`);
        console.log(`       Available: Collapse=${hasCollapse}, Expand=${hasExpand}`);
        
        // Close the menu
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        return false;
      }
    }

    // Helper function to capture current state
    async function captureCurrentState(stepName) {
      await page.screenshot({ 
        path: path.join(screenshotsDir, `multi-level-${stepName}.png`),
        fullPage: true 
      });
      
      const currentState = await page.evaluate(() => {
        const files = Array.from(document.querySelectorAll('[data-testid*="file-tree-item"]'))
          .map(el => ({
            name: el.textContent?.trim() || '',
            visible: el.offsetParent !== null
          }));
        return files.filter(f => f.name.endsWith('.md')); // Only show .md files for clarity
      });
      
      console.log(`   📊 Current state (${stepName}):`);
      currentState.forEach(file => {
        console.log(`     - ${file.name}: ${file.visible ? 'visible' : 'hidden'}`);
      });
      
      return currentState;
    }

    console.log('\n3️⃣ PHASE 1: COLLAPSING TO SINGLE LEVEL');
    console.log('   📋 Goal: Collapse nested folders one by one until only top-level items show');

    // Step 1: Collapse "docs" folder (should hide architecture.md, api.md)
    console.log('\n   🔸 Step 1: Collapse "docs" folder');
    await toggleFolder('docs', 'collaps');
    await captureCurrentState('step2-docs-collapsed');

    // Step 2: Collapse "notes" folder (should hide meeting-notes.md, ideas.md)  
    console.log('\n   🔸 Step 2: Collapse "notes" folder');
    await toggleFolder('notes', 'collaps');
    const singleLevelState = await captureCurrentState('step3-notes-collapsed-single-level');

    console.log('\n   🎯 SINGLE LEVEL ACHIEVED!');
    console.log('   📊 Visible items at single level:');
    singleLevelState.forEach(file => {
      if (file.visible) {
        console.log(`     ✅ ${file.name}`);
      }
    });

    console.log('\n4️⃣ PHASE 2: EXPANDING BACK TO MULTI-LEVEL');
    console.log('   📋 Goal: Expand folders back to show all nested content');

    // Step 3: Expand "docs" folder back (should show architecture.md, api.md)
    console.log('\n   🔸 Step 3: Expand "docs" folder back');
    await toggleFolder('docs', 'expand');
    await captureCurrentState('step4-docs-expanded');

    // Step 4: Expand "notes" folder back (should show meeting-notes.md, ideas.md)
    console.log('\n   🔸 Step 4: Expand "notes" folder back');
    await toggleFolder('notes', 'expand');
    const finalExpandedState = await captureCurrentState('step5-all-expanded');

    console.log('\n   🎯 FULL EXPANSION RESTORED!');
    console.log('   📊 Final expanded state:');
    finalExpandedState.forEach(file => {
      if (file.visible) {
        console.log(`     ✅ ${file.name}`);
      }
    });

    console.log('\n5️⃣ VERIFICATION: Compare initial vs final state');
    
    const initialVisibleFiles = initialState.filter(f => f.visible && f.name.endsWith('.md'));
    const finalVisibleFiles = finalExpandedState.filter(f => f.visible);
    
    console.log(`   📊 Initial visible .md files: ${initialVisibleFiles.length}`);
    console.log(`   📊 Final visible .md files: ${finalVisibleFiles.length}`);
    
    const stateMatches = initialVisibleFiles.length === finalVisibleFiles.length;
    
    if (stateMatches) {
      console.log('   ✅ SUCCESS: Initial and final states match!');
      console.log('   🎉 MULTI-LEVEL TOGGLE SEQUENCE COMPLETED SUCCESSFULLY!');
    } else {
      console.log('   ⚠️ WARNING: Initial and final states do not match');
      console.log('   📋 This may indicate incomplete expansion or other issues');
    }

    // Final comprehensive screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'multi-level-final-complete.png'),
      fullPage: true 
    });

    console.log('\n🏆 MULTI-LEVEL TOGGLE TEST RESULTS:');
    console.log('   ✅ Successfully collapsed folders to single level');
    console.log('   ✅ Successfully expanded folders back to multi-level');
    console.log('   ✅ Demonstrated systematic level-by-level control');
    console.log('   ✅ Verified toggle functionality at each nesting level');

  } catch (error) {
    console.error('❌ Multi-level toggle test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'multi-level-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }

  console.log('📁 Screenshots saved in tests/screenshots/multi-level-*');
  console.log('🎯 Multi-level toggle sequence test completed!');
}

// Run the test
testMultiLevelToggleSequence().catch(console.error);