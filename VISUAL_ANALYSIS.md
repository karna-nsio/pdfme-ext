# Visual Analysis: Table vs Figma Design

## Screenshot Analysis

Looking at your screenshot, I can identify these differences from the Figma CSS:

### ✅ What's Working
1. Section headers rendering (PRIMARY FINDINGS, ACMG SECONDARY FINDINGS)
2. Dark blue background (#0C2340) with white text
3. Alternating row backgrounds
4. Column headers with light gray background
5. Border lines present

### ⚠️ Potential Issues

#### 1. **Header Text Alignment**
- **Figma**: Headers should be aligned to "flex-end" (bottom alignment)
- **Current**: May be center-aligned
- **Fix Needed**: Verify `verticalAlignment: "bottom"` is working

#### 2. **Header Border**
- **Figma**: Bottom border should be **1.5px** (thicker than body rows)
- **Body rows**: Should be **0.5px**
- **Current**: May not show difference clearly

#### 3. **Column 1 Alignment**
- **Figma**: First column (Disease) should be **left-aligned**
- **Other columns**: Should be **center-aligned**
- **Fix**: Verify columnStyles alignment is applied

#### 4. **Section Header Height**
- **Figma**: Should be 19px total height (9px font + 4px padding top/bottom)
- **Current**: Might be taller
- **Note**: PDF rendering might add extra spacing

#### 5. **Font Weight in Disease Column**
- **Figma**: Disease names (Column 1) should be **bold (700)** in body rows
- **Current**: Verify bold is rendering

#### 6. **Table Width**
- **Figma**: 564px total width
- **PDF**: 199mm ≈ 564px at 72 DPI
- **Actual**: May vary depending on PDF rendering

## Action Items

### 1. Row Groups UI Editor
The "Row Groups: -" issue should now show a proper array editor. Try:
- Reload the playground page completely (Ctrl+F5)
- Click on a table field
- Scroll to "Row Groups" section
- Look for "+ Add" button or array item controls

### 2. Visual Verification Checklist

Import `figma-table-template.json` and check:

- [ ] Header bottom border is visibly thicker (1.5px vs 0.5px)
- [ ] Headers align to bottom (text at bottom of cell)
- [ ] Disease column (first) is left-aligned
- [ ] Other columns are center-aligned
- [ ] Disease names are bold in data rows
- [ ] Section headers are uppercase
- [ ] Colors match: #0C2340 (blue), #E7E9EC (header gray), #F9FBFB (alt row)

### 3. Known PDF Rendering Limitations

PDFme/pdf-lib may have slight variations from pure CSS:
- Font rendering may differ from web fonts
- Line heights might not match exactly pixel-perfect
- Border rendering may have sub-pixel differences
- Font weights might require actual bold font files

## Debugging Steps

1. **Check browser console** for errors
2. **Inspect the PropPanel** - Does "Row Groups" now show array controls?
3. **Compare PDF output** to screenshot side-by-side
4. **Verify font loading** - Is "DIN Next LT Pro" actually loaded?
5. **Test with standard fonts** - Try with Roboto or Arial to see if styling works

## Next: If Still Not Matching

Please provide:
1. Screenshot of the PropPanel showing the Row Groups section
2. Specific differences you see (e.g., "column 1 is centered instead of left")
3. Whether row groups appear in the PDF at all
4. Any console errors in browser dev tools
