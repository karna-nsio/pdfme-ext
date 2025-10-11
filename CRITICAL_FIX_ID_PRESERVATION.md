# ✅ CRITICAL FIX: Schema ID Preservation

## 🎯 The Root Cause (Finally Found!)

### **The Problem:**

In `packages/ui/src/helper.ts` line 274, the `convertSchemasForUI` function was:

```typescript
template.schemas.forEach((page) => {
  page.forEach((schema) => {
    (schema as SchemaForUI).id = uuid();  // ❌ ALWAYS creates NEW UUID!
  });
});
```

**What this caused:**

```
Timeline:
1. User selects fields → Creates group
   └─ Group stores: fieldIds = ['90e02bbc-b2ba-452f-83d0-133a60f30081', ...]

2. User clicks Preview → template2SchemasList() called
   └─ convertSchemasForUI() runs
   └─ Generates NEW UUIDs for ALL schemas
   └─ Schemas now have: id = ['xyz123-new-uuid', 'abc456-new-uuid', ...]

3. Condition evaluation runs
   └─ Looking for: ['90e02bbc-b2ba-452f-83d0-133a60f30081', ...]  ← Old IDs
   └─ Schemas have: ['xyz123-new-uuid', 'abc456-new-uuid', ...]  ← New IDs
   └─ No match! ❌
   └─ Result: "All fields not in any group" → Shows everything

4. User sees: All fields overlapping (no filtering)
```

---

## ✅ The Fix

### **Updated convertSchemasForUI:**

```typescript
const convertSchemasForUI = (template: Template): SchemaForUI[][] => {
  template.schemas.forEach((page) => {
    // Handle both array and object formats
    if (Array.isArray(page)) {
      page.forEach((schema) => {
        // ✅ ONLY generate new ID if missing
        if (!(schema as SchemaForUI).id) {
          (schema as SchemaForUI).id = uuid();
        }
        (schema as SchemaForUI).content = schema.content || '';
      });
    } else if (page && typeof page === 'object') {
      // Object format: { field1: {...}, field2: {...} }
      Object.values(page).forEach((schema: any) => {
        // ✅ Preserve existing ID
        if (!schema.id) {
          schema.id = uuid();
        }
        schema.content = schema.content || '';
      });
    }
  });
  return template.schemas as SchemaForUI[][];
};
```

**Key changes:**
1. ✅ Check if `schema.id` already exists
2. ✅ Only generate new UUID if ID is missing
3. ✅ Handle both array and object schema formats
4. ✅ Fixed TypeScript error with `any` type annotation

---

## 📊 Expected Behavior After Fix

```
Timeline (Fixed):
1. User selects fields → Creates group
   └─ Schemas get IDs: ['90e02bbc-...', 'c0311a5d-...']
   └─ Group stores same IDs: ['90e02bbc-...', 'c0311a5d-...']

2. User clicks Preview → template2SchemasList() called
   └─ convertSchemasForUI() runs
   └─ Checks: schema.id exists? YES
   └─ Preserves existing IDs: ['90e02bbc-...', 'c0311a5d-...'] ✅

3. Condition evaluation runs
   └─ Looking for: ['90e02bbc-...', 'c0311a5d-...']
   └─ Schemas have: ['90e02bbc-...', 'c0311a5d-...']
   └─ Match! ✅
   └─ Result: Correct group membership detection

4. Filtering happens
   └─ Input: resultType = 'p'
   └─ Positive group: resultType == 'p' → TRUE ✅ → Show 4 fields
   └─ Negative group: resultType == 'n' → FALSE ❌ → Hide 3 fields

5. User sees: ONLY 4 fields from 'p' group (no overlap!) ✅
```

---

## 🧪 Expected Console Logs After Fix

```
[@pdfme/ui Preview] Evaluating group conditions...
  - Input data: { resultType: 'p', ... }
  
  - Group: p
    Fields: 90e02bbc-b2ba-452f-83d0-133a60f30081, ...
    Condition: resultType == p
    Input value for resultType: p  ✅ MATCHES!

[@pdfme/ui Preview] Visible field IDs: ['90e02bbc-...', 'c0311a5d-...', '99bdab18-...', '0dca3835-...']

🔍 Checking field - key: "field1", schema.id: "90e02bbc-b2ba-452f-83d0-133a60f30081"
   Possible IDs: [90e02bbc-b2ba-452f-83d0-133a60f30081, field1, field1]
   ✅ Found in group using ID: 90e02bbc-b2ba-452f-83d0-133a60f30081
   isInGroup: true, shouldShow: true
✅ Field 90e02bbc-... (field1) - condition met, showing

🔍 Checking field - key: "field5", schema.id: "e1e34b9a-82da-4da8-a364-53a311951e88"
   Possible IDs: [e1e34b9a-82da-4da8-a364-53a311951e88, field5, field5]
   ✅ Found in group using ID: e1e34b9a-82da-4da8-a364-53a311951e88
   isInGroup: true, shouldShow: false
❌ Field e1e34b9a-... (field5) - condition not met, HIDING

[@pdfme/ui Preview] Filtered: 140 fields → 4 fields (-136 change)

✅ Preview shows ONLY 'p' group fields!
```

---

## 🎉 This Was The Missing Piece!

All the other parts were correct:
- ✅ Designer stores fieldGroups
- ✅ Template preserves fieldGroups
- ✅ Preview receives fieldGroups
- ✅ Conditions are evaluated correctly
- ✅ Visible field IDs are calculated correctly

The ONLY problem was:
- ❌ Schema IDs were regenerated every time
- ❌ Group IDs became stale
- ❌ No matches → No filtering

Now with ID preservation:
- ✅ Schema IDs stay consistent
- ✅ Group IDs match schema IDs
- ✅ Matches found → Filtering works!

---

## 🚀 After Build Completes

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

**Test:**
1. Navigate to: `http://localhost:5173/editor/wgs-standard-v1.3`
2. Create 2 groups with conditions
3. Click Preview
4. Enter: `resultType = p`
5. Click "Apply & Preview"

**Expected Result:**
- ✅ Preview shows ONLY 4 fields from 'p' group
- ✅ 3 fields from 'n' group are HIDDEN
- ✅ No overlap!
- ✅ Console shows: "Filtered: 140 → 4 fields (-136 change)"

**This should finally work! 🎉**

