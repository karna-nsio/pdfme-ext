# 📋 Field Grouping - Quick Reference Card

## 🚀 CREATE A GROUP (3 Steps)

```
1. SELECT     →  Shift+Click on 2+ fields in canvas
2. BUTTON     →  See "Create Group" button enabled in field list
3. CREATE     →  Click button → Name it → Done! ✅
```

---

## 🎯 WHAT HAPPENS WHEN YOU SELECT FIELDS

| Fields Selected | Right Sidebar Shows | Create Group Button |
|----------------|---------------------|---------------------|
| **0 fields** | Field List (ListView) | ⚪ Disabled (grey) |
| **1 field** | Edit Field (DetailView) | 🚫 Not visible |
| **2+ fields** | Field List (ListView) | ✅ Enabled (blue)! |

**Key:** When you select 2+ fields, you stay in ListView with the button!

---

## 🎨 GROUP OPERATIONS

### Hide/Show All
```
Right-click group → "Hide All Fields" or "Show All Fields"
→ All fields toggle together! ✅
```

### Collapse/Expand
```
Click arrow (▶/▼) next to group name
→ Hides/shows member fields in list
```

### Rename
```
Right-click → "Rename Group" → Enter new name → Done!
```

### Delete
```
Right-click → "Delete Group" (keeps fields)
OR
Right-click → "Delete Group & Fields" (deletes all)
```

---

## 💡 PERFECT USE CASES

### 1. Report Sections
```
📁 Demographics
📁 Clinical Info  
📁 Test Results
📁 Doctor Notes
```
Work on one section at a time!

### 2. Conditional Fields
```
📁 Positive Result Fields (hidden) 👁️‍🗨️
📁 Negative Result Fields
```
Show/hide based on result type!

### 3. Multi-Language
```
📁 English Fields
📁 Arabic Fields (hidden) 👁️‍🗨️
```
Switch languages instantly!

---

## ⚡ QUICK TIPS

✅ **DO:**
- Name groups clearly ("Patient Info" not "Group1")
- Group related fields together
- Hide groups you're not working on
- Collapse groups to reduce clutter

❌ **DON'T:**
- Try to put a field in 2 groups (one group per field)
- Create groups with only 1 field (minimum is 2)
- Use duplicate group names (must be unique)

---

## 🔧 AFTER BUILD

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

---

## 🎯 TRY IT NOW

1. **Shift+Click** on 2 fields
2. See **ListView** with blue **"Create Group"** button
3. Click button
4. Name your group
5. ✅ Done!

**It just works! 🎉**

