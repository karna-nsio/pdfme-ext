# 🎨 Hidden Area Indicators - Final Design

## ✅ YOUR VISION IMPLEMENTED!

Instead of showing individual field indicators, we now show **highlighted rectangular areas** that encompass ALL hidden fields in each region!

---

## 🎯 How It Works

### **Concept:**
- Find all hidden fields on the page
- Group them into **clusters** (nearby fields)
- Calculate a **bounding box** for each cluster
- Show a **single highlighted area** per cluster

### **Result:**
**One subtle highlighted region** instead of many individual indicators! ✅

---

## 🎨 Visual Design

### **Single Cluster Example:**
```
Canvas with 3 hidden fields at top:

┌─────────────────────────────────────────┐
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║ 🔶 Subtle amber highlight         ║  │
│  ║                                   ║  │
│  ║   (patient_name - hidden)         ║  │
│  ║   (patient_age - hidden)          ║  │
│  ║   (patient_id - hidden)           ║  │
│  ║                          👁️‍🗨️ 3    ║  │
│  ╚═══════════════════════════════════╝  │
│         ↑                               │
│    Single highlighted area              │
│    covering all 3 hidden fields         │
│                                         │
│  ┌──────────────┐  ← Visible fields    │
│  │ Test Result  │     (normal)          │
│  └──────────────┘                       │
│                                         │
└─────────────────────────────────────────┘
```

**Clean and uncluttered!** ✨

---

### **Multiple Clusters Example:**
```
Canvas with 2 separate regions of hidden fields:

┌─────────────────────────────────────────┐
│  Header Section                         │
│  ╔═══════════════════════════════╗      │
│  ║ Demographics (5 hidden)      ║      │
│  ║                         👁️‍🗨️ 5 ║      │
│  ╚═══════════════════════════════╝      │
│         ↑                               │
│    Area 1: Patient demographics         │
│                                         │
│  ┌──────────────┐                       │
│  │ Visible      │  ← Normal fields      │
│  │ Content      │     showing           │
│  └──────────────┘                       │
│                                         │
│  Footer Section                         │
│  ╔═══════════════════════════════╗      │
│  ║ Lab Results (12 hidden)      ║      │
│  ║                        👁️‍🗨️ 12 ║      │
│  ╚═══════════════════════════════╝      │
│         ↑                               │
│    Area 2: Lab test results             │
│                                         │
└─────────────────────────────────────────┘
```

**Two distinct regions highlighted!** 📍

---

## 🔍 How Clustering Works

### **Algorithm:**

```typescript
1. Find all hidden fields on current page
2. Sort by Y position (top to bottom)
3. For each field:
   - Check if it's near any existing cluster
   - "Near" = within 30mm vertically AND horizontally close
   - If near, add to that cluster
   - If not, create new cluster
4. For each cluster:
   - Calculate min X, Y (top-left)
   - Calculate max X, Y (bottom-right)
   - Create bounding box with 2mm padding
5. Render one indicator per bounding box
```

### **Example:**

```
Hidden Fields:
- patient_name at (20, 30) [80×10]
- patient_age at (20, 45) [80×10]
- patient_id at (20, 60) [80×10]
- test_result at (20, 200) [100×15]

Clustering:
Cluster 1: patient_name, patient_age, patient_id
  (All within 30mm of each other)
  
Cluster 2: test_result
  (100mm away from cluster 1)

Bounding Boxes:
Box 1: x=18, y=28, width=84, height=47
  (Covers all 3 patient fields + 2mm padding)
  
Box 2: x=18, y=198, width=104, height=19
  (Covers test_result + 2mm padding)

Result: 2 indicators instead of 4! ✅
```

---

## 🎨 Visual Style

### **Colors (Subtle Amber/Yellow Tint):**
```css
Background:  rgba(251, 191, 36, 0.08)   /* Very subtle amber */
Border:      1px dashed rgba(251, 191, 36, 0.3)  /* Amber dash */
Badge BG:    rgba(251, 191, 36, 0.9)    /* Amber badge */
Badge Text:  #78350f                     /* Dark amber */
```

### **Why Amber/Yellow?**
- ✅ **Attention** - Suggests "something here" without being alarming
- ✅ **Neutral** - Not error (red) or success (green)
- ✅ **Subtle** - Low opacity doesn't distract
- ✅ **Distinct** - Different from blue (selected) or grey (UI)

### **Badge Position:**
```
┌─────────────────────────┐
│                  👁️‍🗨️ 5  │ ← Top-right corner
│                         │
│  Hidden content area    │
│                         │
└─────────────────────────┘
```

Small badge doesn't clutter the area!

---

## 📐 Accurate Positioning

### **Bounding Box Calculation:**

