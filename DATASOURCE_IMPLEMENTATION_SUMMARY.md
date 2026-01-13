# Datasource Field Implementation Summary

## Overview

Successfully migrated the datasource field from wgs-reports into the pdfme library as a reusable plugin with dynamic option support.

## Phase 1: pdfme Library Implementation ✅ COMPLETED

### 1. Extended UIOptions Schema
**File:** `packages/common/src/schema.ts`

Added `datasourceOptions` array to UIOptions with full zod validation:
```typescript
export const UIOptions = CommonOptions.extend({
  // ... existing options
  datasourceOptions: z.array(z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional(),
    disabled: z.boolean().optional(),
    entity: z.string().optional(),
    property: z.string().optional(),
    type: z.string().optional(),
    sample: z.string().optional(),
    is_phi_data: z.boolean().optional(),
    is_required: z.boolean().optional(),
    is_dynamic: z.boolean().optional(),
    fieldCategory: z.string().optional(),
    dataSource: z.record(z.string(), z.any()).optional(),
  })).optional(),
});
```

### 2. Created Datasource Schema Directory
**Location:** `packages/schemas/src/datasource/`

**Files Created:**
- `types.ts` - TypeScript interfaces (DatasourceOption, DatasourceSchema)
- `constants.ts` - Default values (DEFAULT_DATASOURCE_FIELD, DEFAULT_DATASOURCE_OPTIONS)
- `propPanel.ts` - Property panel configuration with dynamic options
- `index.ts` - Main plugin export

### 3. Key Implementation Details

**DatasourceSchema Interface** (`types.ts`):
```typescript
export interface DatasourceSchema extends TextSchema {
  datasourceField: string;
}
```
- Extends TextSchema for full text formatting capabilities
- Adds `datasourceField` property to store the selected field binding

**PropPanel Implementation** (`propPanel.ts`):
```typescript
export const propPanel: PropPanel<DatasourceSchema> = {
  schema: (propPanelProps) => {
    const { options, i18n, activeSchema } = propPanelProps;

    // ✅ Get datasource options from Designer options
    const datasourceOptions: DatasourceOption[] =
      options.datasourceOptions || DEFAULT_DATASOURCE_OPTIONS;

    return {
      datasourceField: {
        title: i18n('schemas.datasource.field') || 'Data Source Field',
        type: 'string',
        widget: 'select',
        props: {
          options: datasourceOptions.map(opt => ({
            label: opt.label,
            value: opt.value,
            disabled: opt.disabled || false,
          })),
          showSearch: true,
          placeholder: i18n('schemas.datasource.placeholder'),
        },
        span: 24,
      },
      // ... text formatting options (fontSize, fontColor, etc.)
    };
  },
  defaultSchema: { /* ... */ },
};
```

**Plugin Export** (`index.ts`):
```typescript
const datasource: Plugin<DatasourceSchema> = {
  ui: text.ui,      // Delegates to text schema
  pdf: text.pdf,    // Delegates to text schema
  propPanel,        // Custom property panel with dynamic options
  icon: datasourceIcon, // FileText icon from lucide
};
```

### 4. i18n Support
**Files Modified:**
- `packages/common/src/schema.ts` - Added Dict keys
- `packages/ui/src/i18n.ts` - Added translations for all 11 languages

**New i18n Keys:**
- `schemas.datasource.field` - "Data Source Field" (and translations)
- `schemas.datasource.placeholder` - "Select a field to bind" (and translations)

### 5. Export Configuration
**File:** `packages/schemas/src/index.ts`

Added datasource to exports:
```typescript
import datasource from './datasource/index.js';

export {
  builtInPlugins,
  text,
  // ... other schemas
  select,
  datasource, // ✅ New export
  radioGroup,
  checkbox,
};
```

### 6. Build Verification ✅

Successfully built schemas package:
```bash
cd packages/schemas
npm run build
# ✅ All TypeScript files compiled without errors
# ✅ Output generated in dist/esm/src/datasource/
# ✅ Datasource exported in dist/esm/src/index.js
```

## How It Works

### Architecture Flow

1. **Option Passing:**
   ```
   wgs-reports → Designer options → propPanel.schema() → dropdown
   ```

2. **No Closure Dependency:**
   - Options accessed via `propPanelProps.options.datasourceOptions`
   - No closure capture needed
   - Plugin reference remains stable

3. **Rendering:**
   - UI and PDF rendering delegate to text schema
   - `datasourceField` value resolved at render time via inputs
   - Full text formatting support inherited

## Usage Example

