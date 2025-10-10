# Hide Property Feature - Usage Guide

## Overview

The **hide** property allows you to make fields invisible in the Designer canvas while still keeping them in the template. This enables you to:

- Place multiple fields at the same position
- Conditionally show/hide fields
- Keep backup/alternative fields that don't interfere with the designer

## How It Works

### 1. In the Designer UI

When you select any field in the Designer, you'll now see a **"Hide"** checkbox in the properties panel:

```
┌─────────────────────────┐
│ Edit Field              │
├─────────────────────────┤
│ Type:      [text   ▼]   │
│ Name:      field1        │
│ Editable:  ☑             │
│ Required:  ☑             │
│ Hide:      ☐  ← NEW!    │
├─────────────────────────┤
│ Position, Size, etc...  │
└─────────────────────────┘
```

**When you check "Hide":**
- ✅ Field becomes **completely invisible** on the canvas
- ✅ Field is **removed from mouse interactions** (won't block clicks)
- ✅ Field is **still in the template** (saved in JSON)
- ✅ You can **place other fields on top** at the same position

### 2. Programmatic Usage

In your `DesignerCanvas.jsx`, fields with `hide: true` are automatically handled:

```javascript
// Example: Create a hidden field programmatically
const hiddenField = {
  type: 'text',
  name: 'backup_name',
  position: { x: 10, y: 10 },
  width: 50,
  height: 10,
  hide: true,  // ← This field won't appear on canvas
  content: 'Backup value'
}

// Add to template
const newTemplate = {
  ...currentTemplate,
  schemas: [
    {
      ...currentTemplate.schemas[0],
      backup_name: hiddenField
    }
  ]
}
```

### 3. Template JSON Structure

When saved, your template will look like:

```json
{
  "schemas": [
    [
      {
        "name": "visible_field",
        "type": "text",
        "position": { "x": 10, "y": 10 },
        "width": 50,
        "height": 10,
        "hide": false
      },
      {
        "name": "hidden_field",
        "type": "text",
        "position": { "x": 10, "y": 10 },  // Same position!
        "width": 50,
        "height": 10,
        "hide": true  // ← This one is hidden
      }
    ]
  ],
  "basePdf": "..."
}
```

## Use Cases

### Use Case 1: Multiple Fields at Same Position

```javascript
// Scenario: Show different values based on conditions
const fields = {
  patient_name_english: {
    type: 'text',
    position: { x: 20, y: 30 },
    width: 80,
    height: 10,
    hide: false,  // Currently visible
    content: 'John Doe'
  },
  patient_name_arabic: {
    type: 'text',
    position: { x: 20, y: 30 },  // Same position
    width: 80,
    height: 10,
    hide: true,   // Hidden (will show later based on language)
    content: 'جون دو'
  }
}
```

### Use Case 2: Conditional Fields with Expression Builder

Your existing conditional field plugin can use this:

```javascript
// In your conditional field logic
const conditionalField = {
  type: 'conditional',
  name: 'conditional_result',
  position: { x: 50, y: 50 },
  width: 100,
  height: 20,
  hide: false,  // Show the result
  conditionalExpression: 'if (age > 18) return "Adult" else "Minor"'
}

// The fallback field (hidden)
const fallbackField = {
  type: 'text',
  name: 'conditional_fallback',
  position: { x: 50, y: 50 },  // Same position
  width: 100,
  height: 20,
  hide: true,  // Hidden by default
  content: 'N/A'
}
```

### Use Case 3: Backup Fields for Different Data Sources

```javascript
// Show Patient.Name by default
const primaryDataSource = {
  type: 'datasource',
  name: 'primary_name',
  datasourceField: 'Patient.Name',
  position: { x: 10, y: 10 },
  hide: false
}

// Keep backup for Test.PatientName (hidden)
const backupDataSource = {
  type: 'datasource',
  name: 'backup_name',
  datasourceField: 'Test.PatientName',
  position: { x: 10, y: 10 },  // Same position
  hide: true  // Can toggle this based on which datasource is available
}
```

## How to Toggle Hide Property

### In the Designer UI
1. Click on any field
2. In the right properties panel, find the "Hide" checkbox
3. Check it to hide, uncheck to show

### Programmatically

```javascript
// In DesignerCanvas.jsx or parent component
const toggleFieldVisibility = (fieldName, shouldHide) => {
  const currentTemplate = designerRef.current.getTemplate()

  // Find and update the field
  currentTemplate.schemas.forEach((page, pageIndex) => {
    if (page[fieldName]) {
      currentTemplate.schemas[pageIndex][fieldName] = {
        ...page[fieldName],
        hide: shouldHide
      }
    }
  })

  // Update designer
  designerRef.current.updateTemplate(currentTemplate)
}

// Usage
toggleFieldVisibility('backup_field', true)   // Hide
toggleFieldVisibility('backup_field', false)  // Show
```

## Important Notes

1. **Hidden fields don't render at all** - They return `null` in the Canvas component
2. **No z-index issues** - Since hidden fields aren't rendered, they won't interfere with layering
3. **Field still exists in template** - Hidden fields are preserved when saving
4. **Generator still renders them** - When generating PDFs, you control whether to render hidden fields based on your logic
5. **Works with all field types** - text, datasource, conditional, image, signature, etc.

## Testing the Feature

After linking your local pdfme:

1. Start your wgs-reports dev server
2. Open the Designer
3. Add any field (text, datasource, etc.)
4. Select the field
5. Check the "Hide" checkbox in the properties panel
6. The field should disappear from the canvas
7. You can now add another field at the same position
8. Uncheck "Hide" to make it visible again

## Troubleshooting

**Issue:** Hide checkbox doesn't appear
- **Solution:** Make sure you've built and linked the local pdfme package (see BUILD_AND_LINK.md)

**Issue:** Hidden fields still visible
- **Solution:** Clear your browser cache and restart dev server

**Issue:** Fields not at exact same position
- **Solution:** Use the position inputs in properties panel to set exact x,y coordinates

**Issue:** Changes not persisting
- **Solution:** Make sure `onTemplateChange` callback is working in your DesignerCanvas
