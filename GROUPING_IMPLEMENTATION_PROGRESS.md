# Field Grouping Feature - Implementation Progress

## ✅ COMPLETED (Phase 1 - Core Infrastructure)

### 1. Schema Definitions (DONE)
- ✅ Added `FieldGroup` type to `packages/common/src/schema.ts`
  - id, name, fieldIds, collapsed, hide, color properties
- ✅ Updated `Template` type to include optional `fieldGroups` array
- ✅ Added i18n keys for group feature (14 new translations needed)
- ✅ Exported `FieldGroup` type from `packages/common/src/types.ts`
- ✅ Added `FieldGroup` to `packages/common/src/index.ts` exports

### 2. Helper Functions (DONE)
- ✅ Added 11 group management functions to `packages/ui/src/helper.ts`:
  - `createFieldGroup()` - Create new group from selected fields
  - `deleteFieldGroup()` - Delete group (keep fields)
  - `renameFieldGroup()` - Rename group
  - `toggleGroupHide()` - Hide/show all fields in group
  - `addFieldsToGroup()` - Add fields to existing group
  - `removeFieldsFromGroup()` - Remove fields from group
  - `toggleGroupCollapse()` - Toggle group collapsed state
  - `isFieldInAnyGroup()` - Check if field is grouped
  - `getGroupForField()` - Get field's parent group
  - `getUngroupedFields()` - Get all ungrouped fields
  - `removeFieldFromGroups()` - Remove field when deleting
  - `cleanupEmptyGroups()` - Remove empty groups

### 3. UI Components (DONE)
- ✅ Created `GroupItem.tsx` - Collapsible group display component
  - Folder icon, collapse arrow, field count
  - Eye icon for hidden state
  - Context menu with actions (hide/show, rename, delete)
  - Nested field list display
  
- ✅ Created `GroupModal.tsx` - Modal for create/rename operations
  - Name input with validation
  - Duplicate name checking
  - Selected field count display

---

## 🔄 IN PROGRESS / TODO

### 4. Build Packages (NEXT STEP)
**STATUS:** Needs to be done before continuing

```bash
cd C:\Users\sandi\source\repos\pdfme

# Build common package first (exports FieldGroup type)
npm run build:common

# Then build UI package
npm run build:ui
```

This will resolve the TypeScript error: `Module '"@pdfme/common"' has no exported member 'FieldGroup'`

### 5. Add i18n Translations (TODO)
**File:** `packages/common/src/constants.ts`

Add English translations (and other languages):
```typescript
// In the en (English) dictionary section
createGroup: 'Create Group',
groupName: 'Group Name',
renameGroup: 'Rename Group',
deleteGroup: 'Delete Group',
deleteGroupAndFields: 'Delete Group & Fields',
deleteGroupConfirm: 'Are you sure you want to delete this group? Fields will be kept.',
deleteGroupAndFieldsConfirm: 'Are you sure you want to delete this group and all its fields?',
hideAllFields: 'Hide All Fields',
showAllFields: 'Show All Fields',
addFieldsToGroup: 'Add Fields to Group',
removeFromGroup: 'Remove from Group',
ungrouped: 'Ungrouped',
groupNameRequired: 'Group name is required',
groupNameExists: 'Group name already exists',
fieldGroups: 'Field Groups',
```

### 6. Update ListView Component (TODO - Phase 2)
**File:** `packages/ui/src/components/Designer/RightSidebar/ListView/index.tsx`

Needs:
- State management for fieldGroups
- "Create Group" button (enabled when 2+ fields selected)
- Render groups using GroupItem component
- Render ungrouped fields separately
- Group modal integration

### 7. Update Designer Component (TODO - Phase 2)
**File:** `packages/ui/src/components/Designer/index.tsx`

Needs:
- Add fieldGroups state
- Load/save fieldGroups with template
- Pass fieldGroups to ListView
- Handle group operations (create, delete, rename)
- Sync field hide state with group hide state

### 8. Template Load/Save (TODO - Phase 1)
**File:** `packages/ui/src/helper.ts`

Update:
- `template2SchemasList()` - Preserve fieldGroups
- `schemasList2template()` - Include fieldGroups in output
- Backward compatibility (templates without groups)

### 9. Field Deletion Cleanup (TODO - Phase 3)
When a field is deleted, need to:
- Remove field ID from any group it belongs to
- Clean up empty groups
- Update template

### 10. Testing (TODO - Final Phase)
- Create group from selection
- Rename group
- Hide/show all fields in group
- Delete group (keep fields)
- Delete group and fields
- Save/load template with groups
- Verify backward compatibility

---

## 📊 Progress Overview

**Phase 1 (Core Infrastructure):** 70% Complete
- ✅ Schema definitions
- ✅ Helper functions
- ✅ Basic UI components
- ⏳ i18n translations
- ⏳ Template load/save
- ⏳ Build packages

**Phase 2 (UI Integration):** 0% Complete
- ⏳ Update ListView
- ⏳ Update Designer
- ⏳ "Create Group" button
- ⏳ Group modal integration

**Phase 3 (Polish):** 0% Complete
- ⏳ Field deletion cleanup
- ⏳ Context menu actions
- ⏳ Testing

---

## 🚀 Next Steps (In Order)

1. **Build packages** (resolves TypeScript errors)
   ```bash
   cd C:\Users\sandi\source\repos\pdfme
   npm run build:common
   npm run build:ui
   ```

2. **Add i18n translations** to `packages/common/src/constants.ts`
   - Search for `addPageAfter:` to find English dictionary
   - Add the 14 new group-related strings

3. **Update ListView component** to display groups
   - Import GroupItem and GroupModal
   - Add state for groups and modal
   - Render groups before ungrouped fields
   - Add "Create Group" button

4. **Update Designer component** to manage groups
   - Add fieldGroups to template state
   - Implement group CRUD operations
   - Sync with template save/load

5. **Test the feature**
   - Link to wgs-reports
   - Create/rename/delete groups
   - Hide/show groups
   - Verify save/load

---

## 📂 Files Modified

### packages/common/src/
- ✅ `schema.ts` - Added FieldGroup type
- ✅ `types.ts` - Exported FieldGroup
- ✅ `index.ts` - Added FieldGroup to exports
- ⏳ `constants.ts` - Need to add i18n translations

### packages/ui/src/
- ✅ `helper.ts` - Added 11 group helper functions

### packages/ui/src/components/Designer/RightSidebar/ListView/
- ✅ `GroupItem.tsx` - NEW: Group display component
- ✅ `GroupModal.tsx` - NEW: Create/rename modal
- ⏳ `index.tsx` - TODO: Integrate groups
- ⏳ `SelectableSortableContainer.tsx` - TODO: Handle group selection

### packages/ui/src/components/Designer/
- ⏳ `index.tsx` - TODO: Add fieldGroups state

---

## 💡 Estimated Time Remaining

- **Build + i18n:** 15 minutes
- **ListView integration:** 1-2 hours  
- **Designer integration:** 1-2 hours
- **Testing + fixes:** 1 hour

**Total:** ~3-5 hours to complete

---

## 🎯 What Works Now

After building, you'll have:
- ✅ Complete type definitions for field groups
- ✅ All helper functions to manage groups
- ✅ UI components ready to use
- ✅ Validation and error handling

The foundation is solid! Just need to wire it up to the UI and test.

