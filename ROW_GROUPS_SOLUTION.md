# Row Groups Solution - Section Headers That Span All Columns

## The Problem with rowStyles Approach

The previous `rowStyles` approach had fundamental limitations:

### ❌ Issues:
1. **Section headers only in first column** - "PRIMARY FINDINGS" appeared only in Disease column
2. **Empty cells in other columns** - Rest of the row was blank
3. **Not truly spanning** - Each cell rendered separately
4. **Hard to configure** - Needed to edit JSON directly
5. **Doesn't match Figma** - Section headers should span entire table width

### Why It Failed:
```json
// rowStyles approach - Section header as data row
"content": [
  ["PRIMARY FINDINGS", "", "", "", "", "", ""],  // Only in first cell!
  ["Cornelia De Lange...", "Autosomal...", ...]
]
```

Result: "PRIMARY FINDINGS" only appears in Disease column, not spanning all columns.

## The Correct Solution: Row Groups

Row groups are **separate elements** that render BETWEEN data rows and automatically span all columns.

### ✅ Advantages:

1. **Spans all columns automatically** - Renders as single element across full table width
2. **Configurable through UI** - Edit in PropPanel (Title, Start Row, Styles)
3. **Separate from data** - Doesn't affect data row indices
4. **Easy to add/remove** - Click "Add a new line" in Row Groups section
5. **Fully customizable styles** - Background color, text color, font, padding, etc.

### How It Works:

```json
{
  "content": [
    // ONLY data rows (no section headers)
    ["Cornelia De Lange Syndrome 1", "Autosomal Dominant", ...],
    ["KMT2D-Related Disorders", "Autosomal Dominant", ...],
    ["Neurodevelopmental Disorder", "Autosomal Dominant", ...],
    ["KCNQ1-Related Arrhythmias", "Autosomal Dominant", ...]
  ],

  "rowGroups": [
    {
      "title": "PRIMARY FINDINGS",
      "startRow": 0,  // Insert BEFORE row 0
      "colspan": true,  // Span all columns
      "visible": true,
      "styles": {
        "backgroundColor": "#0C2340",
        "fontColor": "#FFFFFF",
        "fontSize": 9,
        "fontWeight": "700",
        "textTransform": "uppercase",
        "alignment": "left",
        "padding": { "top": 4, "bottom": 4, "left": 8, "right": 8 }
      }
    },
    {
      "title": "ACMG SECONDARY FINDINGS",
      "startRow": 3,  // Insert BEFORE row 3
      "colspan": true,
      "visible": true,
      "styles": { /* same styling */ }
    }
  ]
}
```

### Visual Result:

```
┌─────────────────────────────────────────────────────────┐
│ Disease │ Inheritance... │ Gene... │ ... │ Classification │ ← Header
├─────────────────────────────────────────────────────────┤
│ PRIMARY FINDINGS                                        │ ← Row Group (spans ALL columns)
├─────────────────────────────────────────────────────────┤
│ Cornelia... │ Autosomal... │ NIPBL... │ ... │ Pathogenic │ ← Row 0
├─────────────────────────────────────────────────────────┤
│ KMT2D... │ Autosomal... │ KMT2D... │ ... │ VUS          │ ← Row 1
├─────────────────────────────────────────────────────────┤
│ Neurodevelop... │ Autosomal... │ BAZ2B... │ ... │ VUS  │ ← Row 2
├─────────────────────────────────────────────────────────┤
│ ACMG SECONDARY FINDINGS                                 │ ← Row Group (spans ALL columns)
├─────────────────────────────────────────────────────────┤
│ KCNQ1... │ Autosomal... │ KCNQ1... │ ... │ Pathogenic   │ ← Row 3
└─────────────────────────────────────────────────────────┘
```

## Template Structure

### Data Content (4 rows)
- Row 0: Cornelia De Lange Syndrome 1
- Row 1: KMT2D-Related Disorders
- Row 2: Neurodevelopmental Disorder
- Row 3: KCNQ1-Related Arrhythmias

### Row Groups (2 groups)
- **PRIMARY FINDINGS**: Inserted before row 0
- **ACMG SECONDARY FINDINGS**: Inserted before row 3

## Configuring Row Groups in UI

In the Designer mode, select the table and look at the **"Row Groups" section** in the Edit Field panel:

### Available Options:
1. **Title** - The text to display (e.g., "PRIMARY FINDINGS")
2. **Start Row** - Which row to insert before (0-indexed)
3. **Span All Columns** - Checkbox (should be checked)
4. **Styles** - Full styling configuration:
   - Background Color
   - Font Color
   - Font Weight
   - Font Size
   - Text Transform
   - Alignment
   - Padding
   - Border

