# PDFme Table Enhancement Implementation Plan

## Executive Summary
This plan outlines the step-by-step approach to implement comprehensive table design capabilities in PDFme, enabling replication of complex medical report tables as shown in the Figma design reference.

**Timeline Estimate:** 4-6 weeks
**Complexity:** High
**Risk Level:** Medium (requires careful backward compatibility management)

---

## Phase 0: Preparation & Analysis (Week 1 - Days 1-2)

### Task 0.1: Environment Setup & Code Review
**Duration:** 4 hours
**Assignee:** Developer

**Steps:**
1. Clone/update PDFme repository
2. Run full test suite to establish baseline
   ```bash
   npm install
   npm run build
   npm run test
   ```
3. Study existing table implementation:
   - Read `packages/schemas/src/tables/types.ts`
   - Read `packages/schemas/src/tables/classes.ts`
   - Read `packages/schemas/src/tables/pdfRender.ts`
   - Read `packages/schemas/src/tables/uiRender.ts`
   - Read `packages/schemas/src/tables/cell.ts`
4. Document current data flow and rendering pipeline
5. Identify integration points for new features

**Deliverables:**
- [ ] Development environment ready
- [ ] Baseline test results documented
- [ ] Architecture diagram of current table implementation
- [ ] List of potential breaking change areas

### Task 0.2: Create Feature Branch & Backup
**Duration:** 1 hour

**Steps:**
```bash
git checkout -b feature/comprehensive-table-design
git push -u origin feature/comprehensive-table-design
```

**Deliverables:**
- [ ] Feature branch created
- [ ] Branch protection rules configured

### Task 0.3: Design Technical Specifications
**Duration:** 8 hours
**Assignee:** Lead Developer + Architect

**Steps:**
1. Create detailed type definitions for all new properties
2. Design data structure for row groups and cell merging
3. Plan backward compatibility strategy
4. Design migration path for existing tables
5. Create mockups of PropPanel UI changes
6. Define validation rules for new properties
7. Plan caching strategy for complex tables

**Deliverables:**
- [ ] Technical specification document
- [ ] Updated TypeScript interfaces (draft)
- [ ] PropPanel UI mockups
- [ ] Validation schema definitions
- [ ] Performance impact assessment

---

## Phase 1: Core Type System & Data Structures (Week 1 - Days 3-5)

### Task 1.1: Update Type Definitions
**Duration:** 6 hours
**File:** `packages/schemas/src/tables/types.ts`

**Steps:**
1. Add font weight support to CellStyle:
```typescript
export interface CellStyle {
  fontName?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  alignment: ALIGNMENT;
  verticalAlignment: VERTICAL_ALIGNMENT;
  fontSize: number;
  lineHeight: number;
  characterSpacing: number;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: BoxDimensions;
  padding: BoxDimensions;
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  whiteSpace?: 'normal' | 'nowrap' | 'pre-wrap';
  wordBreak?: 'normal' | 'break-all' | 'break-word';
}
```

2. Add row group support to TableSchema:
```typescript
export interface RowGroupConfig {
  title: string;
  startRow: number;
  endRow?: number;
  styles?: Partial<CellStyle>;
  colspan?: boolean; // Span all columns
  visible?: boolean;
}

export interface TableSchema extends Schema {
  showHead: boolean;
  head: string[];
  headWidthPercentages: number[];

  tableStyles: {
    borderColor: string;
    borderWidth: number;
  };
  headStyles: CellStyle;
  bodyStyles: CellStyle & { alternateBackgroundColor: string };
  columnStyles: {
    alignment?: { [colIndex: number]: ALIGNMENT };
  };

  // 🆕 New properties
  rowGroups?: RowGroupConfig[];
  rowStyles?: { [rowIndex: number]: Partial<CellStyle> };
  cellStyles?: {
    [rowIndex: number]: {
      [colIndex: number]: Partial<CellStyle>;
    };
  };
  cellMerge?: {
    [rowIndex: number]: {
      [colIndex: number]: {
        colspan?: number;
        rowspan?: number;
      };
    };
  };

  columnConditions?: {
    [colIndex: number]: {
      enabled: boolean;
      variable: string;
      operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'contains';
      value: string | number | string[];
    };
  };
}
```

3. Add unit tests for type definitions
4. Run TypeScript compiler to check for errors

**Deliverables:**
- [ ] Updated `types.ts` with all new interfaces
- [ ] TypeScript compilation passing
- [ ] JSDoc comments for all new types
- [ ] Unit tests for type validation

### Task 1.2: Update Table Class Structure
**Duration:** 8 hours
**File:** `packages/schemas/src/tables/classes.ts`

**Steps:**
1. Update `Cell` class to support new style properties:
```typescript
export class Cell {
  raw: string;
  styles: Styles;
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;
  rowSpan: number = 1; // 🆕
  colSpan: number = 1; // 🆕
  isMerged: boolean = false; // 🆕
  mergedWith?: { row: number; col: number }; // 🆕

  // ... existing code
}
```

2. Add `RowGroup` class:
```typescript
export class RowGroup {
  title: string;
  startRow: number;
  endRow?: number;
  styles: Partial<Styles>;
  colspan: boolean;
  cell?: Cell;

  constructor(config: RowGroupConfig, tableWidth: number) {
    // Initialize row group
  }
}
```

3. Update `Table` class to manage row groups:
```typescript
export class Table {
  // ... existing properties
  rowGroups: RowGroup[] = []; // 🆕

  // ... existing code
}
```

4. Add methods for cell merging logic:
```typescript
private applyCellMerge(schema: TableSchema): void {
  // Apply colspan/rowspan from schema
}

private getCellAt(row: number, col: number): Cell | null {
  // Get cell considering merged cells
}
```

**Deliverables:**
- [ ] Updated `classes.ts` with new properties and methods
- [ ] Cell merging logic implemented
- [ ] Row group support in Table class
- [ ] Unit tests for class methods

### Task 1.3: Update Helper Functions
**Duration:** 4 hours
**File:** `packages/schemas/src/tables/helper.ts`

