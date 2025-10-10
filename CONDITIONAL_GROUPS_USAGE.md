# 🎯 Conditional Groups - Quick Usage Guide

## ✅ IMPLEMENTED & READY!

The conditional groups feature is now complete! Here's how to use it:

---

## 🚀 Quick Start: Create Conditional Variants

### **Scenario: Result Type Variants (Positive/Negative/Indeterminate)**

#### **Step 1: Design Positive Layout**

1. Create fields for positive result:
   - `pos_finding` at (50, 100)
   - `pos_treatment` at (50, 120)
   - `pos_followup` at (50, 140)

2. Select all 3 fields (Shift+Click)

3. Create group: "Positive Result Fields"

#### **Step 2: Set Condition on Positive Group**

1. Right-click on "Positive Result Fields"
2. Select **"Set Condition"**
3. Enter:
   - ☑ Enable condition
   - Variable: `resultType`
   - Operator: `equals (==)`
   - Value: `positive`
4. See preview: `IF data.resultType == "positive" THEN show "Positive Result Fields"`
5. Click "Save Condition" (or just click Cancel to go back)

**Note:** The Save is done inline - just click outside or press Escape to exit

6. Group now shows gear icon (⚙️): **Positive Result Fields (3) ⚙️**

7. Right-click → "Hide All Fields" (to design next variant)

#### **Step 3: Design Negative Layout (Same Position!)**

1. Canvas is now clear at position (50, 100)
2. Create fields for negative result:
   - `neg_finding` at (50, 100) ← Same position!
   - `neg_notes` at (50, 120) ← Same position!

3. Select both fields
4. Create group: "Negative Result Fields"
5. Right-click → Set Condition:
   - Variable: `resultType`
   - Operator: `equals (==)`
   - Value: `negative`
6. Hide the group

#### **Step 4: Design Indeterminate Layout**

1. Create fields at same positions
2. Group them: "Indeterminate Result Fields"
3. Set condition: `resultType == "indeterminate"`
4. Hide the group

#### **Step 5: Save Template**

Your template now has 3 groups at the same position, each with conditions!

```
Field List:
📁▶ Positive Result Fields (3) 👁️‍🗨️ ⚙️
📁▶ Negative Result Fields (2) 👁️‍🗨️ ⚙️
📁▶ Indeterminate Result Fields (3) 👁️‍🗨️ ⚙️

Icons:
📁 = Group
👁️‍🗨️ = Hidden  
⚙️ = Has condition
```

---

## 🎬 How It Works at Runtime

### **In Viewer/Generator (Your wgs-reports app):**

**When data comes in:**

```javascript
// Example 1: Positive result
const data = {
  resultType: 'positive',
  patientName: 'John Doe',
  // ... other data
};

// Processing:
// ✅ Positive group condition matches → Show pos_finding, pos_treatment, pos_followup
// ❌ Negative group condition doesn't match → Hide neg_finding, neg_notes
// ❌ Indeterminate group condition doesn't match → Hide ind_* fields

// User sees ONLY positive fields!
```

**Example 2: Negative result**

```javascript
const data = {
  resultType: 'negative',
  // ...
};

// ❌ Positive → Hide
// ✅ Negative → Show
// ❌ Indeterminate → Hide

// User sees ONLY negative fields!
```

---

## 🎨 Visual Indicators

### **In Field List:**

```
📁 Group Name (count) [icons]

Icons:
👁️‍🗨️ = Hidden in Designer (for design purposes)
⚙️ = Has condition (will show/hide based on data)
```

### **Hover on Gear Icon:**

```
Tooltip: "Condition: resultType == 'positive'"
```

---

## ⚙️ Available Operators

| Operator | Description | Example |
|----------|-------------|---------|
| **==** | Equals | `resultType == "positive"` |
| **!=** | Not equals | `status != "cancelled"` |
| **>** | Greater than | `age > 18` |
| **<** | Less than | `score < 50` |
| **>=** | Greater or equal | `count >= 10` |
| **<=** | Less or equal | `level <= 5` |
| **in** | In list | `type in ["A", "B", "C"]` |
| **contains** | Contains substring | `notes contains "urgent"` |

---

## 📋 Features Implemented

- ✅ Set condition on any group
- ✅ 8 comparison operators
- ✅ Visual indicator (gear icon ⚙️)
- ✅ Condition preview before saving
- ✅ Enable/disable toggle
- ✅ Tooltip showing condition
- ✅ Inline editor (no modal popup!)
- ✅ Evaluation helpers ready for viewer/generator

---

## 🚀 After Build

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

**Test:**
1. Create a group
2. Right-click → "Set Condition"
3. Enter: `resultType == "positive"`
4. See gear icon ⚙️ appear!
5. Hover to see condition tooltip

---

## 🎯 What's Ready

**In Designer:**
- ✅ Set conditions on groups
- ✅ Visual indicators  
- ✅ All UI components
- ✅ Validation and preview

**In Your App (wgs-reports):**
You'll need to integrate the evaluation:
- Filter fields based on group conditions
- Pass current data to evaluation function
- Only render matching fields

See your `src/utils/schemaResolver.js` - you can integrate the group condition evaluation there!

**The foundation is complete!** 🎉

