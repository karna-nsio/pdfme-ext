# 🎯 Conditional Groups Feature - Implementation Plan

## 📋 Requirement Analysis

### **Use Case: Result Type Variants**

**Scenario:** A medical report has different layouts based on test result type:
- **Positive Result** → Show positive-specific fields
- **Negative Result** → Show negative-specific fields  
- **Indeterminate Result** → Show indeterminate-specific fields

**Current Problem:**
- User can create groups and hide/show them manually
- But at **runtime** (viewer/generator), ALL fields render
- No way to automatically show only the matching group

**Desired Solution:**
- Attach **conditions** to field groups
- At **design time:** User hides/shows to work on each variant
- At **view/generate time:** Only groups matching conditions render
- Example: `if (resultType === 'positive') show PositiveGroup`

---

## 🏗️ Technical Design

### **Option A: Conditions on Field Groups (RECOMMENDED)**

#### **Data Structure:**

```typescript
// Add to FieldGroup schema
export const FieldGroup = z.object({
  id: z.string(),
  name: z.string(),
  fieldIds: z.array(z.string()),
  collapsed: z.boolean().optional(),
  hide: z.boolean().optional(),
  color: z.string().optional(),
  
  // NEW: Conditional visibility
  condition: z.object({
    enabled: z.boolean(),                    // Is condition active?
    variable: z.string(),                    // e.g., "resultType"
    operator: z.enum(['==', '!=', 'in']),   // Comparison operator
    value: z.union([z.string(), z.array(z.string())]), // "positive" or ["positive", "negative"]
  }).optional(),
});
```

#### **Example:**

```json
{
  "fieldGroups": [
    {
      "id": "group1",
      "name": "Positive Result Fields",
      "fieldIds": ["field1", "field2", "field3"],
      "hide": true,  // Hidden in Designer for now
      "condition": {
        "enabled": true,
        "variable": "resultType",
        "operator": "==",
        "value": "positive"
      }
    },
    {
      "id": "group2", 
      "name": "Negative Result Fields",
      "fieldIds": ["field4", "field5"],
      "hide": false,  // Visible in Designer
      "condition": {
        "enabled": true,
        "variable": "resultType",
        "operator": "==",
        "value": "negative"
      }
    },
    {
      "id": "group3",
      "name": "Indeterminate Result Fields",
      "fieldIds": ["field6", "field7", "field8"],
      "hide": true,
      "condition": {
        "enabled": true,
        "variable": "resultType",
        "operator": "==",
        "value": "indeterminate"
      }
    }
  ]
}
```

---

### **Option B: Conditions on Individual Fields (Alternative)**

Store condition on each field:

```typescript
export const Schema = z.object({
  // ... existing properties
  conditionGroup: z.string().optional(),  // Group this field belongs to
  conditionValue: z.string().optional(),  // Value to match
});
```

**Pros:**
- ✅ Works with existing conditional field plugin
- ✅ Field-level granularity

**Cons:**
- ❌ Harder to manage (must set on each field)
- ❌ Not group-based (defeats purpose of groups)
- ❌ More complex for users

**Decision: Use Option A (Conditions on Groups)** ✅

---

## 🎨 UI Design

### **1. Group Condition Editor**

**Location:** Context menu on group → "Set Condition"

```
┌─ Field List ───────────────────────┐
│ 📁 Positive Result Fields (3) 👁️‍🗨️   │
│    ↓ Right-click                   │
│    ┌──────────────────────────┐    │
│    │ 👁️ Show All Fields        │    │
│    │ ─────────────────────    │    │
│    │ ⚙️ Set Condition   ← NEW! │    │
│    │ ─────────────────────    │    │
│    │ ✏️ Rename Group           │    │
│    │ 🗑️ Delete Group           │    │
│    └──────────────────────────┘    │
└────────────────────────────────────┘
```

### **2. Condition Configuration Modal/Inline Form**

**Style:** Similar to ConditionalExpressionBuilder

