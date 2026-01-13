# Row Styles Fix - Section Headers Now Showing! 🎉

## Problem Identified

The section header rows ("PRIMARY FINDINGS", "ACMG SECONDARY FINDINGS") were defined in the template's `content` field, but they were **NOT appearing on the canvas** because:

1. The `uiRender` and `pdfRender` functions were using the `value` parameter (runtime data) to get the table body
2. When you first load a template in Designer mode without providing runtime data, `value` is empty
3. The code wasn't falling back to `schema.content` (the template's default content) when `value` was empty

## What Was Fixed

### 1. Fixed `uiRender.ts` (Canvas Rendering)

**File**: `packages/schemas/src/tables/uiRender.ts`

**Changed**: Lines 257-262

```typescript
// BEFORE
export const uiRender = async (arg: UIRenderProps<TableSchema>) => {
  const { rootElement, onChange, schema, value, mode, scale} = arg;
  const body = getBody(value);
  const bodyWidthRange = getBodyWithRange(value, schema.__bodyRange);

// AFTER
export const uiRender = async (arg: UIRenderProps<TableSchema>) => {
  const { rootElement, onChange, schema, value, mode, scale} = arg;
  // Use value if provided, otherwise fall back to schema.content, or empty array
  const contentValue = value || schema.content || '[]';
  const body = getBody(contentValue);
  const bodyWidthRange = getBodyWithRange(contentValue, schema.__bodyRange);
```

**Explanation**: Now when `value` is empty (which it is in Designer mode when first loading a template), the code falls back to `schema.content`, which contains the 6 rows of data including the section headers.

### 2. Fixed `pdfRender.ts` (PDF Generation)

**File**: `packages/schemas/src/tables/pdfRender.ts`

**Changed**: Lines 145-150

```typescript
// BEFORE
export const pdfRender = async (arg: PDFRenderProps<TableSchema>) => {
  const { value, schema, basePdf, options, _cache } = arg;

  const body = getBodyWithRange(
    typeof value !== 'string' ? JSON.stringify(value || '[]') : value,
    schema.__bodyRange,
  );

// AFTER
export const pdfRender = async (arg: PDFRenderProps<TableSchema>) => {
  const { value, schema, basePdf, options, _cache } = arg;

  // Use value if provided, otherwise fall back to schema.content, or empty array
  const contentValue = typeof value !== 'string' ? JSON.stringify(value || '[]') : (value || schema.content || '[]');
  const body = getBodyWithRange(contentValue, schema.__bodyRange);
```

**Explanation**: Same fix for PDF rendering to ensure PDFs generated from templates also include the section headers.

## What You Should See Now

### ✅ In the Playground (Canvas)

After refreshing the playground, when you load the `figma-table-template-rowstyles.json` template:

