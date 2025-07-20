const { chromium } = require('playwright');

async function testSimpleImport() {
  console.log('🧪 TESTING SIMPLE IMPORT');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages and errors
  page.on('console', (msg) => {
    console.log(`📱 BROWSER: ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', (error) => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  try {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(3000);

    // Try to import the types module directly first
    const typesResult = await page.evaluate(async () => {
      try {
        console.log('🔍 Attempting to import types module...');
        const typesModule = await import('/src/components/shared/types.tsx');
        console.log('✅ Types module imported successfully');
        console.log('📋 Available exports:', Object.keys(typesModule));
        console.log('🔍 FileSystemItem available:', 'FileSystemItem' in typesModule);
        return {
          success: true,
          exports: Object.keys(typesModule),
          hasFileSystemItem: 'FileSystemItem' in typesModule
        };
      } catch (error) {
        console.log('❌ Types import failed:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log('🧪 Types import result:', typesResult);

    // Try to import the FileTree module
    const result = await page.evaluate(async () => {
      try {
        console.log('🔍 Attempting to import FileTree module...');
        const module = await import('/src/components/shared/FileTree.tsx');
        console.log('✅ Module imported successfully');
        console.log('📋 Available exports:', Object.keys(module));
        console.log('🔍 FileSystemItem available:', 'FileSystemItem' in module);
        return {
          success: true,
          exports: Object.keys(module),
          hasFileSystemItem: 'FileSystemItem' in module
        };
      } catch (error) {
        console.log('❌ Import failed:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log('🧪 Import test result:', result);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimpleImport().catch(console.error);