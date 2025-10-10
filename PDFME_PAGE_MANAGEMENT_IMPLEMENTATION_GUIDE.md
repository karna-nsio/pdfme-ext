# PDFme Page Management Implementation Guide
## Integrating Add/Remove Page Functionality in wgs-reports

---

## 🔍 **Problem Analysis**

### **Issue Identified**
The wgs-reports project is unable to configure page management (add/remove pages) in the Designer component because the **CtlBar component is missing** from the custom DesignerCanvas implementation.

### **Root Cause**
In the original PDFme Designer, page management controls are handled by the `CtlBar` component, which:
1. Only appears when page management functions are provided as props
2. Automatically shows add/remove page buttons for BlankPdf templates
3. Is integrated at the Designer component level, not the individual canvas level

### **Current State in wgs-reports**
- ✅ BlankPdf template structure is correctly implemented
- ✅ Designer component from PDFme is being used
- ❌ CtlBar component is not included in DesignerCanvas
- ❌ Page management functions are not implemented
- ❌ No UI controls for page add/remove operations

---

## 📋 **How PDFme Page Management Actually Works**

### **Original PDFme Designer Architecture**
```typescript
// In Designer/index.tsx
const handleAddPageAfter = () => {
  const _schemasList = cloneDeep(schemasList);
  _schemasList.splice(pageCursor + 1, 0, []);
  void updatePage(_schemasList, pageCursor + 1);
};

const handleRemovePage = () => {
  if (pageCursor === 0) return;
  if (!window.confirm(i18n('removePageConfirm'))) return;
  const _schemasList = cloneDeep(schemasList);
  _schemasList.splice(pageCursor, 1);
  void updatePage(_schemasList, pageCursor - 1);
};

// Conditional page management based on template type
const pageManipulation = isBlankPdf(template.basePdf)
  ? { addPageAfter: handleAddPageAfter, removePage: handleRemovePage }
  : {};

// CtlBar integration
<CtlBar
  size={sizeExcSidebars}
  pageCursor={pageCursor}
  pageNum={schemasList.length}
  setPageCursor={(p) => { /* page navigation logic */ }}
  zoomLevel={zoomLevel}
  setZoomLevel={setZoomLevel}
  {...pageManipulation}  // Spreads addPageAfter and removePage functions
/>
```

### **CtlBar Component Logic**
```typescript
// CtlBar only shows page controls when functions are provided
const contextMenuItems: MenuProps['items'] = [];
if (addPageAfter) {
  contextMenuItems.push({
    key: '1',
    label: <div onClick={addPageAfter}>{i18n('addPageAfter')}</div>,
  });
}
if (removePage && pageNum > 1 && pageCursor !== 0) {
  contextMenuItems.push({
    key: '2',
    label: <div onClick={removePage}>{i18n('removePage')}</div>,
  });
}
```

### **Required Conditions for Page Management**
1. **BlankPdf Template**: `isBlankPdf(template.basePdf)` must return `true`
2. **CtlBar Component**: Must be included in the UI
3. **Page Functions**: `addPageAfter` and `removePage` functions must be implemented
4. **Template Structure**: Must use `{ basePdf: {width, height, padding}, schemas: [{}] }` format

---

## 🚀 **Implementation Solutions**

## **Option A: Integrate PDFme CtlBar Component (Recommended)**

### **Advantages**
- ✅ Consistent with PDFme's design
- ✅ Handles all edge cases automatically
- ✅ Includes zoom controls and page navigation
- ✅ Built-in internationalization support
- ✅ Proper styling and responsive design

### **Implementation Steps**

#### **Step 1: Import CtlBar Component**
```typescript
// In your DesignerCanvas.jsx
import CtlBar from '@pdfme/ui/dist/components/CtlBar';
// Alternative import path (adjust based on your setup):
// import { CtlBar } from '@pdfme/ui/src/components/CtlBar';
```

#### **Step 2: Add State Management**
```typescript
// Add to your DesignerCanvas component
const [currentPage, setCurrentPage] = useState(0);
const [zoomLevel, setZoomLevel] = useState(1);
```

