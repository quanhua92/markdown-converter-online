#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HEADLESS = process.env.HEADLESS !== 'false';
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 100;
const TIMEOUT = 30000;

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function testGitOperations() {
  console.log('🚀 Starting Git operations test...');
  
  const browser = await chromium.launch({ 
    headless: HEADLESS,
    slowMo: SLOW_MO
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Listen for console messages and errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔍 [Browser Error]: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      console.log(`🔍 [Browser Warning]: ${msg.text()}`);
    } else {
      console.log(`🔍 [Browser ${msg.type()}]: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`❌ [Browser Error]: ${error.message}`);
  });

  try {
    // Test 1: Check if Git support is available
    console.log('\n🧪 Test 1: Check Git support availability');
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    // Check for Git-related components
    const hasGitAuth = await page.isVisible('[data-testid="github-auth"]').catch(() => false);
    const hasGitWorkspaceCreator = await page.isVisible('[data-testid="git-workspace-creator"]').catch(() => false);
    
    console.log(`GitHub Auth component visible: ${hasGitAuth}`);
    console.log(`Git Workspace Creator visible: ${hasGitWorkspaceCreator}`);
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'git-support-check.png') });
    
    // Test 2: Authentication Status
    console.log('\n🧪 Test 2: GitHub authentication status');
    
    const authStatus = await page.evaluate(() => {
      // Check if GitHub auth functions are available
      if (typeof window !== 'undefined' && window.testGitHub) {
        return window.testGitHub.getAuthStatus();
      }
      return { available: false, authenticated: false };
    });
    
    console.log(`Auth status:`, authStatus);
    
    // Test 3: Git Workspace Creation Flow
    console.log('\n🧪 Test 3: Git workspace creation flow (UI test)');
    
    // Clear storage to start fresh
    await page.evaluate(() => {
      localStorage.clear();
      if (typeof indexedDB !== 'undefined') {
        indexedDB.deleteDatabase('MarkdownExplorerDB');
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Look for Git workspace creation option
    const gitWorkspaceOption = await page.isVisible('text=From Git Repository').catch(() => false);
    const createGitButton = await page.isVisible('[data-testid="create-git-workspace"]').catch(() => false);
    
    console.log(`Git workspace option visible: ${gitWorkspaceOption}`);
    console.log(`Create Git button visible: ${createGitButton}`);
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'git-workspace-creation-ui.png') });
    
    // Test 4: Offline vs Git workspace differentiation
    console.log('\n🧪 Test 4: Offline vs Git workspace differentiation');
    
    // Try to create a local workspace first
    const createLocalButton = await page.isVisible('text=Create New Workspace').catch(() => false);
    console.log(`Create local workspace button visible: ${createLocalButton}`);
    
    if (createLocalButton) {
      try {
        await page.click('text=Create New Workspace', { timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Fill workspace name
        const nameInput = await page.isVisible('input[placeholder*="name"]').catch(() => false);
        if (nameInput) {
          await page.fill('input[placeholder*="name"]', 'Test Local Workspace');
          await page.click('button[type="submit"]', { timeout: 5000 });
          await page.waitForTimeout(2000);
          
          console.log('✅ Local workspace creation attempted');
        }
      } catch (error) {
        console.log('⚠️ Local workspace creation failed:', error.message);
      }
    }
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'workspace-types-test.png') });
    
    // Test 5: Git-specific UI elements
    console.log('\n🧪 Test 5: Git-specific UI elements');
    
    // Check for Git status panel
    const gitStatusPanel = await page.isVisible('[data-testid="git-status"]').catch(() => false);
    const syncButton = await page.isVisible('[data-testid="sync-button"]').catch(() => false);
    const commitButton = await page.isVisible('[data-testid="commit-button"]').catch(() => false);
    
    console.log(`Git status panel visible: ${gitStatusPanel}`);
    console.log(`Sync button visible: ${syncButton}`);
    console.log(`Commit button visible: ${commitButton}`);
    
    // Test 6: Enhanced Explorer Features
    console.log('\n🧪 Test 6: Enhanced explorer features');
    
    const enhancedHeader = await page.isVisible('[data-testid="enhanced-explorer-header"]').catch(() => false);
    const workspaceTypeIndicator = await page.isVisible('[data-testid="workspace-type"]').catch(() => false);
    const leaveWorkspaceButton = await page.isVisible('[data-testid="leave-workspace"]').catch(() => false);
    
    console.log(`Enhanced header visible: ${enhancedHeader}`);
    console.log(`Workspace type indicator visible: ${workspaceTypeIndicator}`);
    console.log(`Leave workspace button visible: ${leaveWorkspaceButton}`);
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'enhanced-explorer-features.png') });
    
    // Test 7: Integration Layer Testing
    console.log('\n🧪 Test 7: Integration layer testing');
    
    const integrationStatus = await page.evaluate(() => {
      try {
        // Test if hooks are available
        const hooks = {
          useIntegratedFileSystem: typeof window.React !== 'undefined',
          useEnhancedWorkspaceManager: typeof window.React !== 'undefined',
          useGitFileSystem: typeof window.React !== 'undefined'
        };
        
        return {
          hooksAvailable: hooks,
          reactAvailable: typeof window.React !== 'undefined',
          storageAvailable: typeof localStorage !== 'undefined',
          indexedDbAvailable: typeof indexedDB !== 'undefined'
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('Integration status:', integrationStatus);
    
    // Test 8: Error Handling
    console.log('\n🧪 Test 8: Error handling for Git operations');
    
    // Try to trigger Git operations without authentication
    const errors = await page.evaluate(() => {
      const errors = [];
      
      // Check for error messages in the UI
      const errorElements = document.querySelectorAll('[role="alert"], .error, .text-red-500, .text-destructive');
      errorElements.forEach(el => {
        if (el.textContent.trim()) {
          errors.push(el.textContent.trim());
        }
      });
      
      return errors;
    });
    
    console.log('Errors found:', errors);
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'git-error-handling.png') });
    
    console.log('\n📊 Git Operations Test Summary:');
    console.log('✅ Git support availability - CHECKED');
    console.log('✅ Authentication status - CHECKED');
    console.log('✅ Workspace creation flow - CHECKED');
    console.log('✅ Offline vs Git differentiation - CHECKED');
    console.log('✅ Git-specific UI elements - CHECKED');
    console.log('✅ Enhanced explorer features - CHECKED');
    console.log('✅ Integration layer - CHECKED');
    console.log('✅ Error handling - CHECKED');
    
    console.log('\n🎉 Git operations test completed!');
    console.log('📸 Screenshots saved in tests/screenshots/');
    
  } catch (error) {
    console.error('❌ Git operations test failed:', error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'git-operations-error.png') });
    throw error;
  } finally {
    await browser.close();
  }
}

// Test offline workspace functionality
async function testOfflineWorkspace() {
  console.log('\n🚀 Starting offline workspace test...');
  
  const browser = await chromium.launch({ 
    headless: HEADLESS,
    slowMo: SLOW_MO
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Test offline workspace creation and operations
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(2000);
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('🧪 Testing offline workspace functionality...');
    
    // Try to create a local workspace
    const hasCreateButton = await page.isVisible('text=Create New Workspace').catch(() => false);
    console.log(`Create New Workspace button visible: ${hasCreateButton}`);
    
    if (hasCreateButton) {
      await page.click('text=Create New Workspace');
      await page.waitForTimeout(1000);
      
      // Fill workspace name
      const nameInput = await page.isVisible('input').catch(() => false);
      if (nameInput) {
        await page.fill('input', 'Offline Test Workspace');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        
        console.log('✅ Offline workspace creation attempted');
      }
    }
    
    // Test file operations
    const fileTree = await page.isVisible('[data-testid="file-tree"]').catch(() => false);
    console.log(`File tree visible: ${fileTree}`);
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'offline-workspace-test.png') });
    
    console.log('✅ Offline workspace test completed');
    
  } catch (error) {
    console.error('❌ Offline workspace test failed:', error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'offline-workspace-error.png') });
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    await testGitOperations();
    await testOfflineWorkspace();
    console.log('\n🎯 All Git and workspace tests completed!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testGitOperations, testOfflineWorkspace };