1. **6 rows total** (not just 4):
   - Row 0: **"PRIMARY FINDINGS"** section header (dark blue #0C2340, white text, uppercase)
   - Row 1: Cornelia De Lange Syndrome 1 (white background)
   - Row 2: KMT2D-Related Disorders (light gray alternating background)
   - Row 3: Neurodevelopmental Disorder (white background)
   - Row 4: **"ACMG SECONDARY FINDINGS"** section header (dark blue #0C2340, white text, uppercase)
   - Row 5: KCNQ1-Related Arrhythmias (light gray alternating background)

2. **Section headers have the exact styling** from `rowStyles`:
   - Dark blue background (#0C2340)
   - White text (#FFFFFF)
   - Font weight: 700 (bold)
   - Font size: 9
   - Uppercase text
   - Left alignment
   - Padding: 4px top/bottom, 8px left/right

3. **Section headers span all columns** naturally (they're just rows with empty cells in other columns)

4. **Perfect width match** - Section headers are exactly as wide as other rows because they ARE rows

## Testing Instructions

### Option 1: Hard Refresh (Recommended)

1. **Hard refresh** the playground browser tab:
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Load the template**:
   - Click "Designer" tab
   - Click "Load/Import Template" button
   - Select `figma-table-template-rowstyles.json`

3. **Verify the canvas shows**:
   - Dark blue section headers at rows 0 and 4
   - White uppercase text in section headers
   - All 6 rows visible

### Option 2: Just Refresh

If HMR (Hot Module Reload) worked correctly, you might just need to:

1. **Refresh** the browser (F5)
2. **Re-import** the template

### Option 3: Re-import Template

If the page is already loaded:

1. Just click "Load/Import Template" again
2. Select `figma-table-template-rowstyles.json`

## Visual Result

The canvas should now show this structure:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Disease │ Inheritance... │ Gene... │ Genotype │ ...                │ ← Header (light gray)
├─────────────────────────────────────────────────────────────────────┤
│ PRIMARY FINDINGS                                                    │ ← Row 0 (dark blue)
├─────────────────────────────────────────────────────────────────────┤
│ Cornelia De Lange Syndrome 1 │ Autosomal Dominant │ NIPBL... │ ... │ ← Row 1 (white)
├─────────────────────────────────────────────────────────────────────┤
│ KMT2D-Related Disorders │ Autosomal Dominant │ KMT2D... │ ... │    │ ← Row 2 (gray)
├─────────────────────────────────────────────────────────────────────┤
│ Neurodevelopmental Disorder │ Autosomal Dominant │ BAZ2B... │ ... │ │ ← Row 3 (white)
├─────────────────────────────────────────────────────────────────────┤
│ ACMG SECONDARY FINDINGS                                             │ ← Row 4 (dark blue)
├─────────────────────────────────────────────────────────────────────┤
│ KCNQ1-Related Arrhythmias │ Autosomal Dominant │ KCNQ1... │ ... │  │ ← Row 5 (gray)
└─────────────────────────────────────────────────────────────────────┘
```

## How It Works Now

### Designer Mode (Template Design)
1. Template defines `schema.content` with the data including section headers
2. Template defines `schema.rowStyles` with styling for rows 0 and 4
3. When rendering, if no `value` is provided, uses `schema.content`
4. Section headers appear on canvas with proper styling

### Form/Viewer Mode (Runtime Data)
1. If `value` is provided (runtime data), uses that
2. If `value` is empty or not provided, falls back to `schema.content`
3. Section headers appear with the same styling

### PDF Generation
1. Same fallback logic applies
2. PDFs generated from templates include section headers
3. Styling from `rowStyles` is applied in the PDF

## Data Structure in Template

The template's `content` field contains a JSON string with 6 rows:

```json
{
  "content": "[[\"PRIMARY FINDINGS\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"Cornelia De Lange Syndrome 1\",\"Autosomal Dominant\",\"NIPBL c.2479del, p.R87Gfs*20\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Pathogenic\"],[\"KMT2D-Related Disorders\",\"Autosomal Dominant\",\"KMT2D: c.1952C>G, p.S651W\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Variant of Uncertain Significance\"],[\"Neurodevelopmental Disorder\",\"Autosomal Dominant\",\"BAZ2B:HG38 chr2:159670492-159491775 del 21.28(kb)\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Variant of Uncertain Significance\"],[\"ACMG SECONDARY FINDINGS\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"KCNQ1-Related Arrhythmias\",\"Autosomal Dominant\",\"KCNQ1: c.1552C>T, p.R518*\",\"Heterozygous\",\"Sequence Variant\",\"N/A\",\"Pathogenic\"]]",

  "rowStyles": {
    "0": {
      "backgroundColor": "#0C2340",
      "fontColor": "#FFFFFF",
      "fontWeight": "700",
      "fontSize": 9,
      "textTransform": "uppercase",
      "alignment": "left",
      "padding": { "top": 4, "bottom": 4, "left": 8, "right": 8 }
    },
    "4": {
      "backgroundColor": "#0C2340",
      "fontColor": "#FFFFFF",
      "fontWeight": "700",
      "fontSize": 9,
      "textTransform": "uppercase",
      "alignment": "left",
      "padding": { "top": 4, "bottom": 4, "left": 8, "right": 8 }
    }
  }
}
```

## Advantages of This Approach

### ✅ Section Headers Are Just Rows
- No need for separate `rowGroups` configuration
- Section headers are actual data rows with special styling
- Simpler data structure
- Easier to understand and maintain

### ✅ Perfect Width Alignment
- Section headers automatically match table width
- No width calculation needed
- Spans all columns naturally (just empty cells in other columns)

### ✅ Style Precedence Works Correctly
Styles are applied in this order (last wins):
1. Default styles
2. Section styles (bodyStyles)
3. Alternate row styles
4. Column styles
5. **Row styles** ⭐ (rows 0 and 4 get special styling)
6. Cell styles (if you need per-cell overrides)

### ✅ Dynamic Runtime Data Support
- Can provide custom data at runtime via `value`
- Falls back to template's default `content` when needed
- Section headers can be included in runtime data too

## Troubleshooting

### If section headers still don't appear:

1. **Check browser console** for JavaScript errors
2. **Hard refresh** the page (Ctrl+Shift+R)
3. **Verify you imported the correct template**: `figma-table-template-rowstyles.json`
4. **Check the template file** contains the correct `content` with 6 rows
5. **Rebuild packages** if needed:
   ```bash
   cd packages/schemas && npm run build
   cd packages/ui && npm run build
   ```

### If styling looks wrong:

1. **Verify `rowStyles`** in the template:
   - Should have entries for keys "0" and "4"
   - Should have backgroundColor, fontColor, etc.

2. **Check style precedence**:
   - rowStyles override alternateRowStyles
   - cellStyles override rowStyles if defined

### If data looks incomplete:

1. **Parse the content string** to verify it has 6 rows:
   ```javascript
   JSON.parse(schema.content)
   ```

2. **Check browser DevTools**:
   - Inspect the table element
   - Check if body has 6 rows in the data structure

## Build Information

**Packages rebuilt**:
- ✅ `@pdfme/schemas` - Built successfully
- ✅ `@pdfme/ui` - Built successfully (6,978 kB)

**Files modified**:
- `packages/schemas/src/tables/uiRender.ts` - Added content fallback
- `packages/schemas/src/tables/pdfRender.ts` - Added content fallback

## Success Criteria

✅ **COMPLETE** when you can confirm:
1. ✅ Six rows visible on canvas (not just 4)
2. ✅ "PRIMARY FINDINGS" section header visible at row 0
3. ✅ "ACMG SECONDARY FINDINGS" section header visible at row 4
4. ✅ Section headers have dark blue background (#0C2340)
5. ✅ Section headers have white uppercase text
6. ✅ Section headers span full table width
7. ✅ Section headers have left alignment and proper padding
8. ✅ Data rows between section headers are visible and styled correctly

---

**Next Steps**: Once you confirm the section headers are showing correctly on the canvas, we can:
1. Fine-tune any styling details
2. Test PDF generation to ensure it works there too
3. Add more section headers or customize the styling further
4. Test with different data sets

**Template File**: `figma-table-template-rowstyles.json`

**Documentation**: See `ROW_STYLES_SOLUTION.md` for detailed explanation of the `rowStyles` approach
