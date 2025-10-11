# 🎨 Auto-Layout System Research for PDF Designer

## 📚 Research Overview

Modern visual designers like **Figma**, **WordPress Gutenberg**, **Canva**, and **Webflow** use auto-layout systems to make design easier and more consistent.

---

## 🔍 Key Concepts from Leading Designers

### **1. Figma Auto Layout**

Figma's auto-layout is the gold standard for component-based design:

#### **Core Features:**
- **Parent-Child Relationship:** Parent frames automatically size based on children
- **Padding:** Uniform padding around all children (top, right, bottom, left)
- **Spacing:** Automatic spacing between children
- **Direction:** Horizontal or vertical stacking
- **Alignment:** Cross-axis alignment (center, start, end)
- **Resizing:** Children can be fixed or fill container

#### **Example:**
```
Container (Auto-layout):
├─ Padding: 16px all sides
├─ Spacing: 8px between items
├─ Direction: Vertical
│
├── Child 1: Text "Patient Name"
├── Child 2: Text "John Doe"
├── Child 3: Text "DOB: 1990-01-01"

Result: Children automatically stack with 8px gaps,
        16px padding from container edges
```

---

### **2. WordPress Gutenberg Blocks**

WordPress uses a **block-based** system:

#### **Core Features:**
- **Block Hierarchy:** Blocks can contain other blocks (containers)
- **InnerBlocks:** Special API for parent-child relationships
- **Block Spacing:** Automatic spacing between blocks
- **Alignment Tools:** Left, center, right, wide, full-width
- **Block Templates:** Predefined layouts with locked structure

#### **Example:**
```
Group Block (Container):
├─ Vertical spacing: 20px
├─ Padding: 30px
│
├── Heading Block
├── Paragraph Block
├── Image Block

Result: Blocks stack vertically with automatic spacing
```

---

### **3. Canva Smart Templates**

Canva focuses on **template-based design** with smart positioning:

#### **Core Features:**
- **Smart Guides:** Auto-snap to alignment
- **Smart Spacing:** Equal spacing suggestions
- **Groups:** Group elements move together
- **Locked Elements:** Background elements stay fixed
- **Text Boxes:** Auto-resize based on content

#### **Example:**
```
Medical Report Template:
├─ Header Section (locked position)
├─ Patient Info Section (auto-spaced below header)
│   ├── Name field (auto-padded)
│   ├── ID field (auto-aligned with name)
│   └── DOB field (equal spacing)
├─ Results Section (auto-spaced)
```

---

## 🎯 Recommended Features for PDF Designer

### **Phase 1: Container Fields (Immediate Priority)**

#### **What:**
Add a special "Container" or "Section" field type that can hold other fields.

#### **Features:**
1. **Visual Boundary:** Dashed border to show container area
2. **Auto-Padding:** Configurable padding (default 5mm all sides)
3. **Child Positioning:** Children placed relative to container
4. **Auto-Stacking:** Children stack vertically with spacing
5. **Container Resize:** Auto-expands to fit all children

#### **Use Case for Genetic Reports:**
```
Create "Patient Demographics" Container:
├─ Padding: 5mm
├─ Spacing: 3mm between fields
│
├── Add "Patient Name" text field
│   → Automatically positioned at (5mm from left, 5mm from top)
│
├── Add "Patient ID" text field
│   → Automatically positioned at (5mm from left, 13mm from top)
│   → Auto-spaced 3mm from previous field + field height
│
├── Add "DOB" text field
│   → Automatically positioned at (5mm from left, 21mm from top)
│   → Auto-spaced from previous field

Container auto-resizes: Height = 5mm (top) + fields + spacing + 5mm (bottom)
```

---

### **Phase 2: Smart Alignment & Spacing**

#### **Features:**

**1. Smart Guides (like Figma/Canva):**
- Show alignment lines when dragging
- Snap to other field edges
- Snap to center lines
- Equal spacing indicators

**2. Distribute Spacing:**
- Select multiple fields
- "Distribute Vertically" → Equal spacing between all
- "Distribute Horizontally" → Equal spacing between all

**3. Align Tools:**
- Align Left/Right/Top/Bottom
- Align to Center (H/V)
- Align to Page Center

---

### **Phase 3: Templates & Presets**

#### **Features:**

**1. Section Templates:**
- Predefined sections for common layouts
- "Patient Info Section" (name, ID, DOB pre-arranged)
- "Test Results Section" (findings, interpretation)
- "Signature Section" (doctor signature, date)

