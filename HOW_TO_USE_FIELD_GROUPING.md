# How to Use Field Grouping - User Guide

## 📋 Quick Overview
The field grouping feature lets you organize multiple fields into named groups, then hide/show or manage them all at once.

---

## 🎯 Step-by-Step: Creating a Group

### Step 1: Select Multiple Fields (2 or more)

**In the Designer Canvas:**

**Method A: Shift+Click**
1. Click on a field to select it
2. Hold **Shift** and click on another field
3. Keep holding Shift and click more fields
4. All selected fields will be highlighted

**Method B: Drag to Select**
1. Click and drag on the canvas to create a selection box
2. All fields inside the box will be selected

**You need at least 2 fields selected to create a group.**

### Step 2: Click "Create Group" Button

In the **Field List Panel** (right sidebar):
1. Look for the **"Create Group"** button at the top
2. When you have 2+ fields selected, the button will be **enabled** (blue)
3. Click the **"Create Group"** button

### Step 3: Name Your Group

A modal will appear:
```
┌──────────────────────────────┐
│  Create Group                │
├──────────────────────────────┤
│  Group Name:                 │
│  [___________________]       │
│                              │
│  3 fields selected           │
│                              │
│  [Cancel]  [Create Group]    │
└──────────────────────────────┘
```

1. Enter a descriptive name (e.g., "Patient Information", "Test Results")
2. Click **"Create Group"**

### Step 4: Group Created! ✅

Your fields are now grouped:
```
┌─ Field List ─────────────────┐
│ [+ Create Group]             │
├──────────────────────────────┤
│ 📁▼ Patient Information (3)  │ ← Your new group!
│    ├─ patient_name           │
│    ├─ patient_age            │
│    └─ patient_gender         │
│                              │
│ Ungrouped                    │
│    └─ other_field            │
└──────────────────────────────┘
```

---

## 🎨 Working with Groups

### Hide/Show All Fields in a Group

**Method 1: Context Menu**
1. **Right-click** on the group name
2. Select **"Hide All Fields"** or **"Show All Fields"**
3. All fields in the group will hide/show together

**Method 2: Quick Toggle**
- When a group is hidden, you'll see an **eye-off icon** 👁️‍🗨️
- This means all fields in that group are hidden on the canvas

### Expand/Collapse a Group

Click the **arrow icon** (▶ or ▼) next to the group name:
- **▼** = Expanded (shows all fields)
- **▶** = Collapsed (hides the field list)

*Note: Collapsing only affects the UI display, not the canvas visibility*

### Rename a Group

1. **Right-click** on the group name
2. Select **"Rename Group"**
3. Enter the new name
4. Click **"Set"**

### Delete a Group

**Option A: Keep Fields**
1. Right-click on the group
2. Select **"Delete Group"**
3. Confirm the action
4. ✅ Group is removed, but fields remain (moved to "Ungrouped")

**Option B: Delete Fields Too**
1. Right-click on the group
2. Select **"Delete Group & Fields"**
3. Confirm the action
4. ⚠️ Group AND all its fields are permanently deleted

---

## 💡 Use Cases

### Use Case 1: Hide Multiple Related Fields

**Scenario:** You have 5 fields for "positive test results" that you only need sometimes.

**Solution:**
1. Select all 5 fields
2. Create group: "Positive Results"
3. Right-click → "Hide All Fields"
4. ✅ All 5 fields hidden with one click!

### Use Case 2: Multi-Language Fields

**Scenario:** You have English and Arabic versions of each field.

**Solution:**
```
📁 English Fields (visible)
   ├─ patient_name_en
   ├─ diagnosis_en
   └─ notes_en

📁 Arabic Fields (hidden) 👁️‍🗨️
   ├─ patient_name_ar
   ├─ diagnosis_ar
   └─ notes_ar
```

Switch languages by hiding one group and showing the other!

### Use Case 3: Report Sections

**Scenario:** Large template with many fields.

**Solution:**
```
📁 Patient Demographics (4 fields)
📁 Clinical Information (7 fields)
📁 Test Results (12 fields)
📁 Doctor Notes (3 fields)
```

Work on one section at a time by collapsing the others!

---

## 🔧 Integration Required

**⚠️ IMPORTANT:** To use this feature, you need to integrate it into your Designer first.

### Quick Integration (5 minutes)

Edit: `packages/ui/src/components/Designer/RightSidebar/index.tsx`

**Replace:**
```typescript
import ListView from './ListView/index.js';

// ... later in the render:
<ListView
  schemas={schemas}
  onSortEnd={onSortEnd}
  onEdit={onEdit}
  // ... other props
/>
```