**Steps:**
1. Update `getDefaultCellStyles()` to include new properties:
```typescript
export const getDefaultCellStyles = () => ({
  fontName: undefined,
  fontWeight: 'normal',
  fontStyle: 'normal',
  alignment: DEFAULT_ALIGNMENT,
  verticalAlignment: VERTICAL_ALIGN_MIDDLE,
  fontSize: DEFAULT_FONT_SIZE,
  lineHeight: DEFAULT_LINE_HEIGHT,
  characterSpacing: DEFAULT_CHARACTER_SPACING,
  fontColor: DEFAULT_FONT_COLOR,
  backgroundColor: '',
  borderColor: '#888888',
  borderWidth: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
  padding: { top: 5, bottom: 5, left: 5, right: 5 },
  textDecoration: 'none',
  textTransform: 'none',
  whiteSpace: 'normal',
  wordBreak: 'normal',
});
```

2. Add helper function to merge cell styles:
```typescript
export const mergeCellStyles = (
  baseStyles: Partial<CellStyle>,
  ...overrides: Partial<CellStyle>[]
): CellStyle => {
  // Deep merge with proper precedence
};
```

3. Add helper to resolve effective cell style:
```typescript
export const resolveEffectiveCellStyle = (
  schema: TableSchema,
  rowIndex: number,
  colIndex: number,
  section: 'head' | 'body'
): CellStyle => {
  // Resolve styles with precedence: cell > row > column > section > default
};
```

**Deliverables:**
- [ ] Updated helper functions
- [ ] Style resolution logic implemented
- [ ] Unit tests for helper functions

---

## Phase 2: PDF Rendering Implementation (Week 2)

### Task 2.1: Update Cell Rendering for Font Properties
**Duration:** 6 hours
**File:** `packages/schemas/src/tables/cell.ts`

**Steps:**
1. Modify `pdfRender` to support font weight:
```typescript
const cellSchema: Plugin<CellSchema> = {
  pdf: async (arg) => {
    const { schema } = arg;
    const { position, width, height, borderWidth, padding } = schema;

    await Promise.all([
      // BACKGROUND (existing)
      rectanglePdfRender({ /* ... */ }),

      // BORDERS (existing)
      renderLine(/* ... */),
    ]);

    // TEXT with new properties
    await textPdfRender({
      ...arg,
      schema: {
        ...schema,
        type: 'text',
        fontWeight: schema.fontWeight, // 🆕
        fontStyle: schema.fontStyle, // 🆕
        textDecoration: schema.textDecoration, // 🆕
        textTransform: schema.textTransform, // 🆕
        backgroundColor: '',
        position: {
          x: position.x + borderWidth.left + padding.left,
          y: position.y + borderWidth.top + padding.top,
        },
        width: width - borderWidth.left - borderWidth.right - padding.left - padding.right,
        height: height - borderWidth.top - borderWidth.bottom - padding.top - padding.bottom,
      },
    });
  },
  // ... ui and propPanel
};
```

2. Verify font weight rendering with pdf-lib
3. Handle fallback for fonts without bold variant

**Deliverables:**
- [ ] Font weight rendering in PDF
- [ ] Font style (italic) rendering
- [ ] Fallback handling for unsupported fonts
- [ ] Visual tests

### Task 2.2: Implement Row Group Rendering
**Duration:** 8 hours
**File:** `packages/schemas/src/tables/pdfRender.ts`

**Steps:**
1. Add row group rendering logic:
```typescript
async function drawRowGroup(
  arg: PDFRenderProps<TableSchema>,
  table: Table,
  rowGroup: RowGroup,
  cursor: Pos,
): Promise<void> {
  if (!rowGroup.colspan) return;

  // Create merged cell spanning all columns
  const cell = new Cell({
    raw: rowGroup.title,
    styles: rowGroup.styles,
    width: table.getWidth(),
    height: calculateRowGroupHeight(rowGroup),
  });

  cell.x = cursor.x;
  cell.y = cursor.y;

  await drawCell(arg, cell);

  cursor.y += cell.height;
}
```

2. Update `drawTable` to include row groups:
```typescript
async function drawTable(arg: PDFRenderProps<TableSchema>, table: Table): Promise<void> {
  const settings = table.settings;
  const startY = settings.startY;
  const margin = settings.margin;
  const cursor = { x: margin.left, y: startY };
  const startPos = Object.assign({}, cursor);

  // Draw header
  if (settings.showHead) {
    for (const row of table.head) {
      await drawRow(arg, table, row, cursor, table.columns);
    }
  }

  // Draw body with row groups 🆕
  let currentBodyRowIndex = 0;
  for (const row of table.body) {
    // Check if row group should be inserted before this row
    const rowGroup = table.rowGroups.find(rg => rg.startRow === currentBodyRowIndex);
    if (rowGroup) {
      await drawRowGroup(arg, table, rowGroup, cursor);
    }

    await drawRow(arg, table, row, cursor, table.columns);
    currentBodyRowIndex++;
  }

  await drawTableBorder(arg, table, startPos, cursor);
}
```

**Deliverables:**
- [ ] Row group rendering in PDF
- [ ] Proper positioning and spacing
- [ ] Integration with existing table rendering
- [ ] Visual tests with row groups

### Task 2.3: Implement Cell Merging in PDF
**Duration:** 10 hours
**File:** `packages/schemas/src/tables/pdfRender.ts`, `classes.ts`

**Steps:**
1. Add cell merge processing to table construction:
```typescript
// In tableHelper.ts
export const createSingleTable = async (
  body: string[][],
  args: CreateTableArgs
): Promise<Table> => {
  // ... existing code

  // Process cell merges 🆕
  if (schema.cellMerge) {
    processCellMerges(table, schema.cellMerge);
  }

  return table;
};

function processCellMerges(
  table: Table,
  mergeConfig: TableSchema['cellMerge']
): void {
  if (!mergeConfig) return;

  for (const [rowIndex, rowMerges] of Object.entries(mergeConfig)) {
    for (const [colIndex, merge] of Object.entries(rowMerges)) {
      const row = table.body[parseInt(rowIndex)];
      const cell = row.cells[parseInt(colIndex)];

      if (merge.colspan) {
        cell.colSpan = merge.colspan;
        cell.width *= merge.colspan;

        // Mark merged cells
        for (let i = 1; i < merge.colspan; i++) {
          const mergedCell = row.cells[parseInt(colIndex) + i];
          mergedCell.isMerged = true;
          mergedCell.mergedWith = { row: parseInt(rowIndex), col: parseInt(colIndex) };
        }
      }

      if (merge.rowspan) {
        cell.rowSpan = merge.rowspan;
        // Handle rowspan logic
      }
    }
  }
}
```

