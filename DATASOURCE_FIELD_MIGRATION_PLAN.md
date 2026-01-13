# Datasource Field Migration Plan
## Moving Dynamic Datasource Dropdown from wgs-reports to pdfme Library

**Date:** 2025-12-15
**Goal:** Move the custom datasource field with dynamic options from wgs-reports into the pdfme library as a reusable schema/plugin

---

## 📊 Current Situation Analysis

### Current Implementation Location
**File:** `wgs-reports/src/components/DesignerCanvas.jsx`

**Current Approach:**
- Datasource field is defined inline in the consuming application (wgs-reports)
- Dynamic options (`dynamicDatasourceOptions`) are loaded via API in wgs-reports
- Options are captured in a `useMemo` hook and passed to the datasource schema definition
- The field is recreated whenever options change to update the dropdown

**Current Structure:**
```javascript
const datasource = useMemo(() => ({
  pdf: (arg) => { /* render logic */ },
  ui: (arg) => { /* render logic */ },
  propPanel: {
    schema: () => ({
      datasourceField: {
        title: 'Data Source',
        type: 'string',
        widget: 'select',
        props: {
          options: dynamicDatasourceOptions  // ❌ Hardcoded closure
        }
      }
    })
  }
}), [dynamicDatasourceOptions])  // ❌ Recreated on every option change
```

**Problems:**
1. ❌ Datasource field is tightly coupled to wgs-reports
2. ❌ Not reusable in other projects
3. ❌ Options are hardcoded via closure (not configurable)
4. ❌ Forces component re-rendering when options change
5. ❌ Cannot be distributed as part of pdfme library

---

## 🎯 Target Architecture

### New Implementation Location
**Package:** `pdfme/packages/schemas/src/datasource/`

**Target Approach:**
- Datasource field becomes a standard pdfme plugin/schema
- Options are passed as a runtime parameter (not hardcoded)
- Supports dynamic option updates without recreating the schema
- Follows pdfme's standard plugin architecture
- Distributed with `@pdfme/schemas` package

**Target Structure:**
```javascript
// In pdfme library
const datasourceSchema: Plugin<DatasourceSchema> = {
  pdf: pdfRender,
  ui: uiRender,
  propPanel: {
    schema: (propPanelProps) => {
      // ✅ Access options from Designer/props
      const datasourceOptions = propPanelProps.options.datasourceOptions || []

      return {
        datasourceField: {
          title: 'Data Source',
          type: 'string',
          widget: 'select',
          props: {
            options: datasourceOptions  // ✅ Dynamic from Designer options
          }
        }
      }
    }
  }
}

// In wgs-reports (consuming app)
const designer = new Designer({
  plugins: { datasource },
  options: {
    datasourceOptions: dynamicOptions  // ✅ Pass options to Designer
  }
})
```

---

## 🏗️ Architecture Design

### 1. pdfme Library Extension

#### A. Extend UIOptions Interface
**File:** `packages/common/src/schema.ts`

```typescript
export const UIOptions = CommonOptions.extend({
  lang: Lang.optional(),
  labels: z.record(z.string(), z.string()).optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
  icons: z.record(z.string(), z.string()).optional(),
  requiredByDefault: z.boolean().optional(),
  maxZoom: z.number().optional(),
  sidebarOpen: z.boolean().optional(),
  zoomLevel: z.number().optional(),

  // ✅ NEW: Support for custom plugin options
  datasourceOptions: z.array(z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional(),
    disabled: z.boolean().optional(),
    // ... other option properties
  })).optional(),
});
```

**Rationale:**
- UIOptions is already passed to propPanel schema functions
- Extending it maintains consistency with pdfme architecture
- All UI components (Designer, Form, Viewer) can access these options
- No breaking changes to existing API

#### B. Create Datasource Schema Plugin
**File:** `packages/schemas/src/datasource/index.ts`

