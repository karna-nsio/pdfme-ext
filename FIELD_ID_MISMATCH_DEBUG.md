# 🔍 Field ID Mismatch - Detailed Debug

## 🎯 What We're Testing

The new logs will show us **exactly** why field IDs aren't matching between groups and schemas.

---

## 📊 Current Situation (From Logs)

### **Group Field IDs (UUIDs):**
```
Group 'p' has fieldIds:
- a4b4ee92-a4dc-407c-901d-3ca00ccbd25b
- b9e97925-69db-4f7e-924a-83580495bb02
- 0c6db921-ee6b-4e1b-9d37-cd1aaa31428c
- bf8b7eaf-238f-4fa8-a68b-2773d1ca0a57
```

### **Schemas (All showing "not in any group"):**
```
✅ Field undefined (field1) - not in any group
✅ Field undefined (field2) - not in any group
... (all 140 fields)
```

**Problem:** `schema.id` is `undefined`, so it doesn't match the UUIDs in the group!

---

## 🔍 What the New Logs Will Show

After rebuild, when you test, look for these detailed logs:

```
🔍 Checking field - key: "field1", schema.id: "a4b4ee92-...", schema.name: "field1"
   Possible IDs: [a4b4ee92-..., field1, field1]
   Checking against visibleFieldIds: ['a4b4ee92-...', 'b9e97925-...', ...]
   ✅ Found in group using ID: a4b4ee92-...  ← This tells us which ID matched
   isInGroup: true, shouldShow: true
✅ Field a4b4ee92-... (field1) - condition met, showing

🔍 Checking field - key: "field2", schema.id: "xyz123-...", schema.name: "field2"
   Possible IDs: [xyz123-..., field2, field2]
   Checking against visibleFieldIds: ['a4b4ee92-...', 'b9e97925-...', ...]
   (no "Found in group" message)
   isInGroup: false, shouldShow: false
✅ Field field2 - not in any group, showing
```

---

## 🎯 What We're Looking For

### **Scenario A: schema.id matches (GOOD)**
```
key: "field1", schema.id: "a4b4ee92-a4dc-407c-901d-3ca00ccbd25b"
Possible IDs: [a4b4ee92-a4dc-407c-901d-3ca00ccbd25b, field1]
✅ Found in group using ID: a4b4ee92-a4dc-407c-901d-3ca00ccbd25b
❌ Field a4b4ee92... - condition not met, HIDING  ← Should hide 'n' group fields
```

### **Scenario B: schema.id is undefined or different (BAD)**
```
key: "field1", schema.id: "undefined" or "different-uuid"
Possible IDs: [field1]
(no "Found in group" message)
isInGroup: false
✅ Field field1 - not in any group, showing  ← WRONG!
```

### **Scenario C: Key matches instead (ALTERNATIVE)**
```
key: "a4b4ee92-a4dc-407c-901d-3ca00ccbd25b", schema.id: "undefined"
Possible IDs: [a4b4ee92-a4dc-407c-901d-3ca00ccbd25b]
✅ Found in group using ID: a4b4ee92-a4dc-407c-901d-3ca00ccbd25b
```

---

## 🧪 Test After Build

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

**Test steps:**
1. Click Preview
2. Enter `resultType` = `p`
3. Click "Apply & Preview"
4. **Look at console for the detailed field checks**

---

## 📋 Copy This From Console

Please share a few lines from the field checking section, like:

```
🔍 Checking field - key: "???", schema.id: "???", schema.name: "???"
   Possible IDs: [...]
   Checking against visibleFieldIds: [...]
   ✅ Found in group using ID: ???  (or not present)
   isInGroup: ???, shouldShow: ???
```

This will tell us:
1. What identifier the schema actually has
2. What identifier the group is looking for
3. Why they don't match

---

## 💡 Possible Fixes

Based on what we find:

### **If schema.id exists but is different:**
→ Bug in how groups store field IDs (wrong UUID?)
→ Need to fix group creation logic

### **If schema.id is undefined:**
→ Schemas lost their ID during getDynamicTemplate
→ Need to use key instead of schema.id

### **If key is the UUID:**
→ Object keys are UUIDs, not field names
→ Already fixed by using `schema.id || key`

**Test and share the detailed logs! 🔍**