2. Update `drawRow` to skip merged cells:
```typescript
async function drawRow(
  arg: PDFRenderProps<TableSchema>,
  table: Table,
  row: Row,
  cursor: Pos,
  columns: Column[],
) {
  cursor.x = table.settings.margin.left;
  for (const column of columns) {
    const cell = row.cells[column.index];
    if (!cell || cell.isMerged) {
      cursor.x += column.width;
      continue;
    }

    cell.x = cursor.x;
    cell.y = cursor.y;

    await drawCell(arg, cell);

    cursor.x += cell.colSpan > 1 ? cell.width : column.width;
  }
  cursor.y += row.height;
}
```

**Deliverables:**
- [ ] Cell merging logic implemented
- [ ] Colspan rendering in PDF
- [ ] Rowspan rendering in PDF
- [ ] Edge case handling (overlapping merges)
- [ ] Unit tests for merge logic

### Task 2.4: Implement Row-Specific Styling
**Duration:** 6 hours
**File:** `packages/schemas/src/tables/tableHelper.ts`

**Steps:**
1. Update style resolution in table creation:
```typescript
function applyCellStyles(
  cell: Cell,
  schema: TableSchema,
  rowIndex: number,
  colIndex: number,
  section: 'head' | 'body'
): void {
  let effectiveStyles: Partial<Styles> = {};

  // Base styles (section-level)
  if (section === 'head') {
    effectiveStyles = { ...schema.headStyles };
  } else {
    effectiveStyles = { ...schema.bodyStyles };

    // Alternating row color
    if (rowIndex % 2 === 1 && schema.bodyStyles.alternateBackgroundColor) {
      effectiveStyles.backgroundColor = schema.bodyStyles.alternateBackgroundColor;
    }
  }

  // Column styles 🆕
  if (schema.columnStyles?.alignment?.[colIndex]) {
    effectiveStyles.alignment = schema.columnStyles.alignment[colIndex];
  }

  // Row styles 🆕
  if (schema.rowStyles?.[rowIndex]) {
    effectiveStyles = { ...effectiveStyles, ...schema.rowStyles[rowIndex] };
  }

  // Cell styles (highest priority) 🆕
  if (schema.cellStyles?.[rowIndex]?.[colIndex]) {
    effectiveStyles = { ...effectiveStyles, ...schema.cellStyles[rowIndex][colIndex] };
  }

  // Apply to cell
  Object.assign(cell.styles, effectiveStyles);
}
```

**Deliverables:**
- [ ] Row styling implemented
- [ ] Cell styling implemented
- [ ] Style precedence working correctly
- [ ] Unit tests for style resolution

---

## Phase 3: UI Rendering Implementation (Week 3)

### Task 3.1: Update UI Cell Rendering
**Duration:** 6 hours
**File:** `packages/schemas/src/tables/cell.ts`

**Steps:**
1. Update `uiRender` to support new CSS properties:
```typescript
ui: async (arg) => {
  const { schema, rootElement } = arg;
  const { borderWidth, width, height, borderColor, backgroundColor } = schema;

  rootElement.style.backgroundColor = backgroundColor;

  const textDiv = createTextDiv(schema);

  // Apply new styles 🆕
  if (schema.fontWeight) {
    textDiv.style.fontWeight = schema.fontWeight;
  }
  if (schema.fontStyle) {
    textDiv.style.fontStyle = schema.fontStyle;
  }
  if (schema.textDecoration) {
    textDiv.style.textDecoration = schema.textDecoration;
  }
  if (schema.textTransform) {
    textDiv.style.textTransform = schema.textTransform;
  }
  if (schema.whiteSpace) {
    textDiv.style.whiteSpace = schema.whiteSpace;
  }
  if (schema.wordBreak) {
    textDiv.style.wordBreak = schema.wordBreak;
  }

  await textUiRender({
    ...arg,
    schema: { ...schema, backgroundColor: '' },
    rootElement: textDiv,
  });
  rootElement.appendChild(textDiv);

  const lines = [
    createLineDiv(`${width}mm`, `${borderWidth.top}mm`, '0mm', null, null, '0mm', borderColor),
    createLineDiv(`${width}mm`, `${borderWidth.bottom}mm`, null, null, '0mm', '0mm', borderColor),
    createLineDiv(`${borderWidth.left}mm`, `${height}mm`, '0mm', null, null, '0mm', borderColor),
    createLineDiv(`${borderWidth.right}mm`, `${height}mm`, '0mm', '0mm', null, null, borderColor),
  ];

  lines.forEach((line) => rootElement.appendChild(line));
}
```

**Deliverables:**
- [ ] Font properties rendering in UI
- [ ] Text decoration rendering
- [ ] Visual parity with PDF output
- [ ] Browser compatibility tested

### Task 3.2: Implement Row Group UI Rendering
**Duration:** 8 hours
**File:** `packages/schemas/src/tables/uiRender.ts`

**Steps:**
1. Create row group rendering function:
```typescript
async function renderRowGroup(
  arg: UIRenderProps<TableSchema>,
  rowGroup: RowGroup,
  container: HTMLElement,
  yOffset: number
): Promise<number> {
  const groupDiv = document.createElement('div');
  groupDiv.style.position = 'absolute';
  groupDiv.style.width = `${rowGroup.cell.width}mm`;
  groupDiv.style.height = `${rowGroup.cell.height}mm`;
  groupDiv.style.top = `${yOffset}mm`;
  groupDiv.style.left = '0mm';

  // Render as a merged cell
  await cellUiRender({
    ...arg,
    schema: {
      type: 'cell',
      name: '',
      content: rowGroup.title,
      position: { x: 0, y: yOffset },
      width: rowGroup.cell.width,
      height: rowGroup.cell.height,
      ...rowGroup.styles,
    },
    rootElement: groupDiv,
  });

  container.appendChild(groupDiv);

  return yOffset + rowGroup.cell.height;
}
```