**Directory Structure:**
```
packages/schemas/src/datasource/
├── index.ts           # Main plugin export
├── types.ts           # TypeScript interfaces
├── constants.ts       # Default values
├── pdfRender.ts       # PDF rendering logic
├── uiRender.ts        # UI rendering logic
├── propPanel.ts       # Property panel configuration
└── helper.ts          # Utility functions
```

**Plugin Structure:**
```typescript
// types.ts
export interface DatasourceOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  entity?: string;
  property?: string;
  type?: string;
  sample?: string;
  is_phi_data?: boolean;
  is_required?: boolean;
  is_dynamic?: boolean;
  fieldCategory?: string;
  dataSource?: Record<string, any>;
}

export interface DatasourceSchema extends TextSchema {
  datasourceField: string;  // Selected field value (e.g., "Patient.patient_first_name")
}

// index.ts
import type { Plugin } from '@pdfme/common';
import { pdfRender } from './pdfRender.js';
import { propPanel } from './propPanel.js';
import { uiRender } from './uiRender.js';
import type { DatasourceSchema } from './types.js';

const datasourceSchema: Plugin<DatasourceSchema> = {
  pdf: pdfRender,
  ui: uiRender,
  propPanel,
  icon: '<svg>...</svg>',
};

export default datasourceSchema;
```

#### C. Implement PropPanel with Dynamic Options
**File:** `packages/schemas/src/datasource/propPanel.ts`

```typescript
import { PropPanel, PropPanelSchema } from '@pdfme/common';
import { textPropPanel } from '../text/propPanel.js';
import type { DatasourceSchema, DatasourceOption } from './types.js';

export const propPanel: PropPanel<DatasourceSchema> = {
  // ✅ schema is a FUNCTION that receives propPanelProps
  schema: (propPanelProps) => {
    const { options, i18n, activeSchema } = propPanelProps;

    // ✅ Access datasourceOptions from Designer options
    const datasourceOptions: DatasourceOption[] =
      options.datasourceOptions || getDefaultOptions();

    // ✅ Group by entity for better UX
    const groupedOptions = groupByEntity(datasourceOptions);

    const datasourceSchema: Record<string, PropPanelSchema> = {
      datasourceField: {
        title: i18n('schemas.datasource.field') || 'Data Source',
        type: 'string',
        widget: 'select',
        default: 'Patient.patient_first_name',
        props: {
          options: datasourceOptions,  // ✅ Dynamic options
          showSearch: true,             // ✅ Enable search
          placeholder: i18n('schemas.datasource.placeholder') || 'Select a field',
        },
        span: 24,
      },

      // ✅ Inherit text properties (fontSize, fontColor, etc.)
      ...getTextProperties(propPanelProps),

      // ✅ Show field metadata (optional)
      fieldInfo: {
        type: 'void',
        widget: 'FieldInfo',  // Custom widget to display field details
        span: 24,
      },
    };

    return datasourceSchema;
  },

  // ✅ Custom widgets for enhanced UX
  widgets: {
    FieldInfo: (props) => {
      const { rootElement, activeSchema, options } = props;
      const schema = activeSchema as DatasourceSchema;

      // Find selected field metadata
      const selectedField = options.datasourceOptions?.find(
        opt => opt.value === schema.datasourceField
      );

      if (selectedField) {
        // Display field metadata (type, PHI flag, data source, etc.)
        renderFieldInfo(rootElement, selectedField);
      }
    },
  },

  defaultSchema: {
    type: 'datasource',
    name: 'datasource',
    datasourceField: 'Patient.patient_first_name',
    position: { x: 0, y: 0 },
    width: 100,
    height: 16,
    fontSize: 10,
    fontColor: '#000000',
    // ... inherit text schema defaults
  },
};
```

---

### 2. wgs-reports Integration Updates

#### A. Update DesignerCanvas.jsx
**File:** `wgs-reports/src/components/DesignerCanvas.jsx`

