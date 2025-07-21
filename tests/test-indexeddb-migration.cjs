const { chromium } = require('playwright');
const { promises: fs } = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting IndexedDB Migration Tests...');
  
  const browser = await chromium.launch({
    headless: false,
    devtools: false
  });

  let testsPassed = 0;
  let testsFailed = 0;
  
  // Create screenshots directory if it doesn't exist
  await fs.mkdir('tests/screenshots', { recursive: true });

  // Helper function to run a test
  async function runTest(testName, testFunction) {
    console.log(`\n🧪 Test: ${testName}`);
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Browser Error]: ${msg.text()}`);
      } else {
        console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
      }
    });
    
    try {
      await testFunction(page);
      console.log(`✅ ${testName} - PASSED`);
      testsPassed++;
    } catch (error) {
      console.error(`❌ ${testName} - FAILED:`, error.message);
      testsFailed++;
    } finally {
      await context.close();
    }
  }

  // Test 1: Detect migration is needed when localStorage has data
  await runTest('Detect migration need with localStorage data', async (page) => {
    // First, populate localStorage with test data
    await page.goto('http://localhost:3000');
    
    await page.evaluate(() => {
      // Simulate existing localStorage data
      localStorage.setItem('markdown-explorer-v2-workspace-test1', JSON.stringify({
        id: 'test1',
        name: 'Test Workspace',
        files: [{
          id: 'file1',
          name: 'test.md',
          type: 'file',
          path: '/test.md',
          content: '# Test Content'
        }],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }));
      
      localStorage.setItem('markdown-explorer-v2-current-workspace', 'test1');
      localStorage.setItem('markdownDraft', '# Draft content');
      localStorage.setItem('theme', 'dark');
    });
    
    // Reload page to trigger migration check
    await page.reload();
    
    // Wait for migration dialog to appear
    await page.waitForSelector('[data-testid="migration-dialog"]', { timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/migration-dialog-detected.png',
      fullPage: true 
    });
  });

  // Test 2: No migration dialog when no localStorage data exists
  await runTest('No migration needed with empty localStorage', async (page) => {
    // Start with clean localStorage
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Wait a bit to ensure migration check completes
    await page.waitForTimeout(2000);
    
    // Check that migration dialog is not present
    const migrationDialog = await page.$('[data-testid="migration-dialog"]');
    if (migrationDialog !== null) {
      throw new Error('Migration dialog should not be present');
    }
  });

  // Test 3: Complete migration with progress tracking
  await runTest('Complete migration with progress tracking', async (page) => {
    // Setup localStorage with multiple items
    await page.goto('http://localhost:3000');
    
    await page.evaluate(() => {
      localStorage.clear(); // Start clean
      
      // Add multiple test items
      localStorage.setItem('markdown-explorer-v2-workspace-workspace1', JSON.stringify({
        id: 'workspace1',
        name: 'Workspace 1',
        files: [{ id: 'f1', name: 'file1.md', type: 'file', path: '/file1.md', content: '# File 1' }],
        createdAt: '2024-01-01T00:00:00.000Z',
        lastModified: '2024-01-01T00:00:00.000Z'
      }));
      
      localStorage.setItem('markdown-explorer-v2-workspace-workspace2', JSON.stringify({
        id: 'workspace2',
        name: 'Workspace 2',
        files: [{ id: 'f2', name: 'file2.md', type: 'file', path: '/file2.md', content: '# File 2' }],
        createdAt: '2024-01-02T00:00:00.000Z',
        lastModified: '2024-01-02T00:00:00.000Z'
      }));
      
      localStorage.setItem('markdown-explorer-v2-current-workspace', 'workspace1');
      localStorage.setItem('markdownDraft', '# Migration test draft');
      localStorage.setItem('theme', 'light');
    });
    
    await page.reload();
    
    // Wait for migration dialog
    await page.waitForSelector('[data-testid="migration-dialog"]');
    
    // Click start migration button
    await page.click('button:has-text("Start Migration")');
    
    // Wait for and verify progress updates
    await page.waitForSelector('.bg-blue-600', { timeout: 10000 }); // Progress bar
    
    // Check for console logs showing migration progress
    const progressText = await page.textContent('[data-testid="migration-progress"]');
    if (!progressText.includes('/')) {
      throw new Error('Progress text should contain "/" separator');
    }
    
    // Wait for migration completion
    await page.waitForSelector('button:has-text("Continue")', { timeout: 15000 });
    
    // Take screenshot of completed migration
    await page.screenshot({ 
      path: 'tests/screenshots/migration-completed.png',
      fullPage: true 
    });
    
    // Click continue
    await page.click('button:has-text("Continue")');
    
    // Verify data was migrated to IndexedDB
    const indexedDBData = await page.evaluate(async () => {
      // Check if data exists in IndexedDB
      const { StorageService } = await import('/src/db/storage.ts');
      
      const workspace1 = await StorageService.loadItem('markdown-explorer-v2-workspace-workspace1');
      const currentWorkspace = await StorageService.loadItem('markdown-explorer-v2-current-workspace');
      const draft = await StorageService.loadItem('markdownDraft');
      const theme = await StorageService.loadItem('theme');
      
      return {
        workspace1: workspace1?.name,
        currentWorkspace,
        draft,
        theme
      };
    });
    
    if (indexedDBData.workspace1 !== 'Workspace 1') {
      throw new Error(`Expected workspace1 name to be 'Workspace 1', got: ${indexedDBData.workspace1}`);
    }
    if (indexedDBData.currentWorkspace !== 'workspace1') {
      throw new Error(`Expected currentWorkspace to be 'workspace1', got: ${indexedDBData.currentWorkspace}`);
    }
    if (indexedDBData.draft !== '# Migration test draft') {
      throw new Error(`Expected draft to be '# Migration test draft', got: ${indexedDBData.draft}`);
    }
    if (indexedDBData.theme !== 'light') {
      throw new Error(`Expected theme to be 'light', got: ${indexedDBData.theme}`);
    }
  });

  // Test 4: Console interface functionality
  await runTest('Console interface functionality', async (page) => {
    await page.goto('http://localhost:3000');
    
    await page.evaluate(() => {
      localStorage.clear();
      for (let i = 0; i < 5; i++) {
        localStorage.setItem(`test-item-${i}`, JSON.stringify({ index: i, data: `test ${i}` }));
      }
    });
    
    await page.reload();
    await page.waitForSelector('[data-testid="migration-dialog"]');
    
    // Check console section exists
    const consoleSection = await page.$('.bg-gray-900');
    if (!consoleSection) {
      throw new Error('Console section should exist');
    }
    
    // Check console header
    const consoleHeader = await page.textContent('.bg-gray-800');
    if (!consoleHeader.includes('Migration Console')) {
      throw new Error('Console header should contain "Migration Console"');
    }
    
    // Start migration
    await page.click('button:has-text("Start Migration")');
    
    // Wait for console logs to appear
    await page.waitForSelector('.text-green-400', { timeout: 5000 });
    
    // Check that timestamps are shown
    const timestampElements = await page.$$('.text-gray-500');
    if (timestampElements.length === 0) {
      throw new Error('Should have timestamp elements');
    }
    
    // Check for processing messages
    await page.waitForFunction(() => {
      const logs = document.querySelectorAll('.text-green-400');
      return Array.from(logs).some(log => log.textContent.includes('Processing:'));
    });
    
    // Take screenshot of console interface
    await page.screenshot({ 
      path: 'tests/screenshots/migration-console-interface.png',
      fullPage: true 
    });
  });

  // Test 5: Data integrity preservation
  await runTest('Data integrity preservation', async (page) => {
    await page.goto('http://localhost:3000');
    
    // Setup complex test data
    const testData = {
      'markdown-explorer-v2-workspace-complex': {
        id: 'complex',
        name: 'Complex Workspace',
        files: [
          {
            id: 'folder1',
            name: 'docs',
            type: 'folder',
            path: '/docs',
            isExpanded: true,
            children: [
              {
                id: 'nested-file',
                name: 'nested.md',
                type: 'file',
                path: '/docs/nested.md',
                content: '# Nested File\\n\\nComplex content with **bold** and *italic* text.\\n\\n```javascript\\nconsole.log("code block");\\n```'
              }
            ]
          }
        ],
        currentFilePath: '/docs/nested.md',
        createdAt: '2024-01-01T12:00:00.000Z',
        lastModified: '2024-01-01T12:30:00.000Z'
      },
      'theme': 'dark',
      'markdownDraft': "# Draft\\n\\nDraft with unicode: 🚀 ✨ 📝\\n\\nSpecial chars: <>&\"'"
    };
    
    await page.evaluate((data) => {
      localStorage.clear();
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }, testData);
    
    await page.reload();
    await page.waitForSelector('[data-testid="migration-dialog"]');
    await page.click('button:has-text("Start Migration")');
    await page.waitForSelector('button:has-text("Continue")', { timeout: 15000 });
    await page.click('button:has-text("Continue")');
    
    // Verify all data was preserved exactly
    const migratedData = await page.evaluate(async () => {
      const { StorageService } = await import('/src/db/storage.ts');
      
      const workspace = await StorageService.loadItem('markdown-explorer-v2-workspace-complex');
      const theme = await StorageService.loadItem('theme');
      const draft = await StorageService.loadItem('markdownDraft');
      
      return { workspace, theme, draft };
    });
    
    // Verify workspace structure
    if (migratedData.workspace.name !== 'Complex Workspace') {
      throw new Error(`Expected workspace name to be 'Complex Workspace', got: ${migratedData.workspace.name}`);
    }
    if (!migratedData.workspace.files[0].children[0].content.includes('console.log')) {
      throw new Error('Nested file content should contain console.log');
    }
    if (migratedData.workspace.currentFilePath !== '/docs/nested.md') {
      throw new Error(`Expected currentFilePath to be '/docs/nested.md', got: ${migratedData.workspace.currentFilePath}`);
    }
    
    // Verify theme and draft
    if (migratedData.theme !== 'dark') {
      throw new Error(`Expected theme to be 'dark', got: ${migratedData.theme}`);
    }
    if (!migratedData.draft.includes('🚀 ✨ 📝')) {
      throw new Error('Draft should contain unicode characters');
    }
    if (!migratedData.draft.includes('<>&"\'')) {
      throw new Error('Draft should contain special characters');
    }
  });

  // Test 6: Prevent duplicate migration
  await runTest('Prevent duplicate migration', async (page) => {
    await page.goto('http://localhost:3000');
    
    // Set up data and mark as already migrated
    await page.evaluate(async () => {
      localStorage.clear();
      localStorage.setItem('test-data', 'some data');
      
      // Simulate already completed migration in IndexedDB
      const { StorageService } = await import('/src/db/storage.ts');
      await StorageService.saveItem('hasMigratedToIndexedDB', {
        completed: true,
        timestamp: Date.now()
      });
    });
    
    await page.reload();
    
    // Wait to ensure no migration dialog appears
    await page.waitForTimeout(3000);
    
    const migrationDialog = await page.$('[data-testid="migration-dialog"]');
    if (migrationDialog !== null) {
      throw new Error('Migration dialog should not appear for already migrated data');
    }
  });

  await browser.close();
  
  console.log(`\n📊 Test Summary:`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📋 Total: ${testsPassed + testsFailed}`);
  
  if (testsFailed > 0) {
    console.log('❌ Some IndexedDB migration tests failed!');
    process.exit(1);
  } else {
    console.log('🎉 All IndexedDB migration tests passed!');
  }
})();