```typescript
import { Designer } from '@pdfme/ui';
import { datasource } from '@pdfme/schemas';

const designer = new Designer({
  domContainer: document.getElementById('designer'),
  template,
  options: {
    datasourceOptions: [
      {
        label: '── 👤 Patient Information ──',
        value: '__SEPARATOR_PATIENT__',
        disabled: true,
      },
      {
        label: 'Patient → First Name',
        value: 'Patient.firstName',
        description: 'Patient first name',
        entity: 'Patient',
        property: 'firstName',
        type: 'string',
        sample: 'John',
      },
      {
        label: 'Patient → Last Name',
        value: 'Patient.lastName',
        description: 'Patient last name',
        entity: 'Patient',
        property: 'lastName',
        type: 'string',
        sample: 'Doe',
      },
      // ... more options
    ],
  },
  plugins: { datasource },
});
```

## Phase 2: wgs-reports Integration (Next Steps)

### 2.1 Update Package Dependencies

**File:** `wgs-reports/package.json`

Ensure pdfme packages are up to date with the new datasource schema.

### 2.2 Import Datasource from @pdfme/schemas

**File:** `wgs-reports/src/components/DesignerCanvas.jsx`

```javascript
import { datasource } from '@pdfme/schemas';
```

### 2.3 Remove Inline Datasource Definition

**File:** `wgs-reports/src/components/DesignerCanvas.jsx`

Remove the `useMemo` block that defines datasource inline:
```javascript
// ❌ DELETE THIS
const datasource = useMemo(() => ({
  pdf: (arg) => { /* ... */ },
  ui: (arg) => { /* ... */ },
  propPanel: { /* ... */ }
}), [dynamicDatasourceOptions]);
```

### 2.4 Pass Options via Designer

**File:** `wgs-reports/src/components/DesignerCanvas.jsx`

Update Designer instantiation:
```javascript
const designer = new Designer({
  domContainer: designerRef.current,
  template,
  options: {
    datasourceOptions: dynamicDatasourceOptions, // ✅ Pass options here
    font,
    lang: 'en',
  },
  plugins: { datasource }, // ✅ Use imported plugin
});
```

### 2.5 Update Options Dynamically (Optional)

If options need to be updated after Designer creation:

**Option A:** Update Designer options prop (React will handle re-render)
```javascript
useEffect(() => {
  if (designerInstance) {
    designerInstance.updateOptions({
      datasourceOptions: dynamicDatasourceOptions,
    });
  }
}, [dynamicDatasourceOptions]);
```

**Option B:** Recreate Designer when options change (simpler)
```javascript
useEffect(() => {
  // Designer will recreate with new options
}, [dynamicDatasourceOptions]);
```

### 2.6 Testing Checklist

- [ ] Datasource field appears in Designer toolbar
- [ ] Property panel shows dropdown with dynamic options
- [ ] Dropdown search works correctly
- [ ] Separator options are disabled
- [ ] Selected field binds correctly
- [ ] Text formatting options work (font, size, color)
- [ ] PDF generation resolves field values correctly
- [ ] Option updates reflect in dropdown (if using dynamic updates)

## Benefits of This Implementation

### 1. **Performance**
- No plugin recreation on option changes
- Stable plugin reference
- No closure memory leaks

### 2. **Reusability**
- Available to any pdfme project
- Not tied to wgs-reports
- Proper npm package distribution

### 3. **Maintainability**
- Centralized in pdfme library
- TypeScript type safety
- Follows pdfme plugin patterns

### 4. **Extensibility**
- Easy to add new option properties
- i18n support for all languages
- Consistent with other pdfme schemas

## Technical Details

### File Structure
```
pdfme/
├── packages/
│   ├── common/
│   │   └── src/
│   │       └── schema.ts (Extended UIOptions)
│   ├── schemas/
│   │   └── src/
│   │       ├── datasource/
│   │       │   ├── types.ts
│   │       │   ├── constants.ts
│   │       │   ├── propPanel.ts
│   │       │   └── index.ts
│   │       └── index.ts (Export datasource)
│   └── ui/
│       └── src/
│           └── i18n.ts (Add translations)
```

### Dependencies
- Extends TextSchema from `@pdfme/schemas`
- Uses lucide icons (FileText icon)
- Zod validation for type safety
- i18n support via Dict

### Build Output
```
packages/schemas/dist/
├── esm/src/datasource/
│   ├── constants.js
│   ├── index.js
│   ├── propPanel.js
│   └── types.js
└── cjs/src/datasource/
    └── (same structure)
```

## Status

✅ **Phase 1 Complete** - Datasource schema fully implemented in pdfme library
⏳ **Phase 2 Pending** - wgs-reports integration needs to be completed

## Next Actions

1. Update wgs-reports to import datasource from @pdfme/schemas
2. Remove inline datasource definition from DesignerCanvas.jsx
3. Pass datasourceOptions via Designer options
4. Test full integration with BGL001/1800 test case
5. Verify PDF generation with bound fields

---

**Implementation Date:** December 15, 2025
**pdfme Version:** 0.0.0 (development)
**Schemas Package:** @pdfme/schemas