```
┌─ Set Group Condition ──────────────────┐
│                                        │
│ Show this group when:                  │
│                                        │
│ Variable:                              │
│ ┌────────────────────────────────────┐ │
│ │ resultType                      ▼  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Operator:                              │
│ ┌────────────────────────────────────┐ │
│ │ equals (==)                     ▼  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Value:                                 │
│ ┌────────────────────────────────────┐ │
│ │ positive                           │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Preview:                               │
│ ╔════════════════════════════════════╗ │
│ ║ IF resultType == "positive"        ║ │
│ ║ THEN show "Positive Result Fields" ║ │
│ ╚════════════════════════════════════╝ │
│                                        │
│ ☑ Enable condition                     │
│                                        │
│ [Cancel]  [Save Condition]             │
└────────────────────────────────────────┘
```

### **3. Visual Indicator in Field List**

**Show condition status:**

```
┌─ Field List ──────────────────────────┐
│ 📁▼ Positive Results (3) 👁️‍🗨️ ⚙️       │
│    ↑                    ↑  ↑         │
│    Group             Hidden Condition │
│    ├─ pos_finding                     │
│    ├─ pos_details                     │
│    └─ pos_action                      │
│                                       │
│ 📁▼ Negative Results (2) ⚙️            │
│    ↑                    ↑             │
│    Group              Condition       │
│    ├─ neg_finding                     │
│    └─ neg_notes                       │
└───────────────────────────────────────┘
```

**Gear icon (⚙️) = Has condition attached**

Hover tooltip: "Condition: resultType == 'positive'"

---

## 🔧 Technical Implementation

### **Phase 1: Schema & Types**

**File:** `packages/common/src/schema.ts`

```typescript
// Add condition type
export const GroupCondition = z.object({
  enabled: z.boolean(),
  variable: z.string(),
  operator: z.enum(['==', '!=', '>', '<', '>=', '<=', 'in', 'contains']),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
});

// Update FieldGroup
export const FieldGroup = z.object({
  id: z.string(),
  name: z.string(),
  fieldIds: z.array(z.string()),
  collapsed: z.boolean().optional(),
  hide: z.boolean().optional(),
  color: z.string().optional(),
  condition: GroupCondition.optional(),  // NEW
});
```

### **Phase 2: Condition Evaluation**

**File:** `packages/ui/src/helper.ts`

```typescript
/**
 * Evaluate if a group condition matches the given data
 */
export const evaluateGroupCondition = (
  condition: GroupCondition,
  data: Record<string, any>
): boolean => {
  if (!condition.enabled) return true; // No condition = always show

  const actualValue = data[condition.variable];
  const expectedValue = condition.value;

  switch (condition.operator) {
    case '==':
      return actualValue === expectedValue;
    case '!=':
      return actualValue !== expectedValue;
    case '>':
      return actualValue > expectedValue;
    case '<':
      return actualValue < expectedValue;
    case '>=':
      return actualValue >= expectedValue;
    case '<=':
      return actualValue <= expectedValue;
    case 'in':
      return Array.isArray(expectedValue) 
        ? expectedValue.includes(actualValue)
        : false;
    case 'contains':
      return String(actualValue).includes(String(expectedValue));
    default:
      return true;
  }
};

/**
 * Filter groups based on conditions and data
 */
export const getVisibleGroups = (
  groups: FieldGroup[],
  data: Record<string, any>
): FieldGroup[] => {
  return groups.filter((group) => {
    if (!group.condition) return true;
    return evaluateGroupCondition(group.condition, data);
  });
};

/**
 * Get fields that should be visible based on group conditions
 */
export const getConditionallyVisibleFieldIds = (
  groups: FieldGroup[],
  data: Record<string, any>
): string[] => {
  const visibleGroups = getVisibleGroups(groups, data);
  return visibleGroups.flatMap((g) => g.fieldIds);
};
```

### **Phase 3: UI Components**

**Create:** `packages/ui/src/components/Designer/RightSidebar/ListView/GroupConditionModal.tsx`

Similar to ConditionalExpressionBuilder but simpler (one condition per group):
- Variable selector (from data model)
- Operator selector
- Value input
- Enable/disable toggle
- Preview of condition

### **Phase 4: Viewer Integration**

**File:** `packages/ui/src/components/Viewer.tsx` (or Preview/Form)

