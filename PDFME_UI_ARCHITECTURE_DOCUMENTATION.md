# PDFme UI Package - Comprehensive Architecture Documentation

## Overview

The `@pdfme/ui` package is the user interface layer of the PDFme ecosystem, providing React-based components for creating, editing, and viewing PDF templates. It offers three main UI modes: Designer (template creation), Form (data input), and Viewer (preview/display).

## Project Structure

```
packages/ui/
├── src/
│   ├── components/           # React components
│   │   ├── Designer/        # Template designer components
│   │   │   ├── Canvas/      # Canvas rendering components
│   │   │   └── RightSidebar/ # Property panel components
│   │   └── [other components]
│   ├── class.ts            # Base classes for UI components
│   ├── Designer.tsx         # Main Designer class
│   ├── Form.tsx            # Form class for data input
│   ├── Viewer.tsx          # Viewer class for preview
│   ├── helper.ts           # Utility functions
│   ├── hooks.ts            # React hooks
│   └── [other utilities]
├── __mocks__/              # Jest mocks for testing
└── __tests__/              # Test files
```

---

## Core Architecture

### 1. **Entry Points (`src/index.ts`)**

The package exports three main classes:
- `Designer` - Template creation and editing interface
- `Form` - Data input interface for filling templates
- `Viewer` - Read-only preview interface (deprecated)

### 2. **Base Classes (`src/class.ts`)**

#### **BaseUIClass**
- **Purpose**: Abstract base class for all UI components
- **Key Features**:
  - DOM container management
  - Template state management
  - Resize observer for responsive layout
  - Plugin registry management
  - Font and language configuration
  - Lifecycle management (render, update, destroy)

#### **PreviewUI**
- **Purpose**: Extends BaseUIClass for preview-based components (Form, Viewer)
- **Key Features**:
  - Input data management
  - Data conversion utilities
  - Input validation and change tracking

---

## Main UI Components

### 3. **Designer (`src/Designer.tsx`)**

#### **Purpose**
The Designer class provides a complete template creation interface with drag-and-drop functionality, property panels, and visual editing capabilities.

#### **Architecture**
```typescript
class Designer extends BaseUIClass {
  // Template change callbacks
  private onSaveTemplateCallback?: (template: Template) => void;
  private onChangeTemplateCallback?: (template: Template) => void;
  private pageCursor: number = 0; // Current page tracking
}
```

#### **Key Features**
- **Template Management**: Create, edit, and save PDF templates
- **Page Management**: Add/remove pages (for BlankPdf templates)
- **Real-time Updates**: Live template change notifications
- **Plugin System**: Extensible schema types (text, image, table, etc.)

#### **Usage Pattern**
```typescript
const designer = new Designer({
  domContainer: document.getElementById('designer'),
  template: myTemplate,
  plugins: customPlugins
});

designer.onChangeTemplate((template) => {
  console.log('Template updated:', template);
});
```

### 4. **Form (`src/Form.tsx`)**

#### **Purpose**
The Form class creates an interactive interface for users to input data into predefined template fields.

#### **Architecture**
```typescript
class Form extends PreviewUI {
  private onChangeInputCallback?: (arg: {
    index: number;
    value: string;
    name: string
  }) => void;
}
```

#### **Key Features**
- **Interactive Fields**: Users can input data into template fields
- **Real-time Updates**: Input change notifications
- **Data Validation**: Built-in validation for different field types
- **Multi-page Support**: Navigate through multi-page forms

#### **Usage Pattern**
```typescript
const form = new Form({
  domContainer: document.getElementById('form'),
  template: myTemplate,
  inputs: [{ name: 'John', email: 'john@example.com' }]
});

form.onChangeInput(({ index, name, value }) => {
  console.log('Input changed:', { index, name, value });
});
```

### 5. **Viewer (`src/Viewer.tsx`)**

#### **Purpose**
Read-only preview interface (deprecated in favor of Form without interaction).

#### **Status**: ⚠️ **DEPRECATED** - Will be removed in future versions

---

## Designer Component Architecture

### 6. **Designer Components (`src/components/Designer/`)**