2. Update main UI render to include row groups

**Deliverables:**
- [ ] Row groups visible in Designer
- [ ] Row groups visible in Form/Viewer
- [ ] Proper positioning and layout
- [ ] Interactive editing support

### Task 3.3: Implement Cell Merging in UI
**Duration:** 8 hours
**File:** `packages/schemas/src/tables/uiRender.ts`

**Steps:**
1. Update cell rendering to handle merged cells:
```typescript
function renderTableCell(
  cell: Cell,
  container: HTMLElement,
  isMerged: boolean
): void {
  if (isMerged) return; // Skip rendering merged cells

  const cellDiv = document.createElement('div');
  cellDiv.style.position = 'absolute';
  cellDiv.style.left = `${cell.x}mm`;
  cellDiv.style.top = `${cell.y}mm`;
  cellDiv.style.width = `${cell.width}mm`;
  cellDiv.style.height = `${cell.height}mm`;

  if (cell.colSpan > 1) {
    cellDiv.setAttribute('data-colspan', String(cell.colSpan));
  }
  if (cell.rowSpan > 1) {
    cellDiv.setAttribute('data-rowspan', String(cell.rowSpan));
  }

  // Render cell content
  container.appendChild(cellDiv);
}
```

**Deliverables:**
- [ ] Merged cells rendering in UI
- [ ] Grid layout handles merges correctly
- [ ] Visual tests passing

---

## Phase 4: PropPanel UI Integration (Week 3-4)

### Task 4.1: Add Font Property Controls
**Duration:** 6 hours
**File:** `packages/schemas/src/tables/propPanel.ts`

**Steps:**
1. Update `getCellPropPanelSchema` to include font controls:
```typescript
export const getCellPropPanelSchema = (arg: {
  i18n: (key: string) => string;
  fallbackFontName: string;
  fontNames: string[];
  isBody?: boolean;
}) => {
  const { i18n, fallbackFontName, fontNames, isBody } = arg;

  return {
    fontName: { /* existing */ },

    // 🆕 Font weight
    fontWeight: {
      title: i18n('schemas.text.fontWeight'),
      type: 'string',
      widget: 'select',
      default: 'normal',
      props: {
        options: [
          { label: i18n('schemas.fontWeight.normal'), value: 'normal' },
          { label: i18n('schemas.fontWeight.bold'), value: 'bold' },
          { label: '100 (Thin)', value: '100' },
          { label: '200 (Extra Light)', value: '200' },
          { label: '300 (Light)', value: '300' },
          { label: '400 (Normal)', value: '400' },
          { label: '500 (Medium)', value: '500' },
          { label: '600 (Semi Bold)', value: '600' },
          { label: '700 (Bold)', value: '700' },
          { label: '800 (Extra Bold)', value: '800' },
          { label: '900 (Black)', value: '900' },
        ],
      },
      span: 8,
    },

    // 🆕 Font style
    fontStyle: {
      title: i18n('schemas.text.fontStyle'),
      type: 'string',
      widget: 'select',
      default: 'normal',
      props: {
        options: [
          { label: i18n('schemas.fontStyle.normal'), value: 'normal' },
          { label: i18n('schemas.fontStyle.italic'), value: 'italic' },
          { label: i18n('schemas.fontStyle.oblique'), value: 'oblique' },
        ],
      },
      span: 8,
    },

    fontSize: { /* existing */ },
    characterSpacing: { /* existing */ },
    alignment: { /* existing */ },
    verticalAlignment: { /* existing */ },
    lineHeight: { /* existing */ },

    // 🆕 Text decoration
    textDecoration: {
      title: i18n('schemas.text.textDecoration'),
      type: 'string',
      widget: 'select',
      default: 'none',
      props: {
        options: [
          { label: i18n('schemas.textDecoration.none'), value: 'none' },
          { label: i18n('schemas.textDecoration.underline'), value: 'underline' },
          { label: i18n('schemas.textDecoration.lineThrough'), value: 'line-through' },
        ],
      },
      span: 8,
    },

    fontColor: { /* existing */ },
    borderColor: { /* existing */ },
    backgroundColor: { /* existing */ },

    // ... rest of existing properties
  };
};
```

2. Update i18n translations for new labels

**Deliverables:**
- [ ] Font weight selector in PropPanel
- [ ] Font style selector in PropPanel
- [ ] Text decoration selector in PropPanel
- [ ] i18n translations added
- [ ] UI tests for PropPanel

### Task 4.2: Add Row Group Configuration UI
**Duration:** 8 hours
**File:** `packages/schemas/src/tables/propPanel.ts`

**Steps:**
1. Add row groups configuration to PropPanel:
```typescript
export const propPanel: PropPanel<TableSchema> = {
  schema: ({ activeSchema, options, i18n }) => {
    const tableSchema = activeSchema as TableSchema;
    const head = tableSchema.head || [];
    const showHead = tableSchema.showHead || false;
    const font = options.font || { [DEFAULT_FONT_NAME]: { data: '', fallback: true } };
    const fontNames = Object.keys(font);
    const fallbackFontName = getFallbackFontName(font);

    return {
      showHead: { /* existing */ },
      '-------': { type: 'void', widget: 'Divider' },

      // 🆕 Row Groups
      rowGroups: {
        title: i18n('schemas.table.rowGroups'),
        type: 'array',
        widget: 'ArrayCards',
        span: 24,
        items: {
          type: 'object',
          properties: {
            title: {
              title: i18n('schemas.table.rowGroupTitle'),
              type: 'string',
              widget: 'input',
            },
            startRow: {
              title: i18n('schemas.table.startRow'),
              type: 'number',
              widget: 'inputNumber',
              props: { min: 0 },
            },
            endRow: {
              title: i18n('schemas.table.endRow'),
              type: 'number',
              widget: 'inputNumber',
              props: { min: 0 },
            },
            colspan: {
              title: i18n('schemas.table.spanAllColumns'),
              type: 'boolean',
              widget: 'checkbox',
            },
            styles: {
              title: i18n('schemas.table.rowGroupStyles'),
              type: 'object',
              widget: 'Card',
              properties: getCellPropPanelSchema({ i18n, fallbackFontName, fontNames }),
            },
          },
        },
      },

      tableStyles: { /* existing */ },
      headStyles: { /* existing */ },
      bodyStyles: { /* existing */ },
      columnStyles: { /* existing */ },

      // 🆕 Row Styles
      rowStyles: {
        title: i18n('schemas.table.rowStyles'),
        type: 'object',
        widget: 'Card',
        span: 24,
        description: i18n('schemas.table.rowStylesDescription'),
        properties: {
          // Dynamic based on number of rows
          // Can be configured via JSON for now
        },
      },
    };
  },
  defaultSchema: {
    /* existing defaults */
    rowGroups: [], // 🆕
    rowStyles: {}, // 🆕
    cellStyles: {}, // 🆕
    cellMerge: {}, // 🆕
  },
};
```

