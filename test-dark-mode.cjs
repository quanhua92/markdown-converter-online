const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🎨 Testing dark mode styling...');
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Add content to preview
  const textarea = await page.locator('textarea').first();
  await textarea.clear();
  await textarea.fill('# Heading 1\n\n## Heading 2\n\nParagraph text with **bold** and *italic*.');
  
  await page.waitForTimeout(1000);
  
  // Enable preview
  await page.click('button:has-text("Preview")');
  await page.waitForTimeout(2000);
  
  // Take light mode screenshot
  await page.screenshot({ path: 'light-mode-preview.png' });
  console.log('📸 Light mode screenshot taken');
  
  // Check basic dark mode functionality first
  const lightBodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('Body background in light mode:', lightBodyBg);
  
  // Get light mode h1 color
  const lightH1Color = await page.locator('h1').first().evaluate(el => {
    return window.getComputedStyle(el).color;
  });
  console.log('H1 color in light mode:', lightH1Color);
  
  // Toggle to dark mode
  const themeButton = await page.locator('button.btn-elegant').first();
  await themeButton.click();
  await page.waitForTimeout(1000);
  
  // Check if dark mode classes are applied
  const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('Dark class applied:', hasDarkClass);
  
  // Take dark mode screenshot
  await page.screenshot({ path: 'dark-mode-preview.png' });
  console.log('📸 Dark mode screenshot taken');
  
  // Check basic dark mode functionality
  const darkBodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('Body background in dark mode:', darkBodyBg);
  
  // Check if prose content has dark styling
  const darkH1Color = await page.locator('h1').first().evaluate(el => {
    return window.getComputedStyle(el).color;
  });
  console.log('H1 color in dark mode:', darkH1Color);
  
  // Check the actual classes on the prose container
  const proseClasses = await page.locator('.prose').first().getAttribute('class');
  console.log('Prose classes:', proseClasses);
  
  // Check if basic dark mode is working
  if (lightBodyBg !== darkBodyBg) {
    console.log('✅ Basic dark mode is working - body background changes');
  } else {
    console.log('⚠️  Basic dark mode not working - body background same in both modes');
  }
  
  // Compare colors
  if (lightH1Color !== darkH1Color) {
    console.log('✅ SUCCESS: Dark mode styling is working - colors change between modes');
  } else {
    console.log('⚠️  ISSUE: Dark mode styling might not be working - colors same in both modes');
    console.log('This could mean Tailwind dark mode classes are not being applied to prose elements');
  }
  
  // Toggle back to light mode
  await themeButton.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'back-to-light-mode.png' });
  
  await browser.close();
  console.log('🎉 Dark mode test completed!');
})();