#### **Main Designer Component (`index.tsx`)**
- **Purpose**: Orchestrates the entire designer interface
- **Key Features**:
  - **Drag & Drop**: Uses `@dnd-kit/core` for element placement
  - **Page Management**: Add/remove pages for BlankPdf templates
  - **Multi-sidebar Layout**: Left (element palette) + Right (properties)
  - **Canvas Management**: Handles zoom, scroll, and selection

#### **Component Hierarchy**:
```
DesignerComponent
├── LeftSidebar          # Element palette
├── Canvas/              # Main editing area
│   ├── Paper            # PDF page representation
│   ├── Renderer         # Schema rendering
│   ├── Moveable         # Element manipulation
│   ├── Selecto          # Multi-selection
│   ├── Guides           # Alignment guides
│   └── Mask/Padding     # Visual helpers
├── RightSidebar/        # Properties panel
│   ├── ListView         # Schema list management
│   └── DetailView       # Property editing
└── CtlBar              # Bottom controls (zoom, pages)
```

### 7. **Left Sidebar (`LeftSidebar.tsx`)**

#### **Purpose**
Element palette for dragging new components onto the canvas.

#### **Key Features**:
- **Plugin Rendering**: Shows available schema types from plugin registry
- **Drag & Drop Source**: Elements can be dragged to canvas
- **Live Preview**: Shows how elements will look when rendered
- **Responsive Design**: Adapts to different screen sizes

#### **Architecture**:
- Uses `@dnd-kit/core` for drag functionality
- Renders each plugin using the `Renderer` component
- Manages plugin default schemas and font settings

### 8. **Canvas System (`Canvas/`)**

#### **Main Canvas (`Canvas/index.tsx`)**
- **Purpose**: Primary editing area where users manipulate template elements
- **Features**:
  - **Multi-page Support**: Renders multiple PDF pages
  - **Zoom & Pan**: Viewport manipulation
  - **Element Selection**: Single and multi-selection
  - **Visual Feedback**: Guides, padding indicators, masks

#### **Sub-Components**:

##### **Moveable (`Moveable.tsx`)**
- **Purpose**: Provides resize, rotate, and drag handles for selected elements
- **Features**:
  - **Resize Handles**: Visual handles for element resizing
  - **Rotation**: Element rotation capabilities
  - **Drag**: Element positioning
  - **Snap-to-Grid**: Alignment assistance

##### **Selecto (`Selecto.tsx`)**
- **Purpose**: Multi-element selection with rectangle selection tool
- **Features**:
  - **Rectangle Selection**: Click and drag to select multiple elements
  - **Keyboard Modifiers**: Ctrl/Cmd for multi-selection
  - **Selection Feedback**: Visual indication of selected elements

##### **Guides (`Guides.tsx`)**
- **Purpose**: Alignment guides and snapping assistance
- **Features**:
  - **Smart Guides**: Show alignment with other elements
  - **Snap Lines**: Visual feedback for precise positioning
  - **Grid Overlay**: Optional grid for alignment

##### **Padding (`Padding.tsx`)**
- **Purpose**: Visual representation of PDF padding/margins
- **Features**:
  - **Padding Visualization**: Shows safe zones on BlankPdf templates
  - **Boundary Indicators**: Prevents content outside printable area

##### **Mask (`Mask.tsx`)**
- **Purpose**: Visual overlays and masks for enhanced editing experience
- **Features**:
  - **Selection Overlay**: Highlights selected areas
  - **Drop Zones**: Visual feedback for drag operations

### 9. **Right Sidebar (`RightSidebar/`)**

#### **Main Sidebar (`index.tsx`)**
- **Purpose**: Properties panel and schema management
- **Features**:
  - **Collapsible**: Can be hidden to maximize canvas space
  - **Context-Sensitive**: Shows properties for selected elements
  - **Multi-mode**: List view and detail view

#### **List View (`ListView/`)**
- **Purpose**: Hierarchical list of all template elements
- **Features**:
  - **Sortable**: Drag to reorder elements (z-index)
  - **Selectable**: Click to select elements
  - **Visual Hierarchy**: Shows page structure
  - **Bulk Operations**: Multi-element actions