```typescript
// Before rendering, filter schemas based on group conditions
const visibleFieldIds = getConditionallyVisibleFieldIds(
  template.fieldGroups || [],
  inputs[0] // Current data
);

// Only render fields that are in visible groups OR not in any group
const schemasToRender = schemas.filter(schema => 
  !isFieldInAnyGroup(schema.id, template.fieldGroups) || // Ungrouped
  visibleFieldIds.includes(schema.id) // In visible group
);
```

### **Phase 5: Generator Integration**

**File:** `packages/generator/src/index.ts`

Same logic as Viewer - filter schemas before PDF generation:

```typescript
for (const input of inputs) {
  // Get visible fields based on group conditions
  const visibleFieldIds = getConditionallyVisibleFieldIds(
    template.fieldGroups || [],
    input
  );
  
  // Only generate visible fields
  const schemasToGenerate = schemas.filter(schema =>
    !isFieldInAnyGroup(schema.id, template.fieldGroups) ||
    visibleFieldIds.includes(schema.id)
  );
  
  // Generate PDF with filtered schemas...
}
```

---

## 🎯 User Workflow

### **Design Time (In Designer):**

**Step 1: Design Positive Variant**
```
1. Create fields: pos_finding, pos_details, pos_action
2. Create group: "Positive Result Fields"
3. Design looks good!
```

**Step 2: Hide Positive, Design Negative**
```
4. Right-click "Positive Result Fields" → Hide All
5. Create NEW fields at SAME positions: neg_finding, neg_notes
6. Create group: "Negative Result Fields"
7. Design negative layout!
```

**Step 3: Hide Negative, Design Indeterminate**
```
8. Right-click "Negative Result Fields" → Hide All
9. Create fields at SAME positions: ind_finding, ind_recommendation
10. Create group: "Indeterminate Result Fields"
11. Design indeterminate layout!
```

**Step 4: Set Conditions on Groups**
```
12. Right-click "Positive Result Fields" → Set Condition
    - Variable: resultType
    - Operator: ==
    - Value: positive
    
13. Right-click "Negative Result Fields" → Set Condition
    - Variable: resultType
    - Operator: ==
    - Value: negative
    
14. Right-click "Indeterminate Result Fields" → Set Condition
    - Variable: resultType
    - Operator: ==
    - Value: indeterminate
```

**Step 5: Save Template**
```
Template now contains:
- 3 groups at overlapping positions
- Each with its own condition
- All fields preserved
```

### **View Time (In Viewer/Generator):**

```
Data: { resultType: "positive", ... }

Processing:
1. Check group conditions
2. "Positive Result Fields" → resultType == "positive" → TRUE ✅
3. "Negative Result Fields" → resultType == "negative" → FALSE ❌
4. "Indeterminate Result Fields" → resultType == "indeterminate" → FALSE ❌

Render:
- Show only positive fields
- Hide negative and indeterminate fields
- User sees correct variant!
```

---

## 🎨 UI Mockups

### **Group with Condition (Field List):**

```
┌─ Field List ──────────────────────────────┐
│ 📁▼ Positive Result Fields (3) ⚙️          │
│    ↑                           ↑         │
│    Group                    Condition    │
│    ├─ pos_finding                        │
│    ├─ pos_details                        │
│    └─ pos_action                         │
│                                          │
│ 📁▶ Negative Result Fields (2) 👁️‍🗨️ ⚙️     │
│    ↑                      ↑    ↑        │
│    Collapsed           Hidden Condition │
└──────────────────────────────────────────┘
```

**Hover on gear icon:**
```
Tooltip: "Condition: resultType == 'positive'"
```

### **Set Condition Interface:**

```
┌─ Set Group Condition ─────────────────────┐
│                                           │
│ Group: "Positive Result Fields"           │
│                                           │
│ ☑ Enable conditional visibility           │
│                                           │
│ Show this group when:                     │
│                                           │
│ Variable:                                 │
│ ┌───────────────────────────────────────┐ │
│ │ resultType                         ▼  │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ Operator:                                 │
│ ┌───────────────────────────────────────┐ │
│ │ equals (==)                        ▼  │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ Value:                                    │
│ ┌───────────────────────────────────────┐ │
│ │ positive                              │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ╔═══════════════════════════════════════╗ │
│ ║ Preview:                              ║ │
│ ║ IF data.resultType == "positive"      ║ │
│ ║ THEN show this group's fields         ║ │
│ ╚═══════════════════════════════════════╝ │
│                                           │
│ [Cancel]  [Save Condition]                │
└───────────────────────────────────────────┘
```

