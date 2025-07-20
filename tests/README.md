# Tests

This directory contains essential automated tests for the markdown converter application.

## Playwright Tests

We use Playwright for end-to-end testing to verify core functionality and user workflows.

### Prerequisites

1. Ensure the application is running via Docker:
   ```bash
   ./build-fresh.sh
   ```

2. Install Playwright dependencies (if running tests outside Docker):
   ```bash
   pnpm add -D playwright
   ```

## Essential Test Suite

Our streamlined test suite includes **5 core tests** that cover the most critical functionality:

### 1. Template Functionality Test (`test-template-functionality.cjs`)
**NEW** - Tests the core template selection and file creation workflow.

**What it tests:**
- Template selector dropdown functionality
- All 4 template options (showcase, presentation, document, article)
- File creation with template content
- "Create Empty File" functionality
- File close button and workflow
- File tree integration

**Run:** `node tests/test-template-functionality.cjs`

### 2. Dark Mode Test (`test-dark-mode.cjs`)
Tests the light/dark mode toggle functionality and visual changes.

**What it tests:**
- Dark mode toggle functionality (adds/removes `dark` class)
- Background color changes between light and dark modes
- Takes screenshots for visual verification
- Verifies computed styles and CSS application

**Run:** `node tests/test-dark-mode.cjs`

### 3. Workspace Welcome Test (`test-workspace-welcome.cjs`)
Tests the workspace welcome flow and workspace state management.

**What it tests:**
- Workspace welcome screen display (no-workspace state)
- Create new workspace workflow with custom naming
- Join existing workspace functionality
- Leave workspace to return to welcome screen
- Template initialization from welcome screen

**Run:** `node tests/test-workspace-welcome.cjs`

### 4. Delete Functionality Test (`test-delete-functionality.cjs`)
Tests file and folder deletion with confirmation dialogs.

**What it tests:**
- File deletion (immediate, no confirmation)
- Folder deletion with confirmation dialog
- Warning about deleting all folder contents
- Cancel and confirm functionality in delete dialog
- Nested file and folder deletion
- Error handling and visual feedback

**Run:** `node tests/test-delete-functionality.cjs`

### 5. Readability Test (`test-readability.cjs`)
Tests text readability and accessibility compliance (WCAG).

**What it tests:**
- WCAG contrast ratio compliance
- Text readability across different elements
- Color contrast between text and background
- Accessibility standards verification

**Run:** `node tests/test-readability.cjs`

## Running Tests

### Quick Start
1. **Start the application:**
   ```bash
   ./build-fresh.sh
   ```

2. **Wait for the container to be ready** (usually 5-10 seconds)

3. **Run individual tests:**
   ```bash
   # Template functionality (new feature)
   node tests/test-template-functionality.cjs
   
   # Core UI and accessibility
   node tests/test-dark-mode.cjs
   node tests/test-readability.cjs
   
   # Workspace management
   node tests/test-workspace-welcome.cjs
   
   # File operations
   node tests/test-delete-functionality.cjs
   ```

### Run All Essential Tests
```bash
# Run complete essential test suite
for test in test-template-functionality.cjs test-dark-mode.cjs test-workspace-welcome.cjs test-delete-functionality.cjs test-readability.cjs; do
  echo "🧪 Running tests/$test..."
  node "tests/$test"
  echo "✅ Completed tests/$test"
  echo "---"
done
```

### Run All Tests (Alternative)
```bash
# Run all tests in the tests directory
for test in tests/test-*.cjs; do
  echo "🧪 Running $test..."
  node "$test"
  echo "✅ Completed $test"
  echo "---"
done
```

## Test Output

Tests generate:
- **Screenshots** in the `tests/screenshots/` directory for visual verification
- **Console logs** with detailed test results and emojis for easy scanning
- **Success/failure indicators** for each test case

Key screenshots to review:
- `template-functionality-final.png` - Shows all created template files
- `delete-test-*.png` - Shows deletion workflow states
- Dark mode screenshots for visual verification

## Troubleshooting

### Common Issues

**Container not running:**
- Ensure Docker is running
- Run `./build-fresh.sh` to start fresh containers
- Check `docker ps` to verify container is running on port 3000

**Test failures:**
- Check if the application is fully loaded (wait longer)
- Verify Docker container logs: `docker logs <container-name>`
- Ensure no other process is using port 3000

**Template functionality issues:**
- Verify all template options appear in the dropdown
- Check that files are created with correct template content
- Ensure close button (X) appears in file headers

**Delete functionality issues:**
- Files should delete immediately without confirmation
- Folders should show a confirmation dialog before deletion
- Check browser console for JavaScript errors during deletion

**Accessibility issues:**
- Review contrast ratios in the readability test output
- Ensure WCAG compliance for all text elements
- Check for proper color contrast in both light and dark modes

### Performance Tips

- Tests run sequentially to avoid conflicts
- Each test clears localStorage to ensure clean state
- Screenshots are only taken when necessary to save time
- Tests use realistic delays to account for React state updates

## Adding New Tests

When adding new functionality, create corresponding tests:

1. Create a new `.cjs` file in the `tests/` directory
2. Follow the existing test structure:
   ```javascript
   const { chromium } = require('playwright');

   (async () => {
     const browser = await chromium.launch({
       headless: false,  // Set to true for CI
       slowMo: 500       // Remove for faster execution
     });
     const page = await browser.newPage();
     
     try {
       // Clear storage for clean state
       await page.goto('http://localhost:3000/explorer');
       await page.evaluate(() => localStorage.clear());
       await page.reload();
       
       // Your test logic here
       console.log('✅ Test passed');
       
     } catch (error) {
       console.error('❌ Test failed:', error);
       await page.screenshot({ path: 'tests/screenshots/error.png' });
     } finally {
       await browser.close();
     }
   })();
   ```
3. Document the test in this README
4. Test with the Docker environment
5. Add to the essential test suite if it covers core functionality

## Test Philosophy

Our test suite focuses on:
- **User workflows** rather than implementation details
- **Critical functionality** that affects all users
- **Visual verification** through screenshots
- **Accessibility compliance** for inclusive design
- **Clean state management** to ensure reliable results

We prioritize tests that:
- Verify core features work end-to-end
- Catch regressions in essential functionality
- Validate accessibility and visual design
- Are maintainable and reliable across environments