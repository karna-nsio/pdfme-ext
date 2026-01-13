# Row Styles Solution - Use Actual Rows as Section Headers 🎯

## The Simpler Approach

Instead of using separate `rowGroups` elements, we now support styling **actual data rows** as section headers using `rowStyles`.

## How It Works

### 1. Data Structure
Your table data includes the section header text as regular rows:

```json
[
  ["PRIMARY FINDINGS", "", "", "", "", "", ""],          // Row 0 - Section header
  ["Cornelia De Lange Syndrome 1", "Autosomal...", ...], // Row 1 - Data
  ["KMT2D-Related Disorders", "Autosomal...", ...],      // Row 2 - Data
  ["Neurodevelopmental Disorder", "Autosomal...", ...],  // Row 3 - Data
  ["ACMG SECONDARY FINDINGS", "", "", "", "", "", ""],   // Row 4 - Section header
  ["KCNQ1-Related Arrhythmias", "Autosomal...", ...]     // Row 5 - Data
]
```

### 2. Apply Row Styles
Use `rowStyles` to style specific rows:

```json
{
  "rowStyles": {
    "0": {
      "backgroundColor": "#0C2340",
      "fontColor": "#FFFFFF",
      "fontWeight": "700",
      "fontSize": 9,
      "textTransform": "uppercase",
      "alignment": "left",
      "padding": {
        "top": 4,
        "bottom": 4,
        "left": 8,
        "right": 8
      }
    },
    "4": {
      "backgroundColor": "#0C2340",
      "fontColor": "#FFFFFF",
      "fontWeight": "700",
      "fontSize": 9,
      "textTransform": "uppercase",
      "alignment": "left",
      "padding": {
        "top": 4,
        "bottom": 4,
        "left": 8,
        "right": 8
      }
    }
  }
}
```

## Advantages

### ✅ Simpler
- No need for separate row group configuration
- Row headers are just rows with special styling
- Easier to understand and maintain

### ✅ More Flexible
- Each cell in the row can have different content if needed
- Can apply different styles to different cells in the header row using `cellStyles`
- Row width automatically matches other rows

### ✅ Same Width as Data Rows
- Section headers span all columns naturally
- No width calculation issues
- Perfect alignment with data rows

## Available Style Properties

You can apply any `CellStyle` properties via `rowStyles`:

```typescript
{
  fontName?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | ... | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  alignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'middle' | 'bottom';
  lineHeight: number;
  characterSpacing: number;
  padding: { top, right, bottom, left };
  borderColor: string;
  borderWidth: { top, right, bottom, left };
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  whiteSpace?: 'normal' | 'nowrap' | 'pre-wrap';
  wordBreak?: 'normal' | 'break-all' | 'break-word';
}
```

## Style Precedence

Styles are applied in this order (last wins):

1. **Default styles** (base)
2. **Section styles** (headStyles or bodyStyles)
3. **Alternate row styles** (every other row)
4. **Column styles** (per-column)
5. **Row styles** (per-row) ⭐ NEW
6. **Cell styles** (per-cell) ⭐ NEW

This means `rowStyles` will **override** alternating row colors, column alignment, etc.

## Complete Example