**Deliverables:**
- [ ] Row groups array editor in PropPanel
- [ ] Row styles configuration UI
- [ ] User-friendly interface
- [ ] Validation for row indices

### Task 4.3: Add Cell Merge Configuration UI
**Duration:** 6 hours

**Steps:**
1. Create visual cell merge editor:
   - Table grid with clickable cells
   - Select cells to merge
   - Configure colspan/rowspan visually

2. Add JSON configuration option for advanced users

**Deliverables:**
- [ ] Visual cell merge editor
- [ ] JSON configuration support
- [ ] Preview of merged cells
- [ ] Validation for merge conflicts

---

## Phase 5: Text Schema Integration (Week 4)

### Task 5.1: Add Font Weight to Text Schema
**Duration:** 8 hours
**Files:** `packages/schemas/src/text/types.ts`, `pdfRender.ts`, `uiRender.ts`

**Steps:**
1. Update text schema types:
```typescript
// In packages/schemas/src/text/types.ts
export interface TextSchema extends Schema {
  // ... existing properties
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}
```

2. Update PDF rendering in `packages/schemas/src/text/pdfRender.ts`:
```typescript
export const pdfRender = async (arg: PDFRenderProps<TextSchema>) => {
  const { pdfDoc, pdfPage, schema, options, _cache } = arg;
  const { font, getFontProp, colorRgbGetter } = options;

  // Get font with weight support
  const fontName = schema.fontName || getFallbackFontName(font);
  const fontWeight = schema.fontWeight || 'normal';
  const fontStyle = schema.fontStyle || 'normal';

  // Load appropriate font variant
  const fontKey = `${fontName}-${fontWeight}-${fontStyle}`;
  let pdfFont = _cache.get(fontKey);

  if (!pdfFont) {
    pdfFont = await loadFontWithWeight(pdfDoc, font, fontName, fontWeight, fontStyle);
    _cache.set(fontKey, pdfFont);
  }

  // Apply text transform
  let text = schema.content || '';
  if (schema.textTransform) {
    text = applyTextTransform(text, schema.textTransform);
  }

  // Draw text with font
  pdfPage.drawText(text, {
    font: pdfFont,
    size: schema.fontSize,
    color: colorRgbGetter(schema.fontColor),
    // ... other options
  });

  // Apply text decoration if needed
  if (schema.textDecoration === 'underline') {
    drawUnderline(pdfPage, /* params */);
  } else if (schema.textDecoration === 'line-through') {
    drawStrikethrough(pdfPage, /* params */);
  }
};
```

3. Implement font loading with weight:
```typescript
async function loadFontWithWeight(
  pdfDoc: PDFDocument,
  fontMap: Font,
  fontName: string,
  fontWeight: string,
  fontStyle: string
): Promise<PDFFont> {
  // Try to find font variant
  const variantName = `${fontName}-${fontWeight === 'bold' ? 'Bold' : ''}-${fontStyle === 'italic' ? 'Italic' : ''}`;

  if (fontMap[variantName]) {
    return await pdfDoc.embedFont(fontMap[variantName].data);
  }

  // Fallback to base font
  const baseFont = fontMap[fontName];
  if (!baseFont) {
    throw new Error(`Font ${fontName} not found`);
  }

  const embeddedFont = await pdfDoc.embedFont(baseFont.data);

  // If bold requested but no bold variant, use fake bold (increase line width)
  // Note: This is a limitation - real bold variants are better

  return embeddedFont;
}
```

4. Implement text transform helper:
```typescript
function applyTextTransform(text: string, transform: string): string {
  switch (transform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.replace(/\b\w/g, c => c.toUpperCase());
    default:
      return text;
  }
}
```

5. Update UI rendering in `packages/schemas/src/text/uiRender.ts`:
```typescript
export const uiRender = async (arg: UIRenderProps<TextSchema>) => {
  const { rootElement, schema } = arg;

  // Apply font weight
  if (schema.fontWeight) {
    rootElement.style.fontWeight = schema.fontWeight;
  }

  // Apply font style
  if (schema.fontStyle) {
    rootElement.style.fontStyle = schema.fontStyle;
  }

  // Apply text decoration
  if (schema.textDecoration) {
    rootElement.style.textDecoration = schema.textDecoration;
  }

  // Apply text transform
  if (schema.textTransform) {
    rootElement.style.textTransform = schema.textTransform;
  }

  // ... rest of rendering
};
```

**Deliverables:**
- [ ] Font weight support in text schema
- [ ] Font loading with variants
- [ ] Text decoration rendering (underline, strikethrough)
- [ ] Text transform support
- [ ] Fallback handling for missing font variants
- [ ] Unit tests for text rendering
- [ ] Visual regression tests

---

## Phase 6: Testing & Validation (Week 5)

### Task 6.1: Unit Tests
**Duration:** 12 hours
**Files:** `packages/schemas/__tests__/tables/*.test.ts`