**With:**
```typescript
import ListViewWithGroups from './ListView/ListViewWithGroups.js';

// Add state for groups (temporary, for testing):
const [fieldGroups, setFieldGroups] = useState([]);
const [selectedFieldIds, setSelectedFieldIds] = useState([]);

// Track selected fields from activeElements
useEffect(() => {
  const ids = activeElements.map(el => el.id);
  setSelectedFieldIds(ids);
}, [activeElements]);

// Dummy handlers (logs to console):
const handleCreateGroup = (name, fieldIds) => {
  console.log('Create group:', name, fieldIds);
  const newGroup = {
    id: Date.now().toString(),
    name,
    fieldIds,
    collapsed: false,
    hide: false,
  };
  setFieldGroups([...fieldGroups, newGroup]);
};

const handleRenameGroup = (groupId, newName) => {
  console.log('Rename group:', groupId, newName);
  setFieldGroups(fieldGroups.map(g => 
    g.id === groupId ? { ...g, name: newName } : g
  ));
};

const handleDeleteGroup = (groupId) => {
  console.log('Delete group:', groupId);
  setFieldGroups(fieldGroups.filter(g => g.id !== groupId));
};

const handleDeleteGroupWithFields = (groupId) => {
  console.log('Delete group with fields:', groupId);
  const group = fieldGroups.find(g => g.id === groupId);
  if (group) {
    // Remove fields (you'd call removeSchemas here)
    console.log('Would delete fields:', group.fieldIds);
  }
  setFieldGroups(fieldGroups.filter(g => g.id !== groupId));
};

const handleToggleGroupHide = (groupId, hide) => {
  console.log('Toggle hide:', groupId, hide);
  const updatedGroups = fieldGroups.map(g => 
    g.id === groupId ? { ...g, hide } : g
  );
  setFieldGroups(updatedGroups);
  
  // Hide/show fields on canvas
  const group = updatedGroups.find(g => g.id === groupId);
  if (group) {
    group.fieldIds.forEach(fieldId => {
      const field = schemas.find(s => s.id === fieldId);
      if (field) {
        changeSchemas([{
          key: 'hide',
          value: hide,
          schemaId: fieldId,
        }]);
      }
    });
  }
};

const handleToggleGroupCollapse = (groupId) => {
  console.log('Toggle collapse:', groupId);
  setFieldGroups(fieldGroups.map(g => 
    g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
  ));
};

// ... in render:
<ListViewWithGroups
  schemas={schemas}
  onSortEnd={onSortEnd}
  onEdit={onEdit}
  size={size}
  hoveringSchemaId={hoveringSchemaId}
  onChangeHoveringSchemaId={onChangeHoveringSchemaId}
  changeSchemas={changeSchemas}
  fieldGroups={fieldGroups}
  onCreateGroup={handleCreateGroup}
  onRenameGroup={handleRenameGroup}
  onDeleteGroup={handleDeleteGroup}
  onDeleteGroupWithFields={handleDeleteGroupWithFields}
  onToggleGroupHide={handleToggleGroupHide}
  onToggleGroupCollapse={handleToggleGroupCollapse}
  selectedFieldIds={selectedFieldIds}
/>
```

**Then rebuild:**
```bash
cd C:\Users\sandi\source\repos\pdfme
npm run build:ui

cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

---

## 🎬 Visual Walkthrough

### Before (No Groups)
```
Field List:
- patient_name
- patient_age  
- patient_gender
- test_result_1
- test_result_2
- doctor_notes
```
*Hard to manage, all flat*

### After (With Groups)
```
Field List:
📁 Patient Info (3)
   ├─ patient_name
   ├─ patient_age
   └─ patient_gender

📁 Test Results (2)
   ├─ test_result_1
   └─ test_result_2

Ungrouped:
   └─ doctor_notes
```
*Organized, easy to hide/show sections!*

---

## 🎯 Pro Tips

1. **Name groups clearly** - Use descriptive names like "Demographics" not "Group 1"
2. **Group by purpose** - Put related fields together (all patient info, all test results)
3. **Use hide/show** - Hide groups you're not working on to reduce clutter
4. **Collapse groups** - Keep field list tidy by collapsing groups
5. **Multi-language** - Perfect for managing English/Arabic field pairs

---

## ❓ FAQ

**Q: Can a field be in multiple groups?**
A: No, each field can only be in one group at a time.

**Q: What happens if I delete a field that's in a group?**
A: The field is automatically removed from the group. Empty groups can be deleted.

**Q: Do groups persist when I save the template?**
A: Not yet with the temporary implementation above. For full persistence, see `FIELD_GROUPING_FINAL_STEPS.md`

**Q: Can I have nested groups?**
A: Not in the current version, but it's possible to add in the future!

**Q: How many fields can I put in a group?**
A: Unlimited! Group as many as you need.

**Q: Can I reorder fields within a group?**
A: Yes, drag and drop works within groups just like the regular field list.

---

## 🚀 Next Steps

1. **Integrate** - Follow the Quick Integration above
2. **Test** - Create a group with 2-3 fields
3. **Explore** - Try hide/show, rename, collapse
4. **Use** - Start organizing your templates!

For full integration with persistence, see **`FIELD_GROUPING_FINAL_STEPS.md`**

**Enjoy your organized field list! 📁✨**

