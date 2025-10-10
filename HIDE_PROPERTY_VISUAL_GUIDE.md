# Hide Property - Visual Guide

## What You'll See in the Designer

### Before (Without Hide Property)
```
┌────────────────────────────────────┐
│  Properties Panel                  │
├────────────────────────────────────┤
│ Type:      [text        ▼]         │
│ Name:      patient_name            │
│ Editable:  ☑                       │
│ Required:  ☑                       │
│ ────────────────────────────       │  ← No Hide option
│ Align:     [Center alignment UI]   │
│ Position:  X: 20  Y: 30           │
│ Width:     80    Height: 10       │
└────────────────────────────────────┘
```

### After (With Hide Property)
```
┌────────────────────────────────────┐
│  Properties Panel                  │
├────────────────────────────────────┤
│ Type:      [text        ▼]         │
│ Name:      patient_name            │
│ Editable:  ☑                       │
│ Required:  ☑                       │
│ Hide:      ☐  ← NEW CHECKBOX!     │
│ ────────────────────────────       │
│ Align:     [Center alignment UI]   │
│ Position:  X: 20  Y: 30           │
│ Width:     80    Height: 10       │
└────────────────────────────────────┘
```

## Canvas Behavior

### Scenario: Two Fields at Same Position

#### Step 1: Create First Field (Visible)
```
Canvas View:
┌────────────────────────────────────┐
│                                    │
│    ┌─────────────┐                 │
│    │ Patient Name│  ← Field 1      │
│    └─────────────┘                 │
│                                    │
└────────────────────────────────────┘

Properties:
- Name: patient_name_english
- Position: X=20, Y=30
- Hide: ☐ (unchecked - VISIBLE)
```

#### Step 2: Create Second Field (Initially Visible)
```
Canvas View:
┌────────────────────────────────────┐
│                                    │
│    ┌─────────────┐                 │
│    │اسم المريض   │  ← Can't click Field 1!
│    └─────────────┘                 │
│         ↑                          │
│    Field 2 blocks Field 1          │
└────────────────────────────────────┘

Problem: Field 2 covers Field 1!
Can't select or edit Field 1!
```

#### Step 3: Hide Second Field
```
Click Field 2 → Check "Hide" checkbox

Canvas View:
┌────────────────────────────────────┐
│                                    │
│    ┌─────────────┐                 │
│    │ Patient Name│  ← Field 1 visible again!
│    └─────────────┘                 │
│                                    │
└────────────────────────────────────┘

Properties:
Field 1:
- Name: patient_name_english
- Position: X=20, Y=30
- Hide: ☐ (unchecked - VISIBLE)

Field 2:
- Name: patient_name_arabic
- Position: X=20, Y=30  ← Same position!
- Hide: ☑ (checked - HIDDEN)
```

## Practical Example: Language Toggle

### Template Structure
```javascript
{
  "schemas": [
    [
      // English version - visible by default
      {
        "name": "patient_name_en",
        "type": "datasource",
        "datasourceField": "Patient.Name",
        "position": { "x": 20, "y": 30 },
        "width": 80,
        "height": 10,
        "hide": false  // ← Visible
      },

      // Arabic version - hidden by default
      {
        "name": "patient_name_ar",
        "type": "datasource",
        "datasourceField": "Patient.NameArabic",
        "position": { "x": 20, "y": 30 },  // Same position!
        "width": 80,
        "height": 10,
        "hide": true   // ← Hidden
      }
    ]
  ]
}
```

### In Your Code (Switch Language)
```javascript
// Function to toggle language display
const switchToArabic = () => {
  const template = designerRef.current.getTemplate()

  // Hide English, Show Arabic
  template.schemas[0].patient_name_en.hide = true
  template.schemas[0].patient_name_ar.hide = false

  designerRef.current.updateTemplate(template)
}

const switchToEnglish = () => {
  const template = designerRef.current.getTemplate()

  // Show English, Hide Arabic
  template.schemas[0].patient_name_en.hide = false
  template.schemas[0].patient_name_ar.hide = true

  designerRef.current.updateTemplate(template)
}
```

## UI Location in Designer

```
┌──────────────────────────────────────────────────────────────┐
│  Designer Canvas                                             │
│  ┌───────┐ ┌──────────────────────┐ ┌──────────────────┐    │
│  │       │ │                      │ │ Properties       │    │
│  │ Left  │ │                      │ │ ┌──────────────┐ │    │
│  │ Side  │ │  Canvas Area         │ │ │ Type: text   │ │    │
│  │ bar   │ │                      │ │ │ Name: field1 │ │    │
│  │       │ │  [Your PDF fields]   │ │ │ Editable: ☑  │ │    │
│  │ [+]   │ │                      │ │ │ Required: ☑  │ │    │
│  │ Text  │ │                      │ │ │ Hide: ☐ ←NEW │ │    │
│  │ Image │ │                      │ │ │──────────────│ │    │
│  │ Data  │ │                      │ │ │ Position...  │ │    │
│  └───────┘ └──────────────────────┘ └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                                       ↑
                                  Hide checkbox appears here!
```

## File Locations in Source Code

The hide property was added to these files:

```
C:\Users\sandi\source\repos\pdfme\
├── packages\
│   ├── common\
│   │   └── src\
│   │       └── schema.ts                    ← Type definition
│   │           Line 111: hide: z.boolean().optional()
│   │
│   └── ui\
│       └── src\
│           └── components\
│               └── Designer\
│                   ├── Canvas\
│                   │   └── index.tsx        ← Hide logic
│                   │       Lines 476-479: if (schema.hide) return null
│                   │
│                   └── RightSidebar\
│                       └── DetailView\
│                           └── index.tsx    ← UI checkbox
│                               Lines 244-248: hide property
```

## What Happens Under the Hood

### When hide = false (visible)
```javascript
// Canvas renders the field normally
<Renderer
  key={schema.id}
  schema={schema}
  // ... all the props
/>
```

### When hide = true (hidden)
```javascript
// Canvas returns null - field doesn't render at all!
if (schema.hide) {
  return null  // ← Field completely removed from DOM
}
```

This means:
- ✅ No visual element on canvas
- ✅ No bounding box
- ✅ No mouse events
- ✅ Can't accidentally select it
- ✅ Won't interfere with other fields
- ✅ Still exists in template data

## Integration with Your DesignerCanvas.jsx

Your current code at [DesignerCanvas.jsx:637](C:\Users\sandi\source\repos\wgs-reports\src\components\DesignerCanvas.jsx#L637):

```javascript
const designer = new Designer(designerOptions)
designerRef.current = designer
```

**After linking local pdfme:**
- The Designer will automatically support the hide property
- No changes needed to your DesignerCanvas.jsx!
- The hide checkbox will appear automatically
- Hidden fields will be invisible automatically

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Overlapping fields** | Not possible (fields block each other) | ✅ Possible with hide |
| **Properties panel** | No hide option | ✅ Hide checkbox |
| **Canvas rendering** | Always renders all fields | ✅ Skips hidden fields |
| **Mouse interaction** | Hidden fields still selectable | ✅ Hidden fields don't interfere |
| **Template JSON** | No hide property | ✅ `hide: true/false` |
| **Code changes needed** | N/A | ✅ None! (after linking) |