**BEFORE:**
```javascript
// ❌ Datasource defined inline with closure
const datasource = useMemo(() => ({
  pdf: (arg) => { /* ... */ },
  ui: (arg) => { /* ... */ },
  propPanel: {
    schema: () => ({
      datasourceField: {
        props: {
          options: dynamicDatasourceOptions  // Closure
        }
      }
    })
  }
}), [dynamicDatasourceOptions])

const plugins = useMemo(() => ({
  text,
  datasource,  // ❌ Recreated on every option change
  // ...
}), [datasource])
```

**AFTER:**
```javascript
// ✅ Import from pdfme schemas
import { datasource } from '@pdfme/schemas'

// ✅ Plugins are stable (no recreation needed)
const plugins = useMemo(() => ({
  text,
  datasource,  // ✅ Stable reference
  // ...
}), [])  // ✅ No dependencies

// ✅ Pass options to Designer
const designerOptions = {
  domContainer: containerRef.current,
  template: template,
  plugins,
  options: {
    font: fonts,
    lang: 'en',
    theme: { token: { colorPrimary: "#25c2a0" } },

    // ✅ NEW: Pass datasource options dynamically
    datasourceOptions: dynamicDatasourceOptions,
  }
}

const designer = new Designer(designerOptions)
```

**Key Changes:**
1. ✅ Remove inline datasource definition
2. ✅ Import datasource from `@pdfme/schemas`
3. ✅ Pass `datasourceOptions` via Designer options
4. ✅ Plugins become stable (no re-creation)
5. ✅ Options can be updated without recreating Designer

#### B. Support Dynamic Option Updates
**File:** `wgs-reports/src/components/DesignerCanvas.jsx`

```javascript
// ✅ When options change, update Designer options
useEffect(() => {
  if (designerRef.current && dynamicDatasourceOptions.length > 0) {
    // ✅ Update options without recreating Designer
    designerRef.current.updateOptions({
      datasourceOptions: dynamicDatasourceOptions
    })
  }
}, [dynamicDatasourceOptions])
```

**Note:** This requires implementing `updateOptions()` method in Designer class (see below)

---

### 3. pdfme Designer Enhancement

#### A. Add updateOptions() Method
**File:** `packages/ui/src/Designer.tsx`

```typescript
class Designer extends BaseUIClass {
  // ... existing methods

  /**
   * ✅ NEW: Update Designer options without full re-render
   * Useful for dynamic plugin options like datasourceOptions
   */
  public updateOptions(newOptions: Partial<UIOptions>) {
    if (!this.domContainer) throw Error(DESTROYED_ERR_MSG);

    // Merge new options with existing
    this.options = {
      ...this.options,
      ...newOptions
    };

    // Trigger property panel re-render if active schema uses these options
    this.refreshPropertyPanel();
  }

  private refreshPropertyPanel() {
    // Re-render property panel to reflect new options
    // This allows propPanel.schema() to access updated options
  }
}
```

#### B. Ensure Options Flow to PropPanel
**File:** `packages/ui/src/components/Designer/PropertyPanel.tsx` (or similar)

```typescript
// Ensure propPanelProps includes latest options
const propPanelProps = {
  rootElement,
  activeSchema,
  activeElements,
  changeSchemas,
  schemas,
  pageSize,
  options: this.options,  // ✅ Pass updated options
  theme,
  i18n,
};

// Call schema function with updated props
const schemaConfig = plugin.propPanel.schema(propPanelProps);
```

---

## 🔄 Data Flow

### Before (Current - wgs-reports only)
```
1. wgs-reports loads metadata from API
   ↓
2. Sets dynamicDatasourceOptions state
   ↓
3. useMemo creates datasource schema with closure
   ↓
4. plugins object recreated with new datasource
   ↓
5. Designer re-renders (expensive)
```

### After (Migrated to pdfme)
```
1. wgs-reports loads metadata from API
   ↓
2. Sets dynamicDatasourceOptions state
   ↓
3. Passes options to Designer via options.datasourceOptions
   ↓
4. Designer.updateOptions() updates internal options
   ↓
5. Property panel re-renders (lightweight)
   ↓
6. propPanel.schema() accesses updated options
   ↓
7. Dropdown reflects new options
```

