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
```

#### What to test after changes:
1. **UI Changes**: Run dark mode test to verify light/dark themes work
2. **Markdown Rendering**: Run heading styles test for preview/print consistency
3. **New Features**: Add new Playwright tests in `tests/` directory

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