**Steps:**
1. Create test files:
```typescript
// packages/schemas/__tests__/tables/rowGroups.test.ts
describe('Table Row Groups', () => {
  it('should render row group with spanning columns', async () => {
    const schema: TableSchema = {
      type: 'table',
      rowGroups: [{
        title: 'PRIMARY FINDINGS',
        startRow: 0,
        colspan: true,
        styles: {
          backgroundColor: '#1a3a52',
          fontColor: '#ffffff',
          fontWeight: 'bold',
        }
      }],
      // ... rest of schema
    };

    const result = await pdfRender({ schema, /* ... */ });
    expect(result).toMatchSnapshot();
  });

  it('should handle multiple row groups', () => { /* ... */ });
  it('should validate row group indices', () => { /* ... */ });
});

// packages/schemas/__tests__/tables/cellMerge.test.ts
describe('Table Cell Merging', () => {
  it('should merge cells horizontally (colspan)', () => { /* ... */ });
  it('should merge cells vertically (rowspan)', () => { /* ... */ });
  it('should handle complex merge scenarios', () => { /* ... */ });
  it('should prevent overlapping merges', () => { /* ... */ });
});

// packages/schemas/__tests__/tables/styling.test.ts
describe('Table Styling', () => {
  it('should apply font weight to cells', () => { /* ... */ });
  it('should resolve style precedence correctly', () => { /* ... */ });
  it('should apply row-specific styles', () => { /* ... */ });
  it('should apply cell-specific styles', () => { /* ... */ });
});
```

2. Run tests:
```bash
npm run test -- packages/schemas/__tests__/tables
```

**Deliverables:**
- [ ] Unit tests for row groups (>90% coverage)
- [ ] Unit tests for cell merging (>90% coverage)
- [ ] Unit tests for styling (>90% coverage)
- [ ] All tests passing

### Task 6.2: Visual Regression Tests
**Duration:** 8 hours
**Files:** `packages/schemas/__tests__/visual/tables/*.test.ts`

**Steps:**
1. Create Figma design replication test:
```typescript
// packages/schemas/__tests__/visual/figma-medical-table.test.ts
describe('Figma Medical Findings Table', () => {
  it('should match Figma design', async () => {
    const schema: TableSchema = {
      type: 'table',
      showHead: true,
      head: ['Disease', 'Inheritance Pattern', 'Gene / Variant', 'Genotype', 'Variant Type', 'Inherited From', 'Variant Classification'],
      headWidthPercentages: [15, 12, 18, 12, 12, 12, 19],
      headStyles: {
        fontWeight: 'bold',
        backgroundColor: '#2c5282',
        fontColor: '#ffffff',
        alignment: 'center',
        fontSize: 10,
        padding: { top: 8, bottom: 8, left: 5, right: 5 },
      },
      rowGroups: [
        {
          title: 'PRIMARY FINDINGS',
          startRow: 0,
          colspan: true,
          styles: {
            fontWeight: 'bold',
            backgroundColor: '#1a3a52',
            fontColor: '#ffffff',
            alignment: 'left',
            fontSize: 11,
            padding: { top: 6, bottom: 6, left: 10, right: 10 },
          }
        },
        {
          title: 'ACMG SECONDARY FINDINGS',
          startRow: 3,
          colspan: true,
          styles: {
            fontWeight: 'bold',
            backgroundColor: '#1a3a52',
            fontColor: '#ffffff',
            alignment: 'left',
            fontSize: 11,
            padding: { top: 6, bottom: 6, left: 10, right: 10 },
          }
        }
      ],
      bodyStyles: {
        backgroundColor: '#ffffff',
        alternateBackgroundColor: '#f9fafb',
        fontColor: '#000000',
        fontSize: 9,
        alignment: 'left',
        padding: { top: 6, bottom: 6, left: 5, right: 5 },
      },
      content: JSON.stringify([
        ['Cornelia De Lange Syndrome 1', 'Autosomal Dominant', 'NIPBL c.2479del, p.R87Gfs*20', 'Heterozygous', 'Sequence Variant', 'De Novo', 'Pathogenic'],
        ['KMT2D-Related Disorders', 'Autosomal Dominant', 'KMT2D: c.1952C>G, p.S651W', 'Heterozygous', 'Sequence Variant', 'De Novo', 'Variant of Uncertain Significance'],
        ['Neurodevelopmental Disorder', 'Autosomal Dominant', 'BAZ2B:HG38 chr2:159670492-159491775 del 21.28(kb)', 'Heterozygous', 'Sequence Variant', 'De Novo', 'Variant of Uncertain Significance'],
        ['KCNQ1-Related Arrhythmias', 'Autosomal Dominant', 'KCNQ1: c.1552C>T, p.R518*', 'Heterozygous', 'Sequence Variant', 'N/A', 'Pathogenic'],
      ]),
    };

    const pdf = await generate({ template: { schemas: [[schema]] }, inputs: [{}] });
    const pdfImage = await pdfToImage(pdf);

    expect(pdfImage).toMatchImageSnapshot({
      customSnapshotIdentifier: 'figma-medical-table',
      failureThreshold: 0.05, // 5% difference allowed
      failureThresholdType: 'percent',
    });
  });
});
```

2. Create snapshot tests for all features:
```bash
npm run test:ui:update-snapshots
```

**Deliverables:**
- [ ] Visual regression test for Figma design
- [ ] Snapshot tests for all table features
- [ ] Image comparison passing
- [ ] Screenshot artifacts stored

### Task 6.3: Integration Tests
**Duration:** 6 hours

**Steps:**
1. Test in playground:
```bash
cd playground
npm run dev
```

2. Create test templates:
   - Simple table with bold headers
   - Table with row groups
   - Table with merged cells
   - Figma medical table replica

3. Test in all UI modes:
   - Designer
   - Form
   - Viewer

4. Test PDF generation

**Deliverables:**
- [ ] Playground examples created
- [ ] All UI modes tested
- [ ] PDF generation verified
- [ ] Cross-browser testing completed

### Task 6.4: Performance Testing
**Duration:** 4 hours

**Steps:**
1. Create large table test (100+ rows):
```typescript
describe('Table Performance', () => {
  it('should render large table efficiently', async () => {
    const startTime = performance.now();

    const schema = createLargeTableSchema(100); // 100 rows
    await pdfRender({ schema, /* ... */ });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(2000); // Less than 2 seconds
  });
});
```

2. Profile memory usage
3. Test with complex styling
4. Optimize if needed

**Deliverables:**
- [ ] Performance benchmarks established
- [ ] Large table rendering under 2s
- [ ] Memory usage acceptable (<100MB)
- [ ] No memory leaks detected

---