**2. Layout Presets:**
- "Two Column Layout"
- "Header + Body + Footer"
- "Side by Side Fields"

**3. Field Presets:**
- "Label + Value" pair (auto-aligned)
- "Table Row" (multiple fields with equal width)

---

## 💡 Implementation Recommendations

### **Priority 1: Container/Section Field** ⭐ HIGHEST PRIORITY

**Why:** This solves the immediate need for organized layouts.

**Implementation:**
```typescript
// New field type: 'container'
{
  type: 'container',
  name: 'patient_demographics',
  position: { x: 20, y: 20 },
  width: 170,  // Container size
  height: 80,  // Auto-calculated or manual
  padding: 5,  // Padding in mm
  childSpacing: 3,  // Spacing between children in mm
  layout: 'vertical',  // or 'horizontal'
  children: [
    { fieldId: 'patient_name', order: 0 },
    { fieldId: 'patient_id', order: 1 },
    { fieldId: 'patient_dob', order: 2 }
  ]
}
```

**Auto-Positioning Logic:**
```javascript
const positionChildrenInContainer = (container, childFields) => {
  let currentY = container.padding; // Start from top padding
  
  childFields.forEach((child, index) => {
    // Position relative to container
    child.position.x = container.position.x + container.padding;
    child.position.y = container.position.y + currentY;
    
    // Update for next child
    currentY += child.height + container.childSpacing;
  });
  
  // Auto-resize container to fit children
  container.height = currentY + container.padding - container.childSpacing;
};
```

---

### **Priority 2: Snap-to-Grid System** ⭐ HIGH PRIORITY

**Why:** Makes alignment consistent and clean.

**Implementation:**
- Grid size: 5mm (or configurable)
- When dragging, snap position to nearest grid point
- Visual grid overlay (optional, toggleable)
- Snap threshold: 2mm

**Code:**
```javascript
const snapToGrid = (position, gridSize = 5) => {
  return Math.round(position / gridSize) * gridSize;
};

// In onDrag handler:
const snappedX = snapToGrid(draggedX, 5);
const snappedY = snapToGrid(draggedY, 5);
```

---

### **Priority 3: Smart Guides** ⭐ MEDIUM PRIORITY

**Why:** Helps users align fields visually.

**Features:**
- When dragging, show red lines when field aligns with:
  - Other field edges (left, right, top, bottom, center)
  - Page center
  - Equal spacing between 3+ fields

**Visual:**
```
┌─────────────────────────────┐
│  [Field 1]                  │
│      ↕ 10mm                  │ ← Equal spacing indicator
│  [Field 2]  ◄─── Dragging   │
│      ↕ 10mm ◄─── Red line   │
│  [Field 3]                  │
└─────────────────────────────┘
```

---

### **Priority 4: Alignment Tools** ⭐ MEDIUM PRIORITY

**Why:** Quick way to organize multiple fields.

**Tools:**
- Align Left (align all left edges)
- Align Right (align all right edges)
- Align Top (align all top edges)
- Align Bottom (align all bottom edges)
- Align Center Horizontal
- Align Center Vertical
- Distribute Vertically (equal spacing)
- Distribute Horizontally (equal spacing)

**UI:**
```
Toolbar when 2+ fields selected:
┌──────────────────────────────────┐
│ [⬅] [➡] [⬆] [⬇] [↕] [↔] [⊞] [⊟] │
└──────────────────────────────────┘
 Left Right Top Bottom Dist Dist Center
```

---

## 🏥 Specific Use Cases for Genetic Reports

### **Use Case 1: Patient Information Section**

**Current (Manual):**
```
User adds fields one by one:
- Drag "Patient Name" field → Position manually (20mm, 30mm)
- Drag "Patient ID" field → Position manually (20mm, 40mm)
- Drag "DOB" field → Position manually (20mm, 50mm)
- Adjust spacing manually if not equal
```

**With Auto-Layout (Proposed):**
```
User creates "Patient Info Container":
1. Add container field at (20mm, 30mm), width: 80mm
2. Set padding: 5mm, spacing: 3mm
3. Drag "Patient Name" into container → Auto-positions at (25mm, 35mm)
4. Drag "Patient ID" into container → Auto-positions at (25mm, 48mm)
5. Drag "DOB" into container → Auto-positions at (25mm, 61mm)

Result: Perfect alignment, equal spacing, automatic!
```

---

### **Use Case 2: Two-Column Results Layout**