### Adding New Row Group:
1. Click **"+ Add a new line"** button
2. Enter the title
3. Set the start row index
4. Configure styling
5. Check "Span All Columns"

### Editing Existing Row Group:
1. Click to expand the row group item
2. Modify any properties
3. Changes apply immediately

## Styling Configuration

### Section Header Styles (Based on Figma):
```json
{
  "fontName": "DIN Next LT Pro",
  "fontWeight": "700",
  "fontSize": 9,
  "lineHeight": 1.22,
  "fontColor": "#FFFFFF",
  "backgroundColor": "#0C2340",
  "alignment": "left",
  "verticalAlignment": "middle",
  "characterSpacing": 0,
  "padding": {
    "top": 4,
    "bottom": 4,
    "left": 8,
    "right": 8
  },
  "borderColor": "#0C2340",
  "borderWidth": {
    "top": 0,
    "bottom": 0,
    "left": 0,
    "right": 0
  },
  "textTransform": "uppercase"
}
```

### Customizing Background Color:
To change section header background (e.g., to red):
```json
{
  "backgroundColor": "#FF0000"  // Change from #0C2340 to #FF0000
}
```

Or in the UI:
1. Expand the row group in Edit Field panel
2. Find "Background Color" field
3. Enter new color (e.g., #FF0000)
4. See change immediately on canvas

## Cell Styles for Disease Column

To make the Disease column (column 0) bold in all data rows:

```json
{
  "cellStyles": {
    "0": { "0": { "fontWeight": "700" } },  // Row 0, Column 0
    "1": { "0": { "fontWeight": "700" } },  // Row 1, Column 0
    "2": { "0": { "fontWeight": "700" } },  // Row 2, Column 0
    "3": { "0": { "fontWeight": "700" } }   // Row 3, Column 0
  }
}
```

## Testing Instructions

1. **Load the new template**: `figma-table-template-rowgroups.json`

2. **Verify canvas shows**:
   - ✅ "PRIMARY FINDINGS" spans ALL columns (not just Disease column)
   - ✅ "ACMG SECONDARY FINDINGS" spans ALL columns
   - ✅ Both section headers have dark blue background (#0C2340)
   - ✅ Both section headers have white uppercase text
   - ✅ Section headers appear at correct positions
   - ✅ 4 data rows between and after section headers

3. **Test configurability**:
   - Click on the table in Designer mode
   - Look at "Row Groups" section in Edit Field panel
   - Should see 2 row groups listed
   - Expand one and modify the title or background color
   - Changes should reflect immediately on canvas

4. **Test adding new row group**:
   - Click "+ Add a new line" in Row Groups section
   - Enter a title like "TEST SECTION"
   - Set start row to 2
   - Configure styling
   - Should see new section header inserted before row 2

## Comparison

| Feature | rowStyles Approach ❌ | rowGroups Approach ✅ |
|---------|----------------------|----------------------|
| Spans all columns | No (only first column) | Yes (automatic) |
| Configurable in UI | No (JSON only) | Yes (PropPanel) |
| Easy to add/remove | No | Yes (click button) |
| Matches Figma | No | Yes |
| Section header width | Matches column 0 only | Matches full table width |
| Positioning | Complex (part of data) | Simple (separate elements) |
| Styling options | Limited | Full control |

## Migration from rowStyles to rowGroups

If you have the old `figma-table-template-rowstyles.json`:

### 1. Remove section headers from data:
**Before:**
```json
"content": [
  ["PRIMARY FINDINGS", "", "", "", "", "", ""],
  ["Cornelia...", ...],
  ...
]
```

**After:**
```json
"content": [
  ["Cornelia...", ...],
  ...
]
```

### 2. Add to rowGroups:
```json
"rowGroups": [
  {
    "title": "PRIMARY FINDINGS",
    "startRow": 0,
    "colspan": true,
    "visible": true,
    "styles": { ... }
  }
]
```

### 3. Adjust row indices:
Since section headers are removed from data, adjust:
- cellStyles row indices
- rowStyles row indices (if any)
- Any references to row positions

## File to Use

**Template**: `figma-table-template-rowgroups.json`

This template:
- ✅ Uses rowGroups for section headers
- ✅ Section headers span all columns
- ✅ Fully configurable through UI
- ✅ Matches Figma design exactly
- ✅ 4 data rows (no section headers in data)
- ✅ 2 row groups with proper styling

## Summary

✅ **Use rowGroups** for section headers that need to span all columns
✅ **Fully configurable** through the Edit Field panel in Designer mode
✅ **Easy to add/remove** section headers without editing JSON
✅ **Matches Figma design** with proper full-width section headers
✅ **Better user experience** for managing table organization
