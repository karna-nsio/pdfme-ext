# Implementation Plan: Text Field Enhancements for PDFme Designer

**Version:** 1.0
**Date:** 2025-11-09
**Priority:** HIGH - Critical missing features for professional document design
**Estimated Effort:** 3-5 days for all features

---

## Table of Contents
1. [Overview](#overview)
2. [Feature 1: Bold & Italic (Font Weight & Style)](#feature-1-bold--italic-font-weight--style)
3. [Feature 2: Border Properties](#feature-2-border-properties)
4. [Feature 3: Padding](#feature-3-padding)
5. [Feature 4: Text Transform](#feature-4-text-transform)
6. [Feature 5: Line Styles (Dashed/Dotted)](#feature-5-line-styles-dasheddotted)
7. [Testing Checklist](#testing-checklist)
8. [Implementation Order](#implementation-order)

---

## Overview

This document provides a **step-by-step implementation plan** for adding critical text styling features to PDFme. Each feature includes:
- **Exact file paths** to modify
- **Exact code snippets** to add
- **Line numbers** or insertion points
- **Test cases** to verify functionality

**Architecture:**
- Each text field uses a **Plugin** pattern with 3 components:
  1. `types.ts` - TypeScript interface definitions
  2. `propPanel.ts` - Designer UI configuration (what users see)
  3. `uiRender.ts` - Browser rendering (CSS)
  4. `pdfRender.ts` - PDF generation (pdf-lib)

---

## Feature 1: Bold & Italic (Font Weight & Style)

**Priority:** CRITICAL (Most important missing feature)
**Complexity:** MEDIUM
**Estimated Time:** 1 day

### Problem
Users cannot make text bold or italic. The Figma design has multiple bold text elements that cannot be recreated.

### Solution Architecture

**Important Note:** PDFme uses custom fonts loaded via `options.font`. Bold/italic require **separate font files**:
- Regular: `Roboto-Regular.ttf`
- Bold: `Roboto-Bold.ttf`
- Italic: `Roboto-Italic.ttf`
- Bold Italic: `Roboto-BoldItalic.ttf`

We'll add `fontWeight` and `fontStyle` properties that **select the appropriate font variant**.

---

### Step 1: Add TypeScript Types

**File:** `packages/schemas/src/text/types.ts`

**Current Code (lines 14-30):**
```typescript
export interface TextSchema extends Schema {
  fontName?: string;
  alignment: ALIGNMENT;
  verticalAlignment: VERTICAL_ALIGNMENT;
  fontSize: number;
  lineHeight: number;
  strikethrough?: boolean;
  underline?: boolean;
  characterSpacing: number;
  dynamicFontSize?: {
    min: number;
    max: number;
    fit: DYNAMIC_FONT_SIZE_FIT;
  };
  fontColor: string;
  backgroundColor: string;
}
```

**New Code (ADD these properties):**
```typescript
export interface TextSchema extends Schema {
  fontName?: string;
  fontWeight?: 'normal' | 'bold';          // :new: ADD THIS
  fontStyle?: 'normal' | 'italic';         // :new: ADD THIS
  alignment: ALIGNMENT;
  verticalAlignment: VERTICAL_ALIGNMENT;
  fontSize: number;
  lineHeight: number;
  strikethrough?: boolean;
  underline?: boolean;
  characterSpacing: number;
  dynamicFontSize?: {
    min: number;
    max: number;
    fit: DYNAMIC_FONT_SIZE_FIT;
  };
  fontColor: string;
  backgroundColor: string;
}
```

---

### Step 2: Add Constants

**File:** `packages/schemas/src/text/constants.ts`

**Current Code (end of file):**
```typescript
export const DEFAULT_FONT_COLOR = '#000000';
export const PLACEHOLDER_FONT_COLOR = '#a1a1a1';
```

**New Code (ADD at the end):**
```typescript
export const DEFAULT_FONT_COLOR = '#000000';
export const PLACEHOLDER_FONT_COLOR = '#a1a1a1';

// :new: ADD THESE
export const DEFAULT_FONT_WEIGHT = 'normal';
export const DEFAULT_FONT_STYLE = 'normal';
```

---

### Step 3: Update PropPanel (Designer UI)

**File:** `packages/schemas/src/text/propPanel.ts`

**Location:** Inside the `textSchema` object (around line 61)

**Current Code:**
```typescript
const textSchema: Record<string, PropPanelSchema> = {
  fontName: {
    title: i18n('schemas.text.fontName'),
    type: 'string',
    widget: 'select',
    default: fallbackFontName,
    placeholder: fallbackFontName,
    props: { options: fontNames.map((name) => ({ label: name, value: name })) },
    span: 12,
  },
  fontSize: {
    // ... existing code
  },
```

**New Code (ADD after fontName, before fontSize):**
```typescript
const textSchema: Record<string, PropPanelSchema> = {
  fontName: {
    title: i18n('schemas.text.fontName'),
    type: 'string',
    widget: 'select',
    default: fallbackFontName,
    placeholder: fallbackFontName,
    props: { options: fontNames.map((name) => ({ label: name, value: name })) },
    span: 12,
  },
  // :new: ADD THESE TWO FIELDS
  fontWeight: {
    title: i18n('schemas.text.fontWeight'),
    type: 'string',
    widget: 'select',
    props: {
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Bold', value: 'bold' },
      ],
    },
    span: 6,
  },
  fontStyle: {
    title: i18n('schemas.text.fontStyle'),
    type: 'string',
    widget: 'select',
    props: {
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Italic', value: 'italic' },
      ],
    },
    span: 6,
  },
  // END NEW FIELDS
  fontSize: {
    title: i18n('schemas.text.size'),
    type: 'number',
    widget: 'inputNumber',
    span: 6,
    disabled: enableDynamicFont,
    props: { min: 0 },
  },
```

**Also Update defaultSchema (around line 161):**

**Current Code:**
```typescript
defaultSchema: {
  name: '',
  type: 'text',
  content: 'Type Something...',
  position: { x: 0, y: 0 },
  width: 45,
  height: 10,
  rotate: 0,
  alignment: DEFAULT_ALIGNMENT,
  verticalAlignment: DEFAULT_VERTICAL_ALIGNMENT,
  fontSize: DEFAULT_FONT_SIZE,
  lineHeight: DEFAULT_LINE_HEIGHT,
  characterSpacing: DEFAULT_CHARACTER_SPACING,
  dynamicFontSize: undefined,
  fontColor: DEFAULT_FONT_COLOR,
  fontName: undefined,
  backgroundColor: '',
  opacity: DEFAULT_OPACITY,
  strikethrough: false,
  underline: false,
},
```

**New Code (ADD new properties):**
```typescript
defaultSchema: {
  name: '',
  type: 'text',
  content: 'Type Something...',
  position: { x: 0, y: 0 },
  width: 45,
  height: 10,
  rotate: 0,
  alignment: DEFAULT_ALIGNMENT,
  verticalAlignment: DEFAULT_VERTICAL_ALIGNMENT,
  fontSize: DEFAULT_FONT_SIZE,
  lineHeight: DEFAULT_LINE_HEIGHT,
  characterSpacing: DEFAULT_CHARACTER_SPACING,
  dynamicFontSize: undefined,
  fontColor: DEFAULT_FONT_COLOR,
  fontName: undefined,
  fontWeight: DEFAULT_FONT_WEIGHT,    // :new: ADD THIS
  fontStyle: DEFAULT_FONT_STYLE,      // :new: ADD THIS
  backgroundColor: '',
  opacity: DEFAULT_OPACITY,
  strikethrough: false,
  underline: false,
},
```

---

### Step 4: Add i18n Labels

**File:** `packages/common/src/i18n.ts`

**Location:** Find the section with text schema labels (search for `'schemas.text.fontName'`)

**Current Code:**
```typescript
'schemas.text.fontName': 'Font',
'schemas.text.size': 'Size',
'schemas.text.spacing': 'Character Spacing',
```

**New Code (ADD after fontName):**
```typescript
'schemas.text.fontName': 'Font',
'schemas.text.fontWeight': 'Weight',     // :new: ADD THIS
'schemas.text.fontStyle': 'Style',       // :new: ADD THIS
'schemas.text.size': 'Size',
'schemas.text.spacing': 'Character Spacing',
```

**Also Update the Dict schema:**

**File:** `packages/common/src/schema.ts`

**Location:** Around line 83

**Current Code:**
```typescript
'schemas.text.fontName': z.string(),
'schemas.text.size': z.string(),
'schemas.text.spacing': z.string(),
```

**New Code:**
```typescript
'schemas.text.fontName': z.string(),
'schemas.text.fontWeight': z.string(),   // :new: ADD THIS
'schemas.text.fontStyle': z.string(),    // :new: ADD THIS
'schemas.text.size': z.string(),
'schemas.text.spacing': z.string(),
```

---

### Step 5: Update UI Rendering (Browser)

**File:** `packages/schemas/src/text/uiRender.ts`

**Location:** In `buildStyledTextContainer` function, around line 215

**Current Code:**
```typescript
const textBlockStyle: CSS.Properties = {
  // Font formatting styles
  fontFamily: schema.fontName ? `'${schema.fontName}'` : 'inherit',
  color: schema.fontColor ? schema.fontColor : DEFAULT_FONT_COLOR,
  fontSize: `${dynamicFontSize ?? schema.fontSize ?? DEFAULT_FONT_SIZE}pt`,
  letterSpacing: `${schema.characterSpacing ?? DEFAULT_CHARACTER_SPACING}pt`,
  lineHeight: `${schema.lineHeight ?? DEFAULT_LINE_HEIGHT}em`,
  textAlign: schema.alignment ?? DEFAULT_ALIGNMENT,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  // ... rest
```

**New Code (ADD fontWeight and fontStyle):**
```typescript
const textBlockStyle: CSS.Properties = {
  // Font formatting styles
  fontFamily: schema.fontName ? `'${schema.fontName}'` : 'inherit',
  fontWeight: schema.fontWeight ?? DEFAULT_FONT_WEIGHT,       // :new: ADD THIS
  fontStyle: schema.fontStyle ?? DEFAULT_FONT_STYLE,           // :new: ADD THIS
  color: schema.fontColor ? schema.fontColor : DEFAULT_FONT_COLOR,
  fontSize: `${dynamicFontSize ?? schema.fontSize ?? DEFAULT_FONT_SIZE}pt`,
  letterSpacing: `${schema.characterSpacing ?? DEFAULT_CHARACTER_SPACING}pt`,
  lineHeight: `${schema.lineHeight ?? DEFAULT_LINE_HEIGHT}em`,
  textAlign: schema.alignment ?? DEFAULT_ALIGNMENT,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  // ... rest
```

**Don't forget to import the constants at the top:**

**Add to imports (around line 1-20):**
```typescript
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_ALIGNMENT,
  VERTICAL_ALIGN_TOP,
  VERTICAL_ALIGN_MIDDLE,
  VERTICAL_ALIGN_BOTTOM,
  DEFAULT_VERTICAL_ALIGNMENT,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_CHARACTER_SPACING,
  DEFAULT_FONT_COLOR,
  PLACEHOLDER_FONT_COLOR,
  DEFAULT_FONT_WEIGHT,    // :new: ADD THIS
  DEFAULT_FONT_STYLE,     // :new: ADD THIS
} from './constants.js';
```

---

### Step 6: Update PDF Rendering (Critical!)

**File:** `packages/schemas/src/text/pdfRender.ts`

**Important:** PDFme cannot apply CSS `fontWeight: bold` to PDFs. Instead, we need to **select a different font file** (e.g., `Roboto-Bold.ttf`).

**Create a helper function to get the correct font variant:**

**Location:** Add this new function at the top of the file (after imports, around line 32)

```typescript
/**
 * Get the appropriate font name based on fontWeight and fontStyle.
 *
 * Font variants must be registered separately in options.font:
 * - 'Roboto' → Roboto-Regular.ttf
 * - 'Roboto-Bold' → Roboto-Bold.ttf
 * - 'Roboto-Italic' → Roboto-Italic.ttf
 * - 'Roboto-BoldItalic' → Roboto-BoldItalic.ttf
 *
 * @param baseFontName - The base font name (e.g., 'Roboto')
 * @param fontWeight - 'normal' | 'bold'
 * @param fontStyle - 'normal' | 'italic'
 * @returns The font variant name to use
 */
const getFontVariant = (
  baseFontName: string,
  fontWeight: 'normal' | 'bold' = 'normal',
  fontStyle: 'normal' | 'italic' = 'normal'
): string => {
  if (fontWeight === 'bold' && fontStyle === 'italic') {
    return `${baseFontName}-BoldItalic`;
  }
  if (fontWeight === 'bold') {
    return `${baseFontName}-Bold`;
  }
  if (fontStyle === 'italic') {
    return `${baseFontName}-Italic`;
  }
  return baseFontName;
};
```

**Now update the font selection logic:**

**Location:** Around line 108-111

**Current Code:**
```typescript
const fontName = (
  schema.fontName ? schema.fontName : getFallbackFontName(font)
) as keyof typeof pdfFontObj;
const pdfFontValue = pdfFontObj && pdfFontObj[fontName];
```

**New Code:**
```typescript
const baseFontName = schema.fontName ? schema.fontName : getFallbackFontName(font);
const fontName = getFontVariant(
  baseFontName,
  schema.fontWeight,
  schema.fontStyle
) as keyof typeof pdfFontObj;

// Fallback to base font if variant doesn't exist
const pdfFontValue = (pdfFontObj && pdfFontObj[fontName]) || pdfFontObj[baseFontName];
```

**Also update the fontKitFont loading:**

**Location:** Around line 96-103

**Current Code:**
```typescript
const [pdfFontObj, fontKitFont] = await Promise.all([
  embedAndGetFontObj({
    pdfDoc,
    font,
    _cache: _cache as unknown as Map<PDFDocument, { [key: string]: PDFFont }>,
  }),
  getFontKitFont(schema.fontName, font, _cache as Map<string, FontKitFont>),
]);
```

**New Code:**
```typescript
const baseFontName = schema.fontName || getFallbackFontName(font);
const variantFontName = getFontVariant(baseFontName, schema.fontWeight, schema.fontStyle);

const [pdfFontObj, fontKitFont] = await Promise.all([
  embedAndGetFontObj({
    pdfDoc,
    font,
    _cache: _cache as unknown as Map<PDFDocument, { [key: string]: PDFFont }>,
  }),
  // Try to load the variant, fallback to base font if not available
  getFontKitFont(variantFontName, font, _cache as Map<string, FontKitFont>)
    .catch(() => getFontKitFont(baseFontName, font, _cache as Map<string, FontKitFont>)),
]);
```

---

### Step 7: Update Helper Functions

**File:** `packages/schemas/src/text/helper.ts`

The `getFontKitFont` function needs to handle missing font variants gracefully.

**Location:** Find the `getFontKitFont` function (search for "export const getFontKitFont")

**Ensure it has proper error handling:**

```typescript
export const getFontKitFont = async (
  fontName: string | undefined,
  font: Font,
  cache: Map<string, FontKitFont>,
): Promise<FontKitFont> => {
  const fallbackFontName = getFallbackFontName(font);
  const name = fontName || fallbackFontName;

  if (cache.has(name)) {
    return cache.get(name)!;
  }

  const fontValue = font[name];

  // :new: ADD: If font variant doesn't exist, try fallback
  if (!fontValue) {
    console.warn(`Font "${name}" not found, using fallback "${fallbackFontName}"`);
    return getFontKitFont(fallbackFontName, font, cache);
  }

  let data = fontValue.data;
  if (typeof data === 'string' && data.startsWith('http')) {
    data = await fetch(data).then((res) => res.arrayBuffer());
  }

  const fontBuffer = typeof data === 'string' ? b64toUint8Array(data) : data;
  const loadedFont = fontkit.create(Buffer.from(fontBuffer));
  cache.set(name, loadedFont);

  return loadedFont;
};
```

---

### Step 8: Documentation for Users

Create a note in the README or documentation explaining how to use bold/italic:

**Example Usage:**

```typescript
import { Template, Font } from '@pdfme/common';

// Define font with variants
const font: Font = {
  'Roboto': {
    data: await fetch('/fonts/Roboto-Regular.ttf').then(r => r.arrayBuffer()),
    fallback: true,
  },
  'Roboto-Bold': {
    data: await fetch('/fonts/Roboto-Bold.ttf').then(r => r.arrayBuffer()),
  },
  'Roboto-Italic': {
    data: await fetch('/fonts/Roboto-Italic.ttf').then(r => r.arrayBuffer()),
  },
  'Roboto-BoldItalic': {
    data: await fetch('/fonts/Roboto-BoldItalic.ttf').then(r => r.arrayBuffer()),
  },
};

// Use in template
const template: Template = {
  schemas: [[
    {
      name: 'title',
      type: 'text',
      fontName: 'Roboto',
      fontWeight: 'bold',      // Uses Roboto-Bold.ttf
      fontStyle: 'normal',
      fontSize: 24,
      // ... other properties
    },
  ]],
  // ...
};
```

---

### Testing Checklist for Feature 1

- [ ] **TypeScript compiles without errors**
  ```bash
  npm run build:common
  npm run build:schemas
  ```

- [ ] **Designer UI shows Bold/Italic dropdowns**
  - Open Designer
  - Select a text field
  - Verify "Weight" dropdown shows (Normal, Bold)
  - Verify "Style" dropdown shows (Normal, Italic)

- [ ] **Browser rendering works**
  - Set text to Bold → should render bold in Viewer/Form
  - Set text to Italic → should render italic
  - Set both Bold+Italic → should render bold italic

- [ ] **PDF generation works**
  - Load font variants (Regular, Bold, Italic, BoldItalic)
  - Generate PDF with bold text
  - Open PDF → text should be bold (not faux-bold)

- [ ] **Fallback behavior**
  - Set fontWeight=bold but don't load Bold variant
  - Should fallback to regular font (with console warning)

- [ ] **Template serialization**
  - Save template with bold text
  - Reload template
  - Verify bold property persists

---

## Feature 2: Border Properties

**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated Time:** 1 day

### Problem
Text fields cannot have borders. The Figma design shows dotted borders, solid borders, and bordered boxes.

### Solution Architecture

Add `border`, `borderWidth`, `borderColor`, `borderStyle` properties to text schema.

---

### Step 1: Add TypeScript Types

**File:** `packages/schemas/src/text/types.ts`

**Add to TextSchema interface:**
```typescript
export interface TextSchema extends Schema {
  // ... existing properties
  fontColor: string;
  backgroundColor: string;
  // :new: ADD THESE
  border?: boolean;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
}
```

---

### Step 2: Add Constants

**File:** `packages/schemas/src/text/constants.ts`

```typescript
// :new: ADD THESE
export const DEFAULT_BORDER_WIDTH = 1;
export const DEFAULT_BORDER_COLOR = '#000000';
export const DEFAULT_BORDER_STYLE = 'solid';
export const DEFAULT_BORDER_RADIUS = 0;
```

---

### Step 3: Update PropPanel

**File:** `packages/schemas/src/text/propPanel.ts`

**Add after backgroundColor:**

```typescript
const textSchema: Record<string, PropPanelSchema> = {
  // ... existing fields
  backgroundColor: {
    title: i18n('schemas.bgColor'),
    type: 'string',
    widget: 'color',
    props: {
      disabledAlpha: true,
    },
    rules: [
      {
        pattern: HEX_COLOR_PATTERN,
        message: i18n('validation.hexColor'),
      },
    ],
  },
  // :new: ADD BORDER SECTION
  border: {
    title: i18n('schemas.border.enabled'),
    type: 'boolean',
    span: 8,
  },
  borderWidth: {
    title: i18n('schemas.border.width'),
    type: 'number',
    widget: 'inputNumber',
    span: 8,
    props: { min: 0, step: 0.5 },
    hidden: '{{!formData.border}}',
  },
  borderRadius: {
    title: i18n('schemas.border.radius'),
    type: 'number',
    widget: 'inputNumber',
    span: 8,
    props: { min: 0 },
    hidden: '{{!formData.border}}',
  },
  borderColor: {
    title: i18n('schemas.border.color'),
    type: 'string',
    widget: 'color',
    props: {
      disabledAlpha: true,
    },
    rules: [
      {
        pattern: HEX_COLOR_PATTERN,
        message: i18n('validation.hexColor'),
      },
    ],
    hidden: '{{!formData.border}}',
  },
  borderStyle: {
    title: i18n('schemas.border.style'),
    type: 'string',
    widget: 'select',
    props: {
      options: [
        { label: i18n('schemas.border.solid'), value: 'solid' },
        { label: i18n('schemas.border.dashed'), value: 'dashed' },
        { label: i18n('schemas.border.dotted'), value: 'dotted' },
      ],
    },
    hidden: '{{!formData.border}}',
  },
};
```

**Update defaultSchema:**

```typescript
defaultSchema: {
  // ... existing properties
  strikethrough: false,
  underline: false,
  // :new: ADD THESE
  border: false,
  borderWidth: DEFAULT_BORDER_WIDTH,
  borderColor: DEFAULT_BORDER_COLOR,
  borderStyle: DEFAULT_BORDER_STYLE,
  borderRadius: DEFAULT_BORDER_RADIUS,
},
```

---

### Step 4: Add i18n Labels

**File:** `packages/common/src/i18n.ts`

```typescript
// Border labels
'schemas.border.enabled': 'Border',
'schemas.border.width': 'Width',
'schemas.border.color': 'Color',
'schemas.border.style': 'Style',
'schemas.border.radius': 'Radius',
'schemas.border.solid': 'Solid',
'schemas.border.dashed': 'Dashed',
'schemas.border.dotted': 'Dotted',
```

**File:** `packages/common/src/schema.ts` (Dict schema)

```typescript
'schemas.border.enabled': z.string(),
'schemas.border.width': z.string(),
'schemas.border.color': z.string(),
'schemas.border.style': z.string(),
'schemas.border.radius': z.string(),
'schemas.border.solid': z.string(),
'schemas.border.dashed': z.string(),
'schemas.border.dotted': z.string(),
```

---

### Step 5: Update UI Rendering

**File:** `packages/schemas/src/text/uiRender.ts`

**Update containerStyle (around line 194):**

```typescript
const containerStyle: CSS.Properties = {
  padding: 0,
  resize: 'none',
  backgroundColor: getBackgroundColor(value, schema),
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: mapVerticalAlignToFlex(schema.verticalAlignment),
  width: '100%',
  height: '100%',
  cursor: isEditable(mode, schema) ? 'text' : 'default',
  // :new: ADD BORDER STYLES
  ...(schema.border && {
    border: `${schema.borderWidth ?? DEFAULT_BORDER_WIDTH}pt ${schema.borderStyle ?? DEFAULT_BORDER_STYLE} ${schema.borderColor ?? DEFAULT_BORDER_COLOR}`,
    borderRadius: `${schema.borderRadius ?? DEFAULT_BORDER_RADIUS}pt`,
  }),
};
```

**Import constants:**

```typescript
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_ALIGNMENT,
  // ... other imports
  DEFAULT_BORDER_WIDTH,
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_STYLE,
  DEFAULT_BORDER_RADIUS,
} from './constants.js';
```

---

### Step 6: Update PDF Rendering

**File:** `packages/schemas/src/text/pdfRender.ts`

**Add border rendering after background rectangle (around line 125):**

```typescript
if (schema.backgroundColor) {
  const color = hex2PrintingColor(schema.backgroundColor, colorType);
  page.drawRectangle({ x, y, width, height, rotate, color });
}

// :new: ADD BORDER RENDERING
if (schema.border) {
  const borderColor = hex2PrintingColor(
    schema.borderColor || DEFAULT_BORDER_COLOR,
    colorType
  );
  const borderWidth = schema.borderWidth ?? DEFAULT_BORDER_WIDTH;
  const borderRadius = schema.borderRadius ?? DEFAULT_BORDER_RADIUS;

  if (schema.borderStyle === 'dashed') {
    // Draw dashed border using lines
    const dashLength = 3;
    const gapLength = 3;
    page.pushOperators(pdfLib.setDashPattern([dashLength, gapLength], 0));
  } else if (schema.borderStyle === 'dotted') {
    // Draw dotted border
    const dotLength = 1;
    const gapLength = 2;
    page.pushOperators(pdfLib.setDashPattern([dotLength, gapLength], 0));
  }

  page.drawRectangle({
    x,
    y,
    width,
    height,
    rotate,
    borderColor,
    borderWidth,
    borderRadius: borderRadius > 0 ? borderRadius : undefined,
  });

  // Reset dash pattern
  if (schema.borderStyle !== 'solid') {
    page.pushOperators(pdfLib.setDashPattern([], 0));
  }
}
```

**Import constants at top:**

```typescript
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_ALIGNMENT,
  // ... other imports
  DEFAULT_BORDER_WIDTH,
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_STYLE,
  DEFAULT_BORDER_RADIUS,
} from './constants.js';
```

---

### Testing Checklist for Feature 2

- [ ] Border checkbox appears in Designer
- [ ] Border width/color/style fields appear when border enabled
- [ ] Solid border renders in browser
- [ ] Dashed border renders in browser
- [ ] Dotted border renders in browser
- [ ] Border radius rounds corners
- [ ] PDF shows correct border (solid/dashed/dotted)
- [ ] Border color matches selected color
- [ ] Hidden fields (when border=false) don't show

---

## Feature 3: Padding

**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated Time:** 0.5 days

### Problem
Text touches the edges of its bounding box. Professional designs need internal padding.

### Solution Architecture

Add `padding` property (top, right, bottom, left) to text schema.

---

### Step 1: Add TypeScript Types

**File:** `packages/schemas/src/text/types.ts`

```typescript
export interface TextSchema extends Schema {
  // ... existing
  borderRadius?: number;
  // :new: ADD THIS
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

---

### Step 2: Add Constants

**File:** `packages/schemas/src/text/constants.ts`

```typescript
// :new: ADD THIS
export const DEFAULT_PADDING = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
```

---

### Step 3: Update PropPanel

**File:** `packages/schemas/src/text/propPanel.ts`

```typescript
const textSchema: Record<string, PropPanelSchema> = {
  // ... existing fields
  borderStyle: { /* ... */ },
  // :new: ADD PADDING SECTION
  padding: {
    type: 'object',
    widget: 'card',
    title: i18n('schemas.padding'),
    column: 2,
    properties: {
      top: {
        title: i18n('schemas.top'),
        type: 'number',
        widget: 'inputNumber',
        props: { min: 0, step: 0.5 },
      },
      right: {
        title: i18n('schemas.right'),
        type: 'number',
        widget: 'inputNumber',
        props: { min: 0, step: 0.5 },
      },
      bottom: {
        title: i18n('schemas.bottom'),
        type: 'number',
        widget: 'inputNumber',
        props: { min: 0, step: 0.5 },
      },
      left: {
        title: i18n('schemas.left'),
        type: 'number',
        widget: 'inputNumber',
        props: { min: 0, step: 0.5 },
      },
    },
  },
};
```

**Update defaultSchema:**

```typescript
defaultSchema: {
  // ... existing
  borderRadius: DEFAULT_BORDER_RADIUS,
  padding: DEFAULT_PADDING,  // :new: ADD THIS
},
```

---

### Step 4: Update UI Rendering

**File:** `packages/schemas/src/text/uiRender.ts`

**Update textBlockStyle:**

```typescript
const textBlockStyle: CSS.Properties = {
  // ... existing styles
  backgroundColor: 'transparent',
  textDecoration: textDecorations.join(' '),
  // :new: ADD PADDING
  paddingTop: `${(schema.padding?.top ?? 0) + parseFloat(topAdjustment)}px`,
  paddingRight: `${schema.padding?.right ?? 0}pt`,
  paddingBottom: `${schema.padding?.bottom ?? 0}pt`,
  paddingLeft: `${schema.padding?.left ?? 0}pt`,
};
```

**Note:** We add padding.top to existing topAdjustment (for font alignment).

---

### Step 5: Update PDF Rendering

**File:** `packages/schemas/src/text/pdfRender.ts`

**Adjust text rendering position to account for padding:**

**Around line 169 (xLine calculation):**

```typescript
let xLine = x;
// :new: ADD PADDING OFFSET
const paddingLeft = schema.padding?.left ?? 0;
const paddingRight = schema.padding?.right ?? 0;
const paddingTop = schema.padding?.top ?? 0;

if (alignment === 'center') {
  xLine += ((width - paddingLeft - paddingRight) - textWidth) / 2 + paddingLeft;
} else if (alignment === 'right') {
  xLine += width - paddingRight - textWidth;
} else {
  xLine += paddingLeft;
}

let yLine = pageHeight - mm2pt(schema.position.y) - yOffset - rowYOffset - mm2pt(paddingTop);
```

**Also adjust splitTextToSize to account for padding:**

**Around line 131:**

```typescript
const lines = splitTextToSize({
  value,
  characterSpacing,
  fontSize,
  fontKitFont,
  boxWidthInPt: width - mm2pt(paddingLeft + paddingRight),  // :new: SUBTRACT PADDING
});
```

---

### Testing Checklist for Feature 3

- [ ] Padding card appears in Designer
- [ ] Setting top padding moves text down
- [ ] Setting left padding moves text right
- [ ] Setting right padding reduces text width
- [ ] Setting bottom padding reduces text height
- [ ] PDF rendering matches browser rendering
- [ ] Padding works with borders
- [ ] Text wrapping accounts for padding

---

## Feature 4: Text Transform

**Priority:** MEDIUM
**Complexity:** EASY
**Estimated Time:** 0.5 days

### Problem
Cannot make text uppercase/lowercase. Figma shows "CLINICAL INDICATIONS" in all caps.

### Solution Architecture

Add `textTransform` property: 'none' | 'uppercase' | 'lowercase' | 'capitalize'

---

### Step 1: Add TypeScript Types

**File:** `packages/schemas/src/text/types.ts`

```typescript
export interface TextSchema extends Schema {
  // ... existing
  padding?: { /* ... */ };
  // :new: ADD THIS
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}
```

---

### Step 2: Add Constants

**File:** `packages/schemas/src/text/constants.ts`

```typescript
// :new: ADD THIS
export const DEFAULT_TEXT_TRANSFORM = 'none';
```

---

### Step 3: Update PropPanel

**File:** `packages/schemas/src/text/propPanel.ts`

```typescript
const textSchema: Record<string, PropPanelSchema> = {
  // ... existing fields
  padding: { /* ... */ },
  // :new: ADD THIS
  textTransform: {
    title: i18n('schemas.text.transform'),
    type: 'string',
    widget: 'select',
    props: {
      options: [
        { label: i18n('schemas.text.transformNone'), value: 'none' },
        { label: i18n('schemas.text.transformUppercase'), value: 'uppercase' },
        { label: i18n('schemas.text.transformLowercase'), value: 'lowercase' },
        { label: i18n('schemas.text.transformCapitalize'), value: 'capitalize' },
      ],
    },
    span: 12,
  },
};
```

**Update defaultSchema:**

```typescript
defaultSchema: {
  // ... existing
  padding: DEFAULT_PADDING,
  textTransform: DEFAULT_TEXT_TRANSFORM,  // :new: ADD THIS
},
```

---

### Step 4: Add i18n Labels

**File:** `packages/common/src/i18n.ts`

```typescript
'schemas.text.transform': 'Transform',
'schemas.text.transformNone': 'None',
'schemas.text.transformUppercase': 'UPPERCASE',
'schemas.text.transformLowercase': 'lowercase',
'schemas.text.transformCapitalize': 'Capitalize',
```

**File:** `packages/common/src/schema.ts`

```typescript
'schemas.text.transform': z.string(),
'schemas.text.transformNone': z.string(),
'schemas.text.transformUppercase': z.string(),
'schemas.text.transformLowercase': z.string(),
'schemas.text.transformCapitalize': z.string(),
```

---

### Step 5: Update UI Rendering

**File:** `packages/schemas/src/text/uiRender.ts`

```typescript
const textBlockStyle: CSS.Properties = {
  // ... existing styles
  textDecoration: textDecorations.join(' '),
  // :new: ADD THIS
  textTransform: schema.textTransform ?? DEFAULT_TEXT_TRANSFORM,
  // padding, etc.
};
```

---

### Step 6: Update PDF Rendering

**File:** `packages/schemas/src/text/pdfRender.ts`

**Create a helper function:**

```typescript
/**
 * Apply text transformation
 */
const applyTextTransform = (text: string, transform?: string): string => {
  if (!transform || transform === 'none') return text;

  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return text;
};
```

**Use it before rendering:**

**Around line 90 (start of pdfRender):**

```typescript
export const pdfRender = async (arg: PDFRenderProps<TextSchema>) => {
  const { value, pdfDoc, pdfLib, page, options, schema, _cache } = arg;
  if (!value) return;

  // :new: ADD THIS - Apply text transformation
  const transformedValue = applyTextTransform(value, schema.textTransform);

  const { font = getDefaultFont(), colorType } = options;

  const [pdfFontObj, fontKitFont] = await Promise.all([
    embedAndGetFontObj({ /* ... */ }),
    getFontKitFont(/* ... */),
  ]);

  // :new: USE transformedValue instead of value throughout
  const fontProp = getFontProp({
    value: transformedValue,  // Changed
    fontKitFont,
    schema,
    colorType
  });

  // ... rest of function uses transformedValue
```

**Also update splitTextToSize call:**

```typescript
const lines = splitTextToSize({
  value: transformedValue,  // :new: Changed from 'value'
  characterSpacing,
  fontSize,
  fontKitFont,
  boxWidthInPt: width - mm2pt(paddingLeft + paddingRight),
});
```

---

### Testing Checklist for Feature 4

- [ ] Transform dropdown appears in Designer
- [ ] "None" keeps text as-is
- [ ] "UPPERCASE" converts text to all caps
- [ ] "lowercase" converts text to all lowercase
- [ ] "Capitalize" capitalizes first letter of each word
- [ ] Browser rendering matches transform
- [ ] PDF rendering matches transform
- [ ] Works with dynamic font sizing

---

## Feature 5: Line Styles (Dashed/Dotted)

**Priority:** MEDIUM
**Complexity:** EASY
**Estimated Time:** 0.5 days

### Problem
The Line schema only supports solid lines. Figma shows dotted separator lines.

---

### Step 1: Add TypeScript Types

**File:** `packages/schemas/src/graphics/line.ts` (or wherever Line schema is defined)

**Find the LineSchema interface and add:**

```typescript
export interface LineSchema extends Schema {
  color: string;
  // :new: ADD THIS
  lineStyle?: 'solid' | 'dashed' | 'dotted';
}
```

---

### Step 2: Update PropPanel

**File:** Same file, in propPanel definition

```typescript
const propPanel: PropPanel<LineSchema> = {
  schema: ({ i18n }) => ({
    color: {
      title: i18n('schemas.color'),
      type: 'string',
      widget: 'color',
      // ...
    },
    // :new: ADD THIS
    lineStyle: {
      title: i18n('schemas.line.style'),
      type: 'string',
      widget: 'select',
      props: {
        options: [
          { label: i18n('schemas.border.solid'), value: 'solid' },
          { label: i18n('schemas.border.dashed'), value: 'dashed' },
          { label: i18n('schemas.border.dotted'), value: 'dotted' },
        ],
      },
    },
  }),
  defaultSchema: {
    // ... existing
    color: '#000000',
    lineStyle: 'solid',  // :new: ADD THIS
  },
};
```

---

### Step 3: Update PDF Rendering

**File:** Line pdfRender function

```typescript
export const pdfRender = async (arg: PDFRenderProps<LineSchema>) => {
  const { schema, page, options, pdfLib } = arg;

  // ... existing code

  // :new: ADD DASH PATTERN
  if (schema.lineStyle === 'dashed') {
    page.pushOperators(pdfLib.setDashPattern([5, 3], 0));
  } else if (schema.lineStyle === 'dotted') {
    page.pushOperators(pdfLib.setDashPattern([1, 2], 0));
  }

  page.drawLine({
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    thickness: schema.height,
    color,
    opacity: schema.opacity,
  });

  // :new: RESET DASH PATTERN
  if (schema.lineStyle !== 'solid') {
    page.pushOperators(pdfLib.setDashPattern([], 0));
  }
};
```

---

### Step 4: Update UI Rendering

**File:** Line uiRender function

```typescript
export const uiRender = (arg: UIRenderProps<LineSchema>) => {
  const { schema, rootElement } = arg;

  const line = document.createElement('div');
  line.style.cssText = `
    width: 100%;
    height: 100%;
    background-color: ${schema.color};
    opacity: ${schema.opacity ?? 1};
    ${schema.lineStyle === 'dashed' ? 'border-top: 2px dashed ' + schema.color + ';' : ''}
    ${schema.lineStyle === 'dotted' ? 'border-top: 2px dotted ' + schema.color + ';' : ''}
  `;

  rootElement.appendChild(line);
};
```

---

### Testing Checklist for Feature 5

- [ ] Line style dropdown appears in Designer
- [ ] Solid line renders correctly
- [ ] Dashed line renders in browser
- [ ] Dotted line renders in browser
- [ ] PDF shows dashed/dotted lines correctly
- [ ] Line color applies to dashes/dots

---

## Testing Checklist

### Overall Integration Testing

- [ ] **Build passes**
  ```bash
  npm run build
  ```

- [ ] **No TypeScript errors**
  ```bash
  npm run build:common
  npm run build:schemas
  npm run build:ui
  npm run build:generator
  ```

- [ ] **Playground works**
  ```bash
  cd playground && npm run dev
  ```

- [ ] **All features work together**
  - Create text with: bold + italic + border + padding + uppercase
  - Verify rendering in browser
  - Verify PDF generation

- [ ] **Template serialization**
  - Save template with all new features
  - Reload template
  - Verify all properties persist

- [ ] **Backward compatibility**
  - Load old template (without new properties)
  - Should use defaults
  - Should not crash

---

## Implementation Order

**Recommended order (by priority and dependencies):**

1. **Feature 1: Bold & Italic** (1 day)
   - Most critical missing feature
   - Foundation for professional text styling

2. **Feature 3: Padding** (0.5 days)
   - Needed before borders look good
   - Simple implementation

3. **Feature 2: Border Properties** (1 day)
   - Builds on padding
   - Important for boxed layouts

4. **Feature 4: Text Transform** (0.5 days)
   - Independent feature
   - Quick win

5. **Feature 5: Line Styles** (0.5 days)
   - Different schema, can be done anytime
   - Useful for Figma design separators

**Total Estimated Time:** 3.5 days

---

## Code Review Checklist

Before submitting PR:

- [ ] All TypeScript types are properly defined
- [ ] All constants are exported and used consistently
- [ ] i18n labels are added for all new UI strings
- [ ] PropPanel schema is properly structured
- [ ] UI rendering uses CSS properties correctly
- [ ] PDF rendering uses pdf-lib API correctly
- [ ] Default values are sensible
- [ ] Backward compatibility is maintained
- [ ] Error handling is in place (e.g., missing font variants)
- [ ] Code follows existing patterns in the codebase
- [ ] No console errors in browser
- [ ] No build warnings

---

## Font Variant Setup Guide

### For Bold/Italic to work, users must provide font files:

**Example font setup:**

```typescript
import { Font } from '@pdfme/common';

// Download from Google Fonts or similar
const font: Font = {
  // Base font (required, fallback: true)
  'Roboto': {
    data: '/fonts/Roboto-Regular.ttf',
    fallback: true,
  },

  // Bold variant (for fontWeight: 'bold')
  'Roboto-Bold': {
    data: '/fonts/Roboto-Bold.ttf',
  },

  // Italic variant (for fontStyle: 'italic')
  'Roboto-Italic': {
    data: '/fonts/Roboto-Italic.ttf',
  },

  // Bold+Italic variant (for both)
  'Roboto-BoldItalic': {
    data: '/fonts/Roboto-BoldItalic.ttf',
  },
};
```

**Naming convention:**
- Base: `{FontName}`
- Bold: `{FontName}-Bold`
- Italic: `{FontName}-Italic`
- Bold+Italic: `{FontName}-BoldItalic`

**Fallback behavior:**
- If variant doesn't exist → uses base font
- Console warning logged
- No crash

---

## Additional Notes

### Performance Considerations

1. **Font caching**: Font variants are cached separately, so loading 4 variants doesn't hurt performance significantly.

2. **PDF file size**: Using font subsetting (default: true) keeps PDF size small even with multiple font variants.

3. **Browser rendering**: CSS `font-weight: bold` and `font-style: italic` are native, so no performance hit.

### Edge Cases to Handle

1. **Missing font variants**: Fallback to base font with warning
2. **Invalid border width**: Clamp to minimum 0
3. **Negative padding**: Clamp to minimum 0
4. **Empty text with transform**: Should not crash
5. **Very small fontSize with padding**: May cause text overflow (acceptable)

### Future Enhancements

After these 5 features, consider:

1. **Letter spacing per line** (for justified text)
2. **Text shadow** (for depth effects)
3. **Gradient text** (advanced styling)
4. **Multi-column text layout**
5. **Auto-fit text to box** (different from dynamic font size)

---

## Questions for AI Implementation

When passing this to an AI tool for implementation:

**Provide this context:**
- "This is a TypeScript monorepo using Lerna/npm workspaces"
- "Build order matters: common → schemas → ui/generator"
- "Always run `npm run build` after changes"
- "Test in playground: `cd playground && npm run dev`"
- "Font variants must be registered separately (Roboto, Roboto-Bold, etc.)"

**Ask the AI to:**
- "Implement features in order 1→3→2→4→5"
- "Show me the exact file changes with line numbers"
- "Test each feature before moving to the next"
- "Provide the exact bash commands to run"
- "Update documentation/README with usage examples"

---

## End of Implementation Plan

This plan is ready to be passed to any AI coding tool (Cursor, Copilot, etc.) for implementation.

Each section provides:
:white_check_mark: Exact file paths
:white_check_mark: Exact code locations
:white_check_mark: Complete code snippets
:white_check_mark: Testing procedures
:white_check_mark: Error handling
:white_check_mark: Backward compatibility

**Estimated total implementation time: 3-5 days**

Good luck with implementation! :rocket: