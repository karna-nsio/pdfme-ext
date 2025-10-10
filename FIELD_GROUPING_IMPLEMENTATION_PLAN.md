# Field Grouping Feature - Implementation Plan

## Overview
This feature allows users to create named groups of fields in the pdfme Designer, and perform bulk operations (hide/show, delete, etc.) on all fields in a group at once.

## ✅ Feasibility Assessment

### Current Capabilities (Already Working)
1. ✅ Multi-select fields (using Selecto library)
2. ✅ Bulk delete multiple fields (`removeSchemas(ids[])`)
3. ✅ Bulk update fields (`changeSchemas(objs[])`)
4. ✅ Field list in right sidebar shows all fields
5. ✅ Individual field hide/show functionality

### Required Changes (Estimated Effort: ~2-3 days)
1. 🔨 Add group data structure to Template
2. 🔨 Create Group Management UI
3. 🔨 Render groups in Field List
4. 🔨 Implement group actions (hide/show all, delete all)
5. 🔨 Add group editing (rename, add/remove members)

---

## 🏗️ Technical Design

### 1. Data Structure

#### Template Schema Extension
```typescript
// Add to packages/common/src/schema.ts

export const FieldGroup = z.object({
  id: z.string(),              // Unique group ID
  name: z.string(),            // Group name (e.g., "Patient Info", "Test Results")
  fieldIds: z.array(z.string()), // IDs of fields in this group
  collapsed: z.boolean().optional(), // UI state: is group collapsed in field list?
  hide: z.boolean().optional(),      // If true, hide all fields in this group
});

export const Template = z
  .object({
    schemas: SchemaPageArray,
    basePdf: BasePdf,
    pdfmeVersion: z.string().optional(),
    fieldGroups: z.array(FieldGroup).optional(), // ← NEW
  })
  .passthrough();
```

#### Example Template with Groups
```json
{
  "schemas": [
    [
      { "id": "field1", "name": "patient_name", "type": "text", ... },
      { "id": "field2", "name": "patient_age", "type": "text", ... },
      { "id": "field3", "name": "test_result", "type": "text", ... }
    ]
  ],
  "fieldGroups": [
    {
      "id": "group1",
      "name": "Patient Information",
      "fieldIds": ["field1", "field2"],
      "collapsed": false,
      "hide": false
    },
    {
      "id": "group2",
      "name": "Test Results",
      "fieldIds": ["field3"],
      "collapsed": false,
      "hide": true
    }
  ],
  "basePdf": "..."
}
```

### 2. UI Components

#### A. Group Creation Button
**Location:** Right sidebar, above field list

```tsx
// In ListView component
<Button 
  onClick={handleCreateGroup} 
  disabled={selectedFields.length < 2}
>
  <FolderPlus size={16} />
  Create Group from Selection
</Button>
```

**Behavior:**
1. User selects 2+ fields in canvas (using existing multi-select)
2. Clicks "Create Group" button
3. Modal appears asking for group name
4. Group is created and appears in field list

#### B. Field List with Groups
**Location:** Right sidebar `ListView` component

```
┌─────────────────────────────┐
│  Fields List                │
├─────────────────────────────┤
│ 📁 Patient Information      │ ← Collapsible group
│   ├─ 👁️ patient_name        │
│   └─ 👁️ patient_age         │
│                             │
│ 📁 Test Results (hidden)    │ ← Group with EyeOff icon
│   └─ 👁️‍🗨️ test_result       │ ← Member field (greyed out)
│                             │
│ 📄 ungrouped_field          │ ← Regular field (not in group)
└─────────────────────────────┘
```

#### C. Group Actions
**Right-click menu on group:**
- Hide/Show All Fields
- Rename Group
- Add Fields to Group
- Remove from Group
- Delete Group (keeps fields)
- Delete Group & Fields

### 3. Implementation Files

#### Phase 1: Schema & Data Layer
```
1. packages/common/src/schema.ts
   - Add FieldGroup type definition
   - Update Template type

2. packages/ui/src/helper.ts
   - Add helper functions:
     * createGroup(name, fieldIds)
     * deleteGroup(groupId)
     * addFieldsToGroup(groupId, fieldIds)
     * removeFieldsFromGroup(groupId, fieldIds)
     * toggleGroupHide(groupId, hide)
```

#### Phase 2: UI Components
```
3. packages/ui/src/components/Designer/RightSidebar/ListView/GroupItem.tsx
   - New component for rendering groups
   - Collapsible header showing group name
   - Icons: folder icon, eye/eyeOff for hide state
   - Context menu for group actions

4. packages/ui/src/components/Designer/RightSidebar/ListView/index.tsx
   - Update to render both groups and ungrouped fields
   - Add "Create Group" button
   - Handle group interactions

5. packages/ui/src/components/Designer/RightSidebar/ListView/GroupModal.tsx
   - Modal for creating/editing groups
   - Input for group name
   - Field selection (if editing)
```

#### Phase 3: Business Logic
```
6. packages/ui/src/components/Designer/index.tsx
   - Add group state management
   - Implement group creation from selection
   - Cascade hide/show to group members
   - Update template save/load to include groups

7. packages/ui/src/hooks.ts
   - Add useGroupManagement hook
   - Handle group operations
```

### 4. Key Behaviors

#### Hide/Show Cascade
```typescript
// When group.hide = true
const hideGroup = (groupId: string) => {
  const group = template.fieldGroups?.find(g => g.id === groupId);
  if (!group) return;

  // Hide all member fields
  group.fieldIds.forEach(fieldId => {
    const field = findFieldById(fieldId);
    if (field) field.hide = true;
  });

  // Mark group as hidden
  group.hide = true;
};
```

#### Delete Group vs Delete Group & Fields
```typescript
// Option 1: Delete group only (keep fields)
const deleteGroup = (groupId: string) => {
  template.fieldGroups = template.fieldGroups?.filter(g => g.id !== groupId);
  // Fields remain in template
};

// Option 2: Delete group and all member fields
const deleteGroupAndFields = (groupId: string) => {
  const group = template.fieldGroups?.find(g => g.id === groupId);
  if (!group) return;

  // Remove all member fields
  removeSchemas(group.fieldIds);

  // Remove group
  template.fieldGroups = template.fieldGroups?.filter(g => g.id !== groupId);
};
```

#### Field Membership Rules
- ✅ A field can belong to **only one group** at a time
- ✅ A field can be **ungrouped** (not in any group)
- ✅ Deleting a field removes it from its group automatically
- ✅ Groups can be **empty** (all members deleted) - show warning to delete

### 5. Visual Design

#### Group Item in Field List
```tsx
<div className="group-item">
  <div className="group-header" onClick={toggleCollapse}>
    {/* Collapse arrow */}
    {collapsed ? <ChevronRight /> : <ChevronDown />}
    
    {/* Group icon + name */}
    <FolderClosed size={16} />
    <span>{group.name}</span>
    
    {/* Hide indicator */}
    {group.hide && <EyeOff size={15} color="#6B7280" />}
    
    {/* Field count */}
    <span className="field-count">({group.fieldIds.length})</span>
    
    {/* Context menu */}
    <MoreVertical size={16} onClick={showContextMenu} />
  </div>
  
  {/* Member fields (when expanded) */}
  {!collapsed && (
    <div className="group-members">
      {group.fieldIds.map(fieldId => (
        <FieldItem 
          key={fieldId} 
          fieldId={fieldId}
          isGroupMember={true}
          dimmed={group.hide} // Grey out if parent group is hidden
        />
      ))}
    </div>
  )}
</div>
```

### 6. Workflow Example

