const { chromium } = require('playwright');

async function testMigrationDialog() {
  console.log('🧪 Manual Migration Dialog Test');
  
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
  });
  
  try {
    console.log('📂 Setting up localStorage with test data...');
    
    // First load page and set up localStorage
    await page.goto('http://localhost:3000');
    
    await page.evaluate(() => {
      // Clear any existing data
      localStorage.clear();
      
      // Add test data that should trigger migration
      localStorage.setItem('markdown-explorer-v2-workspace-test1', JSON.stringify({
        id: 'test1',
        name: 'Test Workspace 1',
        files: [
          {
            id: 'file1',
            name: 'README.md',
            type: 'file',
            path: '/README.md',
            content: '# Test Workspace\\n\\nThis is a test workspace for migration.'
          },
          {
            id: 'folder1',
            name: 'notes',
            type: 'folder',
            path: '/notes',
            isExpanded: true,
            children: [
              {
                id: 'file2',
                name: 'note1.md',
                type: 'file',
                path: '/notes/note1.md',
                content: '# Note 1\\n\\nSome notes here.'
              }
            ]
          }
        ],
        currentFilePath: '/README.md',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastModified: '2024-01-01T12:00:00.000Z'
      }));
      
      localStorage.setItem('markdown-explorer-v2-workspace-test2', JSON.stringify({
        id: 'test2',
        name: 'Test Workspace 2',
        files: [
          {
            id: 'file3',
            name: 'projects.md',
            type: 'file',
            path: '/projects.md',
            content: '# Projects\\n\\n- Project A\\n- Project B\\n- Project C'
          }
        ],
        createdAt: '2024-01-02T00:00:00.000Z',
        lastModified: '2024-01-02T12:00:00.000Z'
      }));
      
      localStorage.setItem('markdown-explorer-v2-current-workspace', 'test1');
      localStorage.setItem('markdownDraft', '# Migration Test Draft\\n\\nThis is a draft that should be migrated.');
      localStorage.setItem('theme', 'dark');
      
      console.log('✅ Test data added to localStorage');
    });
    
    console.log('🔄 Reloading page to trigger migration check...');
    await page.reload();
    
    console.log('⏳ Waiting for migration dialog to appear...');
    
    try {
      // Wait for migration dialog (with longer timeout)
      await page.waitForSelector('[role=\"dialog\"]', { timeout: 15000 });
      console.log('✅ Migration dialog appeared!');
      
      // Take screenshot of dialog
      await page.screenshot({ 
        path: 'tests/screenshots/migration-dialog-manual-test.png',
        fullPage: true 
      });
      
      // Check for console section
      const consoleSection = await page.$('.bg-gray-900');
      if (consoleSection) {
        console.log('✅ Console interface found');
      } else {
        console.log('❌ Console interface not found');
      }
      
      // Check for progress bar
      const progressBar = await page.$('.bg-gray-200');
      if (progressBar) {
        console.log('✅ Progress bar found');
      } else {
        console.log('❌ Progress bar not found');
      }
      
      // Check for start button
      const startButton = await page.$('button:has-text(\"Start Migration\")');
      if (startButton) {
        console.log('✅ Start Migration button found');
        
        console.log('🚀 Starting migration...');
        await startButton.click();
        
        // Wait for progress to begin
        await page.waitForTimeout(1000);
        
        // Take screenshot during migration
        await page.screenshot({ 
          path: 'tests/screenshots/migration-in-progress.png',
          fullPage: true 
        });
        
        // Wait for completion
        await page.waitForSelector('button:has-text(\"Continue\")', { timeout: 30000 });
        console.log('✅ Migration completed!');
        
        // Take screenshot of completion
        await page.screenshot({ 
          path: 'tests/screenshots/migration-completed-manual.png',
          fullPage: true 
        });
        
        // Click continue
        await page.click('button:has-text(\"Continue\")');
        
        // Verify data was migrated
        console.log('🔍 Verifying migrated data...');
        const verificationResult = await page.evaluate(async () => {
          try {
            // Import storage service
            const { StorageService } = await import('/src/db/storage.ts');
            
            // Check migrated data
            const workspace1 = await StorageService.loadItem('markdown-explorer-v2-workspace-test1');
            const workspace2 = await StorageService.loadItem('markdown-explorer-v2-workspace-test2');
            const currentWorkspace = await StorageService.loadItem('markdown-explorer-v2-current-workspace');
            const draft = await StorageService.loadItem('markdownDraft');
            const theme = await StorageService.loadItem('theme');
            
            return {
              workspace1Name: workspace1?.name,
              workspace2Name: workspace2?.name,
              currentWorkspace,
              draftContent: draft,
              themeValue: theme,
              workspace1FileCount: workspace1?.files?.length,
              workspace2FileCount: workspace2?.files?.length
            };
          } catch (error) {
            return { error: error.message };
          }
        });
        
        if (verificationResult.error) {
          console.log('❌ Verification failed:', verificationResult.error);
        } else {
          console.log('✅ Verification results:');
          console.log('  - Workspace 1:', verificationResult.workspace1Name, `(${verificationResult.workspace1FileCount} files)`);
          console.log('  - Workspace 2:', verificationResult.workspace2Name, `(${verificationResult.workspace2FileCount} files)`);
          console.log('  - Current workspace:', verificationResult.currentWorkspace);
          console.log('  - Draft content length:', verificationResult.draftContent?.length || 0);
          console.log('  - Theme:', verificationResult.themeValue);
        }
        
      } else {
        console.log('❌ Start Migration button not found');
      }
      
    } catch (error) {
      console.log('❌ Migration dialog did not appear within timeout');
      console.log('📸 Taking screenshot of current state...');
      await page.screenshot({ 
        path: 'tests/screenshots/migration-dialog-timeout.png',
        fullPage: true 
      });
    }
    
    console.log('⏳ Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the test
testMigrationDialog().then(() => {
  console.log('🎉 Manual migration dialog test completed!');
}).catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});