##### **Key Components**:
- `SelectableSortableContainer.tsx`: Manages sortable list behavior
- `SelectableSortableItem.tsx`: Individual list items
- `Item.tsx`: Element representation in list

#### **Detail View (`DetailView/`)**
- **Purpose**: Property editing panel for selected elements
- **Features**:
  - **Dynamic Form**: Properties change based on element type
  - **Real-time Updates**: Changes apply immediately
  - **Type-specific Widgets**: Custom controls for different property types

##### **Widget System**:
- `WidgetRenderer.tsx`: Renders appropriate widget for each property
- `AlignWidget.tsx`: Alignment controls (left, center, right, etc.)
- `ButtonGroupWidget.tsx`: Button group controls

---

## Supporting Components

### 10. **Core UI Components**

#### **Paper (`Paper.tsx`)**
- **Purpose**: Represents individual PDF pages in the interface
- **Features**:
  - **Page Visualization**: Shows page boundaries and content area
  - **Background Rendering**: Displays PDF background or blank canvas
  - **Scale Handling**: Adapts to zoom levels

#### **Renderer (`Renderer.tsx`)**
- **Purpose**: Universal component for rendering schema elements
- **Features**:
  - **Plugin-based**: Uses plugin system for different element types
  - **Mode-aware**: Renders differently for designer/form/viewer modes
  - **Performance Optimized**: Efficient re-rendering

#### **Preview (`Preview.tsx`)**
- **Purpose**: Shared component for Form and Viewer interfaces
- **Features**:
  - **Multi-page Support**: Handles paginated content
  - **Interactive Elements**: Supports form input in Form mode
  - **Dynamic Layout**: Handles dynamic height elements

#### **CtlBar (`CtlBar.tsx`)**
- **Purpose**: Bottom control bar for zoom and page navigation
- **Features**:
  - **Zoom Controls**: Zoom in/out with percentage display
  - **Page Navigation**: Previous/next page for multi-page templates
  - **Page Management**: Add/remove pages (BlankPdf only)
  - **Context Menu**: Additional actions dropdown

#### **Root (`Root.tsx`)**
- **Purpose**: Layout container and theme provider
- **Features**:
  - **Responsive Layout**: Adapts to container size
  - **Theme Integration**: Provides consistent styling
  - **Scale Management**: Handles zoom and scaling

#### **ErrorScreen (`ErrorScreen.tsx`)**
- **Purpose**: Error handling and user feedback
- **Features**:
  - **Error Display**: Shows user-friendly error messages
  - **Recovery Options**: Provides actions to resolve issues
  - **Debug Information**: Shows technical details when needed

---

## Utility Systems

### 11. **Helper Functions (`helper.ts`)**

#### **Core Utilities**:
- **`uuid()`**: Generates unique identifiers for elements
- **`round()`**: Precise number rounding for measurements
- **`debounce()`**: Performance optimization for frequent operations

#### **Template Management**:
- **`template2SchemasList()`**: Converts templates to internal format
- **`schemasList2template()`**: Converts internal format back to templates
- **`moveCommandToChangeSchemasArg()`**: Handles element movement

#### **PDF Processing**:
- **`getB64BasePdf()`**: Processes PDF backgrounds
- **`arrayBufferToBase64()`**: Data format conversions
- **`getPagesScrollTopByIndex()`**: Page navigation calculations

#### **UI Helpers**:
- **`initShortCuts()`** / **`destroyShortCuts()`**: Keyboard shortcuts
- **`flatten()`**: Array manipulation utilities
- **`getUniqueSchemaName()`**: Name generation for elements

### 12. **React Hooks (`hooks.ts`)**

#### **`useUIPreProcessor()`**
- **Purpose**: Processes templates for UI rendering
- **Features**:
  - **Background Generation**: Creates page background images
  - **Size Calculation**: Determines page dimensions
  - **Scale Computation**: Calculates zoom factors
  - **Error Handling**: Manages processing errors

#### **`useScrollPageCursor()`**
- **Purpose**: Manages page navigation through scrolling
- **Features**:
  - **Scroll Detection**: Automatically detects current page
  - **Smooth Navigation**: Handles programmatic scrolling
  - **Page Change Events**: Triggers callbacks on page changes