#### **Step 3: Implement Page Management Functions**
```typescript
const handleAddPageAfter = useCallback(() => {
  if (!designerRef.current) return;

  try {
    const currentTemplate = designerRef.current.getTemplate();
    console.log('Adding page after:', currentPage, 'Current template:', currentTemplate);

    // Clone schemas array and add empty page
    const newSchemas = [...currentTemplate.schemas];
    newSchemas.splice(currentPage + 1, 0, {}); // Add empty page after current

    const updatedTemplate = {
      ...currentTemplate,
      schemas: newSchemas
    };

    console.log('Updated template with new page:', updatedTemplate);

    // Update designer
    designerRef.current.updateTemplate(updatedTemplate);

    // Move to the newly created page
    setCurrentPage(currentPage + 1);

    // Notify parent component
    if (onTemplateChange) {
      onTemplateChange(updatedTemplate);
    }
  } catch (error) {
    console.error('Error adding page:', error);
  }
}, [currentPage, onTemplateChange]);

const handleRemovePage = useCallback(() => {
  if (!designerRef.current) return;

  try {
    const currentTemplate = designerRef.current.getTemplate();

    // Prevent removing the last page
    if (currentTemplate.schemas.length <= 1) {
      console.log('Cannot remove the last page');
      return;
    }

    // Prevent removing page 0 (first page) - PDFme convention
    if (currentPage === 0) {
      console.log('Cannot remove the first page');
      return;
    }

    // Confirm before removing
    if (!window.confirm('Are you sure you want to remove this page? This action cannot be undone.')) {
      return;
    }

    console.log('Removing page:', currentPage);

    // Clone schemas array and remove current page
    const newSchemas = [...currentTemplate.schemas];
    newSchemas.splice(currentPage, 1);

    const updatedTemplate = {
      ...currentTemplate,
      schemas: newSchemas
    };

    console.log('Updated template after page removal:', updatedTemplate);

    // Adjust current page if necessary
    const newCurrentPage = currentPage >= newSchemas.length ? newSchemas.length - 1 : currentPage - 1;
    setCurrentPage(newCurrentPage);

    // Update designer
    designerRef.current.updateTemplate(updatedTemplate);

    // Notify parent component
    if (onTemplateChange) {
      onTemplateChange(updatedTemplate);
    }
  } catch (error) {
    console.error('Error removing page:', error);
  }
}, [currentPage, onTemplateChange]);
```

#### **Step 4: Add CtlBar to Component JSX**
```typescript
// Update your DesignerCanvas render method
return (
  <div style={{ height: '100%', width: '100%', backgroundColor: 'white', position: 'relative' }}>
    {/* Your existing pdfme Designer container */}
    <div
      ref={containerRef}
      style={{ width: '100%', height: 'calc(100% - 60px)', backgroundColor: 'white' }}
    />

    {/* Add CtlBar component */}
    {template && (
      <CtlBar
        size={{
          width: containerRef.current?.clientWidth || 800,
          height: containerRef.current?.clientHeight || 600
        }}
        pageCursor={currentPage}
        pageNum={template.schemas?.length || 1}
        setPageCursor={(pageIndex) => {
          console.log('Navigating to page:', pageIndex);
          setCurrentPage(pageIndex);
          // Optional: Implement scroll-to-page functionality here
        }}
        zoomLevel={zoomLevel}
        setZoomLevel={(newZoom) => {
          console.log('Zoom level changed to:', newZoom);
          setZoomLevel(newZoom);
          // Optional: Implement zoom functionality
        }}
        // Conditional page management - only for BlankPdf templates
        {...(template.basePdf &&
            typeof template.basePdf === 'object' &&
            !(template.basePdf instanceof Uint8Array) &&
            template.basePdf.width !== undefined
          ? { addPageAfter: handleAddPageAfter, removePage: handleRemovePage }
          : {}
        )}
      />
    )}
  </div>
);
```

#### **Step 5: Update TemplateDesigner Integration**
```typescript
// In your TemplateDesigner.jsx, pass page change handler
<DesignerCanvas
  ref={designerRef}
  template={currentTemplate}
  onTemplateChange={handleTemplateChange}
  onPageChange={(pageIndex) => {
    console.log('Page changed to:', pageIndex);
    // Optional: Handle page change at parent level
  }}
/>
```

---

## **Option B: Custom Page Management Controls**

### **Advantages**
- ✅ Full control over styling and behavior
- ✅ Can customize for specific wgs-reports needs
- ✅ No additional PDFme component dependencies

### **Implementation**

