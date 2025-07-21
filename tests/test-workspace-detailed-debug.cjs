#!/usr/bin/env node

const { chromium } = require('playwright');

async function debugWorkspaceDetailed() {
  console.log('🚀 Starting detailed workspace debug...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture all console messages with timestamps
  page.on('console', msg => {
    console.log(`🔍 [${new Date().toLocaleTimeString()}] [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ [${new Date().toLocaleTimeString()}] [Error]: ${error.message}`);
  });

  try {
    console.log('📂 Step 1: Navigate to app...');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    console.log('🧹 Step 2: Clear storage...');
    await page.evaluate(() => {
      localStorage.clear();
      if (typeof indexedDB !== 'undefined') {
        indexedDB.deleteDatabase('MarkdownExplorerDB');
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log('📊 Step 3: Check initial state...');
    const initialState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        localStorage: Object.keys(localStorage),
        hasWelcomeCard: !!document.querySelector('[data-testid="workspace-welcome"]'),
        hasCreateButton: !!document.querySelector('text=Create New Workspace'),
        hasFileTree: !!document.querySelector('[data-testid="file-tree"]'),
        mainElements: Array.from(document.querySelectorAll('main *')).length
      };
    });
    
    console.log('Initial state:', initialState);
    
    console.log('🔧 Step 4: Create workspace...');
    
    // Wait for the create button and click it
    await page.waitForSelector('text=Create New Workspace', { timeout: 10000 });
    await page.click('text=Create New Workspace');
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 5: Fill workspace name...');
    await page.fill('input[type="text"]', 'Debug Test Workspace');
    await page.waitForTimeout(500);
    
    console.log('✅ Step 6: Submit workspace creation...');
    await page.click('button[type="submit"]');
    
    // Wait for the workspace to be created and check state every second
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      
      console.log(`🔍 Step 7.${i+1}: Checking state after ${i+1} seconds...`);
      
      const currentState = await page.evaluate(() => {
        const fileTreeElements = document.querySelectorAll('[data-testid="file-tree"], .file-tree, [class*="file"], [class*="tree"]');
        const welcomeElements = document.querySelectorAll('[data-testid="workspace-welcome"], [class*="welcome"]');
        
        return {
          url: window.location.href,
          localStorage: Object.keys(localStorage),
          currentWorkspace: localStorage.getItem('markdown-explorer-v2-current-workspace'),
          hasFileTree: fileTreeElements.length > 0,
          fileTreeElements: Array.from(fileTreeElements).map(el => ({
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent?.substring(0, 100),
            hasChildren: el.children.length > 0
          })),
          hasWelcome: welcomeElements.length > 0,
          welcomeElements: Array.from(welcomeElements).map(el => ({
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent?.substring(0, 100)
          })),
          bodyContent: document.body.textContent?.includes('Welcome.md') || document.body.textContent?.includes('file'),
          allDivs: document.querySelectorAll('div').length,
          visibleText: document.body.textContent?.substring(0, 500)
        };
      });
      
      console.log(`State ${i+1}:`, {
        currentWorkspace: currentState.currentWorkspace,
        hasFileTree: currentState.hasFileTree,
        fileTreeElementsCount: currentState.fileTreeElements.length,
        hasWelcome: currentState.hasWelcome,
        bodyHasFileContent: currentState.bodyContent,
        localStorageKeys: currentState.localStorage.length
      });
      
      if (currentState.fileTreeElements.length > 0) {
        console.log('📁 File tree elements found:', currentState.fileTreeElements);
      }
      
      if (currentState.currentWorkspace) {
        console.log('✅ Workspace is set:', currentState.currentWorkspace);
        
        // Check what's in the workspace storage
        const workspaceData = await page.evaluate((workspaceId) => {
          const key = `markdown-explorer-v2-workspace-${workspaceId}`;
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        }, currentState.currentWorkspace);
        
        console.log('💾 Workspace data:', workspaceData);
        
        if (workspaceData?.files?.length > 0) {
          console.log('📄 Files in workspace:', workspaceData.files.map(f => f.name));
        }
      }
      
      // Take a screenshot every few seconds
      if (i % 3 === 0) {
        await page.screenshot({ 
          path: `tests/screenshots/debug-state-${i+1}.png`,
          fullPage: true 
        });
      }
    }
    
    console.log('🔍 Step 8: Final detailed inspection...');
    
    // Get React component state if available
    const reactState = await page.evaluate(() => {
      // Try to access React DevTools or component state
      const reactRoot = document.querySelector('#root');
      if (reactRoot && reactRoot._reactInternalFiber) {
        return 'React fiber detected';
      }
      if (window.React) {
        return 'React global detected';
      }
      return 'No React debugging available';
    });
    
    console.log('React state:', reactState);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/debug-final-state.png',
      fullPage: true 
    });
    
    console.log('🔍 Step 9: Keep browser open for manual inspection...');
    console.log('Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({ path: 'tests/screenshots/debug-error.png' });
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  debugWorkspaceDetailed();
}

module.exports = { debugWorkspaceDetailed };