#### **`useInitEvents()`**
- **Purpose**: Initializes keyboard shortcuts and event handlers
- **Features**:
  - **Keyboard Shortcuts**: Copy, paste, delete, undo, redo
  - **Event Cleanup**: Proper event listener management
  - **Cross-platform Support**: Handles different OS key combinations

#### **`usePrevious()`**
- **Purpose**: React hook for accessing previous prop values
- **Features**:
  - **Value Tracking**: Keeps reference to previous render values
  - **Change Detection**: Enables comparison between renders

### 13. **Context System (`contexts.ts`)**

#### **Context Providers**:
- **`I18nContext`**: Internationalization and localization
- **`FontContext`**: Font management and loading
- **`PluginsRegistry`**: Plugin system management
- **`OptionsContext`**: UI configuration options
- **`CacheContext`**: Performance caching system

#### **App Context Provider (`AppContextProvider.tsx`)**
- **Purpose**: Provides all contexts to child components
- **Features**:
  - **Centralized Configuration**: Single source for app-wide settings
  - **Performance Optimization**: Efficient context value management
  - **Type Safety**: TypeScript support for all context values

---

## Configuration and Constants

### 14. **Constants (`constants.ts`)**

#### **Layout Constants**:
- **`LEFT_SIDEBAR_WIDTH`**: 45px - Element palette width
- **`RIGHT_SIDEBAR_WIDTH`**: 400px - Properties panel width
- **`RULER_HEIGHT`**: 30px - Top ruler height
- **`PAGE_GAP`**: 10px - Spacing between pages

#### **Styling Constants**:
- **`BACKGROUND_COLOR`**: 'rgb(74, 74, 74)' - Canvas background
- **`SELECTABLE_CLASSNAME`**: 'selectable' - CSS class for selectable elements

#### **Behavior Constants**:
- **`DEFAULT_MAX_ZOOM`**: 2 - Maximum zoom level
- **`DEFAULT_LANG`**: 'en' - Default language

### 15. **Theme System (`theme.ts`)**

#### **Purpose**: Integrates with Ant Design's theme system
#### **Features**:
- **Custom Tokens**: Overrides default Ant Design values
- **Dark/Light Mode**: Supports theme switching
- **Consistent Styling**: Ensures UI consistency across components

### 16. **Type System (`types.ts`)**

#### **Core Types**:
- **`SidebarProps`**: Properties for sidebar components
- **Component-specific interfaces**: Type safety for all components
- **Event Handlers**: Typed callbacks for user interactions

---

## Plugin Integration

### 17. **Plugin Architecture**

#### **Plugin Interface**:
Each plugin must provide:
- **`ui`**: React component for rendering in UI
- **`pdf`**: Function for PDF generation
- **`propPanel`**: Configuration for property editing

#### **Built-in Plugins** (from `@pdfme/schemas`):
- **Text**: Basic text fields
- **MultiVariableText**: Multi-line text areas
- **Image**: Image embedding
- **Table**: Data tables
- **Barcodes**: QR codes and barcodes
- **Shapes**: Lines, rectangles, ellipses
- **Form Elements**: Checkboxes, radio buttons, dropdowns

#### **Plugin Registry**:
- **Registration**: Plugins are registered in the PluginsRegistry context
- **Type Safety**: TypeScript ensures plugin interface compliance
- **Extensibility**: Custom plugins can be added at runtime

---

## Performance Optimizations

### 18. **Rendering Optimizations**

#### **Caching System**:
- **Template Caching**: Avoids redundant template processing
- **Image Caching**: Caches rendered images for better performance
- **Computation Caching**: Memoizes expensive calculations

#### **React Optimizations**:
- **useMemo**: Expensive computations are memoized
- **useCallback**: Event handlers are optimized
- **Component Splitting**: Large components are split for better re-rendering

#### **DOM Optimizations**:
- **Virtualization**: Large lists use virtual scrolling
- **Debouncing**: User inputs are debounced to reduce updates
- **Efficient Selectors**: Minimal DOM queries

### 19. **Memory Management**

#### **Cleanup Systems**:
- **Event Listeners**: Properly removed on component unmount
- **ResizeObserver**: Disconnected when components are destroyed
- **Canvas Cleanup**: WebGL contexts and image data are released

