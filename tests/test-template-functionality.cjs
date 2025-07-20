const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  console.log('🚀 Starting template functionality test...');

  try {
    // Step 1: Clear all storage to ensure clean state
    await page.goto('http://localhost:3000/explorer');
    
    console.log('🧹 Clearing storage...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all workspace-related keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('markdown-explorer-') || key.startsWith('markdown-explorer-v2-'))) {
          localStorage.removeItem(key);
        }
      }
    });
    
    await page.reload();
    await page.waitForTimeout(1000);

    // Step 2: Create a new workspace
    console.log('📁 Creating test workspace...');
    
    // Wait for workspace welcome screen
    await page.waitForSelector('text=Welcome to Markdown Explorer', { timeout: 10000 });
    
    // Click create new workspace
    await page.click('text=Create New Workspace');
    await page.waitForTimeout(500);
    
    // Enter workspace name
    await page.fill('input[placeholder="My Project"]', 'Template Test Workspace');
    await page.click('text=Create Workspace');
    await page.waitForTimeout(2000);

    // Step 3: Verify we're in the workspace and can see file tree
    console.log('✅ Workspace created, checking initial state...');
    
    // Take a screenshot to see current state
    await page.screenshot({ 
      path: 'tests/screenshots/template-test-after-workspace-creation.png',
      fullPage: true 
    });
    
    // Check if there's a file already open that we need to close
    const closeButton = await page.$('[data-testid="close-file-btn"]');
    if (closeButton) {
      console.log('🔄 Found open file, closing it...');
      await page.click('[data-testid="close-file-btn"]');
      await page.waitForTimeout(1000);
    }
    
    // We should now see the template selector since no file is open
    await page.waitForSelector('text=Create from Template', { timeout: 10000 });
    
    // Test Template Selection
    console.log('🎯 Testing template selector...');
    
    // Test the Complete Showcase template
    console.log('📚 Testing Complete Showcase template...');
    await page.click('[data-slot="select-trigger"]');
    await page.waitForTimeout(500);
    await page.click('text=📚 Complete Showcase');
    await page.waitForTimeout(2000);
    
    // Verify file was created and contains showcase content
    let content = await page.textContent('[data-testid="markdown-editor"]');
    if (content && content.includes('Ultimate Markdown & Mermaid Showcase')) {
      console.log('✅ Complete Showcase template works correctly');
    } else {
      console.log('❌ Complete Showcase template failed - content not found');
    }
    
    // Close the file to test another template
    console.log('🔄 Closing file to test next template...');
    await page.click('[data-testid="close-file-btn"]');
    await page.waitForTimeout(1000);
    
    // Verify we're back to the welcome screen
    await page.waitForSelector('text=Create from Template', { timeout: 5000 });
    
    // Test the Presentation template
    console.log('🎯 Testing Presentation template...');
    await page.click('[data-slot="select-trigger"]');
    await page.waitForTimeout(500);
    await page.click('text=🎯 Presentation');
    await page.waitForTimeout(2000);
    
    // Verify file was created and contains presentation content
    content = await page.textContent('[data-testid="markdown-editor"]');
    if (content && content.includes('My Presentation')) {
      console.log('✅ Presentation template works correctly');
    } else {
      console.log('❌ Presentation template failed - content not found');
    }
    
    // Close the file to test another template
    console.log('🔄 Closing file to test next template...');
    await page.click('[data-testid="close-file-btn"]');
    await page.waitForTimeout(1000);
    
    // Test the Document template
    console.log('📄 Testing Document template...');
    await page.click('[data-slot="select-trigger"]');
    await page.waitForTimeout(500);
    await page.click('text=📄 Document');
    await page.waitForTimeout(2000);
    
    // Verify file was created and contains document content
    content = await page.textContent('[data-testid="markdown-editor"]');
    if (content && content.includes('Document Title')) {
      console.log('✅ Document template works correctly');
    } else {
      console.log('❌ Document template failed - content not found');
    }
    
    // Close the file to test the last template
    console.log('🔄 Closing file to test final template...');
    await page.click('[data-testid="close-file-btn"]');
    await page.waitForTimeout(1000);
    
    // Test the Article template
    console.log('📝 Testing Article template...');
    await page.click('[data-slot="select-trigger"]');
    await page.waitForTimeout(500);
    await page.click('text=📝 Article');
    await page.waitForTimeout(2000);
    
    // Verify file was created and contains article content
    content = await page.textContent('[data-testid="markdown-editor"]');
    if (content && content.includes('The Power of Markdown')) {
      console.log('✅ Article template works correctly');
    } else {
      console.log('❌ Article template failed - content not found');
    }
    
    // Test Create Empty File functionality
    console.log('📄 Testing Create Empty File...');
    await page.click('[data-testid="close-file-btn"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="create-new-file-btn"]');
    await page.waitForTimeout(2000);
    
    // Verify empty file was created
    content = await page.textContent('[data-testid="markdown-editor"]');
    if (content && content.includes('# new-file')) {
      console.log('✅ Create Empty File works correctly');
    } else {
      console.log('❌ Create Empty File failed - expected content not found');
    }
    
    // Step 4: Verify file tree shows all created files
    console.log('🌳 Checking file tree for created files...');
    
    // Check if files appear in file tree by looking for specific file items
    const expectedFiles = ['showcase-template.md', 'presentation-template.md', 'document-template.md', 'article-template.md', 'new-file.md'];
    
    let allFilesFound = true;
    for (const fileName of expectedFiles) {
      try {
        await page.waitForSelector(`[data-testid="file-tree-item-${fileName}"]`, { timeout: 2000 });
        console.log(`✅ Found ${fileName} in file tree`);
      } catch (error) {
        console.log(`❌ Missing ${fileName} in file tree`);
        allFilesFound = false;
      }
    }
    
    if (allFilesFound) {
      console.log('🎉 All template functionality tests passed!');
    } else {
      console.log('⚠️ Some tests failed - check file tree content');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/template-functionality-final.png',
      fullPage: true 
    });
    
    console.log('📸 Final screenshot saved');
    
  } catch (error) {
    console.error('❌ Template functionality test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/template-functionality-error.png',
      fullPage: true 
    });
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();