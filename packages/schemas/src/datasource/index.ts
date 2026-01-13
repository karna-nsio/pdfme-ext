import type { Plugin } from '@pdfme/common';
import text from '../text/index.js';
import type { DatasourceSchema } from './types.js';
import { propPanel } from './propPanel.js';
import { FileText } from 'lucide';
import { createSvgStr } from '../utils.js';

// Create icon for the datasource field
const datasourceIcon = createSvgStr(FileText);

/**
 * Datasource schema plugin
 * Extends text schema with dynamic data source field binding
 *
 * Key features:
 * - Dynamic dropdown options via Designer options.datasourceOptions
 * - Inherits all text formatting capabilities (font, size, color, etc.)
 * - Renders exactly like text field in PDF and UI
 * - Value resolution happens at render time via inputs
 *
 * Usage:
 * ```typescript
 * const designer = new Designer({
 *   domContainer,
 *   template,
 *   options: {
 *     datasourceOptions: [
 *       { label: 'Patient → First Name', value: 'Patient.firstName', ... },
 *       { label: 'Patient → Last Name', value: 'Patient.lastName', ... },
 *       // ... more options
 *     ]
 *   },
 *   plugins: { datasource }
 * });
 * ```
 */
const datasource: Plugin<DatasourceSchema> = {
  /**
   * UI rendering - delegates to text schema
   * The datasourceField value is resolved from inputs at render time
   */
  ui: text.ui,

  /**
   * PDF rendering - delegates to text schema
   * The datasourceField value is resolved from inputs at render time
   */
  pdf: text.pdf,

  /**
   * Property panel configuration
   * Provides datasourceField dropdown with dynamic options from Designer
   */
  propPanel,

  /**
   * Icon displayed in Designer toolbar
   */
  icon: datasourceIcon,
};

export default datasource;