#### **Resource Management**:
- **Font Loading**: Fonts are loaded on-demand
- **Image Processing**: Large images are processed in chunks
- **PDF Background**: PDF pages are rendered as needed

---

## Testing Architecture

### 20. **Test Structure (`__tests__/`)**

#### **Component Tests**:
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **Snapshot Tests**: UI regression testing

#### **Mock System (`__mocks__/`)**:
- **Lucide React**: Icon library mocks
- **Form Render**: Form library mocks
- **Asset Transformer**: Asset loading mocks

#### **Test Utilities**:
- **Helper Functions**: Common test utilities
- **Test Data**: Sample templates and inputs for testing

---

## Development Workflow

### 21. **Build System**

#### **TypeScript Compilation**:
- **Strict Mode**: Full TypeScript strict mode enabled
- **Type Checking**: Comprehensive type validation
- **ES Module Output**: Modern JavaScript output

#### **Bundle Optimization**:
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Separate chunks for better loading
- **Minification**: Production bundle optimization

### 22. **Development Guidelines**

#### **Code Organization**:
- **Single Responsibility**: Each component has a clear purpose
- **Composition over Inheritance**: React composition patterns
- **Type Safety**: Comprehensive TypeScript usage

#### **Performance Guidelines**:
- **Avoid Prop Drilling**: Use context for shared state
- **Memoization**: Use React.memo and hooks appropriately
- **Event Handling**: Efficient event listener management

---

## Integration Points

### 23. **External Dependencies**

#### **Core Dependencies**:
- **React & ReactDOM**: UI framework (v17+)
- **Ant Design**: UI component library
- **@dnd-kit**: Drag and drop functionality
- **react-moveable**: Element manipulation
- **Lucide React**: Icon system

#### **PDFme Ecosystem**:
- **@pdfme/common**: Shared types and utilities
- **@pdfme/schemas**: Built-in field types
- **@pdfme/converter**: PDF processing utilities

### 24. **API Surface**

#### **Public API**:
```typescript
// Main exports
export { Designer, Form, Viewer }

// Usage patterns
const designer = new Designer(props);
designer.onChangeTemplate(callback);
designer.onSaveTemplate(callback);
designer.updateTemplate(newTemplate);
designer.getTemplate();
designer.destroy();
```

#### **Event System**:
- **Template Changes**: Real-time template modification events
- **Input Changes**: Form field modification events
- **Page Navigation**: Page cursor change events
- **Selection Changes**: Element selection events

---

## Future Considerations

### 25. **Architectural Improvements**

#### **State Management**:
- **Consider Redux/Zustand**: For complex state management
- **Context Optimization**: Reduce re-renders through context splitting
- **Immutability**: Consider using libraries like Immer

#### **Performance Enhancements**:
- **Web Workers**: Off-main-thread processing for heavy operations
- **Canvas Rendering**: Direct canvas rendering for better performance
- **Streaming**: Stream large PDF processing operations

#### **Accessibility**:
- **ARIA Labels**: Comprehensive accessibility support
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Screen reader compatibility

### 26. **Extension Points**

#### **Custom Plugins**:
- **Plugin API**: Well-defined API for custom field types
- **Plugin Marketplace**: Ecosystem for community plugins
- **Plugin Tools**: Development tools for plugin creation

#### **Theming System**:
- **Custom Themes**: Support for complete theme customization
- **Brand Integration**: Easy brand color and styling integration
- **Component Overrides**: Ability to override built-in components

---

## Summary

The PDFme UI package provides a comprehensive, modular, and extensible system for PDF template management. Its architecture emphasizes:

1. **Modularity**: Clear separation of concerns with focused components
2. **Extensibility**: Plugin system allows for custom field types
3. **Performance**: Optimized rendering and memory management
4. **Type Safety**: Comprehensive TypeScript implementation
5. **User Experience**: Intuitive drag-and-drop interface with real-time feedback
6. **Accessibility**: Designed with accessibility best practices
7. **Maintainability**: Clean code organization with thorough documentation

The system successfully abstracts complex PDF manipulation into an intuitive visual interface while maintaining the flexibility needed for diverse use cases.