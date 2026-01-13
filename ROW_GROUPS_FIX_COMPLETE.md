# Row Groups UI Rendering - FIXED! 🎉

## Problem Identified
The row groups were configured in the schema and rendering in PDF, but **NOT rendering on the canvas** because the UI renderer (`uiRender.ts`) was missing row group rendering code.

## What Was Fixed

### 1. Added `renderRowGroupUi` Function
Created a new function to render row group headers in the UI canvas:
- Renders the row group cell (title) with proper styling
- Applies dark blue background (#0C2340) and white text
- Positions it at the correct Y offset
- Returns the height for offset calculations

### 2. Modified `renderRowUi` Function
Updated to accept and process row groups:
- Added `rowGroups` parameter
- Checks before each body row if a row group should be inserted
- Renders row group at the correct position using `startRow` property
- Adjusts Y offset to account for row group height

### 3. Updated Height Calculation
Fixed table height calculation to include row groups:
- Iterates through body rows
- Checks for row groups before each row
- Adds row group height to total table height
- Ensures proper canvas sizing

### 4. Passed Row Groups to Render Functions
Updated render calls to include row groups:
- Header rendering: `rowGroups: []` (no row groups in header)
- Body rendering: `rowGroups: table.rowGroups || []`

## What You Should See Now

### ✅ In the Playground (Canvas)

After the page reloads, when you view a table with row groups:

1. **"PRIMARY FINDINGS" section header**
   - Dark blue background (#0C2340)
   - White uppercase text
   - Appears before the first data row (row 0)
   - Spans full table width

2. **"ACMG SECONDARY FINDINGS" section header**
   - Same styling as PRIMARY FINDINGS
   - Appears before row 3 (4th data row)
   - Spans full table width

3. **Data rows between sections**
   - Cornelia De Lange Syndrome 1
   - KMT2D-Related Disorders
   - Neurodevelopmental Disorder
   - (section header here)
   - KCNQ1-Related Arrhythmias

### ✅ In the PropPanel

The "Row Groups" section should show:
```
Row Groups - 2 rows
  [Expandable item 1: PRIMARY FINDINGS]
  [Expandable item 2: ACMG SECONDARY FINDINGS]
```

Each item should be expandable to see/edit:
- Title
- Start Row
- Span All Columns

## Testing Instructions

1. **Hard Refresh** the playground:
   - Windows: `Ctrl + F5` or `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Import the template**:
   - Click Import/Load Template
   - Load `figma-table-template.json`

3. **Verify on Canvas**:
   - You should see **two dark blue section headers**
   - PRIMARY FINDINGS before first row
   - ACMG SECONDARY FINDINGS before last row

4. **Check PropPanel**:
   - Click on the table
   - Scroll to "Row Groups" section
   - Should show "- 2 rows" with expandable items

5. **Test Add/Remove**:
   - Try clicking to expand row group items
   - Modify title or start row
   - Changes should reflect on canvas immediately

## Visual Structure

The canvas should now show this structure:

```
┌─────────────────────────────────────────────────┐
│ Disease │ Inherit... │ Gene... │ ...            │ ← Header (light gray)
├─────────────────────────────────────────────────┤
│ PRIMARY FINDINGS                                │ ← Row Group (dark blue)
├─────────────────────────────────────────────────┤
│ Cornelia De Lange Syndrome 1 │ ... │ ... │ ... │ ← Data row (white)
├─────────────────────────────────────────────────┤
│ KMT2D-Related Disorders │ ... │ ... │ ... │     │ ← Data row (light gray)
├─────────────────────────────────────────────────┤
│ Neurodevelopmental Disorder │ ... │ ... │ ... │ │ ← Data row (white)
├─────────────────────────────────────────────────┤
│ ACMG SECONDARY FINDINGS                         │ ← Row Group (dark blue)
├─────────────────────────────────────────────────┤
│ KCNQ1-Related Arrhythmias │ ... │ ... │ ... │   │ ← Data row (white)
└─────────────────────────────────────────────────┘
```

## Code Changes Summary

**File**: `packages/schemas/src/tables/uiRender.ts`

**Changes**:
1. Added `renderRowGroupUi()` function (lines 114-155)
2. Updated `renderRowUi()` signature to accept `rowGroups` parameter (line 163)
3. Added row group insertion logic before each body row (lines 170-177)
4. Updated render calls to pass row groups (lines 277-296)
5. Fixed height calculation to include row group heights (lines 486-499)

## Expected Behavior

### Designer Mode
- Row groups visible on canvas
- Cannot edit row group content directly on canvas (read-only)
- Can configure via PropPanel

### Form Mode
- Row groups visible on canvas
- Read-only display
- Organize data visually

### Viewer Mode
- Row groups visible on canvas
- Full table displayed with section organization

## Troubleshooting

### If row groups still don't appear on canvas:

1. **Check browser console** for JavaScript errors
2. **Verify template has row groups**:
   ```json
   "rowGroups": [
     {
       "title": "PRIMARY FINDINGS",
       "startRow": 0,
       ...
     }
   ]
   ```
3. **Check table object** in console:
   - Open DevTools
   - Inspect table element
   - Check if `table.rowGroups` exists and has items

4. **Verify cells created**:
   - Each row group should have a `cell` property
   - Cell should have `width`, `height`, `raw`, `styles`

### If height is wrong:

- The height calculation now includes row groups
- If table appears cut off, check console for errors
- Verify row group `cell.height` is calculated correctly

## Success Criteria

✅ **COMPLETE** when you can confirm:
1. Two dark blue section headers visible on canvas
2. Section headers have white text
3. Headers say "PRIMARY FINDINGS" and "ACMG SECONDARY FINDINGS"
4. Headers appear before correct rows (0 and 3)
5. PropPanel shows "Row Groups - 2 rows"
6. Clicking row groups in PropPanel shows editable details
7. Table height accommodates section headers

---

**Next**: Once you confirm this is working, we can fine-tune the visual styling to exactly match Figma (borders, padding, font sizes, etc.)