---

## 📋 Implementation Steps

### Phase 1: pdfme Library Changes

#### Step 1.1: Extend UIOptions Type
- [ ] Add `datasourceOptions` to `UIOptions` in `packages/common/src/schema.ts`
- [ ] Define `DatasourceOption` interface
- [ ] Add zod validation schema

#### Step 1.2: Create Datasource Schema
- [ ] Create directory: `packages/schemas/src/datasource/`
- [ ] Create `types.ts` with interfaces
- [ ] Create `constants.ts` with defaults
- [ ] Implement `pdfRender.ts` (can reuse text PDF logic)
- [ ] Implement `uiRender.ts` (display selected field as text)
- [ ] Implement `propPanel.ts` with dynamic options support
- [ ] Create `index.ts` to export the plugin
- [ ] Add icon SVG

#### Step 1.3: Export from @pdfme/schemas
- [ ] Add export in `packages/schemas/src/index.ts`:
  ```typescript
  export { default as datasource } from './datasource/index.js';
  ```
- [ ] Update TypeScript types
- [ ] Build and test

#### Step 1.4: Add Designer.updateOptions()
- [ ] Implement `updateOptions()` method in `Designer.tsx`
- [ ] Ensure options are passed to property panel
- [ ] Add mechanism to refresh property panel on option update

#### Step 1.5: Add i18n Translations
- [ ] Add datasource field translations to `packages/ui/src/i18n.ts`:
  ```typescript
  {
    'schemas.datasource.field': 'Data Source Field',
    'schemas.datasource.placeholder': 'Select a field to bind',
    'schemas.datasource.noOptions': 'No data sources available',
  }
  ```

### Phase 2: wgs-reports Integration

#### Step 2.1: Update Dependencies
- [ ] Update `@pdfme/schemas` to version with datasource field
- [ ] Update `@pdfme/ui` to version with `updateOptions()`

#### Step 2.2: Remove Inline Datasource Implementation
- [ ] Remove inline datasource definition from `DesignerCanvas.jsx`
- [ ] Import datasource from `@pdfme/schemas`

#### Step 2.3: Update Designer Initialization
- [ ] Add `datasourceOptions` to Designer options
- [ ] Remove datasource from plugins useMemo dependencies

#### Step 2.4: Implement Dynamic Updates
- [ ] Add useEffect to call `updateOptions()` when options change
- [ ] Test that dropdown updates without full re-render

#### Step 2.5: Clean Up
- [ ] Remove unused code
- [ ] Update comments
- [ ] Test thoroughly

### Phase 3: Testing & Documentation

#### Step 3.1: Unit Tests
- [ ] Test datasource schema PDF rendering
- [ ] Test datasource schema UI rendering
- [ ] Test propPanel with various option configurations
- [ ] Test propPanel with empty options

#### Step 3.2: Integration Tests
- [ ] Test Designer with datasourceOptions
- [ ] Test updateOptions() method
- [ ] Test option changes reflect in property panel
- [ ] Test field selection and PDF generation

#### Step 3.3: Documentation
- [ ] Add datasource field to pdfme documentation
- [ ] Document `datasourceOptions` parameter
- [ ] Document `updateOptions()` method
- [ ] Add usage examples
- [ ] Update wgs-reports integration docs

---

## 🎨 Detailed Component Design

### 1. Datasource PropPanel Schema

