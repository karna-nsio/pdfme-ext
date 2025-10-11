# ✅ CRITICAL FIX: getDynamicTemplate Strips fieldGroups

## 🐛 The Root Cause (Found!)

From your console logs:

**Before Viewer initialization (PreviewCanvas.jsx):**
```
Template has fieldGroups: true  ✅
fieldGroups count: 2
```

**Inside Viewer (Preview.tsx after getDynamicTemplate):**
```
[@pdfme/ui Preview] Starting condition evaluation...
  - Has fieldGroups: false  ❌ ← LOST HERE!
  - fieldGroups count: 0
```

**What happened:**
`getDynamicTemplate()` processes the template for dynamic content (like tables) but **doesn't preserve** the `fieldGroups` property in the returned object!

---

## ✅ The Fix

### **In `packages/ui/src/components/Preview.tsx`:**

**Before:**
```typescript
const init = (template: Template) => {
  getDynamicTemplate({ template, input, ... })
    .then(async (dynamicTemplate) => {
      // dynamicTemplate.fieldGroups is undefined! ❌
      if (dynamicTemplate.fieldGroups && ...) {
        // Never executes!
      }
    })
}
```

**After:**
```typescript
const init = (template: Template) => {
  // ✅ Store fieldGroups BEFORE getDynamicTemplate
  const originalFieldGroups = template.fieldGroups;
  
  getDynamicTemplate({ template, input, ... })
    .then(async (dynamicTemplate) => {
      // ✅ Restore fieldGroups if lost
      if (originalFieldGroups && !dynamicTemplate.fieldGroups) {
        console.log('[@pdfme/ui Preview] Restoring fieldGroups lost by getDynamicTemplate');
        dynamicTemplate.fieldGroups = originalFieldGroups;
      }
      
      // Now dynamicTemplate.fieldGroups exists! ✅
      if (dynamicTemplate.fieldGroups && ...) {
        // This will execute!
        const visibleFieldIds = getConditionallyVisibleFieldIds(...);
        // Filter fields based on conditions
      }
    })
}
```

---

## 📊 Expected Logs After Fix

When you test again, console should show:

```
=== PREVIEWCANVAS.JSX ===
🔍 Initializing Viewer with:
  - Template has fieldGroups: true
  - fieldGroups count: 2
  - Groups with conditions: 2
  - Input data: { resultType: 'p', ... }

📋 Field Groups:
  - p (4 fields)
    Condition: resultType == p
  - n (3 fields)
    Condition: resultType == n

=== PREVIEW.TSX (INSIDE VIEWER) ===
[@pdfme/ui Preview] Restoring fieldGroups lost by getDynamicTemplate  ← NEW!

[@pdfme/ui Preview] Starting condition evaluation...
  - Has fieldGroups: true  ← SHOULD BE TRUE NOW!
  - fieldGroups count: 2
  - Has input data: true

[@pdfme/ui Preview] Evaluating group conditions...
  - Input data: { resultType: 'p', ... }
  
  - Group: p
    Fields: field1, field2, field3, field4
    Condition: resultType == p
    Input value for resultType: p  ✅ MATCH!
    
  - Group: n
    Fields: field5, field6, field7
    Condition: resultType == n
    Input value for resultType: p  ❌ NO MATCH

[@pdfme/ui Preview] Visible field IDs after evaluation: ['field1', 'field2', 'field3', 'field4']

    ✅ Field field1 (name) - condition met
    ✅ Field field2 (name) - condition met
    ✅ Field field3 (name) - condition met
    ✅ Field field4 (name) - condition met
    ❌ Field field5 (name) - condition not met
    ❌ Field field6 (name) - condition not met
    ❌ Field field7 (name) - condition not met

[@pdfme/ui Preview] Filtered: 7 fields → 4 fields (-3 change)

✅ Preview shows ONLY 'p' group fields!
```

---

## 🎯 Why This Happened

`getDynamicTemplate()` in `@pdfme/common` is designed to:
- Process dynamic content (tables, etc.)
- Return a template with resolved dynamic heights
- **BUT** it only clones specific properties: `basePdf`, `schemas`, `pdfmeVersion`

It **doesn't** clone custom properties like `fieldGroups` because they weren't part of the original pdfme spec.

Our fix: **Manually preserve fieldGroups** before/after `getDynamicTemplate()`.

---

## 🧪 Test After Build

Once build completes:

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

Navigate to: `http://localhost:5173/editor/wgs-standard-v1.3`

**Expected behavior:**
1. Click Preview → Panel appears ✅
2. Enter `resultType` = `p` → Click Apply ✅
3. Console shows: "Restoring fieldGroups..." ✅
4. Console shows: "Has fieldGroups: true" (inside Preview) ✅
5. Console shows: Field filtering logs ✅
6. **Preview shows ONLY 'p' group fields!** ✅

---

## 🎉 This Should Fix It!

The fieldGroups will now survive the `getDynamicTemplate()` call and condition evaluation will work!

**Test after build completes! 🚀**