```
Hidden Fields in a Cluster:

     field1      field2
  ┌────────┐  ┌────────┐
  │ (20,30)│  │(110,30)│
  └────────┘  └────────┘

     field3
  ┌────────┐
  │ (20,50)│
  └────────┘

Bounding Box Calculation:
minX = min(20, 110, 20) = 20
minY = min(30, 30, 50) = 30
maxX = max(20+80, 110+80, 20+80) = 190
maxY = max(30+10, 30+10, 50+10) = 60

With 2mm padding:
x = 20 - 2 = 18
y = 30 - 2 = 28
width = (190 - 20) + 4 = 174
height = (60 - 30) + 4 = 34

Result:
╔════════════════════════════════════╗
║         (Highlighted Area)         ║
║  ┌────────┐  ┌────────┐            ║
║  │ field1 │  │ field2 │  (hidden)  ║
║  └────────┘  └────────┘            ║
║  ┌────────┐                        ║
║  │ field3 │  (hidden)              ║
║  └────────┘               👁️‍🗨️ 3    ║
╚════════════════════════════════════╝
```

**Perfect bounds!** 🎯

---

## 🔄 Real-World Examples

### **Example 1: Patient Demographics Section**
```
┌─────────────────────────────────────────┐
│  Report Header (visible)                │
│  ┌──────────────┐                       │
│  │ Hospital Name│                       │
│  └──────────────┘                       │
│                                         │
│  Patient Information Section            │
│  ╔═══════════════════════════════════╗  │
│  ║ 🔶 Subtle highlight              ║  │
│  ║                                  ║  │
│  ║   (5 patient fields hidden)     ║  │
│  ║                        👁️‍🗨️ 5    ║  │
│  ╚═══════════════════════════════════╝  │
│         ↑                               │
│    All patient fields in this area      │
│                                         │
│  Test Results (visible)                 │
│  ┌──────────────┐                       │
│  │ COVID-19: ...│                       │
│  └──────────────┘                       │
└─────────────────────────────────────────┘
```

**At a glance:** "Patient section is hidden, test results visible"

---

### **Example 2: Conditional Report Variants**
```
┌─────────────────────────────────────────┐
│  Report Title                           │
│                                         │
│  Result Section                         │
│  ┌──────────────┐                       │
│  │ NEGATIVE     │  ← Visible            │
│  │ No findings  │                       │
│  └──────────────┘                       │
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║ 🔶 Alternate positive fields     ║  │
│  ║   (hidden - not needed now)     ║  │
│  ║                        👁️‍🗨️ 8    ║  │
│  ╚═══════════════════════════════════╝  │
│         ↑                               │
│    Positive result fields ready         │
│    to show if test is positive          │
│                                         │
│  Footer (visible)                       │
└─────────────────────────────────────────┘
```

**Clear separation** between active and hidden variants!

---

### **Example 3: Multi-Language Layout**
```
┌─────────────────────────────────────────┐
│  English Version (visible):             │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ Patient Name │  │ John Doe     │     │
│  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ Diagnosis    │  │ Flu          │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
│  Arabic Version (hidden):               │
│  ╔═══════════════════════════════════╗  │
│  ║ 🔶 Arabic fields at same positions║  │
│  ║                        👁️‍🗨️ 4    ║  │
│  ╚═══════════════════════════════════╝  │
│         ↑                               │
│    Exact same layout, different lang    │
└─────────────────────────────────────────┘
```

**Easy to see** where the alternate language fields are!

---

## 💡 Smart Clustering

### **Scenario: Fields in Different Sections**

```
Hidden Fields on Page:
- Header fields (3) at Y: 20-40mm
- Footer fields (2) at Y: 250-270mm

Distance: 210mm apart → TWO separate clusters!

Canvas Shows:
┌─────────────────────────────────────────┐
│  ╔═══════════════╗  ← Cluster 1         │
│  ║ Header   👁️‍🗨️ 3 ║     (top)           │
│  ╚═══════════════╝                      │
│                                         │
│  (Large visible section in middle)      │
│                                         │
│  ╔═══════════════╗  ← Cluster 2         │
│  ║ Footer   👁️‍🗨️ 2 ║     (bottom)        │
│  ╚═══════════════╝                      │
└─────────────────────────────────────────┘
```

**Distinct regions, not one huge box!** 🎯

---

### **Scenario: Fields Close Together**

```
Hidden Fields:
- field1 at Y: 100mm
- field2 at Y: 110mm  (10mm below field1)
- field3 at Y: 125mm  (15mm below field2)

All within 30mm → ONE cluster!

Canvas Shows:
┌─────────────────────────────────────────┐
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║ 🔶 Single highlighted area        ║  │
│  ║                                   ║  │
│  ║   (all 3 fields in this region)  ║  │
│  ║                        👁️‍🗨️ 3     ║  │
│  ╚═══════════════════════════════════╝  │
│         ↑                               │
│    From top field to bottom field       │
│                                         │
└─────────────────────────────────────────┘
```

