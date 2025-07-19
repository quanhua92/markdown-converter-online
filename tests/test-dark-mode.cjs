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
  
  // Check if preview is visible (on desktop it's always visible, on mobile we need to click Preview tab)
  const isDesktop = await page.evaluate(() => window.innerWidth >= 1024);
  if (!isDesktop) {
    // On mobile, click the Preview tab
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(2000);
  }
  
  // Take full page screenshot in light mode
  await page.screenshot({ path: 'tests/screenshots/light-mode-full.png', fullPage: true });
  console.log('📸 Light mode full page screenshot taken');
  
  // Take viewport screenshot in light mode
  await page.screenshot({ path: 'tests/screenshots/light-mode-viewport.png' });
  console.log('📸 Light mode viewport screenshot taken');
  
  // Check basic dark mode functionality first
  const lightBodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('Body background in light mode:', lightBodyBg);
  
  // Check the overall page background
  const lightPageBg = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).backgroundColor;
  });
  console.log('Page background in light mode:', lightPageBg);
  
  // Get light mode h1 color
  const lightH1Color = await page.locator('h1').first().evaluate(el => {
    return window.getComputedStyle(el).color;
  });
  console.log('H1 color in light mode:', lightH1Color);
  
  // Toggle to dark mode - look for the theme toggle button with title text
  const themeButton = await page.locator('button[title*="Switch to"]').first();
  await themeButton.click();
  await page.waitForTimeout(2000); // Give more time for transitions
  
  // Check if dark mode classes are applied
  const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('Dark class applied:', hasDarkClass);
  
  // Take full page screenshot in dark mode
  await page.screenshot({ path: 'tests/screenshots/dark-mode-full.png', fullPage: true });
  console.log('📸 Dark mode full page screenshot taken');
  
  // Take viewport screenshot in dark mode
  await page.screenshot({ path: 'tests/screenshots/dark-mode-viewport.png' });
  console.log('📸 Dark mode viewport screenshot taken');
  
  // Check basic dark mode functionality
  const darkBodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('Body background in dark mode:', darkBodyBg);
  
  // Check the overall page background in dark mode
  const darkPageBg = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).backgroundColor;
  });
  console.log('Page background in dark mode:', darkPageBg);
  
  // Check if prose content has dark styling
  const darkH1Color = await page.locator('h1').first().evaluate(el => {
    return window.getComputedStyle(el).color;
  });
  console.log('H1 color in dark mode:', darkH1Color);
  
  // Check the actual classes on the prose container
  const proseClasses = await page.locator('.prose').first().getAttribute('class');
  console.log('Prose classes:', proseClasses);
  
  // Check body element classes
  const bodyClasses = await page.evaluate(() => document.body.className);
  console.log('Body classes:', bodyClasses);
  
  // Check what CSS is actually applied to body
  const bodyComputedStyles = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      background: computed.background,
      backgroundImage: computed.backgroundImage
    };
  });
  console.log('Body computed styles:', bodyComputedStyles);
  
  // Check main container elements that might be overriding
  const mainContainerStyles = await page.evaluate(() => {
    const container = document.querySelector('main') || document.querySelector('.min-h-screen') || document.querySelector('[class*="bg-"]');
    if (container) {
      const computed = window.getComputedStyle(container);
      return {
        element: container.tagName + ' ' + container.className,
        backgroundColor: computed.backgroundColor,
        background: computed.background
      };
    }
    return null;
  });
  console.log('Main container styles:', mainContainerStyles);
  
  // Check if dark class is on document.documentElement
  const htmlClasses = await page.evaluate(() => document.documentElement.className);
  console.log('HTML element classes:', htmlClasses);
  
  // Check if basic dark mode is working
  if (lightBodyBg !== darkBodyBg) {
    console.log('✅ Body background changes between modes');
  } else {
    console.log('⚠️  Body background stays the same in both modes');
    console.log('   This suggests Tailwind dark mode classes are not being applied to body');
  }
  
  // Compare colors
  if (lightH1Color !== darkH1Color) {
    console.log('✅ SUCCESS: Heading colors change between modes');
  } else {
    console.log('⚠️  ISSUE: Heading colors stay the same in both modes');
  }
  
  // Visual inspection recommendation
  console.log('');
  console.log('🔍 Visual Inspection:');
  console.log('   Compare these screenshots to verify dark mode is working:');
  console.log('   - tests/screenshots/light-mode-full.png vs tests/screenshots/dark-mode-full.png');
  console.log('   - tests/screenshots/light-mode-viewport.png vs tests/screenshots/dark-mode-viewport.png');
  console.log('   The background should change from white to dark gray/black');
  
  // Toggle back to light mode
  await themeButton.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots/back-to-light-mode.png' });
  
  await browser.close();
  console.log('🎉 Dark mode test completed!');
})();