```typescript
// Full implementation details
export const propPanel: PropPanel<DatasourceSchema> = {
  schema: (propPanelProps) => {
    const { options, i18n, activeSchema } = propPanelProps;

    // Get options from Designer
    const datasourceOptions = options.datasourceOptions || [];

    // Find currently selected field
    const selectedField = datasourceOptions.find(
      opt => opt.value === (activeSchema as DatasourceSchema).datasourceField
    );

    return {
      // Main field selector
      datasourceField: {
        title: i18n('schemas.datasource.field'),
        type: 'string',
        widget: 'select',
        default: 'Patient.patient_first_name',
        props: {
          options: datasourceOptions,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            // Custom search logic
            const searchText = input.toLowerCase();
            return (
              option.label.toLowerCase().includes(searchText) ||
              option.value.toLowerCase().includes(searchText) ||
              option.description?.toLowerCase().includes(searchText)
            );
          },
          placeholder: i18n('schemas.datasource.placeholder'),
        },
        span: 24,
      },

      // Divider
      '-------1': { type: 'void', widget: 'Divider' },

      // Field metadata display
      fieldMetadata: {
        type: 'void',
        widget: 'card',
        span: 24,
        properties: {
          fieldType: {
            title: 'Field Type',
            type: 'string',
            widget: 'input',
            disabled: true,
            default: selectedField?.type || '-',
          },
          fieldCategory: {
            title: 'Category',
            type: 'string',
            widget: 'input',
            disabled: true,
            default: selectedField?.fieldCategory || '-',
          },
          isPhiData: {
            title: 'Contains PHI',
            type: 'boolean',
            widget: 'checkbox',
            disabled: true,
            default: selectedField?.is_phi_data || false,
          },
        },
      },

      // Divider
      '-------2': { type: 'void', widget: 'Divider' },

      // Text formatting options (inherited from text schema)
      fontSize: {
        title: i18n('schemas.text.size'),
        type: 'number',
        widget: 'inputNumber',
        default: 10,
        props: { min: 6, max: 72 },
      },
      fontColor: {
        title: i18n('schemas.textColor'),
        type: 'string',
        widget: 'color',
        default: '#000000',
      },
      // ... other text properties
    };
  },

  defaultSchema: {
    type: 'datasource',
    name: 'datasource',
    datasourceField: 'Patient.patient_first_name',
    position: { x: 0, y: 0 },
    width: 100,
    height: 16,
    fontSize: 10,
    fontColor: '#000000',
    backgroundColor: '',
    alignment: 'left',
    verticalAlignment: 'top',
  },
};
```

### 2. PDF Rendering

```typescript
// pdfRender.ts
import { pdfRender as textPdfRender } from '../text/pdfRender.js';
import type { PDFRenderProps } from '@pdfme/common';
import type { DatasourceSchema } from './types.js';

export const pdfRender = (arg: PDFRenderProps<DatasourceSchema>) => {
  // Extract the selected field value
  const { schema, value } = arg;

  // The value should be the actual data to display
  // For example, if datasourceField is "Patient.patient_first_name"
  // and the input data has { Patient: { patient_first_name: "John" } }
  // then value should be "John"

  // Render as text
  return textPdfRender({
    ...arg,
    schema: {
      ...schema,
      type: 'text',
      content: value || schema.datasourceField || '',
    },
  });
};
```

### 3. UI Rendering

```typescript
// uiRender.ts
import { uiRender as textUiRender } from '../text/uiRender.js';
import type { UIRenderProps } from '@pdfme/common';
import type { DatasourceSchema } from './types.js';

export const uiRender = async (arg: UIRenderProps<DatasourceSchema>) => {
  const { schema, value, mode } = arg;

  // In designer mode, show the field placeholder
  // In viewer/form mode, show the actual value
  const displayValue = mode === 'designer'
    ? `{{${schema.datasourceField}}}`
    : value || '';

  // Render as text
  return textUiRender({
    ...arg,
    schema: {
      ...schema,
      type: 'text',
      content: displayValue,
    },
    value: displayValue,
  });
};
```

---

## 🔧 Technical Considerations

### 1. Performance Optimization

**Problem:** Updating options triggers property panel re-render

**Solutions:**
- ✅ Implement memoization in propPanel.schema()
- ✅ Only re-render if options actually changed
- ✅ Use React.memo() for property panel components
- ✅ Debounce option updates in wgs-reports