**Clean single area!** ✅

---

## 📊 Before vs After

### **Before (Individual Indicators):**
```
┌─────────────────────────────────────────┐
│  ┌┄┄┄┄┄┄┄┄┐                             │
│  ┆  👁️‍🗨️   ┆  ← field1                  │
│  └┄┄┄┄┄┄┄┄┘                             │
│  ┌┄┄┄┄┄┄┄┄┐                             │
│  ┆  👁️‍🗨️   ┆  ← field2                  │
│  └┄┄┄┄┄┄┄┄┘                             │
│  ┌┄┄┄┄┄┄┄┄┐                             │
│  ┆  👁️‍🗨️   ┆  ← field3                  │
│  └┄┄┄┄┄┄┄┄┘                             │
│  ┌┄┄┄┄┄┄┄┄┐                             │
│  ┆  👁️‍🗨️   ┆  ← field4                  │
│  └┄┄┄┄┄┄┄┄┘                             │
│  ┌┄┄┄┄┄┄┄┄┐                             │
│  ┆  👁️‍🗨️   ┆  ← field5                  │
│  └┄┄┄┄┄┄┄┄┘                             │
└─────────────────────────────────────────┘

❌ Cluttered with 5 separate indicators
```

### **After (Bounding Box - YOUR IDEA!):**
```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗  │
│  ║ 🔶 Highlighted area              ║  │
│  ║                                  ║  │
│  ║   (5 fields hidden in           ║  │
│  ║    this section)                ║  │
│  ║                        👁️‍🗨️ 5   ║  │
│  ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘

✅ Clean single area with count!
```

**Much better UX!** 💯

---

## 🎨 Visual Characteristics

### **Subtle Design:**
```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════╗      │
│  ║                              ║      │
│  ║  Very light amber tint       ║      │
│  ║  (barely visible but there)  ║      │
│  ║                     👁️‍🗨️ 3   ║      │
│  ╚═══════════════════════════════╝      │
│      ↑            ↑           ↑         │
│   Dashed      Subtle    Small badge    │
│   border       tint                     │
└─────────────────────────────────────────┘

Opacity: 0.08 (very subtle!)
Border: Dashed (suggests temporary/hidden)
Badge: Small, top-right (doesn't clutter)
```

**Professional and non-intrusive!** ✨

---

## 📍 Accurate Positioning

### **Bounding Box Precision:**

```
Hidden Fields Layout:

field1: x=20, y=30, width=80, height=10
field2: x=120, y=35, width=60, height=10
field3: x=20, y=50, width=80, height=10

Bounding Box Calculation:
─────────────────────────────────────
minX = min(20, 120, 20) = 20
minY = min(30, 35, 50) = 30
maxX = max(20+80, 120+60, 20+80) = 180
maxY = max(30+10, 35+10, 50+10) = 60

With 2mm padding:
─────────────────────────────────────
Final Box:
x = 18 (20 - 2)
y = 28 (30 - 2)
width = 164 (180 - 20 + 4)
height = 34 (60 - 30 + 4)

Visual Result:
╔══════════════════════════════════════╗
║padding                         padding║
║  ┌─────────┐  ┌─────────┐            ║
║  │ field1  │  │ field2  │  (hidden)  ║
║  └─────────┘  └─────────┘            ║
║  ┌─────────┐                         ║
║  │ field3  │  (hidden)       👁️‍🗨️ 3   ║
║  └─────────┘                         ║
║padding                         padding║
╚══════════════════════════════════════╝
    ↑                              ↑
Exact bounds with 2mm padding each side
```

**Perfectly covers the hidden region!** 🎯

---

## ⚡ Performance

### **Efficiency Gains:**

**Scenario: 20 hidden fields in patient section**

**Individual Indicators (Old):**
```
Render: 20 DOM elements
Memory: 20 × component instances
Re-render: All 20 on any change
```

**Bounding Box (New):**
```
Render: 1 DOM element ✅
Memory: 1 component instance ✅
Re-render: Just 1 on changes ✅
```

**20x more efficient!** ⚡

### **Optimizations:**
- ✅ **useMemo** - Only recalculates when schemas/page/scale change
- ✅ **Smart clustering** - Groups nearby fields
- ✅ **Minimal DOM** - One div per cluster, not per field
- ✅ **React.memo** - Component only re-renders if props change
- ✅ **No events** - `pointerEvents: 'none'`

---

## 🎯 Use Cases

