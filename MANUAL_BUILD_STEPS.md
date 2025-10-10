# Manual Build and Link Steps

## Problem: npm-run-all not installed

The automated build script requires `npm-run-all` to be installed first.

## Solution: Follow These Steps

### Step 1: Install Dependencies in pdfme

```bash
cd C:\Users\sandi\source\repos\pdfme
npm install
```

**Wait for this to complete** - it may take a few minutes. This will install `npm-run-all` and all other dependencies.

### Step 2: Build pdfme Packages

```bash
# Still in C:\Users\sandi\source\repos\pdfme
npm run build
```

**This will take 5-10 minutes** as it builds all packages:
- pdf-lib
- common (includes our hide property change)
- converter
- schemas
- generator
- ui (includes Canvas and DetailView changes)
- manipulator

You'll see output like:
```
> Compiling TypeScript...
> Building packages...
✓ Build successful
```

### Step 3: Link the UI Package Globally

```bash
cd C:\Users\sandi\source\repos\pdfme\packages\ui
npm link
```

You should see:
```
C:\Users\sandi\AppData\Roaming\npm\node_modules\@pdfme\ui -> C:\Users\sandi\source\repos\pdfme\packages\ui
```

### Step 4: Link in wgs-reports Project

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
```

You should see:
```
C:\Users\sandi\source\repos\wgs-reports\node_modules\@pdfme\ui -> C:\Users\sandi\AppData\Roaming\npm\node_modules\@pdfme\ui -> C:\Users\sandi\source\repos\pdfme\packages\ui
```

### Step 5: Verify the Link

Check that the symlink exists:

```bash
cd C:\Users\sandi\source\repos\wgs-reports\node_modules\@pdfme
dir
```

You should see `ui` listed as a junction/symlink pointing to your local pdfme.

### Step 6: Start Your Dev Server

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm run dev
```

## Alternative: Build Only the UI Package

If the full build takes too long, you can build just the packages you need:

```bash
cd C:\Users\sandi\source\repos\pdfme

# Build dependencies first
npm run build:pdf-lib
npm run build:common     # ← Has our hide property type
npm run build:ui         # ← Has our Canvas and DetailView changes
```

Then proceed with Step 3 and 4 above.

## Troubleshooting

### Issue: "npm-run-all is not recognized"

**Solution:** Run `npm install` in the pdfme root directory first.

```bash
cd C:\Users\sandi\source\repos\pdfme
npm install
```

### Issue: "Cannot find module '@pdfme/common'"

**Solution:** Build the common package first:

```bash
cd C:\Users\sandi\source\repos\pdfme
npm run build:common
```

### Issue: Build errors in packages

**Solution:** Clean and rebuild:

```bash
cd C:\Users\sandi\source\repos\pdfme
npm run clean
npm install
npm run build
```

### Issue: Link doesn't seem to work

**Solution:** Unlink and relink:

```bash
# In wgs-reports
cd C:\Users\sandi\source\repos\wgs-reports
npm unlink @pdfme/ui

# In pdfme/packages/ui
cd C:\Users\sandi\source\repos\pdfme\packages\ui
npm unlink

# Redo the linking steps
npm link
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
```

### Issue: Changes not appearing after linking

**Solution:**
1. Stop your dev server
2. Clear browser cache (Ctrl+Shift+Delete)
3. In wgs-reports, delete `.next` or `dist` folder if it exists
4. Restart dev server

```bash
cd C:\Users\sandi\source\repos\wgs-reports
rm -rf .next dist
npm run dev
```

## Quick Reference: All Commands

Copy and paste these one by one:

```bash
# 1. Install dependencies
cd C:\Users\sandi\source\repos\pdfme
npm install

# 2. Build all packages
npm run build

# 3. Link UI package
cd packages\ui
npm link

# 4. Link to wgs-reports
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui

# 5. Start dev server
npm run dev
```

## When to Rebuild

You need to rebuild pdfme whenever you make changes to the pdfme source code:

```bash
cd C:\Users\sandi\source\repos\pdfme

# Option 1: Full rebuild (slower, safer)
npm run build

# Option 2: Just rebuild UI (faster, if you only changed UI)
npm run build:ui

# Option 3: Just rebuild common (if you only changed types)
npm run build:common
```

After rebuilding, restart your wgs-reports dev server to see changes.