#### Creating a Group
```
1. User selects "patient_name" and "patient_age" in canvas
   → activeElements = [field1, field2]

2. User clicks "Create Group" button in field list

3. Modal appears:
   ┌────────────────────────────┐
   │ Create Field Group         │
   ├────────────────────────────┤
   │ Group Name:                │
   │ [Patient Information____]  │
   │                            │
   │ Selected Fields:           │
   │ • patient_name             │
   │ • patient_age              │
   │                            │
   │ [Cancel]  [Create Group]   │
   └────────────────────────────┘

4. User enters name and clicks "Create Group"

5. Field list updates:
   📁 Patient Information (2)
     ├─ patient_name
     └─ patient_age
```

#### Hiding a Group
```
1. User right-clicks "Patient Information" group

2. Context menu appears:
   ┌─────────────────────┐
   │ Hide All Fields     │ ← Click this
   │ Rename Group        │
   │ Add Fields...       │
   │ ─────────────────── │
   │ Delete Group        │
   │ Delete Group+Fields │
   └─────────────────────┘

3. All fields in group are hidden on canvas
   → patient_name.hide = true
   → patient_age.hide = true
   → group.hide = true

4. Field list shows:
   📁 Patient Information (hidden) 👁️‍🗨️
     ├─ patient_name 👁️‍🗨️
     └─ patient_age 👁️‍🗨️
```

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Day 1)
- [ ] Update schema definitions (`schema.ts`)
- [ ] Add group helper functions (`helper.ts`)
- [ ] Template load/save with groups

### Phase 2: Basic UI (Day 2)
- [ ] Create `GroupItem.tsx` component
- [ ] Update `ListView.tsx` to render groups
- [ ] Add "Create Group" button
- [ ] Group creation modal

### Phase 3: Group Actions (Day 3)
- [ ] Implement hide/show all in group
- [ ] Context menu for groups
- [ ] Rename group
- [ ] Delete group (with/without fields)

### Phase 4: Advanced Features (Optional)
- [ ] Drag field into/out of group
- [ ] Nested groups (group of groups)
- [ ] Group templates (save/reuse groups)
- [ ] Bulk group operations (hide all groups, etc.)

---

## 📋 Testing Checklist

### Basic Operations
- [ ] Create group from 2+ selected fields
- [ ] Create group with custom name
- [ ] Expand/collapse group in field list
- [ ] Delete group (keep fields)
- [ ] Delete group and fields together

### Hide/Show Operations
- [ ] Hide all fields in group
- [ ] Show all fields in group
- [ ] Hidden group shows eye-off icon
- [ ] Member fields are greyed out when group hidden

### Field Management
- [ ] Add field to existing group
- [ ] Remove field from group
- [ ] Field removed from group when deleted
- [ ] Empty group shows warning

### Edge Cases
- [ ] Cannot create group with 0 or 1 field
- [ ] Cannot have duplicate group names
- [ ] Deleting last field in group prompts to delete group
- [ ] Ungrouped fields still work normally
- [ ] Groups persist in template JSON
- [ ] Groups work across template save/load

---

## 🎯 Benefits of This Feature

### For Users
1. **Faster workflow** - Hide/show multiple related fields at once
2. **Better organization** - Logical grouping of related fields (e.g., "Patient Info", "Test Results")
3. **Easier template management** - Especially for large templates with 50+ fields
4. **Cleaner canvas** - Hide entire sections you're not working on

### For Your WGS Reports Project
1. **Perfect for conditional sections** - Group all "positive result" fields together
2. **Report sections** - Group fields by report section (Demographics, Clinical, Results)
3. **Multi-language support** - Group English/Arabic field variants
4. **Template variants** - Easily manage field sets for different report types

---

## 💡 Recommendation

**GO AHEAD with this feature!** 

The architecture is well-suited for it, multi-select already works, and it will significantly improve the user experience for managing complex templates. The estimated implementation time is **2-3 days** for a solid MVP.

### Suggested Approach
1. Start with **Phase 1 + 2** (basic grouping and display) - **Day 1-2**
2. Add **Phase 3** (actions) - **Day 3**
3. Test thoroughly with your WGS templates
4. Consider **Phase 4** features based on user feedback

This is a common pattern in design tools (Figma, Sketch, Adobe XD all have grouping) and will make the Designer much more professional and user-friendly!