**Current (Manual):**
```
User manually aligns:
- Left column: Findings at (20mm, 100mm)
- Right column: Interpretation at (110mm, 100mm)
- Left column: Methods at (20mm, 150mm)
- Right column: Notes at (110mm, 150mm)

Problem: Tedious, hard to keep aligned
```

**With Container (Proposed):**
```
Create 2 containers side by side:

Container 1 (Left):
- Position: (20mm, 100mm)
- Width: 85mm
- Contains: Findings, Methods (auto-stacked)

Container 2 (Right):
- Position: (110mm, 100mm)  
- Width: 85mm
- Contains: Interpretation, Notes (auto-stacked)

Result: Two perfect columns, auto-aligned
```

---

### **Use Case 3: Dynamic Content Sections**

**Scenario:** Report has multiple result sections that should all have same spacing.

**With Auto-Layout:**
```
Create "Result Section" Template:
├─ Container with padding: 5mm
├─ Spacing: 4mm
├─ Children:
│   ├── Title (bold, 14pt)
│   ├── Content (regular, 10pt)
│   └── Interpretation (italic, 10pt)

Apply template 3 times:
- Section 1: Variant 1 results
- Section 2: Variant 2 results  
- Section 3: Variant 3 results

Result: All sections have identical spacing automatically!
```

---

## 🔧 Implementation Roadmap

### **Phase 1: Foundation (Week 1-2)**

**Tasks:**
1. ✅ Remove quick actions toolbar (DONE)
2. ⬜ Add "container" field type to schema
3. ⬜ Implement container rendering with dashed border
4. ⬜ Add padding & spacing properties to container
5. ⬜ Implement child field detection (fields inside container bounds)

**Deliverable:** Users can create containers and see children

---

### **Phase 2: Auto-Positioning (Week 3-4)**

**Tasks:**
1. ⬜ Implement auto-positioning algorithm for children
2. ⬜ Add drag-and-drop into containers
3. ⬜ Auto-stack children vertically with spacing
4. ⬜ Container auto-resize to fit children
5. ⬜ Prevent child from moving outside container

**Deliverable:** Containers automatically position children

---

### **Phase 3: Smart Features (Week 5-6)**

**Tasks:**
1. ⬜ Snap-to-grid system (5mm grid)
2. ⬜ Smart alignment guides (red lines)
3. ⬜ Equal spacing indicators
4. ⬜ Alignment toolbar (align left, right, etc.)
5. ⬜ Distribute spacing tools

**Deliverable:** Professional alignment tools

---

### **Phase 4: Templates (Week 7-8)**

**Tasks:**
1. ⬜ Section templates library
2. ⬜ "Patient Info" preset
3. ⬜ "Test Results" preset
4. ⬜ "Header/Footer" preset
5. ⬜ Save custom templates

**Deliverable:** Pre-built section templates

---

## 💻 Technical Implementation Details

### **1. Container Field Schema**

```typescript
// Add to common/src/schema.ts
export const ContainerSchema = z.object({
  type: z.literal('container'),
  name: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  width: z.number(),
  height: z.number(),
  padding: z.number().default(5),
  childSpacing: z.number().default(3),
  layout: z.enum(['vertical', 'horizontal']).default('vertical'),
  alignment: z.enum(['start', 'center', 'end']).default('start'),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
  children: z.array(z.object({
    fieldId: z.string(),
    order: z.number()
  })).default([])
});
```

---

### **2. Auto-Positioning Algorithm**