### **Context Menu Updated:**

```
Right-click on group:
┌─────────────────────────┐
│ 👁️ Show/Hide All Fields  │
│ ─────────────────────── │
│ ⚙️ Set Condition    ← NEW│
│ ✏️ Rename Group          │
│ ─────────────────────── │
│ 🗑️ Delete Group          │
│ 💀 Delete Group & Fields │
└─────────────────────────┘
```

---

## 🔄 Complete Workflow Example

### **Scenario: Medical Test Result Report**

#### **Design Phase:**

**Step 1: Design Positive Layout**
```
Designer:
┌──────────────────────────┐
│ ┌────────────────────┐   │
│ │ Positive Finding   │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ Treatment Required │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ Follow-up Date     │   │
│ └────────────────────┘   │
└──────────────────────────┘

Field List:
📁 Positive Result Fields (3)
   ├─ pos_finding
   ├─ pos_treatment
   └─ pos_followup
```

**Step 2: Set Condition + Hide**
```
Right-click → Set Condition:
- Variable: resultType
- Operator: ==
- Value: positive

Right-click → Hide All Fields

Result:
📁▶ Positive Result Fields (3) 👁️‍🗨️ ⚙️
    (Now hidden, condition set)
```

**Step 3: Design Negative Layout (Same Position)**
```
Designer (now clean):
┌──────────────────────────┐
│ ┌────────────────────┐   │ ← Same Y position as positive!
│ │ No Findings        │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ Normal Results     │   │
│ └────────────────────┘   │
└──────────────────────────┘

Create group: "Negative Result Fields"
Set condition: resultType == "negative"
Hide all
```

**Step 4: Design Indeterminate Layout**
```
Same process:
- Create fields at same positions
- Group them
- Set condition: resultType == "indeterminate"
- Hide all
```

**Final Designer View:**
```
Field List:
📁▶ Positive Result Fields (3) 👁️‍🗨️ ⚙️
📁▶ Negative Result Fields (2) 👁️‍🗨️ ⚙️
📁▶ Indeterminate Result Fields (3) 👁️‍🗨️ ⚙️

Canvas:
╔════════════════════════════════╗
║ 🔶 Hidden area            👁️‍🗨️ 8 ║
╚════════════════════════════════╝
(All 3 variants hidden, ready for runtime!)
```

#### **View/Generate Phase:**

**Scenario A: Positive Result**
```
Input Data:
{
  resultType: "positive",
  patientName: "John Doe",
  ...
}

Processing:
✅ Positive group condition matches → Show
❌ Negative group condition doesn't match → Hide
❌ Indeterminate group condition doesn't match → Hide

PDF Output:
┌────────────────────┐
│ Positive Finding   │ ← Positive fields shown!
│ Treatment Required │
│ Follow-up Date     │
└────────────────────┘
```

**Scenario B: Negative Result**
```
Input Data:
{
  resultType: "negative",
  ...
}

Processing:
❌ Positive → Hide
✅ Negative → Show
❌ Indeterminate → Hide

PDF Output:
┌────────────────────┐
│ No Findings        │ ← Negative fields shown!
│ Normal Results     │
└────────────────────┘
```

---

## 🏗️ Implementation Phases

### **Phase 1: Core Infrastructure (2-3 hours)**
- [ ] Update FieldGroup schema with condition property
- [ ] Add GroupCondition type
- [ ] Export types from common package
- [ ] Add evaluation helper functions
- [ ] Add i18n strings for conditions

### **Phase 2: UI Components (3-4 hours)**
- [ ] Create GroupConditionEditor component
- [ ] Update GroupItem to show condition icon
- [ ] Add "Set Condition" to context menu
- [ ] Add condition preview in group list
- [ ] Tooltip showing condition details

