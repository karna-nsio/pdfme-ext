/**
 * CSS Extractor for HTML Fragment Export
 * Extracts styles from schema fields and generates CSS classes
 */

import type { Schema } from '@pdfme/common';

export interface ExtractedCSS {
  /** CSS rules as string */
  css: string;
  /** Map of field ID to CSS class name */
  classMap: Map<string, string>;
}

export interface CSSExtractionOptions {
  /** Prefix for generated class names (default: empty, like WGSv2's wes- prefix is user-defined) */
  classPrefix?: string;
  /** Include print media queries */
  includePrintStyles?: boolean;
  /** Minify output */
  minify?: boolean;
}

/**
 * Generate a unique class name for a field
 */
function generateClassName(fieldName: string, prefix: string): string {
  // Sanitize field name for CSS class
  const sanitized = fieldName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${prefix}${sanitized}`;
}

/**
 * Extract text field styles as CSS properties
 */
function extractTextStyles(schema: any): Record<string, string> {
  const styles: Record<string, string> = {};

  if (schema.fontSize) styles['font-size'] = `${schema.fontSize}pt`;
  if (schema.fontColor) styles['color'] = schema.fontColor;
  if (schema.fontName) styles['font-family'] = `${schema.fontName}, Arial, sans-serif`;
  if (schema.fontWeight) styles['font-weight'] = schema.fontWeight;
  if (schema.fontStyle) styles['font-style'] = schema.fontStyle;
  if (schema.alignment) styles['text-align'] = schema.alignment;
  if (schema.lineHeight) styles['line-height'] = String(schema.lineHeight);
  if (schema.characterSpacing) styles['letter-spacing'] = `${schema.characterSpacing}pt`;
  if (schema.backgroundColor) styles['background-color'] = schema.backgroundColor;
  if (schema.borderColor && schema.borderWidth) {
    styles['border'] = `${schema.borderWidth}mm solid ${schema.borderColor}`;
  }
  if (schema.opacity !== undefined && schema.opacity !== 1) {
    styles['opacity'] = String(schema.opacity);
  }
  if (schema.rotate) {
    styles['transform'] = `rotate(${schema.rotate}deg)`;
  }

  // Padding
  if (schema.padding) {
    const p = schema.padding;
    if (typeof p === 'object') {
      styles['padding'] = `${p.top || 0}pt ${p.right || 0}pt ${p.bottom || 0}pt ${p.left || 0}pt`;
    } else {
      styles['padding'] = `${p}pt`;
    }
  }

  return styles;
}

/**
 * Extract table styles as CSS
 */
function extractTableStyles(schema: any): { table: Record<string, string>; head: Record<string, string>; body: Record<string, string> } {
  const tableStyles: Record<string, string> = {
    'width': '100%',
    'border-collapse': 'collapse',
  };

  const headStyles: Record<string, string> = {};
  const bodyStyles: Record<string, string> = {};

  // Table border
  if (schema.tableStyles?.borderWidth) {
    tableStyles['border'] = `${schema.tableStyles.borderWidth}mm solid ${schema.tableStyles.borderColor || '#000'}`;
  }

  // Head styles
  if (schema.headStyles) {
    const hs = schema.headStyles;
    if (hs.backgroundColor) headStyles['background-color'] = hs.backgroundColor;
    if (hs.fontColor) headStyles['color'] = hs.fontColor;
    if (hs.fontSize) headStyles['font-size'] = `${hs.fontSize}pt`;
    if (hs.alignment) headStyles['text-align'] = hs.alignment;
    if (hs.padding) {
      const p = hs.padding;
      headStyles['padding'] = `${p.top || 0}pt ${p.right || 0}pt ${p.bottom || 0}pt ${p.left || 0}pt`;
    }
  }

  // Body styles
  if (schema.bodyStyles) {
    const bs = schema.bodyStyles;
    if (bs.backgroundColor) bodyStyles['background-color'] = bs.backgroundColor;
    if (bs.fontColor) bodyStyles['color'] = bs.fontColor;
    if (bs.fontSize) bodyStyles['font-size'] = `${bs.fontSize}pt`;
    if (bs.alignment) bodyStyles['text-align'] = bs.alignment;
    if (bs.padding) {
      const p = bs.padding;
      bodyStyles['padding'] = `${p.top || 0}pt ${p.right || 0}pt ${p.bottom || 0}pt ${p.left || 0}pt`;
    }
  }

  return { table: tableStyles, head: headStyles, body: bodyStyles };
}

/**
 * Convert style object to CSS string
 */
function stylesToCSS(styles: Record<string, string>, minify: boolean): string {
  const entries = Object.entries(styles);
  if (entries.length === 0) return '';

  if (minify) {
    return entries.map(([prop, val]) => `${prop}:${val}`).join(';');
  }
  return entries.map(([prop, val]) => `  ${prop}: ${val};`).join('\n');
}

/**
 * Generate position styles for absolute positioning
 */
function extractPositionStyles(schema: any): Record<string, string> {
  return {
    'position': 'absolute',
    'left': `${schema.position.x}mm`,
    'top': `${schema.position.y}mm`,
    'width': `${schema.width}mm`,
    'height': `${schema.height}mm`,
    'box-sizing': 'border-box',
  };
}

/**
 * Extract CSS from a collection of schemas
 */
export function extractCSS(
  schemas: Schema[],
  options: CSSExtractionOptions = {}
): ExtractedCSS {
  const {
    classPrefix = '',
    includePrintStyles = true,
    minify = false,
  } = options;

  const classMap = new Map<string, string>();
  const cssRules: string[] = [];
  const nl = minify ? '' : '\n';
  const indent = minify ? '' : '  ';

  // Base styles
  cssRules.push(`/* Generated Styles */${nl}`);

  // Process each schema
  schemas.forEach((schema: any) => {
    const className = generateClassName(schema.name || schema.id, classPrefix);
    classMap.set(schema.id || schema.name, className);

    // Position styles (always needed for layout)
    const positionStyles = extractPositionStyles(schema);

    // Type-specific styles
    let typeStyles: Record<string, string> = {};

    switch (schema.type) {
      case 'text':
      case 'multiVariableText':
        typeStyles = extractTextStyles(schema);
        break;

      case 'table':
        // Tables need multiple rules
        const tableCSS = extractTableStyles(schema);
        cssRules.push(`.${className} {${nl}${stylesToCSS(positionStyles, minify)}${nl}}${nl}`);
        cssRules.push(`.${className} table {${nl}${stylesToCSS(tableCSS.table, minify)}${nl}}${nl}`);
        if (Object.keys(tableCSS.head).length > 0) {
          cssRules.push(`.${className} thead th {${nl}${stylesToCSS(tableCSS.head, minify)}${nl}}${nl}`);
        }
        if (Object.keys(tableCSS.body).length > 0) {
          cssRules.push(`.${className} tbody td {${nl}${stylesToCSS(tableCSS.body, minify)}${nl}}${nl}`);
        }
        return; // Skip default rule generation

      case 'image':
      case 'signature':
        typeStyles = {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        };
        if (schema.backgroundColor) typeStyles['background-color'] = schema.backgroundColor;
        if (schema.opacity !== undefined) typeStyles['opacity'] = String(schema.opacity);
        break;

      case 'line':
        typeStyles = {
          'background-color': schema.color || '#000000',
        };
        if (schema.opacity !== undefined) typeStyles['opacity'] = String(schema.opacity);
        break;

      case 'rectangle':
        typeStyles = {
          'background-color': schema.filled !== false ? (schema.color || '#000000') : 'transparent',
          'border': `${schema.borderWidth || 1}mm solid ${schema.borderColor || schema.color || '#000000'}`,
        };
        if (schema.opacity !== undefined) typeStyles['opacity'] = String(schema.opacity);
        break;

      case 'ellipse':
        typeStyles = {
          'background-color': schema.filled !== false ? (schema.color || '#000000') : 'transparent',
          'border': `${schema.borderWidth || 1}mm solid ${schema.borderColor || schema.color || '#000000'}`,
          'border-radius': '50%',
        };
        if (schema.opacity !== undefined) typeStyles['opacity'] = String(schema.opacity);
        break;

      case 'checkbox':
        typeStyles = {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        };
        break;

      default:
        typeStyles = extractTextStyles(schema);
    }

    // Combine position and type styles
    const allStyles = { ...positionStyles, ...typeStyles };
    const cssContent = stylesToCSS(allStyles, minify);

    if (cssContent) {
      cssRules.push(`.${className} {${nl}${cssContent}${nl}}${nl}`);
    }
  });

  // Print styles
  if (includePrintStyles) {
    cssRules.push(`${nl}@media print {${nl}`);
    cssRules.push(`${indent}.avoid-page-break {${nl}${indent}${indent}page-break-inside: avoid;${nl}${indent}}${nl}`);
    cssRules.push(`${indent}.page-break {${nl}${indent}${indent}page-break-after: always;${nl}${indent}}${nl}`);
    cssRules.push(`}${nl}`);
  }

  return {
    css: cssRules.join(''),
    classMap,
  };
}

/**
 * Generate base/shared CSS that doesn't depend on specific fields
 */
export function generateBaseCSS(options: { minify?: boolean; pageWidth?: number; pageHeight?: number } = {}): string {
  const { minify = false, pageWidth = 210, pageHeight = 297 } = options;
  const nl = minify ? '' : '\n';

  return `/* Base Styles */${nl}
html body {${nl}  font-family: Arial;${nl}  box-sizing: border-box;${nl}}${nl}

@media print {${nl}  body {${nl}    background: white;${nl}    padding: 0;${nl}    margin: 0;${nl}  }${nl}  @page {${nl}    margin: 0;${nl}    size: ${pageWidth}mm ${pageHeight}mm;${nl}  }${nl}}${nl}`;
}