```typescript
// In Designer
private lastOptionsHash: string = '';

public updateOptions(newOptions: Partial<UIOptions>) {
  const newHash = JSON.stringify(newOptions);

  // Only update if options actually changed
  if (newHash === this.lastOptionsHash) {
    return;
  }

  this.lastOptionsHash = newHash;
  this.options = { ...this.options, ...newOptions };
  this.refreshPropertyPanel();
}
```

### 2. Backwards Compatibility

**Consideration:** Existing pdfme users shouldn't be affected

**Approach:**
- ✅ `datasourceOptions` is optional in UIOptions
- ✅ Datasource schema works without options (shows default fields)
- ✅ No breaking changes to existing API
- ✅ Datasource schema is opt-in (must be imported explicitly)

### 3. Type Safety

**Consideration:** Maintain strong TypeScript typing

**Approach:**
```typescript
// Extend UIOptions with proper typing
export interface UIOptions extends z.infer<typeof UIOptionsSchema> {
  datasourceOptions?: DatasourceOption[];
}

// Ensure propPanel.schema receives typed props
export const propPanel: PropPanel<DatasourceSchema> = {
  schema: (propPanelProps: Omit<PropPanelProps, 'rootElement'>) => {
    // TypeScript knows about datasourceOptions
    const options = propPanelProps.options.datasourceOptions;
    // ...
  }
};
```

### 4. Option Validation

**Consideration:** Invalid options could break the UI

**Approach:**
```typescript
// Validate options in Designer constructor
constructor(props: DesignerProps) {
  super(props);

  if (props.options?.datasourceOptions) {
    validateDatasourceOptions(props.options.datasourceOptions);
  }
}

function validateDatasourceOptions(options: any[]): asserts options is DatasourceOption[] {
  if (!Array.isArray(options)) {
    throw new Error('datasourceOptions must be an array');
  }

  options.forEach((opt, index) => {
    if (!opt.label || !opt.value) {
      throw new Error(`Invalid option at index ${index}: must have label and value`);
    }
  });
}
```

### 5. Error Handling

**Scenarios:**
1. No options provided
2. Empty options array
3. Invalid option format
4. Option API fails to load

**Handling:**
```typescript
// In propPanel.schema()
const datasourceOptions = options.datasourceOptions || getDefaultOptions();

function getDefaultOptions(): DatasourceOption[] {
  return [
    {
      label: '── 👤 Patient ──',
      value: '__SEPARATOR_PATIENT__',
      disabled: true,
    },
    {
      label: 'Patient → First Name',
      value: 'Patient.firstName',
      description: 'Patient first name',
    },
    // ... more default options
  ];
}

// Show helpful message if no options
if (datasourceOptions.length === 0) {
  return {
    noOptionsMessage: {
      type: 'void',
      widget: 'Alert',
      props: {
        message: i18n('schemas.datasource.noOptions'),
        type: 'warning',
      },
    },
  };
}
```

---

## 📦 Distribution Strategy

### NPM Package Updates

**@pdfme/schemas:**
- Version bump: Minor (e.g., 5.0.0 → 5.1.0)
- New export: `datasource`
- No breaking changes

**@pdfme/ui:**
- Version bump: Minor
- New method: `Designer.updateOptions()`
- No breaking changes

**@pdfme/common:**
- Version bump: Minor
- Extended: `UIOptions` interface
- No breaking changes

### Migration Guide for Users

```markdown
# Migrating to Datasource Field

## Installation
\`\`\`bash
npm install @pdfme/schemas@^5.1.0 @pdfme/ui@^5.1.0
\`\`\`

## Usage
\`\`\`typescript
import { Designer } from '@pdfme/ui';
import { datasource } from '@pdfme/schemas';

const options = await loadDatasourceOptionsFromAPI();

const designer = new Designer({
  plugins: { datasource },
  options: {
    datasourceOptions: options,
  },
});

// Update options dynamically
designer.updateOptions({
  datasourceOptions: newOptions,
});
\`\`\`
```

---

## 🧪 Testing Strategy

### Unit Tests

**File:** `packages/schemas/src/datasource/__tests__/datasource.test.ts`