```typescript
/**
 * Auto-position children within a container
 */
export const autoPositionChildren = (
  container: ContainerSchema,
  childSchemas: SchemaForUI[]
): SchemaForUI[] => {
  const { padding, childSpacing, layout, alignment } = container;
  
  // Sort children by order
  const sortedChildren = [...childSchemas].sort((a, b) => {
    const aOrder = container.children.find(c => c.fieldId === a.id)?.order || 0;
    const bOrder = container.children.find(c => c.fieldId === b.id)?.order || 0;
    return aOrder - bOrder;
  });
  
  if (layout === 'vertical') {
    let currentY = padding;
    
    return sortedChildren.map(child => {
      // Calculate X based on alignment
      let x = container.position.x + padding;
      
      if (alignment === 'center') {
        x = container.position.x + (container.width - child.width) / 2;
      } else if (alignment === 'end') {
        x = container.position.x + container.width - child.width - padding;
      }
      
      const y = container.position.y + currentY;
      currentY += child.height + childSpacing;
      
      return {
        ...child,
        position: { x, y }
      };
    });
  } else {
    // Horizontal layout
    let currentX = padding;
    
    return sortedChildren.map(child => {
      const x = container.position.x + currentX;
      
      // Calculate Y based on alignment
      let y = container.position.y + padding;
      if (alignment === 'center') {
        y = container.position.y + (container.height - child.height) / 2;
      } else if (alignment === 'end') {
        y = container.position.y + container.height - child.height - padding;
      }
      
      currentX += child.width + childSpacing;
      
      return {
        ...child,
        position: { x, y }
      };
    });
  }
};

/**
 * Auto-calculate container height to fit all children
 */
export const calculateContainerHeight = (
  container: ContainerSchema,
  children: SchemaForUI[]
): number => {
  if (children.length === 0) return container.padding * 2 + 20; // Min height
  
  const totalChildHeight = children.reduce((sum, child) => sum + child.height, 0);
  const totalSpacing = (children.length - 1) * container.childSpacing;
  
  return container.padding + totalChildHeight + totalSpacing + container.padding;
};
```

---

### **3. Snap-to-Grid Implementation**

```typescript
/**
 * Snap position to grid
 */
export const snapToGrid = (value: number, gridSize: number = 5): number => {
  return Math.round(value / gridSize) * gridSize;
};

// In Canvas/index.tsx onDrag handler:
const onDragWithSnap = ({ target, top, left }: OnDrag) => {
  const gridSize = 5; // 5mm grid
  
  const snappedTop = snapToGrid(fmt(top.toString()), gridSize);
  const snappedLeft = snapToGrid(fmt(left.toString()), gridSize);
  
  target.style.top = `${snappedTop * ZOOM}px`;
  target.style.left = `${snappedLeft * ZOOM}px`;
};
```

---

### **4. Smart Alignment Guides**

```typescript
/**
 * Detect alignment with other fields
 */
export const findAlignmentGuides = (
  draggingField: SchemaForUI,
  allFields: SchemaForUI[],
  threshold: number = 2 // 2mm threshold
): AlignmentGuide[] => {
  const guides: AlignmentGuide[] = [];
  
  allFields.forEach(field => {
    if (field.id === draggingField.id) return;
    
    // Left edge alignment
    if (Math.abs(draggingField.position.x - field.position.x) < threshold) {
      guides.push({
        type: 'vertical',
        position: field.position.x,
        color: '#ff4444'
      });
    }
    
    // Right edge alignment
    const draggingRight = draggingField.position.x + draggingField.width;
    const fieldRight = field.position.x + field.width;
    if (Math.abs(draggingRight - fieldRight) < threshold) {
      guides.push({
        type: 'vertical',
        position: fieldRight,
        color: '#ff4444'
      });
    }
    
    // Top edge alignment
    if (Math.abs(draggingField.position.y - field.position.y) < threshold) {
      guides.push({
        type: 'horizontal',
        position: field.position.y,
        color: '#ff4444'
      });
    }
    
    // Center alignment
    const draggingCenterX = draggingField.position.x + draggingField.width / 2;
    const fieldCenterX = field.position.x + field.width / 2;
    if (Math.abs(draggingCenterX - fieldCenterX) < threshold) {
      guides.push({
        type: 'vertical',
        position: fieldCenterX,
        color: '#ff4444',
        label: 'Center'
      });
    }
  });
  
  return guides;
};
```

---

## 🎨 UI/UX Design

### **Container Field in Designer:**

```
┌─────────────────────────────────────┐
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│                                     │
│ │  Patient Demographics         │ │ ← Container label
│                                     │
│ │  ┌──────────────────────┐    │ │
│    │ Patient Name         │       │ ← Child field
│ │  └──────────────────────┘    │ │
│                                     │
│ │  ┌──────────────────────┐    │ │
│    │ Patient ID           │       │ ← Auto-spaced
│ │  └──────────────────────┘    │ │
│                                     │
│ │  ┌──────────────────────┐    │ │
│    │ Date of Birth        │       │ ← Auto-spaced
│ │  └──────────────────────┘    │ │
│                                     │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└─────────────────────────────────────┘

Features visible:
- Dashed container border
- Children automatically aligned left
- Equal spacing (3mm) between children
- Padding (5mm) from container edges
```

---

### **Property Panel for Container:**

