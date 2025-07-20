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

Our test suite has been optimized to focus on core functionality and remove redundant tests. All tests are end-to-end Playwright tests that verify real user workflows.

#### Core UI Tests

##### Dark Mode Test (`test-dark-mode.cjs`)
Tests the light/dark mode toggle functionality and visual changes.

**What it tests:**
- Dark mode toggle functionality (adds/removes `dark` class)
- Background color changes between light and dark modes
- Takes screenshots for visual verification
- Verifies computed styles and CSS application

**Run:** `node tests/test-dark-mode.cjs`

##### Heading Styles Test (`test-heading-styles.cjs`)
Tests markdown heading rendering consistency between preview and print modes.

**What it tests:**
- Heading font sizes, weights, and borders
- Consistency between preview and print modes
- Proper typography styling

**Run:** `node tests/test-heading-styles.cjs`

##### Readability Test (`test-readability.cjs`)
Tests text readability and accessibility compliance (WCAG).

**What it tests:**
- WCAG contrast ratio compliance
- Text readability across different elements
- Color contrast between text and background
- Accessibility standards verification

**Run:** `node tests/test-readability.cjs`

#### Explorer & Workspace Tests

##### Explorer E2E Test (`test-e2e-explorer.cjs`)
Comprehensive test for the Markdown Explorer functionality.

**What it tests:**
- Template initialization (Project Notes, Knowledge Base, Blog/Website)
- File tree navigation and toggle functionality
- Multi-file editing workflow with auto-save
- Mobile responsive design with edit/preview tabs
- Data persistence across browser sessions
- Dark/light mode in Explorer interface

**Run:** `node tests/test-e2e-explorer.cjs`

##### Workspace Welcome Test (`test-workspace-welcome.cjs`)
Tests the new workspace welcome flow and no-workspace state management.

**What it tests:**
- Workspace welcome screen display (no-workspace state)
- Create new workspace workflow with custom naming
- Join existing workspace functionality
- Leave workspace to return to welcome screen
- Template initialization from welcome screen
- Import from ZIP placeholder functionality

**Run:** `node tests/test-workspace-welcome.cjs`

##### Workspace Functionality Test (`test-workspace-functionality.cjs`)
Tests workspace management and session isolation.

**What it tests:**
- Workspace creation and automatic joining
- Multi-workspace isolation and data persistence
- Session management and localStorage structure
- UI state changes between workspace sessions

**Run:** `node tests/test-workspace-functionality.cjs`

##### Workspace Sign-In/Out Test (`test-workspace-sign-in-out.cjs`)
Tests complete workspace session management workflow.

**What it tests:**
- Workspace creation with "Create & Join" flow
- Workspace leaving with "Leave" button
- Workspace joining with "Join Workspace" dialog
- Data persistence and isolation between sessions
- localStorage structure and multi-workspace support

**Run:** `node tests/test-workspace-sign-in-out.cjs`

##### Folder Toggle Fix Test (`test-folder-toggle-fix.cjs`)
Tests folder expand/collapse functionality in the file tree.

**What it tests:**
- Folder toggle button detection and interaction
- Expand/collapse state changes and visual indicators
- Children visibility when folders are expanded/collapsed
- Proper hiding/showing of folder children
- Consistent visual state indicators (arrows)
- Correct aria-expanded attribute handling
- JavaScript error detection during folder operations

**Run:** `node tests/test-folder-toggle-fix.cjs`

#### Print & Features Tests

##### Print Workflow Test (`test-print-workflow.cjs`)
Tests the print functionality workflow.

**What it tests:**
- Print page generation and rendering
- Content consistency between preview and print
- Print URL generation and accessibility

**Run:** `node tests/test-print-workflow.cjs`

##### Print Mermaid Test (`test-print-mermaid.cjs`)
Tests Mermaid diagram rendering in print mode.

**What it tests:**
- Mermaid diagrams render correctly in print view
- Chart types supported in print mode
- Visual consistency between preview and print

**Run:** `node tests/test-print-mermaid.cjs`

##### Mermaid Multiple Test (`test-mermaid-multiple.cjs`)
Tests multiple Mermaid diagrams on the same page.

**What it tests:**
- Multiple diagram rendering
- Different chart types in one document
- Performance with multiple diagrams

**Run:** `node tests/test-mermaid-multiple.cjs`

#### Debug Utilities

##### Workspace Debug (`debug-workspace.cjs`)
Debugging tool for workspace system analysis.

**What it does:**
- Analyzes localStorage workspace data structure
- Detects UI element rendering issues
- Monitors console errors
- Provides diagnostic information

**Run:** `node tests/debug-workspace.cjs`

##### Anchors Debug (`debug-anchors.cjs`)
Debugging tool for anchor link functionality.

**What it does:**
- Tests anchor link generation and navigation
- Verifies table of contents links
- Debugs heading ID generation

**Run:** `node tests/debug-anchors.cjs`

### Running Tests

1. **Start the application:**
   ```bash
   ./build-fresh.sh
   ```

2. **Wait for the container to be ready** (usually 5-10 seconds)

3. **Run individual tests:**
   ```bash
   # Core UI Tests
   node tests/test-dark-mode.cjs
   node tests/test-heading-styles.cjs
   node tests/test-readability.cjs
   
   # Workspace & Explorer Tests
   node tests/test-workspace-welcome.cjs
   node tests/test-workspace-functionality.cjs
   node tests/test-workspace-sign-in-out.cjs
   node tests/test-folder-toggle-fix.cjs
   node tests/test-e2e-explorer.cjs
   
   # Print & Features Tests
   node tests/test-print-workflow.cjs
   node tests/test-print-mermaid.cjs
   node tests/test-mermaid-multiple.cjs
   
   # Debug Utilities
   node tests/debug-workspace.cjs
   node tests/debug-anchors.cjs
   ```

4. **Run core test suite:**
   ```bash
   # Run essential tests (recommended for CI/regression testing)
   for test in test-dark-mode.cjs test-heading-styles.cjs test-readability.cjs test-workspace-welcome.cjs test-folder-toggle-fix.cjs test-e2e-explorer.cjs; do
     echo "Running tests/$test..."
     node "tests/$test"
     echo "---"
   done
   ```

5. **Run all tests:**
   ```bash
   # Run all tests sequentially (excludes debug utilities)
   for test in tests/test-*.cjs; do
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

**Folder toggle issues:**
- If folders appear collapsed but children are still visible, run `node tests/test-folder-toggle-fix.cjs`
- This was a known bug fixed in v2.1 - ensure you're running the latest version
- Folder toggle functionality should work correctly after the fix

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