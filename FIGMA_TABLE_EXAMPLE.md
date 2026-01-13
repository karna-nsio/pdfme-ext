# Figma Medical Table Example

This example demonstrates how to create a medical findings table (like the Figma design) using the enhanced PDFme table schema.

## JSON Schema Configuration

```json
{
  "type": "table",
  "name": "medical_findings_table",
  "position": { "x": 10, "y": 10 },
  "width": 277,
  "height": 100,
  "showHead": true,
  "head": [
    "Disease",
    "Inheritance Pattern",
    "Gene / Variant",
    "Genotype",
    "Variant Type",
    "Inherited From",
    "Variant Classification"
  ],
  "headWidthPercentages": [15, 12, 18, 12, 12, 12, 19],
  "content": "[[\"Cornelia De Lange Syndrome 1\",\"Autosomal Dominant\",\"NIPBL c.2479del, p.R87Gfs*20\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Pathogenic\"],[\"KMT2D-Related Disorders\",\"Autosomal Dominant\",\"KMT2D: c.1952C>G, p.S651W\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Variant of Uncertain Significance\"],[\"Neurodevelopmental Disorder\",\"Autosomal Dominant\",\"BAZ2B:HG38 chr2:159670492-159491775 del 21.28(kb)\",\"Heterozygous\",\"Sequence Variant\",\"De Novo\",\"Variant of Uncertain Significance\"],[\"KCNQ1-Related Arrhythmias\",\"Autosomal Dominant\",\"KCNQ1: c.1552C>T, p.R518*\",\"Heterozygous\",\"Sequence Variant\",\"N/A\",\"Pathogenic\"]]",
  "tableStyles": {
    "borderColor": "#888888",
    "borderWidth": 0.3
  },
  "headStyles": {
    "fontWeight": "bold",
    "fontSize": 10,
    "fontColor": "#ffffff",
    "backgroundColor": "#2c5282",
    "alignment": "center",
    "verticalAlignment": "middle",
    "lineHeight": 1.2,
    "padding": {
      "top": 8,
      "bottom": 8,
      "left": 5,
      "right": 5
    },
    "borderColor": "#888888",
    "borderWidth": {
      "top": 0.1,
      "bottom": 0.1,
      "left": 0.1,
      "right": 0.1
    }
  },
  "bodyStyles": {
    "fontWeight": "normal",
    "fontSize": 9,
    "fontColor": "#000000",
    "backgroundColor": "#ffffff",
    "alternateBackgroundColor": "#f9fafb",
    "alignment": "left",
    "verticalAlignment": "middle",
    "lineHeight": 1.3,
    "padding": {
      "top": 6,
      "bottom": 6,
      "left": 5,
      "right": 5
    },
    "borderColor": "#888888",
    "borderWidth": {
      "top": 0.1,
      "bottom": 0.1,
      "left": 0.1,
      "right": 0.1
    }
  },
  "rowGroups": [
    {
      "title": "PRIMARY FINDINGS",
      "startRow": 0,
      "colspan": true,
      "styles": {
        "fontWeight": "bold",
        "fontSize": 11,
        "fontColor": "#ffffff",
        "backgroundColor": "#1a3a52",
        "alignment": "left",
        "verticalAlignment": "middle",
        "lineHeight": 1.2,
        "padding": {
          "top": 6,
          "bottom": 6,
          "left": 10,
          "right": 10
        },
        "borderColor": "",
        "borderWidth": {
          "top": 0,
          "bottom": 0,
          "left": 0,
          "right": 0
        }
      }
    },
    {
      "title": "ACMG SECONDARY FINDINGS",
      "startRow": 3,
      "colspan": true,
      "styles": {
        "fontWeight": "bold",
        "fontSize": 11,
        "fontColor": "#ffffff",
        "backgroundColor": "#1a3a52",
        "alignment": "left",
        "verticalAlignment": "middle",
        "lineHeight": 1.2,
        "padding": {
          "top": 6,
          "bottom": 6,
          "left": 10,
          "right": 10
        },
        "borderColor": "",
        "borderWidth": {
          "top": 0,
          "bottom": 0,
          "left": 0,
          "right": 0
        }
      }
    }
  ],
  "columnStyles": {},
  "columnConditions": {},
  "rowStyles": {},
  "cellStyles": {},
  "cellMerge": {}
}
```

## Usage Example

```typescript
import { generate } from '@pdfme/generator';
import { table } from '@pdfme/schemas';

const template = {
  basePdf: { width: 297, height: 210, padding: [10, 10, 10, 10] },
  schemas: [[medicalFindingsTableSchema]] // Use the JSON schema above
};

const inputs = [{}]; // Data is already in the content field

const pdf = await generate({
  template,
  inputs,
  plugins: { table },
});
```

## Features Demonstrated

### 1. Font Weight (Bold Headers)
- Table headers use `fontWeight: "bold"`
- Section headers (PRIMARY FINDINGS, ACMG SECONDARY FINDINGS) use bold text
- Body rows use `fontWeight: "normal"`

### 2. Row Groups (Section Headers)
- Two row groups defined:
  - "PRIMARY FINDINGS" at row 0
  - "ACMG SECONDARY FINDINGS" at row 3
- Both span all columns (`colspan: true`)
- Dark blue background (#1a3a52)
- White text color
- Left-aligned text

### 3. Styling Hierarchy
The table demonstrates the complete styling hierarchy:
1. **Table-level styles**: Border color and width for the entire table
2. **Head styles**: Bold white text on blue background
3. **Body styles**: Normal weight text with alternating row colors
4. **Row group styles**: Bold white text on darker blue background

### 4. Color Scheme
- Header background: #2c5282 (medium blue)
- Header text: #ffffff (white)
- Section header background: #1a3a52 (dark blue)
- Section header text: #ffffff (white)
- Body background: #ffffff (white)
- Body alternate background: #f9fafb (light gray)
- Body text: #000000 (black)
- Borders: #888888 (gray)

### 5. Typography
- Header font size: 10pt
- Section header font size: 11pt
- Body font size: 9pt
- Line height: 1.2-1.3 for better readability

### 6. Spacing
- Headers: 8pt top/bottom padding
- Section headers: 6pt top/bottom padding, 10pt left/right padding
- Body cells: 6pt top/bottom padding, 5pt left/right padding

## Result

The generated PDF will match the Figma design with:
- ✅ Bold text in headers
- ✅ Section headers spanning full width
- ✅ Proper background colors for all sections
- ✅ Clean borders between cells
- ✅ Multi-line text support in cells
- ✅ Alternating row colors in body

## Testing

To test this example:

1. Save the schema to a file or use it directly in your code
2. Generate a PDF using the PDFme generator
3. Compare the output with the Figma design screenshot
4. Verify all styling properties are applied correctly

## Customization

You can easily customize this table by:

- **Adding more row groups**: Add objects to the `rowGroups` array
- **Changing colors**: Modify the `backgroundColor` and `fontColor` properties
- **Adjusting spacing**: Modify the `padding` values
- **Changing column widths**: Adjust the `headWidthPercentages` array
- **Adding more data**: Extend the `content` JSON string with additional rows

## Notes

- Font variants (Bold, Italic, etc.) must be registered in the `options.font` parameter when generating PDFs
- Row group indices are zero-based and refer to body rows (not including the header)
- The table automatically handles text wrapping for long content
- Border widths can be set independently for each side (top, right, bottom, left)