#### **Custom Page Controls Component**
```typescript
// Create: src/components/CustomPageControls.jsx
import React from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomPageControls = ({
  template,
  currentPage,
  onAddPage,
  onRemovePage,
  onPageChange
}) => {
  // Only show for BlankPdf templates
  const isBlankPdf = template?.basePdf &&
    typeof template.basePdf === 'object' &&
    !(template.basePdf instanceof Uint8Array) &&
    template.basePdf.width !== undefined;

  if (!isBlankPdf) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 text-sm text-gray-600">
        Custom PDF - Page management not available
      </div>
    );
  }

  const pageCount = template.schemas?.length || 1;

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  const primaryButton = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const dangerButton = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white'
  };

  const navButton = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '6px'
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      fontSize: '14px'
    }}>
      {/* Page Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage <= 0}
          style={{
            ...navButton,
            opacity: currentPage <= 0 ? 0.5 : 1,
            cursor: currentPage <= 0 ? 'not-allowed' : 'pointer'
          }}
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{
          minWidth: '80px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {currentPage + 1} / {pageCount}
        </span>

        <button
          onClick={() => onPageChange(Math.min(pageCount - 1, currentPage + 1))}
          disabled={currentPage >= pageCount - 1}
          style={{
            ...navButton,
            opacity: currentPage >= pageCount - 1 ? 0.5 : 1,
            cursor: currentPage >= pageCount - 1 ? 'not-allowed' : 'pointer'
          }}
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Separator */}
      <div style={{
        width: '1px',
        height: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)'
      }} />

      {/* Page Management */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onAddPage}
          style={primaryButton}
          title="Add page after current page"
        >
          <Plus size={16} style={{ marginRight: '4px' }} />
          Add Page
        </button>

        <button
          onClick={onRemovePage}
          disabled={pageCount <= 1 || currentPage === 0}
          style={{
            ...dangerButton,
            opacity: (pageCount <= 1 || currentPage === 0) ? 0.5 : 1,
            cursor: (pageCount <= 1 || currentPage === 0) ? 'not-allowed' : 'pointer'
          }}
          title={
            pageCount <= 1
              ? "Cannot remove the last page"
              : currentPage === 0
                ? "Cannot remove the first page"
                : `Remove page ${currentPage + 1}`
          }
        >
          <Minus size={16} style={{ marginRight: '4px' }} />
          Remove Page
        </button>
      </div>

      {/* Template Type Indicator */}
      <div style={{
        marginLeft: '8px',
        padding: '4px 8px',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#22c55e'
      }}>
        ✓ Blank PDF
      </div>
    </div>
  );
};

export default CustomPageControls;
```

#### **Integration in DesignerCanvas**
```typescript
// In your DesignerCanvas.jsx
import CustomPageControls from './CustomPageControls';

// Add to your render method
return (
  <div style={{ height: '100%', width: '100%', backgroundColor: 'white', position: 'relative' }}>
    {/* Your existing pdfme Designer container */}
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
    />

    {/* Custom Page Controls */}
    {template && (
      <CustomPageControls
        template={template}
        currentPage={currentPage}
        onAddPage={handleAddPageAfter}
        onRemovePage={handleRemovePage}
        onPageChange={(pageIndex) => {
          setCurrentPage(pageIndex);
          // Optional: Implement page navigation logic
        }}
      />
    )}
  </div>
);
```

---

## **Option C: Minimal Integration Approach**

### **Quick Implementation for Testing**
```typescript
// Add basic page controls to your existing DesignerCanvas
const PageControls = () => {
  if (!template || !template.basePdf || typeof template.basePdf !== 'object' || template.basePdf.width === undefined) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      display: 'flex',
      gap: '10px',
      zIndex: 1000
    }}>
      <button
        onClick={handleAddPageAfter}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Add Page
      </button>
      <button
        onClick={handleRemovePage}
        disabled={template.schemas?.length <= 1}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          opacity: template.schemas?.length <= 1 ? 0.5 : 1
        }}
      >
        Remove Page
      </button>
      <span style={{
        padding: '8px 16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        Page {currentPage + 1} / {template.schemas?.length || 1}
      </span>
    </div>
  );
};

// Add <PageControls /> to your JSX
```

---

## 🛠️ **Template Structure Validation**

