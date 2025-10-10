# Hidden Field Editing Fix

## Problem
When a field is hidden (`hide: true`):
- It doesn't render on the canvas (returns `null`)
- Clicking it in the field list doesn't open the properties panel
- Can't edit its properties

## Root Cause
The `onEdit` function tried to find the field by `document.getElementById(id)`, but hidden fields have no DOM element.

## Solution

### Changes Made

#### 1. Designer index.tsx (Lines 347-362)
**Allow editing hidden fields from field list:**

```typescript
onEdit={(id) => {
  const editingElem = document.getElementById(id);
  if (editingElem) {
    onEdit([editingElem]);
  } else {
    // If element doesn't exist (hidden field), create a virtual element
    const schema = schemasList[pageCursor]?.find(s => s.id === id);
    if (schema && schema.hide) {
      // Create a dummy element for hidden fields
      const dummyElement = document.createElement('div');
      dummyElement.id = id;
      dummyElement.setAttribute('data-hidden-field', 'true');
      onEdit([dummyElement as HTMLElement]);
    }
  }
}}
```

**What this does:**
- Checks if field exists in DOM
- If not found AND field is hidden, creates a virtual/dummy DOM element
- Marks it with `data-hidden-field="true"` attribute
- Passes this to properties panel

#### 2. AlignWidget.tsx (Lines 19-25)
**Hide alignment widget for hidden fields:**

```typescript
// Check if active element is a hidden field
const isHiddenField = activeElements.length > 0 &&
  activeElements[0].getAttribute('data-hidden-field') === 'true';

// Don't show alignment widget for hidden fields
if (isHiddenField) {
  return null;
}
```

**Why:**
- Alignment requires real DOM positions
- Hidden fields have no visual position
- No point showing align buttons

## How It Works Now

### Workflow

1. **Add a field** → Field appears on canvas
2. **Hide the field** → Check "Hide" checkbox → Field disappears from canvas
3. **Field still appears in field list** (left sidebar)
4. **Click field in list** → Properties panel opens! ✅
5. **Edit properties** → Change name, size, etc.
6. **Uncheck "Hide"** → Field reappears on canvas with updated properties

### Visual Representation

```
Before Fix:
┌─────────────────┐  Click hidden  ┌──────────────┐
│ Field List      │  field1       │ Canvas       │
│ ◆ field1 (hide) │─────X─────────│ (empty)      │
│ ◆ field2        │               │ ■ field2     │
└─────────────────┘               └──────────────┘
                                   ↑
                                   Nothing happens!

After Fix:
┌─────────────────┐  Click hidden  ┌──────────────┐  ┌─────────────────┐
│ Field List      │  field1       │ Canvas       │  │ Properties      │
│ ◆ field1 (hide) │─────✓─────────│ (empty)      │  │ Name: field1    │
│ ◆ field2        │               │ ■ field2     │  │ Hide: ☑         │
└─────────────────┘               └──────────────┘  │ Width: ...      │
                                                     └─────────────────┘
                                                     ↑
                                                     Properties open!
```

## Testing Steps

1. **Open Designer**
2. **Add field1** (text field)
3. **Select field1**
4. **Check "Hide"** in properties
5. **Verify:** field1 disappears from canvas but stays in field list
6. **Add field2** at same position
7. **Click field1 in field list**
8. **Verify:** Properties panel opens for field1
9. **Change field1 name** to "hidden_field"
10. **Uncheck "Hide"**
11. **Verify:** field1 reappears with new name

## Use Cases

### Use Case 1: Edit Hidden Fields
```typescript
// User flow:
1. Hide field
2. Click in field list  ← Fixed! Now works
3. Edit properties
4. Unhide when ready
```

### Use Case 2: Conditional Display
```typescript
// Template with language variants:
{
  name_english: { hide: false },  // Currently visible
  name_arabic: { hide: true }     // Can edit even while hidden
}

// Later: swap visibility by editing from field list
```

### Use Case 3: Template Organization
```typescript
// Keep backup fields hidden but editable:
{
  primary_address: { hide: false },
  backup_address: { hide: true }  // Can maintain without showing
}
```

## What Still Works

✅ Normal fields (hide: false) work as before
✅ Canvas editing for visible fields
✅ Drag and drop from sidebar
✅ Alignment widgets for visible fields
✅ Multi-select (for visible fields)
✅ Undo/redo
✅ Save template

## What Changed

✅ Hidden fields can be selected from field list
✅ Properties panel opens for hidden fields
✅ Alignment widget hidden for hidden fields (since no position)

## Technical Details

### Virtual Element Creation
When a hidden field is clicked:
```typescript
const dummyElement = document.createElement('div');
dummyElement.id = schema.id;
dummyElement.setAttribute('data-hidden-field', 'true');
```

This creates a temporary DOM element that:
- Has the same ID as the hidden field
- Carries a special attribute to identify it
- Allows the properties panel to function
- Gets garbage collected after use

### Alignment Widget Check
```typescript
const isHiddenField = activeElements[0]?.getAttribute('data-hidden-field') === 'true';
```

This checks the virtual element's attribute to determine if it's a hidden field.

## Files Modified

1. **packages/ui/src/components/Designer/index.tsx**
   - Lines 347-362: Allow editing hidden fields

2. **packages/ui/src/components/Designer/RightSidebar/DetailView/AlignWidget.tsx**
   - Lines 19-25: Hide alignment widget for hidden fields

## Rebuild Instructions

```bash
cd C:\Users\sandi\source\repos\pdfme
npm run build:ui

# Then restart wgs-reports dev server
cd C:\Users\sandi\source\repos\wgs-reports
npm run dev
```

Or use the automated script:
```
C:\Users\sandi\source\repos\wgs-reports\REBUILD_HIDDEN_FIELD_FIX.bat
```

## Known Limitations

- ⚠️ Alignment widgets don't work for hidden fields (by design - they have no visual position)
- ⚠️ Multi-select with both hidden and visible fields may behave unexpectedly
- ⚠️ Drag handles won't appear for hidden fields on canvas (they're not rendered)

These are expected behaviors since hidden fields have no visual representation.

## Future Enhancements (Optional)

Could add:
- Visual indicator in field list showing which fields are hidden
- Bulk hide/unhide operation
- Toggle hide with keyboard shortcut
- Preview mode that shows hidden fields with opacity
