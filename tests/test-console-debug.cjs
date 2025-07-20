const { chromium } = require('playwright');

async function testConsoleDebug() {
  console.log('🐛 DEBUGGING CONSOLE OUTPUT');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    // Force fresh context without cache
    ignoreHTTPSErrors: true,
    bypassCSP: true
  });
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', (msg) => {
    console.log(`📱 BROWSER: ${msg.type()}: ${msg.text()}`);
  });

  // Listen for errors
  page.on('pageerror', (error) => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  try {
    await page.goto('http://localhost:3000/explorer');
    
    // Clear all browser storage and cache
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all indexed DB
      if ('indexedDB' in window) {
        indexedDB.databases?.().then(databases => {
          databases.forEach(db => {
            if (db.name) indexedDB.deleteDatabase(db.name);
          });
        });
      }
    });
    
    // Clear service workers and reload
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
    });
    
    // Hard reload to bypass cache with cache disabled
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Create workspace from Project template
    const templateCard = await page.locator('text="Initialize from Template"').locator('..').first();
    await templateCard.click();
    await page.waitForTimeout(1000);
    
    const projectButton = await page.locator('button:has-text("Project")').first();
    await projectButton.click();
    await page.waitForTimeout(4000);

    console.log('🔍 Looking for docs folder and testing toggle...');
    
    // Find and click docs folder More actions button
    const docsText = await page.locator('text="docs"').first();
    const docsContainer = docsText.locator('xpath=../..');
    const docsMoreActionsButton = docsContainer.locator('button[title="More actions"]').first();
    
    await docsMoreActionsButton.click();
    await page.waitForTimeout(1500);

    // Click the Collapse button
    const collapseBtn = await page.locator('button:has-text("Collapse")').first();
    if (await collapseBtn.count() > 0) {
      console.log('🔄 Clicking Collapse button...');
      await collapseBtn.click();
      await page.waitForTimeout(3000); // Wait longer to see if console messages appear
      
      // Force check for enhanced debugging logs
      console.log('🕵️ Looking for enhanced debugging logs that should show item properties...');
    } else {
      console.log('❌ Collapse button not found!');
    }

    await page.waitForTimeout(5000); // Wait to see all console messages

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await browser.close();
  }
}

testConsoleDebug().catch(console.error);