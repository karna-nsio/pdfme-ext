# Skip Canvas Package Build (Recommended Solution)

## Problem

The `canvas` package is only used for **testing** in pdfme. It's **not needed** for:
- Building the UI package
- Using the Designer component
- The hide property feature

The error occurs because `canvas` requires Python and native build tools.

## Solution: Install Without Optional Dependencies

Use the `--ignore-scripts` flag to skip building canvas:

```bash
cd C:\Users\sandi\source\repos\pdfme

# Install without building native modules
npm install --ignore-scripts
```

This will install all JavaScript dependencies but skip compiling native C++ modules like canvas.

## Then Build Only What You Need

Since you only need the UI package with the hide property:

```bash
# Build just the packages you need (skip tests)
cd C:\Users\sandi\source\repos\pdfme

# 1. Build common (has the hide property type)
npm run build:common

# 2. Build UI (has the Canvas and DetailView changes)
npm run build:ui
```

## Complete Quick Steps

```bash
# 1. Install dependencies (skip optional/test packages)
cd C:\Users\sandi\source\repos\pdfme
npm install --ignore-scripts

# 2. Build only what's needed
npm run build:common
npm run build:ui

# 3. Link UI package
cd packages\ui
npm link

# 4. Link to wgs-reports
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui

# 5. Start dev server
npm run dev
```

## Why This Works

- ✅ `--ignore-scripts` skips the canvas native build
- ✅ The UI package doesn't actually use canvas
- ✅ Canvas is only used in test files
- ✅ Your hide property feature is in common + ui packages only
- ✅ You don't need to run tests, just build for production

## Alternative: Use Already Built Package

If even `npm install --ignore-scripts` fails, you can try this approach:

### Option 1: Build Individual Packages Manually

```bash
cd C:\Users\sandi\source\repos\pdfme

# Install TypeScript globally if needed
npm install -g typescript

# Build common package
cd packages\common
npm install --ignore-scripts
npm run build

# Build UI package
cd ..\ui
npm install --ignore-scripts
npm run build

# Link it
npm link

# Go to wgs-reports and link
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
```

### Option 2: Skip Canvas in package.json

Edit `C:\Users\sandi\source\repos\pdfme\package.json` and add:

```json
{
  "overrides": {
    "canvas": "npm:noop-package@1.0.0"
  }
}
```

Or simply remove canvas from devDependencies temporarily.

## If You Really Need Canvas (For Tests)

If you want to run the full test suite later, you'll need:

1. **Install Python 3.6+**: https://www.python.org/downloads/
2. **Install Visual Studio Build Tools**: https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++"
3. **Set Python path**:
   ```bash
   npm config set python "C:\Python311\python.exe"
   ```

But again, **you don't need this for using the Designer with the hide property!**
