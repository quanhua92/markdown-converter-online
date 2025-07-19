const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testing theme functionality...');
  
  // Go to the app
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Check initial state
  const initialHtmlClass = await page.evaluate(() => document.documentElement.className);
  const initialIsDark = await page.evaluate(() => localStorage.getItem('theme'));
  console.log('Initial HTML class:', initialHtmlClass);
  console.log('Initial localStorage theme:', initialIsDark);
  
  // Clear localStorage to ensure fresh start
  await page.evaluate(() => {
    localStorage.removeItem('theme');
    // Force reload to test default behavior
    window.location.reload();
  });
  
  await page.waitForTimeout(2000);
  
  const afterClearHtmlClass = await page.evaluate(() => document.documentElement.className);
  const afterClearStorage = await page.evaluate(() => localStorage.getItem('theme'));
  console.log('After clearing localStorage - HTML class:', afterClearHtmlClass);
  console.log('After clearing localStorage - theme:', afterClearStorage);
  
  // Test system preference detection
  const systemPrefersDark = await page.evaluate(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  console.log('System prefers dark:', systemPrefersDark);
  
  // Try to find and click the theme toggle
  try {
    const toggleButton = page.locator('button[title*="Switch to"]');
    const toggleTitle = await toggleButton.getAttribute('title');
    console.log('Toggle button title:', toggleTitle);
    
    // Click toggle
    await toggleButton.click();
    await page.waitForTimeout(1000);
    
    const afterToggleHtmlClass = await page.evaluate(() => document.documentElement.className);
    const afterToggleStorage = await page.evaluate(() => localStorage.getItem('theme'));
    console.log('After toggle - HTML class:', afterToggleHtmlClass);
    console.log('After toggle - localStorage theme:', afterToggleStorage);
    
    // Toggle again
    await toggleButton.click();
    await page.waitForTimeout(1000);
    
    const afterSecondToggleHtmlClass = await page.evaluate(() => document.documentElement.className);
    const afterSecondToggleStorage = await page.evaluate(() => localStorage.getItem('theme'));
    console.log('After second toggle - HTML class:', afterSecondToggleHtmlClass);
    console.log('After second toggle - localStorage theme:', afterSecondToggleStorage);
    
  } catch (error) {
    console.error('Could not find theme toggle button:', error.message);
  }
  
  await browser.close();
})();