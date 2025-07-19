const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 Testing fresh state...');
  
  // Clear any existing localStorage first
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    localStorage.clear();
    // Force a fresh state by reloading
    window.location.reload();
  });
  
  await page.waitForTimeout(2000);
  
  // Check the fresh state
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  const themeInStorage = await page.evaluate(() => localStorage.getItem('theme'));
  const systemPrefersDark = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  console.log('Fresh state - HTML class:', `"${htmlClass}"`);
  console.log('Fresh state - localStorage theme:', themeInStorage);
  console.log('System prefers dark:', systemPrefersDark);
  
  // Check main container background which should change between light/dark
  const mainContainerBg = await page.evaluate(() => {
    const mainDiv = document.querySelector('.min-h-screen');
    if (mainDiv) {
      const computed = window.getComputedStyle(mainDiv);
      return {
        backgroundColor: computed.backgroundColor,
        classes: mainDiv.className
      };
    }
    return null;
  });
  
  console.log('Main container in fresh state:', mainContainerBg);
  
  await browser.close();
})();