```typescript
describe('Datasource Schema', () => {
  test('renders with default options', () => {
    // Test with no options provided
  });

  test('renders with custom options', () => {
    // Test with datasourceOptions provided
  });

  test('propPanel schema function receives options', () => {
    // Test options flow
  });

  test('PDF render shows field value', () => {
    // Test PDF generation
  });

  test('UI render shows placeholder in designer', () => {
    // Test designer mode
  });

  test('UI render shows value in viewer', () => {
    // Test viewer mode
  });
});
```

### Integration Tests

**File:** `packages/ui/__tests__/designer-datasource.test.tsx`

```typescript
describe('Designer with Datasource', () => {
  test('datasource field appears in property panel', () => {
    // Test field is available
  });

  test('updateOptions updates dropdown', () => {
    // Test dynamic option updates
  });

  test('selecting field updates template', () => {
    // Test field selection
  });

  test('works with empty options', () => {
    // Test graceful degradation
  });
});
```

### wgs-reports Tests

**File:** `wgs-reports/src/components/__tests__/DesignerCanvas.test.jsx`

```typescript
describe('DesignerCanvas with Datasource', () => {
  test('loads metadata from API', async () => {
    // Test API integration
  });

  test('passes options to Designer', () => {
    // Test option passing
  });

  test('updates options when metadata changes', () => {
    // Test dynamic updates
  });

  test('field dropdown shows API fields', () => {
    // Test UI integration
  });
});
```

---

## 📈 Benefits of Migration

### For pdfme Library

1. ✅ **Reusability:** Datasource field can be used in any project
2. ✅ **Maintainability:** Centralized in the library, easier to maintain
3. ✅ **Consistency:** Follows pdfme plugin architecture
4. ✅ **Distribution:** Available to all pdfme users via npm
5. ✅ **Documentation:** Part of official pdfme docs
6. ✅ **Testing:** Covered by pdfme test suite
7. ✅ **Extensibility:** Other projects can extend/customize

### For wgs-reports

1. ✅ **Cleaner Code:** Remove inline datasource definition
2. ✅ **Better Performance:** No re-creation of plugins on option change
3. ✅ **Maintainability:** Less custom code to maintain
4. ✅ **Updates:** Get datasource improvements via pdfme updates
5. ✅ **Type Safety:** Better TypeScript support
6. ✅ **Separation of Concerns:** UI logic in pdfme, data logic in wgs-reports

### For End Users

1. ✅ **Stability:** Fewer re-renders, better performance
2. ✅ **Features:** Access to pdfme improvements
3. ✅ **Consistency:** UI matches other pdfme fields
4. ✅ **Reliability:** Tested and maintained by pdfme team

---

## 🚧 Potential Challenges

### Challenge 1: Option Update Mechanism

**Issue:** pdfme Designer doesn't currently have `updateOptions()` method

**Solution:**
- Implement `updateOptions()` in Designer class
- Add mechanism to refresh property panel
- Ensure changes propagate to propPanel.schema()

**Complexity:** Medium
**Estimated Effort:** 4-6 hours

### Challenge 2: Property Panel Re-render

**Issue:** Need to re-render property panel when options change

**Solution:**
- Add refresh mechanism in Designer
- Use React state management in property panel
- Optimize to only re-render affected components

**Complexity:** Medium
**Estimated Effort:** 3-4 hours

### Challenge 3: Backwards Compatibility

**Issue:** Ensure existing pdfme users aren't affected

**Solution:**
- Make datasourceOptions optional
- Provide sensible defaults
- Thorough testing with existing schemas
- Clear migration guide

**Complexity:** Low
**Estimated Effort:** 2-3 hours

### Challenge 4: Type Definitions

**Issue:** Extending UIOptions with custom types

**Solution:**
- Use zod for runtime validation
- Export TypeScript interfaces
- Ensure proper type inference
- Document types clearly

**Complexity:** Low
**Estimated Effort:** 2-3 hours

---

## 📅 Estimated Timeline