```json
{
  "type": "table",
  "showHead": true,
  "head": ["Disease", "Inheritance Pattern", "Gene / Variant", ...],
  "content": "[[\"PRIMARY FINDINGS\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"Cornelia De Lange Syndrome 1\",\"Autosomal Dominant\",\"NIPBL c.2479del, p.R87Gfs*20\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Pathogenic\"],[\"KMT2D-Related Disorders\",\"Autosomal Dominant\",\"KMT2D: c.1952C>G, p.S651W\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Variant of Uncertain Significance\"],[\"Neurodevelopmental Disorder\",\"Autosomal Dominant\",\"BAZ2B:HG38 chr2:159670492-159491775 del 21.28(kb)\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Variant of Uncertain Significance\"],[\"ACMG SECONDARY FINDINGS\",\"\",\"\",\"\",\"\",\"\",\"\"],[\"KCNQ1-Related Arrhythmias\",\"Autosomal Dominant\",\"KCNQ1: c.1552C>T, p.R518*\",\"Heterozygous\",\"Sequence Variant\",\"N/A\",\"Pathogenic\"]]",

  "bodyStyles": {
    "fontName": "DIN Next LT Pro",
    "fontWeight": "400",
    "fontSize": 10,
    "fontColor": "#0C2340",
    "backgroundColor": "#FFFFFF",
    "alternateBackgroundColor": "#F9FBFB",
    "alignment": "center"
  },

  "rowStyles": {
    "0": {
      "backgroundColor": "#0C2340",
      "fontColor": "#FFFFFF",
      "fontWeight": "700",
      "fontSize": 9,
      "textTransform": "uppercase",
      "alignment": "left"
    },
    "4": {
      "backgroundColor": "#0C2340",
      "fontColor": "#FFFFFF",
      "fontWeight": "700",
      "fontSize": 9,
      "textTransform": "uppercase",
      "alignment": "left"
    }
  },

  "columnStyles": {
    "alignment": {
      "0": "left",
      "1": "center",
      "2": "center",
      ...
    }
  }
}
```

## Testing

1. **Import the new template**: `figma-table-template-rowstyles.json`
2. **Check the canvas**: Rows 0 and 4 should have dark blue background
3. **Verify styling**: White text, uppercase, smaller font
4. **Test PDF export**: Should match canvas exactly

## Visual Result

```
┌──────────────────────────────────────────────┐
│ Disease │ Inherit... │ Gene... │ Geno... │... │ ← Header (light gray)
├──────────────────────────────────────────────┤
│ PRIMARY FINDINGS                             │ ← Row 0 (dark blue)
├──────────────────────────────────────────────┤
│ Cornelia... │ Autosomal... │ NIPBL... │...  │ ← Row 1 (white)
│ KMT2D... │ Autosomal... │ KMT2D... │...     │ ← Row 2 (gray)
│ Neurodevelop... │ Autosomal... │ BAZ2B... │ │ ← Row 3 (white)
├──────────────────────────────────────────────┤
│ ACMG SECONDARY FINDINGS                      │ ← Row 4 (dark blue)
├──────────────────────────────────────────────┤
│ KCNQ1... │ Autosomal... │ KCNQ1... │...     │ ← Row 5 (white)
└──────────────────────────────────────────────┘
```

## Comparison: rowGroups vs rowStyles

### Old Way (rowGroups):
- Separate configuration for row groups
- Row groups inserted as separate elements
- Complex rendering logic
- Width calculation needed

### New Way (rowStyles): ⭐
- Section headers are actual data rows
- Just apply styles to specific row indices
- Simple and intuitive
- Width automatically matches

## Migration Guide

If you have existing `rowGroups`, convert to `rowStyles`:

**Before:**
```json
{
  "rowGroups": [
    {
      "title": "PRIMARY FINDINGS",
      "startRow": 0,
      "styles": { "backgroundColor": "#0C2340", ... }
    }
  ]
}
```

**After:**
```json
{
  "content": "[[\"PRIMARY FINDINGS\",\"\",\"\",...], [\"Data row 1\",...], ...]",
  "rowStyles": {
    "0": {
      "backgroundColor": "#0C2340",
      "fontColor": "#FFFFFF",
      ...
    }
  }
}
```

## Advanced: Cell Styles

You can style individual cells within a row using `cellStyles`:

```json
{
  "cellStyles": {
    "0": {  // Row 0
      "0": {  // Column 0
        "fontWeight": "bold",
        "fontSize": 12
      },
      "1": {  // Column 1
        "fontColor": "#FF0000"
      }
    }
  }
}
```

## Conclusion

This approach provides maximum flexibility:
- ✅ Use actual rows for section headers
- ✅ Apply any styling via `rowStyles`
- ✅ Override per-cell with `cellStyles`
- ✅ Matches exact column widths automatically
- ✅ Simpler than separate row group elements

**File to test**: `figma-table-template-rowstyles.json`
