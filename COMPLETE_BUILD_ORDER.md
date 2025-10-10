# Complete Build Order - All Dependencies

## The Dependency Chain

pdfme packages must be built in this order:

```
pdf-lib
   ↓
common (needs pdf-lib) ← Has our hide property type!
   ↓
converter (needs common)
   ↓
schemas (needs common, converter)
   ↓
ui (needs common, schemas) ← Has our hide property UI!
   ↓
generator (needs common, schemas)
   ↓
manipulator (needs common)
```

## Complete Build Commands

### Option 1: Use the Automated Script (EASIEST)

```
C:\Users\sandi\source\repos\wgs-reports\LINK_LOCAL_PDFME_COMPLETE.bat
```

Just double-click and wait ~10 minutes.

### Option 2: Manual Build (Step by Step)

```bash
cd C:\Users\sandi\source\repos\pdfme

# 1. Install dependencies (skip canvas)
npm install --ignore-scripts

# 2. Build in dependency order
npm run build:pdf-lib      # ~2 min
npm run build:common       # ~1 min ← Our hide property type
npm run build:converter    # ~1 min
npm run build:schemas      # ~2 min
npm run build:ui           # ~2 min ← Our hide property UI

# 3. Link UI package
cd packages\ui
npm link

# 4. Link to wgs-reports
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui

# 5. Start dev server
npm run dev
```

**Total time: ~8-10 minutes**

## Just Build What You Need (Faster)

If you only care about the Designer with hide property:

```bash
cd C:\Users\sandi\source\repos\pdfme
npm install --ignore-scripts

# Build only the dependency chain for UI
npm run build:pdf-lib
npm run build:common
npm run build:converter
npm run build:schemas
npm run build:ui

# Link it
cd packages\ui
npm link
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
```

Skip `generator` and `manipulator` - you don't need them for the Designer.

## What Each Package Does

- **pdf-lib**: Low-level PDF manipulation
- **common**: Types, schemas, validation ← **Has `hide: boolean` type**
- **converter**: PDF ↔ Image conversion
- **schemas**: Field types (text, image, etc.)
- **ui**: Designer, Form, Viewer components ← **Has hide checkbox & logic**
- **generator**: PDF generation from templates
- **manipulator**: PDF modification utilities

## Why Build Order Matters

TypeScript needs the compiled `.d.ts` files from dependencies:

```typescript
// In packages/common/src/types.ts
import type { PDFPage } from '@pdfme/pdf-lib';  // ← Needs pdf-lib built first

// In packages/ui/src/Designer.tsx
import { Schema } from '@pdfme/common';         // ← Needs common built first
import { text } from '@pdfme/schemas';          // ← Needs schemas built first
```

## Troubleshooting Build Errors

### Error: "Cannot find module '@pdfme/pdf-lib'"
**Solution:** Build pdf-lib first
```bash
npm run build:pdf-lib
```

### Error: "Cannot find module '@pdfme/common'"
**Solution:** Build common after pdf-lib
```bash
npm run build:pdf-lib
npm run build:common
```

### Error: "Cannot find module '@pdfme/schemas'"
**Solution:** Build full chain up to schemas
```bash
npm run build:pdf-lib
npm run build:common
npm run build:converter
npm run build:schemas
```

### Error: "Canvas build failed" or "node-gyp error"
**Solution:** Use `--ignore-scripts`
```bash
npm install --ignore-scripts
```

### Error: "Git version error" (shows red but continues)
**Ignore it!** It's just a warning. The build will continue with version 'x.x.x'.

## Verifying the Build

After building, check these directories exist:

```
C:\Users\sandi\source\repos\pdfme\packages\common\dist\
C:\Users\sandi\source\repos\pdfme\packages\ui\dist\
```

And verify the hide property is in the built files:

```bash
# Check if hide property is in common types
cd C:\Users\sandi\source\repos\pdfme\packages\common\dist
findstr /s "hide" *.d.ts

# Should show: hide?: boolean;
```

## After Linking

Verify the link works:

```bash
cd C:\Users\sandi\source\repos\wgs-reports\node_modules\@pdfme
dir ui
```

Should show:
```
<JUNCTION> ui [...\pdfme\packages\ui]
```

## Rebuilding After Code Changes

If you modify the pdfme code:

```bash
cd C:\Users\sandi\source\repos\pdfme

# If you changed common (schema types)
npm run build:common
npm run build:ui

# If you only changed UI (Canvas, DetailView)
npm run build:ui

# Then restart wgs-reports dev server
cd C:\Users\sandi\source\repos\wgs-reports
npm run dev
```

No need to re-link, the symlink stays active.
