# Tests

This directory contains automated tests for the markdown converter application.

## Playwright Tests

We use Playwright for end-to-end testing to verify UI functionality and visual behavior.

### Prerequisites

1. Ensure the application is running via Docker:
   ```bash
   ./build-fresh.sh
   ```

2. Install Playwright dependencies (if running tests outside Docker):
   ```bash
   pnpm add -D playwright
   ```

### Available Tests

#### Dark Mode Test (`test-dark-mode.cjs`)
Tests the light/dark mode toggle functionality and visual changes.

**What it tests:**
- Dark mode toggle functionality (adds/removes `dark` class)
- Background color changes between light and dark modes
- Takes screenshots for visual verification
- Verifies computed styles and CSS application

**Run the test:**
```bash
node tests/test-dark-mode.cjs
```

**Expected output:**
- Screenshots: `tests/screenshots/light-mode-full.png`, `tests/screenshots/dark-mode-full.png`, etc.
- Console logs showing color values and test results
- Visual confirmation that backgrounds change dramatically

#### Explorer E2E Test (`test-e2e-explorer.cjs`)
Comprehensive test for the new Markdown Explorer functionality.

**What it tests:**
- Template initialization (Project Notes, Knowledge Base, Blog/Website)
- File tree navigation and toggle functionality
- Multi-file editing workflow with auto-save
- Mobile responsive design with edit/preview tabs
- Data persistence across browser sessions
- Dark/light mode in Explorer interface

**Run the test:**
```bash
node tests/test-e2e-explorer.cjs
```

**Expected output:**
- Screenshots: `tests/screenshots/explorer-desktop-*.png`, `tests/screenshots/explorer-mobile-*.png`
- Template initialization verification
- File tree interaction testing
- Cross-device compatibility confirmation

#### Workspace Functionality Test (`test-workspace-functionality.cjs`)
Tests the workspace sign-in/sign-out management system.

**What it tests:**
- Workspace selector UI rendering and visibility
- Sign-in/sign-out workflow (join/leave workspace operations)
- Workspace creation and automatic joining
- Multi-workspace isolation and data persistence
- Session management and localStorage structure
- UI state changes between workspace sessions

**Run the test:**
```bash
node tests/test-workspace-functionality.cjs
```

**Expected output:**
- Screenshots: `tests/screenshots/workspace-selector.png`, `tests/screenshots/workspace-created.png`
- Workspace session flow verification
- Data isolation testing between workspaces
- UI interaction confirmation for join/leave operations

#### Workspace Sign-In/Sign-Out Test (`test-workspace-sign-in-out.cjs`)
Tests the complete workspace session management workflow.

**What it tests:**
- Default workspace initial state and display
- Workspace creation with "Create & Join" flow
- Workspace leaving with "Leave" button (return to default)
- Workspace joining with "Join Workspace" dialog
- Data persistence and isolation between workspace sessions
- localStorage structure and multi-workspace support
- UI state consistency during sign-in/sign-out operations

**Run the test:**
```bash
node tests/test-workspace-sign-in-out.cjs
```

**Expected output:**
- Screenshots: `tests/screenshots/workspace-initial-state.png`, `workspace-create-dialog.png`, `workspace-new-joined.png`, etc.
- Complete sign-in/sign-out workflow verification
- localStorage data structure validation
- Session isolation confirmation

#### Workspace Debug Test (`debug-workspace.cjs`)
Debugging tool for workspace system analysis and troubleshooting.

**What it tests:**
- localStorage workspace data structure and integrity
- Workspace UI element detection and analysis
- File tree existence and rendering status
- Console error monitoring and reporting
- Workspace state consistency verification

**Run the test:**
```bash
node tests/debug-workspace.cjs
```

**Expected output:**
- Screenshots: `tests/screenshots/workspace-debug.png`
- Detailed localStorage content analysis
- UI element inspection results
- Error detection and diagnostic information

#### Heading Styles Test (`test-heading-styles.cjs`)
Tests markdown heading rendering in both preview and print modes.

**What it tests:**
- Heading font sizes, weights, and borders
- Consistency between preview and print modes
- Proper typography styling

**Run the test:**
```bash
node tests/test-heading-styles.cjs
```

**Expected output:**
- Screenshots: `tests/screenshots/preview-styling-test.png`, `tests/screenshots/print-styling-test.png`
- Console logs showing heading styles and test results
- Confirmation that heading styles work correctly

#### Readability Test (`test-readability.cjs`)
Tests text readability and accessibility compliance in both light and dark modes.

**What it tests:**
- WCAG contrast ratio compliance
- Text readability across different elements (headings, paragraphs, links, code)
- Color contrast between text and background
- Accessibility standards verification

**Run the test:**
```bash
node tests/test-readability.cjs
```

**Expected output:**
- Screenshots: `tests/screenshots/readability-light-mode.png`, `tests/screenshots/readability-dark-mode.png`
- Console logs showing contrast ratios and WCAG compliance levels
- Detailed accessibility analysis for both themes

### Running Tests

1. **Start the application:**
   ```bash
   ./build-fresh.sh
   ```

2. **Wait for the container to be ready** (usually 5-10 seconds)

3. **Run individual tests:**
   ```bash
   # Test dark mode functionality
   node tests/test-dark-mode.cjs
   
   # Test heading styles
   node tests/test-heading-styles.cjs
   
   # Test workspace functionality
   node tests/test-workspace-functionality.cjs
   
   # Test workspace sign-in/sign-out flow
   node tests/test-workspace-sign-in-out.cjs
   
   # Debug workspace system
   node tests/debug-workspace.cjs
   
   # Test full explorer functionality
   node tests/test-e2e-explorer.cjs
   ```

4. **Run all tests:**
   ```bash
   # Run all tests sequentially
   for test in tests/*.cjs; do
     echo "Running $test..."
     node "$test"
     echo "---"
   done
   ```

### Test Output

Tests generate:
- **Screenshots** in the `tests/screenshots/` directory for visual verification
- **Console logs** with detailed test results
- **Success/failure indicators** for each test case

### Troubleshooting

**Container not running:**
- Ensure Docker is running
- Run `./build-fresh.sh` to start fresh containers
- Check `docker ps` to verify container is running on port 3000

**Test failures:**
- Check if the application is fully loaded (wait longer)
- Verify Docker container logs: `docker logs <container-name>`
- Ensure no other process is using port 3000

**Screenshot comparison:**
- Compare generated screenshots manually to verify visual changes
- Dark mode should show dramatically different backgrounds
- Heading styles should be consistent and properly formatted

### Adding New Tests

1. Create a new `.cjs` file in the `tests/` directory
2. Follow the existing test structure:
   ```javascript
   const { chromium } = require('playwright');
   
   (async () => {
     const browser = await chromium.launch();
     const page = await browser.newPage();
     
     // Your test logic here
     
     await browser.close();
   })();
   ```
3. Document the test in this README
4. Test with the Docker environment