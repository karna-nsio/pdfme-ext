# 🎨 Visual Guide: Creating a Field Group

## 📸 Step-by-Step Screenshots (Text Version)

---

### **STEP 1: Select Fields**

**In the Designer Canvas:**

```
┌─────────────────────────────────────────────────┐
│  Designer Canvas                                │
│                                                 │
│    ┌─────────────┐  ← Click this field         │
│    │patient_name │  (Field 1 selected)          │
│    └─────────────┘                              │
│                                                 │
│    ┌─────────────┐  ← Hold Shift + Click       │
│    │patient_age  │  (Field 2 selected)          │
│    └─────────────┘                              │
│                                                 │
│    ┌─────────────┐  ← Hold Shift + Click       │
│    │patient_id   │  (Field 3 selected)          │
│    └─────────────┘                              │
│                                                 │
│  Now 3 fields are selected! ✅                  │
└─────────────────────────────────────────────────┘
```

**OR use Drag-Select:**

```
Start here ┐
  ↓        │
  ╔════════╪═════════╗  ← Drag to create
  ║ [patient_name  ] ║     selection box
  ║ [patient_age   ] ║
  ║ [patient_id    ] ║
  ╚══════════════════╝
                     ↑
                  End here
```

---

### **STEP 2: Look at Field List Panel**

**Right Sidebar (before):**

```
┌─ Field List ──────────────────┐
│ [  Create Group  ]  ← GREY    │  (Disabled - no selection)
├───────────────────────────────┤
│ patient_name                  │
│ patient_age                   │
│ patient_id                    │
│ test_result                   │
│ doctor_notes                  │
└───────────────────────────────┘
```

**Right Sidebar (after selecting 3 fields):**

```
┌─ Field List ──────────────────┐
│ [+ Create Group]  ← BLUE! ✅  │  (Enabled - 3 fields selected!)
├───────────────────────────────┤
│ patient_name       ✓ selected │
│ patient_age        ✓ selected │
│ patient_id         ✓ selected │
│ test_result                   │
│ doctor_notes                  │
└───────────────────────────────┘
```

---

### **STEP 3: Click "Create Group" Button**

Modal appears:

```
        ┌──────────────────────────────┐
        │  Create Group                │
        ├──────────────────────────────┤
        │                              │
        │  Group Name:                 │
        │  ┌─────────────────────────┐ │
        │  │ [Type name here______]  │ │
        │  └─────────────────────────┘ │
        │                              │
        │  ℹ️ 3 fields selected         │
        │                              │
        │  ┌─────────┐  ┌────────────┐ │
        │  │ Cancel  │  │Create Group│ │
        │  └─────────┘  └────────────┘ │
        └──────────────────────────────┘
```

Type: **"Patient Information"**

---

### **STEP 4: Group Created!**

**Field List After:**

```
┌─ Field List ──────────────────────────────┐
│ [+ Create Group]                          │
├───────────────────────────────────────────┤
│                                           │
│ 📁▼ Patient Information (3)               │ ← NEW GROUP!
│    ├─ patient_name                        │
│    ├─ patient_age                         │
│    └─ patient_id                          │
│                                           │
│ Ungrouped                                 │ ← Other fields
│    ├─ test_result                         │
│    └─ doctor_notes                        │
│                                           │
└───────────────────────────────────────────┘
```

---

## 🎯 **Using Your New Group**

### **To Hide All Fields:**

**1. Right-click on the group:**

```
┌─ Field List ──────────────────────┐
│ 📁▼ Patient Information (3)       │ ← Right-click here!
│    ├─ patient_name                │
│    ├─ patient_age                 │
│    └─ patient_id                  │
└───────────────────────────────────┘
```

**2. Menu appears:**

```
     ┌─────────────────────────┐
     │ 👁️ Hide All Fields       │ ← Click this!
     │ ─────────────────────── │
     │ ✏️ Rename Group          │
     │ ─────────────────────── │
     │ 🗑️ Delete Group          │
     │ 💀 Delete Group & Fields │
     └─────────────────────────┘
```

**3. Result:**

```
Field List:
┌───────────────────────────────────┐
│ 📁▶ Patient Information (3) 👁️‍🗨️   │ ← Collapsed + Hidden!
│                                   │
│ Ungrouped                         │
│    ├─ test_result                 │
│    └─ doctor_notes                │
└───────────────────────────────────┘

Canvas:
┌───────────────────────────────────┐
│                                   │
│  (3 patient fields are now        │
│   completely INVISIBLE!)          │
│                                   │
│  ┌──────────────┐                 │
│  │ test_result  │  ← Still visible│
│  └──────────────┘                 │
│                                   │
│  ┌──────────────┐                 │
│  │ doctor_notes │  ← Still visible│
│  └──────────────┘                 │
│                                   │
└───────────────────────────────────┘
```

**All 3 patient fields are hidden with ONE click! ✨**

---

### **To Expand/Collapse Group:**

**Click the arrow:**

```
Expanded:                      Collapsed:
📁▼ Patient Info (3)          📁▶ Patient Info (3)
   ├─ patient_name              (fields hidden from list,
   ├─ patient_age                still on canvas if not hidden)
   └─ patient_id
```

---

## 🎓 **Common Workflows**

### Workflow 1: Quick Section Toggle

```
1. Create groups for each report section
2. When working on "Test Results":
   - Right-click other groups → "Hide All Fields"
   - Right-click "Test Results" → "Show All Fields"
3. Canvas shows only test result fields!
4. Less clutter, easier to work
```

### Workflow 2: Template Variants

```
1. Create "Layout A Fields" and "Layout B Fields" groups
2. To switch layouts:
   - Hide Layout A → Show Layout B
   - OR vice versa
3. Easy A/B testing of designs!
```

### Workflow 3: Conditional Content

```
1. Create groups:
   - "Show if Positive"
   - "Show if Negative"
2. Design both scenarios
3. Hide the one you're not working on
4. Switch between them easily
```

---

## ✅ **Quick Reference**

| Action | Steps |
|--------|-------|
| **Create Group** | Select fields → Click "Create Group" → Name it |
| **Hide Group** | Right-click → "Hide All Fields" |
| **Show Group** | Right-click → "Show All Fields" |
| **Rename** | Right-click → "Rename Group" |
| **Delete (keep fields)** | Right-click → "Delete Group" |
| **Delete (remove fields)** | Right-click → "Delete Group & Fields" |
| **Collapse** | Click arrow ▶/▼ |

---

## 🎉 **You're All Set!**

The feature is **fully integrated and ready to use**. Once the build completes:

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

Then open your Designer and start grouping fields! 🚀

**Happy organizing! 📁✨**

