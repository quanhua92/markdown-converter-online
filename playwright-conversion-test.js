import { chromium } from 'playwright';

async function testConversion() {
  console.log('🔄 Testing full conversion functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Fill in markdown content
    const textarea = await page.locator('textarea').first();
    await textarea.fill(`# Test Presentation

## Slide 1
This is a test slide with some content.

---

## Slide 2
This is another slide with:
- Point 1
- Point 2
- Point 3

---

## Slide 3
Thank you for your attention!`);
    
    console.log('✅ Filled markdown content');
    
    // Click the convert button
    const convertButton = await page.locator('button:has-text("Convert to PowerPoint")').first();
    await convertButton.click();
    console.log('✅ Clicked convert button');
    
    // Wait for conversion to complete (up to 30 seconds)
    console.log('⏳ Waiting for conversion...');
    
    let converted = false;
    for (let i = 0; i < 30; i++) {
      const downloadButton = await page.locator('button:has-text("Download")').first();
      if (await downloadButton.isVisible()) {
        console.log('✅ Conversion completed successfully!');
        converted = true;
        break;
      }
      await page.waitForTimeout(1000);
    }
    
    if (!converted) {
      console.log('❌ Conversion did not complete within 30 seconds');
      
      // Check for error messages
      const errorText = await page.locator('text=Conversion Failed').first();
      if (await errorText.isVisible()) {
        console.log('❌ Conversion failed - error message visible');
        const errorDetails = await page.locator('pre').first().textContent();
        console.log('Error details:', errorDetails);
      }
    }
    
    await page.screenshot({ path: 'playwright-conversion-test.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testConversion().catch(console.error);