## Phase 7: Documentation (Week 5-6)

### Task 7.1: API Documentation
**Duration:** 8 hours
**File:** `website/docs/tables-advanced.md`

**Steps:**
1. Create comprehensive documentation:
```markdown
# Advanced Table Features

## Font Styling

### Font Weight
Control the weight (boldness) of text in table cells:

\`\`\`typescript
const schema: TableSchema = {
  headStyles: {
    fontWeight: 'bold', // or '100' through '900'
  },
  bodyStyles: {
    fontWeight: 'normal',
  }
};
\`\`\`

Supported values:
- `'normal'` - Regular weight (400)
- `'bold'` - Bold weight (700)
- `'100'` through `'900'` - Numeric weights

### Font Style
\`\`\`typescript
fontStyle: 'italic' // 'normal' | 'italic' | 'oblique'
\`\`\`

## Row Groups

Create section headers that span the full table width:

\`\`\`typescript
const schema: TableSchema = {
  rowGroups: [
    {
      title: 'PRIMARY FINDINGS',
      startRow: 0,
      colspan: true,
      styles: {
        backgroundColor: '#1a3a52',
        fontColor: '#ffffff',
        fontWeight: 'bold',
      }
    }
  ]
};
\`\`\`

## Cell Merging

Merge cells horizontally or vertically:

\`\`\`typescript
const schema: TableSchema = {
  cellMerge: {
    0: { // Row index
      0: { // Column index
        colspan: 2, // Merge 2 columns
        rowspan: 1,
      }
    }
  }
};
\`\`\`

## Styling Precedence

Styles are applied in this order (later overrides earlier):
1. Default styles
2. Section styles (`headStyles`, `bodyStyles`)
3. Column styles (`columnStyles`)
4. Row styles (`rowStyles`)
5. Cell styles (`cellStyles`)

## Complete Example: Medical Report Table

[Include full Figma example with explanation]
\`\`\`
```

2. Add JSDoc comments to all public APIs
3. Create migration guide
4. Add troubleshooting section

**Deliverables:**
- [ ] API documentation complete
- [ ] Migration guide published
- [ ] Troubleshooting section added
- [ ] Code examples tested

### Task 7.2: Tutorial & Examples
**Duration:** 6 hours

**Steps:**
1. Create step-by-step tutorial:
   - "How to Create a Medical Report Table"
   - "Understanding Style Precedence"
   - "Working with Row Groups"

2. Add to playground:
```typescript
// playground/examples/medical-findings-table.json
{
  "name": "Medical Findings Table",
  "description": "Replication of Figma design with row groups and advanced styling",
  "template": { /* ... */ }
}
```

**Deliverables:**
- [ ] 3+ tutorials written
- [ ] Playground examples added
- [ ] Video walkthrough (optional)
- [ ] Blog post (optional)

### Task 7.3: Update Changelog
**Duration:** 2 hours
**File:** `CHANGELOG.md`

**Steps:**
```markdown
## [Unreleased]

### Added
- **Font Weight Support**: Added `fontWeight` property to table cell styles supporting values from '100' to '900' and 'normal'/'bold'
- **Font Style Support**: Added `fontStyle` property for italic/oblique text in tables
- **Row Groups**: Added ability to create section headers that span all columns using `rowGroups` property
- **Cell Merging**: Added `cellMerge` property for horizontal (colspan) and vertical (rowspan) cell merging
- **Row-Specific Styling**: Added `rowStyles` property to apply custom styles to specific rows
- **Individual Cell Styling**: Added `cellStyles` property for granular cell-level styling
- **Text Decoration**: Added `textDecoration` property for underline and strikethrough
- **Text Transform**: Added `textTransform` property for uppercase/lowercase/capitalize
- **Text Wrapping Control**: Added `whiteSpace` and `wordBreak` properties for better text flow control

### Changed
- Updated `CellStyle` interface with new typography properties
- Enhanced style resolution to support precedence: cell > row > column > section > default
- Improved table rendering performance for large tables

### Fixed
- Border rendering at cell intersections
- Style inheritance in nested table structures

### Migration Guide
All new properties are optional and backward compatible. Existing tables will continue to work without any changes.

To use new features:
1. Update `@pdfme/schemas` to version X.X.X
2. Add new properties to your table schema
3. See [Advanced Table Documentation](link) for examples
```

**Deliverables:**
- [ ] Changelog updated
- [ ] Migration notes added
- [ ] Breaking changes documented (if any)

---

## Phase 8: Final Integration & Release (Week 6)

### Task 8.1: Code Review
**Duration:** 8 hours

**Steps:**
1. Self-review checklist:
   - [ ] All TypeScript errors resolved
   - [ ] No ESLint warnings
   - [ ] Code formatted with Prettier
   - [ ] No console.log statements
   - [ ] No commented-out code
   - [ ] All TODOs addressed

2. Create pull request:
```bash
git add .
git commit -m "feat(table): add comprehensive table design support

- Add font weight, font style, text decoration support
- Implement row groups for section headers
- Add cell merging (colspan/rowspan)
- Support row-specific and cell-specific styling
- Update PropPanel UI with new controls
- Add visual regression tests
- Update documentation

Fixes #XXX"

git push origin feature/comprehensive-table-design
```

3. Request peer review
4. Address review comments

**Deliverables:**
- [ ] Pull request created
- [ ] Code review completed
- [ ] All comments addressed
- [ ] Approval received

### Task 8.2: Final Testing
**Duration:** 6 hours

**Steps:**
1. Run full test suite:
```bash
npm run test
npm run test:ui:update-snapshots
npm run lint
```

2. Manual testing:
   - [ ] Create Figma table in Designer
   - [ ] Preview in Viewer
   - [ ] Generate PDF
   - [ ] Test in different browsers
   - [ ] Test on mobile (responsive)

3. Verify backward compatibility:
   - [ ] Load old table templates
   - [ ] Ensure no visual regressions
   - [ ] Test migration path

**Deliverables:**
- [ ] All automated tests passing
- [ ] Manual test checklist completed
- [ ] No regressions found
- [ ] Sign-off from QA

### Task 8.3: Build & Deploy
**Duration:** 4 hours

**Steps:**
1. Build all packages:
```bash
npm run build
```