```
┌─────────────────────────────┐
│ Container Properties         │
├─────────────────────────────┤
│ Name: patient_demographics  │
│                             │
│ Position                    │
│ X: [20___] Y: [30___]      │
│                             │
│ Size                        │
│ Width: [170__]              │
│ Height: [Auto ▼] or [80__] │
│                             │
│ Layout                      │
│ Direction: [Vertical ▼]    │
│ Alignment: [Start ▼]       │
│                             │
│ Spacing                     │
│ Padding: [5___] mm         │
│ Child Spacing: [3___] mm   │
│                             │
│ Style                       │
│ Background: [#ffffff]       │
│ Border Color: [#e5e7eb]    │
│ Border Width: [1___] pt    │
└─────────────────────────────┘
```

---

## 📋 Suggested Workflow for Users

### **Creating a Report Section:**

**Step 1: Create Container**
```
1. Click "Add Container" in toolbar
2. Draw container area on canvas
3. Set properties:
   - Name: "Patient Info"
   - Padding: 5mm
   - Spacing: 3mm
```

**Step 2: Add Fields to Container**
```
1. Drag "Text" field from palette
2. Drop it INSIDE the container
3. Field auto-positions at (container.x + 5mm, container.y + 5mm)
4. Field auto-sizes to fit container width (container.width - 10mm padding)
```

**Step 3: Add More Fields**
```
1. Drag another "Text" field
2. Drop it in container
3. Auto-positions BELOW previous field with 3mm spacing
4. Container auto-expands height to fit
```

**Step 4: Reorder (if needed)**
```
1. Select field in container
2. Drag up/down to reorder
3. All fields auto-reposition with correct spacing
```

---

## 🎯 Benefits for Genetic Report Templates

### **1. Consistency**
- ✅ All sections have uniform padding
- ✅ All fields have equal spacing
- ✅ Professional appearance guaranteed

### **2. Speed**
- ✅ Create sections 5x faster
- ✅ No manual position calculations
- ✅ No alignment struggles

### **3. Flexibility**
- ✅ Easy to add/remove fields
- ✅ Auto-reflow when field added
- ✅ Change spacing globally

### **4. Error Reduction**
- ✅ No overlapping fields
- ✅ No misaligned fields
- ✅ Consistent layouts

---

## 🚀 Quick Wins (Implement First)

### **1. Snap-to-Grid (Easiest)**
- Time: 2-3 hours
- Impact: HIGH
- Code: ~50 lines
- Users immediately feel "guided"

### **2. Alignment Tools (Medium)**
- Time: 1 day
- Impact: MEDIUM-HIGH
- Code: ~200 lines
- Select 2+ fields → Align left/right/top/bottom

### **3. Container Fields (Complex)**
- Time: 3-5 days
- Impact: VERY HIGH
- Code: ~500 lines
- Complete auto-layout system

---

## 📊 Recommended Implementation Order

```
Priority 1: Snap-to-Grid
├─ Immediate benefit
├─ Easy to implement
└─ Foundation for other features

Priority 2: Smart Guides
├─ Visual alignment feedback
├─ Builds on snap-to-grid
└─ Helps manual positioning

Priority 3: Alignment Tools
├─ Batch alignment operations
├─ Toolbar with align buttons
└─ Distribute spacing

Priority 4: Container Fields
├─ Full auto-layout system
├─ Parent-child relationships
└─ Automatic positioning
```

---

## 🎉 Expected Outcome

After implementing auto-layout features:

**Before:**
- Creating a genetic report template: 2-3 hours
- Many manual adjustments needed
- Inconsistent spacing
- Frequent overlaps

**After:**
- Creating a genetic report template: 30-45 minutes
- Automatic positioning
- Perfect spacing every time
- No overlaps

**User feedback:**
- "Feels like magic!"
- "So much easier!"
- "Templates look professional!"

---

## 💡 Next Steps

1. ✅ Remove quick actions toolbar (DONE)
2. ⬜ Start with Snap-to-Grid (quick win)
3. ⬜ Add Smart Alignment Guides
4. ⬜ Implement Container Fields
5. ⬜ Create Section Templates

**Ready to start implementation! Which feature should we tackle first?** 🚀

---

## 🔗 References

- Figma Auto Layout: Component-based automatic spacing
- WordPress Gutenberg: Block-based nested layouts
- Canva Templates: Smart guides and snapping
- Adobe XD: Responsive resize and padding
- Webflow: Visual flexbox designer

**All modern designers use these patterns - proven to work! ✅**