### **Phase 3: Designer Integration (1-2 hours)**
- [ ] Add condition state to group management
- [ ] Wire up Set Condition action
- [ ] Save conditions with template
- [ ] Load conditions from template

### **Phase 4: Viewer Integration (2-3 hours)**
- [ ] Filter schemas based on group conditions
- [ ] Only render fields from matching groups
- [ ] Handle ungrouped fields (always show)
- [ ] Test with different data values

### **Phase 5: Generator Integration (2-3 hours)**
- [ ] Same filtering logic as Viewer
- [ ] Apply conditions before PDF generation
- [ ] Test PDF output with conditions
- [ ] Verify performance

### **Phase 6: Testing & Polish (2 hours)**
- [ ] Test all operators
- [ ] Test multiple groups with different conditions
- [ ] Test nested conditions
- [ ] Backward compatibility (templates without conditions)
- [ ] Documentation

**Total Estimated Time: 12-17 hours**

---

## 🎯 Key Decisions

### **1. Where to Store Conditions?**

✅ **On FieldGroup** (Recommended)
- Logical: Groups represent variants
- Clean: One condition per variant
- Manageable: Easy to understand
- Performant: Check group, get all fields

❌ On Individual Fields
- Redundant: Must set on each field
- Error-prone: Easy to miss fields
- Complex: Harder to maintain

### **2. How to Evaluate?**

✅ **At View/Generate Time** (Recommended)
- Clean separation: Design vs runtime
- Flexible: Can change data without re-designing
- Performant: Evaluate once per group, not per field

❌ At Design Time
- Confusing: Would auto-hide/show groups
- Limiting: Can't design multiple variants
- Counter-intuitive

### **3. Condition Complexity?**

✅ **Simple Expressions** (Recommended for v1)
- Variable, operator, value
- Easy to understand
- Covers 90% of use cases

🔮 **Complex Expressions** (Future)
- Multiple conditions (AND/OR)
- Nested expressions
- Custom JavaScript
- For advanced users

---

## 💡 Alternative Approaches

### **Approach A: Extend Existing Conditional Field Plugin**

Use your existing conditional field plugin at group level:

```typescript
{
  type: "conditionalGroup",
  expressions: [
    { variable: "resultType", operator: "==", value: "positive", targetGroup: "group1" },
    { variable: "resultType", operator: "==", value: "negative", targetGroup: "group2" },
  ]
}
```

**Pros:**
- ✅ Reuses existing logic
- ✅ Familiar UI

**Cons:**
- ❌ More complex
- ❌ Requires new field type
- ❌ Not as clean as group-level conditions

### **Approach B: Group Templates**

Create template variants:

```typescript
{
  variants: [
    { name: "Positive", condition: {...}, schemas: [...] },
    { name: "Negative", condition: {...}, schemas: [...] },
  ]
}
```

**Pros:**
- ✅ Complete variant isolation

**Cons:**
- ❌ Duplicates entire template
- ❌ Hard to maintain
- ❌ Doesn't use group feature

**Decision: Use Approach in Option A (Conditions on Groups)** ✅

---

## 🔒 Backward Compatibility

### **Templates Without Conditions:**

```typescript
// Old template (no fieldGroups)
{
  schemas: [...],
  basePdf: "..."
}
→ Works as before ✅

// Template with groups but no conditions
{
  schemas: [...],
  basePdf: "...",
  fieldGroups: [
    { id: "g1", name: "Group 1", fieldIds: [...] }
    // No condition property
  ]
}
→ All groups visible (default behavior) ✅

// Template with conditional groups
{
  schemas: [...],
  basePdf: "...",
  fieldGroups: [
    { 
      id: "g1",
      name: "Positive",
      fieldIds: [...],
      condition: { enabled: true, ... }
    }
  ]
}
→ Evaluates conditions ✅
```

**No breaking changes!** ✅

---

## 📊 Complexity Analysis

### **Simple (Easy to Implement):**
- ✅ One condition per group
- ✅ Basic operators (==, !=, in)
- ✅ Single variable comparison
- ✅ Boolean enable/disable

### **Medium (Phase 2):**
- Multiple conditions per group (AND/OR)
- Nested conditions
- Computed variables

### **Complex (Future):**
- Cross-group dependencies
- Dynamic condition evaluation
- Condition templates/presets