### **Use Case 1: Template Section Review**
```
Before hiding patient section:
┌─────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Name     │  │ Age      │  │ Gender ││
│  └──────────┘  └──────────┘  └────────┘│
│  ┌──────────┐  ┌──────────┐            │
│  │ Address  │  │ Phone    │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  (Lots of clutter!)                     │
└─────────────────────────────────────────┘

After hiding patient section:
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗  │
│  ║ 🔶 Patient section           👁️‍🗨️ 5║  │
│  ╚═══════════════════════════════════╝  │
│                                         │
│  (Clean canvas to work on other areas!) │
│  ┌──────────────┐                       │
│  │ Test Results │                       │
│  └──────────────┘                       │
└─────────────────────────────────────────┘
```

**Huge improvement in workspace clarity!** ✨

---

### **Use Case 2: Complex Conditional Logic**
```
Canvas with 3 conditional variants:

╔══════════════════════════════╗
║ Positive Results        👁️‍🗨️ 8 ║ ← Hidden (not needed now)
╚══════════════════════════════╝

┌──────────────────────────────┐
│ Negative Results             │ ← Visible (active variant)
│ No findings detected         │
└──────────────────────────────┘

╔══════════════════════════════╗
║ Inconclusive Results    👁️‍🗨️ 5 ║ ← Hidden (not needed now)
╚══════════════════════════════╝
```

**Clear view of active variant vs hidden alternatives!**

---

### **Use Case 3: Multi-Language Positioning Validation**
```
Canvas showing both language versions:

English (visible):
┌──────────────┐  ┌──────────────┐
│ Patient Name │  │ John Doe     │
└──────────────┘  └──────────────┘

Arabic (hidden):
╔════════════════════════════════╗
║ 🔶 Arabic version         👁️‍🗨️ 4 ║
╚════════════════════════════════╝

You can verify:
✅ Both versions occupy same screen area
✅ Layout is consistent
✅ Easy to toggle between them
```

---

## 🔧 Clustering Parameters

### **CLUSTER_DISTANCE: 30mm**

**Why 30mm?**
- ✅ Typical field spacing in forms
- ✅ Groups related fields together
- ✅ Separates distinct sections
- ✅ Balances grouping vs separation

### **Padding: 2mm**

**Why 2mm?**
- ✅ Small visual buffer
- ✅ Ensures full field coverage
- ✅ Doesn't add excessive size
- ✅ Professional appearance

---

## 🎨 Badge Design

### **Small & Unobtrusive:**
```
╔════════════════════════════════╗
║                         👁️‍🗨️ 12 ║ ← Top-right corner
║                                ║
║   (Large hidden section)       ║
║                                ║
╚════════════════════════════════╝
```

**Badge includes:**
- Eye-off icon (10px)
- Count number
- Amber background
- Subtle shadow

**Tooltip on hover:** "12 hidden fields in this area"

---

## 🚀 How It Looks in Practice

### **Working on a Large Template:**

```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗  │
│  ║ Header Section             👁️‍🗨️ 6  ║  │ ← Hidden
│  ╚═══════════════════════════════════╝  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │                                  │   │
│  │  Active Work Area                │   │ ← Visible
│  │  (Demographics - 8 visible       │   │
│  │   fields you're currently        │   │
│  │   editing)                       │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║ Test Results              👁️‍🗨️ 15 ║  │ ← Hidden
│  ╚═══════════════════════════════════╝  │
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║ Footer Section             👁️‍🗨️ 4  ║  │ ← Hidden
│  ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘

At a glance:
- 3 hidden sections (header, tests, footer)
- 25 total hidden fields (6+15+4)
- 1 visible section (demographics) - your focus!
- Clean workspace ✨
```

---

## ✅ Benefits

1. **Clean Canvas**
   - One box per section, not many individual boxes
   - Easy to scan visually
   - Less clutter

2. **Accurate Information**
   - Shows exact region boundaries
   - Counts all hidden fields in area
   - Clear visual separation between clusters

3. **Performance**
   - Minimal DOM elements
   - Efficient clustering algorithm
   - Fast rendering

4. **Professional**
   - Subtle amber highlight
   - Small unobtrusive badge
   - Doesn't distract from work

---

## 🚀 Ready to Test!

After build completes:

```bash
cd C:\Users\sandi\source\repos\wgs-reports
npm link @pdfme/ui
npm run dev
```

**Test it:**
1. Create a group of 5 fields
2. Hide the group
3. See a **single highlighted rectangular area** covering all 5 fields!
4. Badge shows "👁️‍🗨️ 5" in top-right
5. Hover for tooltip: "5 hidden fields in this area"

**Perfect visual feedback without clutter!** ✨

---

## 🎯 Exactly What You Wanted!

✅ **Light highlight** - Subtle amber tint  
✅ **Rectangular section** - Bounding box from top to bottom
✅ **Accurate position** - Exact bounds of hidden fields
✅ **Multiple groups** - Separate boxes for separate clusters
✅ **Field count** - Badge shows how many hidden
✅ **Performant** - Minimal DOM, smart clustering

**This is it! 🎉**