### **Ensure Correct BlankPdf Format**
```typescript
// Your template should look like this:
const correctBlankPdfTemplate = {
  basePdf: {
    width: 210,        // A4 width in mm
    height: 297,       // A4 height in mm
    padding: [20, 10, 20, 10]  // [top, right, bottom, left] in mm
  },
  schemas: [{}]  // Array of page objects (not 2D array)
};

// Validation function
const validateBlankPdfTemplate = (template) => {
  const isValid =
    template &&
    template.basePdf &&
    typeof template.basePdf === 'object' &&
    !(template.basePdf instanceof Uint8Array) &&
    typeof template.basePdf.width === 'number' &&
    typeof template.basePdf.height === 'number' &&
    Array.isArray(template.basePdf.padding) &&
    template.basePdf.padding.length === 4 &&
    Array.isArray(template.schemas);

  console.log('Template validation:', {
    isValid,
    hasBasePdf: !!template?.basePdf,
    basePdfType: typeof template?.basePdf,
    hasWidth: typeof template?.basePdf?.width,
    hasHeight: typeof template?.basePdf?.height,
    hasPadding: Array.isArray(template?.basePdf?.padding),
    hasSchemas: Array.isArray(template?.schemas)
  });

  return isValid;
};
```

### **Update Your blankPdf.js Functions**
Make sure your template creation functions return the correct format:
```typescript
// Ensure this format in your utils/blankPdf.js
export const createBlankPdfTemplate = () => {
  return {
    basePdf: {
      width: 210,
      height: 297,
      padding: [20, 10, 20, 10]
    },
    schemas: [{}] // Start with one empty page
  };
};
```

---

## 🧪 **Testing and Debugging**

### **Debug Checklist**
1. **Template Structure**: Use `validateBlankPdfTemplate()` to verify format
2. **BlankPdf Detection**: Add logging to verify `isBlankPdf()` returns true
3. **Function Calls**: Add console.logs in `handleAddPageAfter` and `handleRemovePage`
4. **UI Rendering**: Verify page controls appear in the interface
5. **Template Updates**: Check that template changes are properly propagated

### **Common Issues and Solutions**

#### **Issue: Page controls don't appear**
- **Solution**: Verify BlankPdf template structure
- **Check**: Console for template validation errors
- **Verify**: CtlBar or custom controls are properly rendered

#### **Issue: "Cannot read property 'schemas' of undefined"**
- **Solution**: Add null checks before accessing template properties
- **Check**: Template is properly passed to components

#### **Issue: Pages not updating in UI**
- **Solution**: Ensure `onTemplateChange` callback is called
- **Check**: Designer component is re-rendering with new template

#### **Issue: Page removal removes wrong page**
- **Solution**: Verify page index calculation in `handleRemovePage`
- **Check**: Current page state is properly managed

---

## 📚 **Additional Resources**

### **Key PDFme Files to Reference**
- `packages/ui/src/components/Designer/index.tsx` - Main Designer implementation
- `packages/ui/src/components/CtlBar.tsx` - Control bar component
- `packages/common/src/helper.ts` - `isBlankPdf()` function
- `packages/common/src/schema.ts` - BlankPdf type definitions

### **Related Documentation**
- [PDFme UI Architecture Documentation](./PDFME_UI_ARCHITECTURE_DOCUMENTATION.md)
- PDFme GitHub Issues related to page management
- PDFme TypeScript definitions for template structure

---

## 🎯 **Recommended Implementation Path**

### **Phase 1: Quick Win (Option C)**
1. Implement minimal page controls for immediate testing
2. Verify template structure and BlankPdf detection
3. Test basic add/remove functionality

### **Phase 2: Production Ready (Option A)**
1. Integrate official CtlBar component
2. Implement proper page management functions
3. Add zoom and navigation features
4. Test with various template configurations

### **Phase 3: Enhancement (Optional)**
1. Add custom styling to match wgs-reports theme
2. Implement keyboard shortcuts for page operations
3. Add page thumbnails or preview functionality
4. Integrate with your reporting workflow

---

## 💡 **Best Practices**

1. **Always validate template structure** before performing page operations
2. **Use consistent page indexing** (0-based like PDFme)
3. **Implement proper error handling** for all page operations
4. **Provide user feedback** for successful/failed operations
5. **Follow PDFme conventions** for maximum compatibility
6. **Test with both BlankPdf and CustomPdf** templates
7. **Implement proper cleanup** when components unmount

This implementation guide provides multiple approaches to solve the page management issue in your wgs-reports project. Choose the option that best fits your development timeline and requirements.