### Phase 1: pdfme Library (2-3 days)
- Day 1: Extend UIOptions, create datasource schema structure
- Day 2: Implement propPanel, PDF/UI rendering
- Day 3: Add updateOptions(), testing, documentation

### Phase 2: wgs-reports Integration (1 day)
- Morning: Update dependencies, remove inline code
- Afternoon: Implement option passing, test thoroughly

### Phase 3: Testing & Polish (1 day)
- Morning: Integration testing, fix issues
- Afternoon: Documentation, examples, review

**Total Estimated Time:** 4-5 days

---

## ✅ Success Criteria

### Technical Success

- [ ] Datasource field works as pdfme plugin
- [ ] Options can be passed via Designer
- [ ] Options can be updated dynamically
- [ ] PDF generation works correctly
- [ ] UI rendering works in all modes
- [ ] Property panel shows correct options
- [ ] No performance degradation
- [ ] All tests pass

### Integration Success

- [ ] wgs-reports successfully uses new datasource field
- [ ] All 52 metadata fields display correctly
- [ ] Field selection works
- [ ] PDF generation with real data works
- [ ] No regressions in existing functionality

### User Experience Success

- [ ] Dropdown is responsive and searchable
- [ ] Field metadata is displayed
- [ ] No unnecessary re-renders
- [ ] Clear error messages
- [ ] Good performance with many options

### Documentation Success

- [ ] API documentation complete
- [ ] Usage examples provided
- [ ] Migration guide clear
- [ ] TypeScript types documented
- [ ] wgs-reports integration documented

---

## 🎯 Alternative Approaches Considered

### Alternative 1: Keep in wgs-reports

**Pros:**
- No changes to pdfme needed
- Faster short-term

**Cons:**
- Not reusable
- Harder to maintain
- Performance issues persist
- Doesn't follow best practices

**Verdict:** ❌ Not recommended

### Alternative 2: Plugin Configuration via Template

**Approach:** Pass options in template metadata

```typescript
const template = {
  schemas: [...],
  metadata: {
    datasourceOptions: options  // Pass here instead
  }
}
```

**Pros:**
- No need for updateOptions()
- Options tied to template

**Cons:**
- Template becomes very large
- Options not truly "dynamic"
- Doesn't fit pdfme architecture
- Harder to update options

**Verdict:** ❌ Not recommended

### Alternative 3: Custom Widget Only

**Approach:** Only create a custom widget, not a full schema

```typescript
propPanel: {
  widgets: {
    DatasourceSelect: (props) => {
      // Custom select widget
      const options = props.options.datasourceOptions;
      // ...
    }
  }
}
```

**Pros:**
- Simpler implementation
- Less code to maintain

**Cons:**
- Still need to pass options somehow
- Doesn't solve the reusability issue
- Doesn't leverage pdfme architecture fully

**Verdict:** ❌ Not recommended

---

## 📝 Conclusion

### Recommended Approach

**✅ Migrate datasource field to pdfme library as a full plugin/schema**

**Rationale:**
1. Follows pdfme architecture best practices
2. Enables reusability across projects
3. Improves performance and maintainability
4. Provides clear separation of concerns
5. Benefits both pdfme and wgs-reports

### Key Advantages

1. **For pdfme:** New reusable schema that enhances the library
2. **For wgs-reports:** Cleaner code, better performance, easier maintenance
3. **For community:** Other projects can leverage the datasource field

### Implementation Priority

**High Priority:**
- ✅ Essential for wgs-reports
- ✅ Improves pdfme architecture
- ✅ Enables future enhancements
- ✅ Demonstrates extensibility pattern

### Next Steps

1. **Review this plan** with the team
2. **Get approval** for pdfme library changes
3. **Create GitHub issues** for tracking
4. **Begin Phase 1** implementation
5. **Iterate based on feedback**

---

**Document Status:** ✅ Plan Complete - Awaiting Review & Approval
**Created:** 2025-12-15
**Author:** Claude (AI Assistant)
**Review Required By:** pdfme maintainers, wgs-reports team
