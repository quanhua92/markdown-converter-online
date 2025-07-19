const { chromium } = require('playwright');

async function testWorkspaceAssertions() {
  console.log('🔍 Testing workspace functionality with strict assertions...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let testResults = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      testResults.passed++;
    } else {
      console.log(`❌ FAIL: ${message}`);
      testResults.failed++;
      testResults.errors.push(message);
      throw new Error(`Assertion failed: ${message}`);
    }
  }
  
  try {
    await page.goto('http://localhost:3000/explorer');
    await page.waitForTimeout(5000);
    
    console.log('\n📝 TEST 1: Default workspace name resolution');
    
    // Critical test: Workspace name must NOT be "Unknown"
    const workspaceText = await page.evaluate(() => {
      // Look for current workspace badge/display
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        if (el.textContent && el.textContent.includes('Current workspace')) {
          return el.textContent;
        }
      }
      
      // Look for workspace selector or display
      const workspaceSelectors = document.querySelectorAll('[class*="workspace"], [data-testid*="workspace"]');
      for (let el of workspaceSelectors) {
        if (el.textContent && el.textContent.trim()) {
          return el.textContent;
        }
      }
      
      // Look for any element containing "Default Workspace" or "Unknown"
      for (let el of elements) {
        const text = el.textContent;
        if (text && (text.includes('Default Workspace') || text.includes('Unknown'))) {
          return text;
        }
      }
      
      return 'NO_WORKSPACE_FOUND';
    });
    
    console.log(`🔍 Found workspace text: "${workspaceText}"`);
    
    // CRITICAL ASSERTION: Must show "Default Workspace", NOT "Unknown"
    assert(
      workspaceText.includes('Default Workspace'),
      'Default workspace must display "Default Workspace" name correctly'
    );
    
    assert(
      !workspaceText.includes('Unknown'),
      'Workspace name must NOT show "Unknown" - this indicates a bug'
    );
    
    console.log('\n📝 TEST 2: Workspace UI elements existence');
    
    // Test that workspace management UI exists
    const workspaceUI = await page.evaluate(() => {
      // Find buttons containing specific text
      const buttons = Array.from(document.querySelectorAll('button'));
      const leaveButton = buttons.find(btn => btn.textContent && btn.textContent.includes('Leave'));
      const joinButton = buttons.find(btn => btn.textContent && btn.textContent.includes('Join Workspace'));
      const createButton = buttons.find(btn => btn.textContent && btn.textContent.includes('Create New'));
      
      return {
        hasLeaveButton: !!leaveButton,
        hasJoinButton: !!joinButton,
        hasCreateButton: !!createButton,
        leaveButtonVisible: leaveButton ? leaveButton.offsetParent !== null : false,
        joinButtonVisible: joinButton ? joinButton.offsetParent !== null : false,
        createButtonVisible: createButton ? createButton.offsetParent !== null : false
      };
    });
    
    console.log('🔍 Workspace UI state:', JSON.stringify(workspaceUI, null, 2));
    
    assert(
      workspaceUI.hasLeaveButton && workspaceUI.leaveButtonVisible,
      'Leave button must be present and visible'
    );
    
    assert(
      workspaceUI.hasJoinButton && workspaceUI.joinButtonVisible,
      'Join Workspace button must be present and visible'
    );
    
    assert(
      workspaceUI.hasCreateButton && workspaceUI.createButtonVisible,
      'Create New button must be present and visible'
    );
    
    console.log('\n📝 TEST 3: Workspace switching functionality');
    
    // Test workspace creation (this must work for switching to be functional)
    console.log('🔄 Testing workspace creation...');
    
    // Click "Create New" button using text search
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createButton = buttons.find(btn => btn.textContent && btn.textContent.includes('Create New'));
      if (createButton) createButton.click();
    });
    await page.waitForTimeout(1000);
    
    // Fill workspace name - wait for dialog to appear and input to be available
    await page.waitForSelector('input[placeholder*="Enter workspace name"]', { timeout: 5000 });
    await page.fill('input[placeholder*="Enter workspace name"]', 'Test Switching Workspace');
    
    // Create workspace using text search
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createJoinButton = buttons.find(btn => btn.textContent && btn.textContent.includes('Create & Join'));
      if (createJoinButton) createJoinButton.click();
    });
    await page.waitForTimeout(3000);
    
    // CRITICAL ASSERTION: After creating workspace, name must change
    const newWorkspaceText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        const text = el.textContent;
        if (text && (text.includes('Test Switching Workspace') || text.includes('Current workspace'))) {
          return text;
        }
      }
      return 'NO_NEW_WORKSPACE_FOUND';
    });
    
    console.log(`🔍 After creation, workspace text: "${newWorkspaceText}"`);
    
    assert(
      newWorkspaceText.includes('Test Switching Workspace'),
      'After creating workspace, must show new workspace name "Test Switching Workspace"'
    );
    
    assert(
      !newWorkspaceText.includes('Default Workspace'),
      'After switching to new workspace, must NOT show "Default Workspace"'
    );
    
    console.log('\n📝 TEST 4: Workspace leaving functionality');
    
    // Test leaving workspace (switching back)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const leaveButton = buttons.find(btn => btn.textContent && btn.textContent.includes('Leave'));
      if (leaveButton) leaveButton.click();
    });
    await page.waitForTimeout(3000);
    
    // CRITICAL ASSERTION: After leaving, must return to default
    const backToDefaultText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        const text = el.textContent;
        if (text && (text.includes('Default Workspace') || text.includes('Current workspace'))) {
          return text;
        }
      }
      return 'NO_DEFAULT_WORKSPACE_FOUND';
    });
    
    console.log(`🔍 After leaving, workspace text: "${backToDefaultText}"`);
    
    assert(
      backToDefaultText.includes('Default Workspace'),
      'After leaving workspace, must return to "Default Workspace"'
    );
    
    assert(
      !backToDefaultText.includes('Test Switching Workspace'),
      'After leaving workspace, must NOT show previous workspace name'
    );
    
    console.log('\n📝 TEST 5: localStorage workspace persistence');
    
    // Test localStorage structure
    const workspaceData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('workspace')) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });
    
    console.log('💾 Workspace localStorage:', JSON.stringify(workspaceData, null, 2));
    
    assert(
      Object.keys(workspaceData).length > 0,
      'Must have workspace data in localStorage'
    );
    
    const hasMultipleWorkspaces = Object.keys(workspaceData).filter(key => 
      key.startsWith('markdown-explorer-workspace-')
    ).length > 1;
    
    assert(
      hasMultipleWorkspaces,
      'Must have multiple workspaces stored in localStorage after creation'
    );
    
    // Take final screenshot for verification
    await page.screenshot({ path: 'tests/screenshots/workspace-assertions-final.png', fullPage: true });
    
    console.log('\n🎉 ALL WORKSPACE ASSERTIONS PASSED!');
    console.log(`✅ Passed: ${testResults.passed} tests`);
    console.log(`❌ Failed: ${testResults.failed} tests`);
    
    if (testResults.failed > 0) {
      console.log('\n🚨 FAILED ASSERTIONS:');
      testResults.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ CRITICAL TEST FAILURE: ${error.message}`);
    console.log(`✅ Passed: ${testResults.passed} tests before failure`);
    console.log(`❌ Failed: ${testResults.failed + 1} tests`);
    
    await page.screenshot({ path: 'tests/screenshots/workspace-assertion-failure.png', fullPage: true });
    
    console.log('\n🚨 WORKSPACE FUNCTIONALITY IS BROKEN - ASSERTIONS FAILED');
    return false;
  } finally {
    await browser.close();
  }
}

testWorkspaceAssertions().then(success => {
  if (success) {
    console.log('\n✅ WORKSPACE ASSERTIONS: ALL TESTS PASSED - Functionality is working correctly');
    process.exit(0);
  } else {
    console.log('\n❌ WORKSPACE ASSERTIONS: TESTS FAILED - Workspace functionality is broken');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Test execution error:', error);
  console.log('\n❌ WORKSPACE ASSERTIONS: TESTS FAILED - Could not complete testing');
  process.exit(1);
});