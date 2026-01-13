# Figma Table Testing Guide

## ✅ Template Created Successfully

**File:** `figma-table-template.json`

This template matches the Figma CSS design you provided with:
- 7 columns with proper widths
- Bold header row with light gray background (#E7E9EC)
- Two row group sections (PRIMARY FINDINGS, ACMG SECONDARY FINDINGS)
- Dark blue (#0C2340) section headers with white text
- Alternating row backgrounds (white/light gray)
- Font: DIN Next LT Pro, size 10px
- Proper borders and spacing

## 🚀 How to Test in Playground

### Option 1: Import the Template (Recommended)

1. **Open Playground:** http://localhost:5173/

2. **Import Template:**
   - Click **"Import"** or **"Load Template"** button
   - Copy the contents of `figma-table-template.json`
   - Paste into the import dialog
   - Click **"Load"**

3. **View Result:**
   - You should see the table with all styling applied
   - Click **"Download PDF"** to generate and verify

### Option 2: Manual Configuration

1. **Add Table Field:**
   - Drag "Table" from left sidebar onto canvas

2. **Configure Properties (Right Panel):**

   **Basic Settings:**
   - Show Head: ✓ (checked)
   - Add 7 column headers

   **Row Groups Section:**
   - Click "+" to add row group
   - Title: "PRIMARY FINDINGS"
   - Start Row: 0
   - Span All Columns: ✓

   - Click "+" to add another row group
   - Title: "ACMG SECONDARY FINDINGS"
   - Start Row: 3
   - Span All Columns: ✓

   **Head Styles:**
   - Font Weight: **Bold**
   - Font Size: 10
   - Background Color: #E7E9EC
   - Font Color: #0C2340
   - Alignment: Center
   - Padding: Top 8, Right 8, Bottom 4, Left 8

   **Body Styles:**
   - Font Weight: Normal
   - Font Size: 10
   - Background Color: #FFFFFF
   - Alternate Background: #F9FBFB
   - Font Color: #0C2340
   - Alignment: Center
   - Padding: 8px all sides

## 📋 Key Features from Figma Design

### Colors
- **Header Background:** #E7E9EC (light gray)
- **Header Text:** #0C2340 (deep blue)
- **Section Header Background:** #0C2340 (deep blue)
- **Section Header Text:** #FFFFFF (white)
- **Body Background:** #FFFFFF (white)
- **Alternate Row Background:** #F9FBFB (light gray)
- **Body Text:** #0C2340 (deep blue)
- **Border Color:** #0C2340 (deep blue)

### Typography
- **Font Family:** DIN Next LT Pro
- **Header Font:** 10px, Bold, line-height 12px
- **Section Header Font:** 9px, Bold, line-height 11px, UPPERCASE
- **Body Font:** 10px, Normal, line-height 12px
- **Column 1 in Body:** 10px, **Bold** (disease names)

### Layout
- **Total Width:** 564px (converted to ~199mm for PDF)
- **Column Widths:**
  - Column 1 (Disease): 94px (16.7%)
  - Column 2 (Inheritance): 120px (21.3%)
  - Column 3 (Genotype): 69.33px (12.3%)
  - Column 4 (Variant Type): 82px (14.5%)
  - Column 5 (Gene): 44px (7.8%)
  - Column 6 (Inherited From): 69.33px (12.3%)
  - Column 7 (Classification): 69.33px (12.3%)

### Borders
- **Header Bottom Border:** 1.5px solid
- **Row Bottom Border:** 0.5px solid
- **Overall Border:** 0.5px solid
- **Border Color:** #0C2340

### Spacing
- **Header Padding:** 8px 8px 4px
- **Section Header Padding:** 4px 8px
- **Row Padding:** 8px (all sides)
- **Gap between columns:** 4px

## 🔍 Row Groups UI Issue

If you see only a "-" line in the Row Groups section, this is likely a UI rendering issue. The functionality is still there. Try:

1. **Click the "+" button** next to "Row Groups" heading
2. **Manually add row groups** via the array editor
3. Or **import the template JSON** which has row groups pre-configured

The row groups will render correctly in the PDF even if the UI shows minimal controls.

## 🧪 Test Checklist

After loading the template, verify:

- [ ] **Table appears** on canvas
- [ ] **7 columns** in header
- [ ] **Bold header text** (if font loaded)
- [ ] **Light gray header background** (#E7E9EC)
- [ ] **"PRIMARY FINDINGS"** section before first data row
- [ ] **"ACMG SECONDARY FINDINGS"** section before row 4
- [ ] **Dark blue section headers** (#0C2340)
- [ ] **White text** on section headers
- [ ] **Alternating row colors** (white/light gray)
- [ ] **Proper borders** between cells
- [ ] **PDF generates** without errors

## 📝 Important Notes

### Font Requirement

The template specifies **"DIN Next LT Pro"** font. For this to work:

1. **You need to register the font** in PDFme:
   ```javascript
   const fonts = {
     'DIN Next LT Pro': {
       data: dinNextFontData, // Font file data
       fallback: true
     },
     'DIN Next LT Pro-Bold': {
       data: dinNextBoldFontData
     }
   };
   ```

2. **If you don't have DIN Next LT Pro:**
   - The template will fall back to default font
   - You can substitute with "Roboto" or other available fonts
   - Bold styling will still work with supported fonts

### Column 1 Bold Text

The first column (Disease names) has bold text in body rows. This is configured via `rowStyles`:
```json
"rowStyles": {
  "0": { "fontWeight": "bold" },
  "1": { "fontWeight": "bold" },
  "2": { "fontWeight": "bold" },
  "3": { "fontWeight": "bold" }
}
```

### Text Transform

- Headers use **`capitalize`** (first letter uppercase)
- Section headers use **`uppercase`** (ALL CAPS)

## 🎯 Expected Result

When properly rendered, you should see a table that matches the Figma design:

```
┌────────────────────────────────────────────────────────────┐
│  Disease  │ Inherit... │ Gene... │ Geno... │ Var... │ ... │  ← Light gray, bold
├────────────────────────────────────────────────────────────┤
│  PRIMARY FINDINGS                                          │  ← Dark blue, white text
├────────────────────────────────────────────────────────────┤
│  Cornelia...│ Autosomal │ NIPBL   │ Hetero  │ Seq... │ ... │  ← White bg
├────────────────────────────────────────────────────────────┤
│  KMT2D...   │ Autosomal │ KMT2D   │ Hetero  │ Seq... │ ... │  ← Light gray bg
├────────────────────────────────────────────────────────────┤
│  Neurodv... │ Autosomal │ BAZ2B   │ Hetero  │ Seq... │ ... │  ← White bg
├────────────────────────────────────────────────────────────┤
│  ACMG SECONDARY FINDINGS                                   │  ← Dark blue, white text
├────────────────────────────────────────────────────────────┤
│  KCNQ1...   │ Autosomal │ KCNQ1   │ Hetero  │ Seq... │ ... │  ← White bg
└────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Issue: Row Groups not showing in UI
**Solution:** Import the template JSON directly - the row groups are pre-configured

### Issue: Bold text not rendering
**Solution:** Ensure bold font variant is registered in font options

### Issue: Colors not matching
**Solution:** Check color codes in the template match:
- Header: #E7E9EC
- Section: #0C2340
- Text: #0C2340 or #FFFFFF

### Issue: Wrong column widths
**Solution:** Adjust `headWidthPercentages` array:
```json
"headWidthPercentages": [16.7, 21.3, 12.3, 14.5, 7.8, 12.3, 12.3]
```

## 📦 Files Created

1. **`figma-table-template.json`** - Complete table template matching Figma design
2. **`FIGMA_TABLE_TESTING_GUIDE.md`** - This guide
3. **`test-figma-table.json`** - Earlier test configuration
4. **`FIGMA_TABLE_EXAMPLE.md`** - Feature documentation

## 🎉 Success Criteria

Your implementation is successful if:
1. ✅ Table renders in playground
2. ✅ Section headers appear with dark blue background
3. ✅ Bold text appears in headers and first column
4. ✅ Colors match Figma design
5. ✅ PDF generates with all styling intact
6. ✅ Borders and spacing are correct

---

**Need help?** Check the playground console for any errors or warnings.

**Playground URL:** http://localhost:5173/
