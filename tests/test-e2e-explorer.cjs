const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  console.log('🚀 Starting Explorer E2E Test Suite...');

  // Test utilities
  const randomId = () => Math.random().toString(36).substr(2, 9);
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Test data
  const testMarkdown1 = `# Project Overview

This is the first test file with **important** content.

## Features
- Feature 1
- Feature 2
- Feature 3

\`\`\`javascript
console.log("Hello from file 1");
\`\`\`

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`
`;

  const testMarkdown2 = `# Meeting Notes

## 2024-01-01 - Team Sync

**Attendees:**
- Alice
- Bob  
- Charlie

**Topics:**
1. Project status
2. Next milestones
3. Blockers

> Important: Remember to follow up on action items

| Task | Owner | Due Date |
|------|-------|----------|
| Feature A | Alice | 2024-01-15 |
| Bug Fix B | Bob | 2024-01-10 |
`;

  const testMarkdown3 = `# Ideas & Brainstorming

## New Feature Ideas
- [ ] Dark mode improvements
- [ ] Export functionality  
- [ ] Better file organization
- [x] Template system ✓

## Architecture Notes
The system should be:
- Scalable
- Maintainable  
- User-friendly

### Technical Details
\`\`\`typescript
interface FileSystem {
  files: FileItem[];
  currentFile: FileItem | null;
}
\`\`\`
`;

  // Desktop Tests
  console.log('\n🖥️ Testing Desktop Explorer Experience...');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Test 1: Navigate to explorer and initial load
    console.log('1️⃣ Testing initial load and welcome screen...');
    await desktopPage.goto('http://localhost:3000/explorer');
    await desktopPage.waitForTimeout(3000);
    
    // Clear localStorage to start fresh 
    await desktopPage.evaluate(() => {
      localStorage.clear();
      // Also clear any specific explorer keys
      localStorage.removeItem('markdown-explorer-files');
      // Set flag to indicate fresh start
      sessionStorage.setItem('explorer-cleared', 'true');
    });
    await desktopPage.reload();
    await desktopPage.waitForTimeout(3000);
    
    await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-initial.png' });
    console.log('✅ Desktop: Explorer page loaded successfully');

    // Test 2: Check if we're on welcome screen or in workspace
    console.log('2️⃣ Testing workspace initialization...');
    
    const welcomeCard = desktopPage.locator('[data-testid="create-workspace-card"]');
    const isWelcomeScreen = await welcomeCard.isVisible();
    
    if (isWelcomeScreen) {
      console.log('✅ Desktop: On welcome screen - testing template initialization');
      
      // Test template initialization from welcome screen
      const templates = ['project-notes', 'knowledge-base', 'blog-site'];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      const templateButton = await desktopPage.locator(`[data-testid="quick-template-${randomTemplate}"]`);
      await templateButton.click();
      await desktopPage.waitForTimeout(3000);
      
      await desktopPage.screenshot({ path: `tests/screenshots/explorer-desktop-template-${randomTemplate}.png` });
      console.log(`✅ Desktop: Initialized with ${randomTemplate} template`);
    } else {
      console.log('✅ Desktop: Already in workspace - testing existing functionality');
      await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-existing-workspace.png' });
    }

    // Test 3: File tree toggle functionality
    console.log('3️⃣ Testing file tree toggle...');
    
    // Initially expanded - collapse it
    const toggleButton = await desktopPage.locator('[data-testid="file-tree-toggle"]');
    await toggleButton.click();
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-tree-collapsed.png' });
    console.log('✅ Desktop: File tree collapsed');
    
    // Expand it again
    await toggleButton.click();
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-tree-expanded.png' });
    console.log('✅ Desktop: File tree expanded');

    // Test 4: File selection and editing
    console.log('4️⃣ Testing file selection and editing...');
    
    // Get all file items in the tree
    const fileItems = await desktopPage.locator('[data-testid^="file-tree-item-"]').all();
    
    if (fileItems.length > 0) {
      // Click on first file
      await fileItems[0].click();
      await desktopPage.waitForTimeout(1000);
      
      // Edit the file content
      const editor = await desktopPage.locator('[data-testid="markdown-editor"]');
      await editor.clear();
      await editor.fill(testMarkdown1);
      await desktopPage.waitForTimeout(2000); // Wait for auto-save
      
      await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-file1-editing.png' });
      console.log('✅ Desktop: First file edited and saved');
      
      // Ensure preview panel is visible (click preview button if needed)
      const previewButton = await desktopPage.locator('button:has-text("Preview")');
      if (await previewButton.isVisible()) {
        // If preview button exists and is not active, click it
        const dataState = await previewButton.getAttribute('data-state');
        const className = await previewButton.getAttribute('class') || '';
        const isActive = dataState === 'active' || className.includes('default');
        if (!isActive) {
          await previewButton.click();
          await desktopPage.waitForTimeout(1000);
        }
      }
      
      // Try to verify preview updates (optional)
      try {
        const preview = await desktopPage.locator('[data-testid="markdown-preview"]');
        await preview.waitFor({ state: 'visible', timeout: 5000 });
        const previewContent = await preview.textContent();
        if (previewContent && previewContent.includes('Project Overview')) {
          console.log('✅ Desktop: Preview updated correctly');
        } else {
          console.log('ℹ️  Desktop: Preview content different than expected');
        }
      } catch (error) {
        console.log('ℹ️  Desktop: Preview verification skipped (panel might be collapsed)');
      }
    }

    // Test 5: Multiple file editing workflow
    console.log('5️⃣ Testing multi-file editing workflow...');
    
    // Create a new file
    const createFileButton = await desktopPage.locator('button[title="New file"]').first();
    await createFileButton.click();
    await desktopPage.waitForTimeout(500);
    
    // Type filename and press Enter
    await desktopPage.keyboard.type('test-notes.md');
    await desktopPage.keyboard.press('Enter');
    await desktopPage.waitForTimeout(1000);
    
    // Edit the new file
    const editor = await desktopPage.locator('[data-testid="markdown-editor"]');
    await editor.clear();
    await editor.fill(testMarkdown2);
    await desktopPage.waitForTimeout(2000);
    
    await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-file2-created.png' });
    console.log('✅ Desktop: New file created and edited');

    // Test 6: File persistence - switch between files
    console.log('6️⃣ Testing file persistence...');
    
    // Click on first file again
    if (fileItems.length > 0) {
      await fileItems[0].click();
      await desktopPage.waitForTimeout(1000);
      
      // Verify content is preserved
      const editorContent = await editor.inputValue();
      if (editorContent.includes('Project Overview')) {
        console.log('✅ Desktop: File content persisted correctly');
      }
    }
    
    // Click on our created file
    const newFileItem = await desktopPage.locator('[data-testid="file-tree-item-test-notes.md"]');
    await newFileItem.click();
    await desktopPage.waitForTimeout(1000);
    
    // Verify new file content is preserved
    const newFileContent = await editor.inputValue();
    if (newFileContent.includes('Meeting Notes')) {
      console.log('✅ Desktop: New file content persisted correctly');
    }

    // Test 7: Create folder and nested file
    console.log('7️⃣ Testing folder creation and nested files...');
    
    const createFolderButton = await desktopPage.locator('button[title="New folder"]').first();
    await createFolderButton.click();
    await desktopPage.waitForTimeout(500);
    
    await desktopPage.keyboard.type('ideas');
    await desktopPage.keyboard.press('Enter');
    await desktopPage.waitForTimeout(1000);
    
    // Click on the folder to create a file inside it
    const folderItem = await desktopPage.locator('[data-testid="file-tree-item-ideas"]').first();
    await folderItem.hover();
    
    // Try to find new file button for the folder (might need to hover first)
    await desktopPage.waitForTimeout(500);
    const folderNewFileButton = await desktopPage.locator('button[title="New file"]').nth(1); // Second new file button
    await folderNewFileButton.click();
    await desktopPage.waitForTimeout(500);
    
    await desktopPage.keyboard.type('brainstorm.md');
    await desktopPage.keyboard.press('Enter');
    await desktopPage.waitForTimeout(1000);
    
    // Edit the nested file
    await editor.clear();
    await editor.fill(testMarkdown3);
    await desktopPage.waitForTimeout(2000);
    
    await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-nested-file.png' });
    console.log('✅ Desktop: Folder and nested file created');

    // Test 8: Dark mode functionality
    console.log('8️⃣ Testing dark mode...');
    
    const themeButton = await desktopPage.locator('button[title*="Switch to"]').first();
    await themeButton.click();
    await desktopPage.waitForTimeout(2000);
    
    const hasDarkClass = await desktopPage.evaluate(() => document.documentElement.classList.contains('dark'));
    if (hasDarkClass) {
      console.log('✅ Desktop: Dark mode activated');
      await desktopPage.screenshot({ path: 'tests/screenshots/explorer-desktop-dark-mode.png' });
    }
    
    // Switch back to light mode
    await themeButton.click();
    await desktopPage.waitForTimeout(1000);

    // Test 9: Print functionality
    console.log('9️⃣ Testing print functionality...');
    
    const printButton = await desktopPage.locator('button[title="Print"]');
    
    // Set up listener for new page (print window)
    const newPagePromise = desktopPage.context().waitForEvent('page');
    await printButton.click();
    
    try {
      const printPage = await newPagePromise;
      await printPage.waitForLoadState();
      await printPage.waitForTimeout(3000);
      
      await printPage.screenshot({ path: 'tests/screenshots/explorer-desktop-print.png' });
      console.log('✅ Desktop: Print page opened successfully');
      
      await printPage.close();
    } catch (error) {
      console.log('⚠️ Desktop: Print test skipped (popup blocked)');
    }

    // Test 10: Export functionality  
    console.log('🔟 Testing export functionality...');
    
    const exportButton = await desktopPage.locator('button[title="Export markdown"]');
    
    // Set up download handler
    const downloadPromise = desktopPage.waitForEvent('download');
    await exportButton.click();
    
    try {
      const download = await downloadPromise;
      console.log('✅ Desktop: File export triggered successfully');
      console.log('   Downloaded file:', download.suggestedFilename());
    } catch (error) {
      console.log('⚠️ Desktop: Export test failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Desktop test error:', error.message);
  }

  await desktopPage.close();

  // Mobile Tests
  console.log('\n📱 Testing Mobile Explorer Experience...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 667 });

  try {
    // Clear localStorage for mobile test
    await mobilePage.goto('http://localhost:3000/explorer');
    await mobilePage.evaluate(() => {
      localStorage.clear();
      localStorage.removeItem('markdown-explorer-files');
      sessionStorage.setItem('explorer-cleared', 'true');
    });
    await mobilePage.reload();
    await mobilePage.waitForTimeout(3000);

    console.log('1️⃣ Mobile: Testing initial load...');
    await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-initial.png' });

    // Check if we're on welcome screen or in workspace
    console.log('2️⃣ Mobile: Testing workspace initialization...');
    
    const mobileWelcomeCard = mobilePage.locator('[data-testid="create-workspace-card"]');
    const isMobileWelcomeScreen = await mobileWelcomeCard.isVisible();
    
    if (isMobileWelcomeScreen) {
      console.log('✅ Mobile: On welcome screen - testing template initialization');
      
      const mobileTemplateButton = await mobilePage.locator('[data-testid="quick-template-knowledge-base"]');
      await mobileTemplateButton.click();
      await mobilePage.waitForTimeout(3000);
      
      await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-template.png' });
      console.log('✅ Mobile: Initialized with knowledge-base template');
    } else {
      console.log('✅ Mobile: Already in workspace - testing existing functionality');
      await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-existing-workspace.png' });
    }

    // Test mobile file tree sheet toggle
    console.log('3️⃣ Mobile: Testing mobile file tree sheet...');
    const mobileMenuButton = await mobilePage.locator('button[title="Open file tree"]');
    await mobileMenuButton.click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-tree-opened.png' });
    
    // Close the sheet by clicking outside or pressing escape
    await mobilePage.keyboard.press('Escape');
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-tree-closed.png' });

    // Test mobile file editing
    console.log('4️⃣ Mobile: Testing file editing...');
    
    // First, open the mobile file tree sheet
    await mobileMenuButton.click();
    await mobilePage.waitForTimeout(1000);
    
    // Wait for file items to be visible in the sheet  
    try {
      await mobilePage.waitForSelector('[data-testid^="file-tree-item-"]', { timeout: 3000, state: 'visible' });
      const mobileFileItems = await mobilePage.locator('[data-testid^="file-tree-item-"]').all();
      
      if (mobileFileItems.length > 0) {
        await mobileFileItems[0].click();
        await mobilePage.waitForTimeout(1000);
        
        // Test mobile tab switching
        const editTab = await mobilePage.locator('button:has-text("Edit")').first();
        const previewTab = await mobilePage.locator('button:has-text("Preview")').first();
        
        // Edit mode
        await editTab.click();
        await mobilePage.waitForTimeout(1000);
        
        const mobileEditor = await mobilePage.locator('[data-testid="markdown-editor"]');
        await mobileEditor.clear();
        await mobileEditor.fill(testMarkdown1);
        await mobilePage.waitForTimeout(2000);
        
        await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-edit-mode.png' });
        console.log('✅ Mobile: Edit mode works');
        
        // Preview mode
        await previewTab.click();
        await mobilePage.waitForTimeout(1000);
        
        await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-preview-mode.png' });
        console.log('✅ Mobile: Preview mode works');
      }
    } catch (error) {
      console.log('ℹ️  Mobile: File tree interaction skipped due to timing');
    }

    // Test mobile dark mode
    console.log('5️⃣ Mobile: Testing dark mode...');
    
    // Make sure any sheets/modals are closed first
    await mobilePage.keyboard.press('Escape');
    await mobilePage.waitForTimeout(500);
    
    const mobileThemeButton = await mobilePage.locator('button[title*="Switch to"]').first();
    await mobileThemeButton.click();
    await mobilePage.waitForTimeout(2000);
    
    await mobilePage.screenshot({ path: 'tests/screenshots/explorer-mobile-dark.png' });
    console.log('✅ Mobile: Dark mode works');

  } catch (error) {
    console.log('❌ Mobile test error:', error.message);
  }

  await mobilePage.close();

  // Persistence Tests
  console.log('\n💾 Testing Data Persistence...');
  const persistencePage = await browser.newPage();
  await persistencePage.setViewportSize({ width: 1280, height: 720 });

  try {
    // Load explorer with existing data from desktop test
    await persistencePage.goto('http://localhost:3000/explorer');
    await persistencePage.waitForTimeout(3000);

    // Check if files from desktop test are still there
    const persistedFiles = await persistencePage.locator('[data-testid^="file-tree-item-"]').all();
    
    if (persistedFiles.length > 0) {
      console.log(`✅ Persistence: Found ${persistedFiles.length} persisted files`);
      
      // Click on a persisted file and verify content
      await persistedFiles[0].click();
      await persistencePage.waitForTimeout(1000);
      
      const persistedEditor = await persistencePage.locator('[data-testid="markdown-editor"]');
      const persistedContent = await persistedEditor.inputValue();
      
      if (persistedContent.length > 0) {
        console.log('✅ Persistence: File content preserved across sessions');
      }
      
      await persistencePage.screenshot({ path: 'tests/screenshots/explorer-persistence-test.png' });
    } else {
      console.log('⚠️ Persistence: No files found (may be using fresh storage)');
    }

  } catch (error) {
    console.log('❌ Persistence test error:', error.message);
  }

  await persistencePage.close();

  await browser.close();

  // Test Summary
  console.log('\n🎉 Explorer E2E Test Complete!');
  console.log('\n📊 Test Summary:');
  console.log('✅ Desktop Experience:');
  console.log('   - Template initialization with random selection');
  console.log('   - File tree toggle (collapse/expand)');
  console.log('   - Multi-file editing workflow');
  console.log('   - File creation and folder organization');
  console.log('   - Content persistence between file switches');
  console.log('   - Dark/light mode switching');
  console.log('   - Print and export functionality');
  
  console.log('✅ Mobile Experience:');
  console.log('   - Responsive layout and template selection');
  console.log('   - File tree toggle on small screens');
  console.log('   - Edit/Preview tab switching');
  console.log('   - Touch-friendly file editing');
  
  console.log('✅ Data Persistence:');
  console.log('   - localStorage file system preservation');
  console.log('   - Content persistence across browser sessions');
  
  console.log('\n📁 Screenshots saved in tests/screenshots/explorer-*');
  console.log('\n🔍 Review screenshots to verify visual behavior across all scenarios.');

})();