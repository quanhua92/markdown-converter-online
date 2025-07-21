const { chromium } = require('playwright');

async function testBasicFunctionality() {
  console.log('🧪 Basic Functionality Test');
  
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable detailed console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error(`❌ [Browser Error]: ${text}`);
    } else if (type === 'warn') {
      console.warn(`⚠️ [Browser Warning]: ${text}`);
    } else {
      console.log(`🔍 [Browser ${type}]: ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    console.error('💥 Page Error:', error.message);
  });
  
  try {
    console.log('📂 Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('⏳ Waiting for app to load...');
    await page.waitForTimeout(3000);
    
    // Check if basic React app is working
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check if there are any obvious errors
    const bodyText = await page.textContent('body');
    if (bodyText.includes('error') || bodyText.includes('Error')) {
      console.log('⚠️ Possible errors found in page content');
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/basic-functionality.png',
      fullPage: true 
    });
    
    console.log('📸 Screenshot saved: tests/screenshots/basic-functionality.png');
    
    // Test IndexedDB availability
    const indexedDBTest = await page.evaluate(async () => {
      try {
        if (!window.indexedDB) {
          return { available: false, error: 'IndexedDB not available' };
        }
        
        // Try to open a test database
        const request = indexedDB.open('test-db', 1);
        
        return new Promise((resolve) => {
          request.onerror = () => {
            resolve({ available: false, error: 'IndexedDB open failed' });
          };
          
          request.onsuccess = () => {
            request.result.close();
            indexedDB.deleteDatabase('test-db');
            resolve({ available: true });
          };
          
          setTimeout(() => {
            resolve({ available: false, error: 'IndexedDB open timeout' });
          }, 2000);
        });
      } catch (error) {
        return { available: false, error: error.message };
      }
    });
    
    console.log('🗄️ IndexedDB test result:', indexedDBTest);
    
    // Test if Dexie is available
    const dexieTest = await page.evaluate(async () => {
      try {
        // Try to import Dexie dynamically
        const dexieModule = await import('/src/db/db.ts');
        return { available: true, hasDb: !!dexieModule.db };
      } catch (error) {
        return { available: false, error: error.message };
      }
    });
    
    console.log('📦 Dexie test result:', dexieTest);
    
    // Test migration service
    const migrationTest = await page.evaluate(async () => {
      try {
        const migrationModule = await import('/src/db/migration.ts');
        const needsMigration = await migrationModule.MigrationService.needsMigration();
        return { available: true, needsMigration };
      } catch (error) {
        return { available: false, error: error.message };
      }
    });
    
    console.log('🔄 Migration test result:', migrationTest);
    
    // Check localStorage content
    const localStorageContent = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key)?.slice(0, 100) + '...'; // Truncate for display
      }
      return { count: localStorage.length, items };
    });
    
    console.log('💾 localStorage content:', localStorageContent);
    
    console.log('⏳ Keeping browser open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the test
testBasicFunctionality().then(() => {
  console.log('✅ Basic functionality test completed!');
}).catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});