**Recommendation: Start with Simple!** ✅

---

## 🎯 Recommendations

### **Should You Implement This?**

✅ **YES, because:**
1. **Solves real problem** - Multiple variants at same position
2. **Builds on existing** - Uses group feature you just built
3. **Clean design** - Conditions belong on groups
4. **Reuses patterns** - Similar to your conditional field plugin
5. **Powerful** - Enables complex conditional layouts

### **Implementation Order:**

**MVP (Minimum Viable Product):**
1. Add condition property to FieldGroup ✅
2. Simple UI to set condition ✅
3. Evaluation logic ✅
4. Viewer integration ✅

**Time:** ~8-10 hours for MVP

**Full Feature:**
5. Advanced operators
6. Multiple conditions per group
7. Condition templates
8. Visual condition preview

**Time:** +5-7 hours for full feature

---

## 🚀 Quick Start (If Approved)

### **Phase 1: Update Schema (30 min)**
```typescript
// packages/common/src/schema.ts
export const GroupCondition = z.object({
  enabled: z.boolean(),
  variable: z.string(),
  operator: z.string(),
  value: z.string(),
});

// Add to FieldGroup
condition: GroupCondition.optional(),
```

### **Phase 2: Evaluation Logic (1 hour)**
```typescript
// packages/ui/src/helper.ts
export const evaluateGroupCondition = (condition, data) => {
  // Simple == comparison for MVP
  return data[condition.variable] === condition.value;
};
```

### **Phase 3: Basic UI (2-3 hours)**
```typescript
// Simple inline form in GroupItem context menu
- Input for variable
- Input for value
- Checkbox to enable
```

### **Phase 4: Viewer Integration (2-3 hours)**
```typescript
// Filter schemas before rendering
const visibleFields = getConditionallyVisibleFieldIds(groups, data);
```

---

## 💡 Alternative: Use Existing Conditional Field Plugin

### **Quick Solution (2-3 hours):**

Instead of new feature, extend your existing conditional field system:

```typescript
// In your conditional field
expressions: [
  {
    variable: "resultType",
    operator: "==",
    value: "positive",
    targetField: "pos_finding", // Each field individually
  },
  {
    variable: "resultType",
    operator: "==",
    value: "positive",
    targetField: "pos_details",
  },
  // ... repeat for each field
]
```

**Pros:**
- ✅ Uses existing code
- ✅ Quick to implement

**Cons:**
- ❌ Must set condition on EACH field
- ❌ Doesn't leverage groups
- ❌ More maintenance

---

## 🎯 My Recommendation

### **Option 1: Conditional Groups (BEST)**
- **Time:** 10-15 hours
- **Benefit:** Clean, powerful, scalable
- **User-friendly:** Set once per group
- **Maintainable:** Easy to update

### **Option 2: Extend Conditional Fields**
- **Time:** 2-3 hours  
- **Benefit:** Quick solution
- **User-friendly:** More repetitive
- **Maintainable:** Must update each field

### **Option 3: Hybrid Approach**
- **Time:** 5-7 hours
- Use groups for organization
- Use conditional fields for logic
- Best of both worlds?

---

## 📋 Decision Checklist

Before implementing, consider:

- [ ] **Frequency:** How often will users need this?
- [ ] **Complexity:** How many variants per template?
- [ ] **Maintenance:** Who maintains condition logic?
- [ ] **Learning curve:** Is it intuitive for users?
- [ ] **Performance:** Impact on viewer/generator?
- [ ] **Timeline:** When do you need this feature?

---

## 🎉 Summary

**Your Requirement:** Conditional visibility for field groups

**Best Solution:** Add condition property to FieldGroup with simple evaluation

**Implementation:** 
- Schema: 30min
- Helpers: 1h
- UI: 3h  
- Viewer: 3h
- Generator: 3h
- Testing: 2h
**Total: ~12 hours**

**Should we proceed with implementation?** 

Let me know if you want:
1. **Full implementation** of conditional groups
2. **Quick solution** extending conditional fields
3. **More detailed planning** before deciding
4. **Something else entirely**

I'm ready to implement when you give the go-ahead! 🚀