2. Version bump (following semver):
```bash
# If minor feature
npm version minor

# Update package versions
lerna version minor --no-git-tag-version
```

3. Create release notes:
```markdown
# Release v2.X.0 - Comprehensive Table Design

We're excited to announce major enhancements to the table schema, enabling creation of complex, professional tables like those found in medical reports, financial statements, and legal documents.

## 🎉 New Features

### Font Styling
- **Font Weight**: Full control from thin (100) to black (900)
- **Font Style**: Italic and oblique support
- **Text Decoration**: Underline and strikethrough

### Row Groups
Create section headers that span the entire table width - perfect for categorizing data:

[Screenshot of row groups]

### Cell Merging
Merge cells horizontally (colspan) or vertically (rowspan):

[Screenshot of merged cells]

### Advanced Styling
- Row-specific styles for individual row customization
- Cell-specific styles for granular control
- Complete style precedence system

## 📚 Documentation
- [Advanced Table Guide](link)
- [Migration Guide](link)
- [API Reference](link)

## 🙏 Acknowledgments
Special thanks to the community for feature requests and feedback!

## 📦 Installation
\`\`\`bash
npm install @pdfme/schemas@latest
\`\`\`
```

4. Publish to npm:
```bash
npm publish --access public
```

5. Create GitHub release
6. Update documentation site

**Deliverables:**
- [ ] Version bumped
- [ ] Packages published to npm
- [ ] GitHub release created
- [ ] Documentation site updated
- [ ] Release announcement posted

---

## Risk Management

### High-Risk Areas

1. **Font Weight with pdf-lib**
   - **Risk**: pdf-lib may not support all font variants
   - **Mitigation**:
     - Implement font fallback system
     - Test with multiple fonts
     - Document limitations
     - Consider synthetic bold as fallback

2. **Backward Compatibility**
   - **Risk**: Changes might break existing tables
   - **Mitigation**:
     - All new properties optional
     - Comprehensive migration testing
     - Maintain default behavior
     - Version compatibility matrix

3. **Performance with Large Tables**
   - **Risk**: Complex styling could slow rendering
   - **Mitigation**:
     - Performance benchmarks
     - Optimize style resolution
     - Implement caching
     - Lazy rendering for UI

4. **Cell Merge Edge Cases**
   - **Risk**: Overlapping merges or invalid configurations
   - **Mitigation**:
     - Validation logic for merge conflicts
     - Clear error messages
     - Visual editor with conflict prevention
     - Comprehensive test cases

### Medium-Risk Areas

1. **PropPanel UI Complexity**
   - **Risk**: Too many options overwhelming users
   - **Mitigation**:
     - Progressive disclosure
     - Sensible defaults
     - Preset templates
     - Good documentation

2. **Cross-Browser Compatibility**
   - **Risk**: Styling differences across browsers
   - **Mitigation**:
     - Test on all major browsers
     - Use standard CSS properties
     - Polyfills where needed

---

## Success Criteria

### Must Have (P0)
- [ ] Figma design can be replicated 100%
- [ ] All Phase 1 features implemented
- [ ] No regressions in existing functionality
- [ ] All tests passing (>90% coverage)
- [ ] Documentation complete
- [ ] Peer review approved

### Should Have (P1)
- [ ] Performance meets benchmarks
- [ ] PropPanel UI intuitive
- [ ] Migration guide available
- [ ] Playground examples working

### Nice to Have (P2)
- [ ] Video tutorials
- [ ] Blog post announcement
- [ ] Community feedback incorporated
- [ ] Advanced examples (financial, legal tables)

---

## Timeline Summary

| Phase | Duration | Tasks | Key Deliverables |
|-------|----------|-------|------------------|
| Phase 0: Preparation | 2 days | Setup, Analysis | Architecture doc, specs |
| Phase 1: Type System | 3 days | Types, Classes | Updated types, data structures |
| Phase 2: PDF Rendering | 5 days | PDF implementation | Font support, row groups, merging |
| Phase 3: UI Rendering | 5 days | UI implementation | Designer/Viewer support |
| Phase 4: PropPanel | 5 days | UI controls | User-friendly configuration |
| Phase 5: Text Integration | 3 days | Text schema updates | Font weight in text fields |
| Phase 6: Testing | 5 days | All tests | 90%+ coverage, visual tests |
| Phase 7: Documentation | 4 days | Docs, tutorials | Complete documentation |
| Phase 8: Release | 3 days | Review, deploy | npm package published |

**Total: 35 days (~5-6 weeks)**

---

## Post-Release Plan

### Week 1 After Release
- Monitor GitHub issues
- Address critical bugs
- Gather user feedback
- Update FAQ based on questions

### Week 2-4 After Release
- Implement feedback improvements
- Add community-requested features
- Create advanced tutorials
- Publish case studies

### Ongoing
- Maintain compatibility with PDFme updates
- Performance optimizations
- Additional table features (Phase 2, 3)
- Community support

---

## Appendix

### A. Development Commands
```bash
# Setup
npm install
npm run build

# Development
cd packages/schemas && npm run dev
cd playground && npm run dev

# Testing
npm run test
npm run test:ui:update-snapshots
npm run lint

# Build
npm run build
npm run build:schemas

# Publish
npm version minor
npm publish
```

### B. Key Files Reference
- Types: `packages/schemas/src/tables/types.ts`
- Main Schema: `packages/schemas/src/tables/index.ts`
- PDF Render: `packages/schemas/src/tables/pdfRender.ts`
- UI Render: `packages/schemas/src/tables/uiRender.ts`
- Cell: `packages/schemas/src/tables/cell.ts`
- Classes: `packages/schemas/src/tables/classes.ts`
- PropPanel: `packages/schemas/src/tables/propPanel.ts`
- Helper: `packages/schemas/src/tables/helper.ts`
- Tests: `packages/schemas/__tests__/tables/`

### C. Resources
- PDFme Documentation: https://pdfme.com/docs
- pdf-lib Documentation: https://pdf-lib.js.org/
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Figma Design Reference: [Attached screenshot]

---

**Document Version:** 1.0
**Last Updated:** 2026-01-13
**Owner:** Development Team
**Status:** Ready for Implementation
