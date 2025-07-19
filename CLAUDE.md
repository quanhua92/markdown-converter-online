# Claude Development Guide

This file contains development guidelines and useful commands for working on the markdown converter project.

## Project Structure

- `src/` - React application source code
- `server/` - Express.js backend server
- `tests/` - Playwright end-to-end tests
- `dist/` - Built frontend assets (generated)
- `server/dist/` - Built backend code (generated)

## Development Workflow

### Docker Development

The application runs in Docker containers for consistent development and testing.

#### Fresh Build and Start
```bash
./build-fresh.sh
```
This script:
- Stops existing containers
- Removes old images 
- Builds fresh with current git commit hash
- Starts new containers on port 3000

#### Using Different Compose Files
```bash
./build-fresh.sh docker-compose.proxy.yml  # Use proxy configuration
./build-fresh.sh docker-compose.yml        # Use standard configuration (default)
```

### Testing

#### Playwright Tests
Located in `tests/` directory. See `tests/README.md` for detailed information.

**Quick test commands:**
```bash
# Ensure application is running first
./build-fresh.sh

# Test dark mode functionality
node tests/test-dark-mode.cjs

# Test heading styles
node tests/test-heading-styles.cjs

# Test text readability and accessibility
node tests/test-readability.cjs
```

#### What to test after changes:
1. **UI Changes**: Run dark mode test to verify light/dark themes work
2. **Markdown Rendering**: Run heading styles test for preview/print consistency  
3. **Accessibility**: Run readability test to ensure WCAG compliance
4. **New Features**: Add new Playwright tests in `tests/` directory

#### Test Screenshots
All test screenshots are saved in `tests/screenshots/` directory:
- Light/dark mode comparisons
- Readability verification images
- Component styling verification

**IMPORTANT**: Always create new test files in `tests/` directory, not in root!

### Key Technical Details

#### Dark Mode Implementation
- Uses CSS class-based dark mode (`--dark-mode: class` in Tailwind CSS 4)
- Toggle adds/removes `dark` class on `document.documentElement`
- Custom CSS selectors (`.dark .main-bg`) instead of Tailwind dark variants
- Body background and main container gradient both have dark mode styles

#### Tailwind CSS 4
- Configuration in `src/styles.css` using `@theme` directive
- Typography plugin: `@plugin "@tailwindcss/typography"`
- Dark mode: `--dark-mode: class`
- Custom CSS for elements where Tailwind dark variants don't work

#### Print Functionality
- Dedicated print route (`/print`) using same ReactMarkdown component as preview
- Mermaid diagrams render correctly in both preview and print
- Consistent heading styles between preview and print modes

#### Workspace Management
- **Multiple Workspaces**: Users can create and switch between isolated file systems
- **Workspace Persistence**: Each workspace is stored separately in localStorage
- **Workspace Selector**: Dropdown in Files panel header for switching workspaces
- **Workspace Operations**: Create, rename, delete workspaces via dialog interfaces
- **Auto-save**: Current workspace and selected file are automatically saved
- **Isolation**: Each workspace maintains its own files, folders, and current file state

##### Workspace Storage Structure
```
localStorage:
├── markdown-explorer-current-workspace: "workspace_id"
├── markdown-explorer-workspace-default: { WorkspaceData }
├── markdown-explorer-workspace-{id}: { WorkspaceData }
└── ...

WorkspaceData:
{
  id: string,
  name: string,
  files: FileSystemItem[],
  currentFilePath?: string,
  createdAt: string,
  lastModified: string
}

FileSystemItem:
{
  id: string,
  name: string,
  type: 'file' | 'folder',
  path: string,
  content?: string,
  children?: FileSystemItem[],
  isExpanded?: boolean
}
```

##### Workspace Implementation Components
- **useWorkspaceManager.tsx**: Core hook managing workspace state and localStorage operations
- **WorkspaceSelector.tsx**: UI component with dropdown, create/rename/delete dialogs
- **useFileSystem.tsx**: Integration layer connecting workspace management to file operations
- **FileTree.tsx**: Contains workspace selector in header (currently disabled for debugging)

##### Storage Keys
- `markdown-explorer-current-workspace`: Stores active workspace ID
- `markdown-explorer-workspace-{id}`: Stores individual workspace data
- `markdown-explorer-workspaces`: Legacy key for workspace list (deprecated)

##### Default Workspace
- **ID**: `default`
- **Name**: "Default Workspace"
- **Creation**: Automatically created if no workspaces exist
- **Protection**: Cannot be deleted (minimum one workspace required)
- **Initialization**: Contains Welcome.md and sample files on first use

##### Workspace Switching Flow
1. User selects workspace from dropdown
2. Current workspace data is saved to localStorage
3. New workspace data is loaded from localStorage
4. UI updates to show new workspace files
5. Current workspace ID is updated in localStorage

### Common Commands

#### Git Workflow
```bash
git add .
git commit -m "Descriptive commit message"
git push
```

#### View Running Containers
```bash
docker ps
```

#### View Container Logs
```bash
docker logs markdown-converter-online-markdown-converter-1
```

#### Clean Docker Resources
```bash
docker system prune -f  # Remove unused containers/images
```

### Linting and Type Checking

Run these commands after making changes (if available in project):
```bash
npm run lint      # Code linting
npm run typecheck # TypeScript checking
npm run test      # Unit tests
```

### Troubleshooting

#### Container Won't Start
1. Check if port 3000 is available: `lsof -i :3000`
2. Stop any conflicting processes
3. Run `./build-fresh.sh` again

#### Dark Mode Not Working
1. Run `node tests/test-dark-mode.cjs` to verify
2. Check browser dev tools for `dark` class on `<html>` element
3. Verify CSS is loading correctly

#### Print Function Issues
1. Test with `node tests/test-heading-styles.cjs`
2. Check that print route loads: `http://localhost:3000/print?content=test`
3. Verify Mermaid diagrams render in print view

#### Build Failures
1. Check Docker logs for specific errors
2. Ensure all dependencies are in package.json
3. Verify TypeScript compilation: `tsc --noEmit`

### Best Practices

1. **Always test in Docker** - Use `./build-fresh.sh` for consistent environment
2. **Test dark mode** - Run Playwright tests after UI changes
3. **Document changes** - Update this file for new workflows or important findings
4. **Use meaningful commits** - Include what was fixed and why
5. **Test both preview and print** - Ensure markdown rendering consistency