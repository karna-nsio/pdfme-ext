import type { Template, Schema, SchemaForUI, FieldGroup, GroupCondition } from '@pdfme/common';
import type { Plugins } from '@pdfme/common';
import { isBlankPdf } from '@pdfme/common';

export interface GenerateHTMLProps {
  template: Template;
  inputs: Record<string, any>[];
  plugins: Plugins;
  options?: {
    title?: string;
    includeStyles?: boolean;
    printFriendly?: boolean;
  };
}

interface PageSize {
  width: number;
  height: number;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(str || '').replace(/[&<>"']/g, (char) => map[char]);
}

// ============================================
// Standalone Helper Functions
// (Copied from UI package to avoid circular dependency)
// ============================================

/**
 * Evaluate group condition
 */
function evaluateGroupCondition(condition: GroupCondition, data: Record<string, any>): boolean {
  if (!condition.enabled) return true;

  const actualValue = data[condition.variable];
  const expectedValue = condition.value;

  switch (condition.operator) {
    case '==':
      return actualValue === expectedValue;
    case '!=':
      return actualValue !== expectedValue;
    case '>':
      return Number(actualValue) > Number(expectedValue);
    case '<':
      return Number(actualValue) < Number(expectedValue);
    case '>=':
      return Number(actualValue) >= Number(expectedValue);
    case '<=':
      return Number(actualValue) <= Number(expectedValue);
    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
    case 'contains':
      return String(actualValue).includes(String(expectedValue));
    default:
      return true;
  }
}

/**
 * Check if field is in any group
 */
function isFieldInAnyGroup(fieldId: string, fieldGroups: FieldGroup[]): boolean {
  return fieldGroups.some((g) => g.fieldIds.includes(fieldId));
}

/**
 * Get group for field
 */
function getGroupForField(fieldId: string, fieldGroups: FieldGroup[]): FieldGroup | undefined {
  return fieldGroups.find((g) => g.fieldIds.includes(fieldId));
}

/**
 * Evaluate field's own condition
 */
function evaluateFieldCondition(schema: any, data: Record<string, any>): 'show' | 'hide' | 'no-condition' {
  if (!schema.condition || schema.condition === null || !schema.condition.enabled) {
    return 'no-condition';
  }
  
  const conditionMet = evaluateGroupCondition(schema.condition, data);
  return conditionMet ? 'show' : 'hide';
}

/**
 * Check if field should be visible (field condition > group condition > default)
 */
function isFieldVisible(schema: any, fieldGroups: FieldGroup[], data: Record<string, any>): boolean {
  // Priority 1: Field-level condition
  const fieldConditionResult = evaluateFieldCondition(schema, data);
  if (fieldConditionResult === 'show') return true;
  if (fieldConditionResult === 'hide') return false;
  
  // Priority 2: Group-level condition
  const group = getGroupForField(schema.id, fieldGroups);
  if (group) {
    if (!group.condition || !group.condition.enabled) {
      return true;
    }
    return evaluateGroupCondition(group.condition, data);
  }
  
  // Priority 3: Default - always show
  return true;
}

/**
 * Filter table columns based on conditions
 */
function filterTableColumns(tableSchema: any, data: Record<string, any>): {
  visibleColumnIndices: number[];
  filteredHead: string[];
  filteredWidthPercentages: number[];
} {
  const columnConditions = tableSchema.columnConditions || {};
  const head = tableSchema.head || [];
  const widthPercentages = tableSchema.headWidthPercentages || [];
  
  const visibleColumnIndices: number[] = [];
  const filteredHead: string[] = [];
  const filteredWidthPercentages: number[] = [];
  
  head.forEach((columnName: string, index: number) => {
    const condition = columnConditions[index];
    
    let visible = true;
    if (condition && condition.enabled) {
      visible = evaluateGroupCondition(condition, data);
    }
    
    if (visible) {
      visibleColumnIndices.push(index);
      filteredHead.push(columnName);
      filteredWidthPercentages.push(widthPercentages[index] || 0);
    }
  });
  
  // Normalize width percentages
  const totalWidth = filteredWidthPercentages.reduce((sum, w) => sum + w, 0);
  if (totalWidth > 0 && totalWidth !== 100) {
    filteredWidthPercentages.forEach((w, i) => {
      filteredWidthPercentages[i] = (w / totalWidth) * 100;
    });
  }
  
  return { visibleColumnIndices, filteredHead, filteredWidthPercentages };
}

/**
 * Filter table body rows
 */
function filterTableBody(body: string[][], visibleColumnIndices: number[]): string[][] {
  return body.map((row) => 
    visibleColumnIndices.map((colIndex) => row[colIndex] || '')
  );
}

/**
 * Get page sizes from basePdf
 */
async function getPageSizes(basePdf: any): Promise<PageSize[]> {
  if (isBlankPdf(basePdf)) {
    // Blank PDF - use width/height from config
    const schemas = (basePdf as any).schemas?.length || 1;
    return Array(schemas).fill({ width: basePdf.width, height: basePdf.height });
  } else {
    // Custom PDF - fallback to A4 for now
    // TODO: Implement pdf2size integration if needed
    return [{ width: 210, height: 297 }];
  }
}

/**
 * Render text field as HTML
 */
function renderTextField(schema: any, value: string): string {
  const fontSize = schema.fontSize || 12;
  const fontColor = schema.fontColor || '#000000';
  const alignment = schema.alignment || 'left';
  const verticalAlignment = schema.verticalAlignment || 'top';
  const fontName = schema.fontName || 'Arial';
  const lineHeight = schema.lineHeight || 1.2;
  const characterSpacing = schema.characterSpacing || 0;
  const opacity = schema.opacity !== undefined ? schema.opacity : 1;
  const rotate = schema.rotate || 0;
  const fontWeight = schema.fontWeight || 'normal';
  const fontStyle = schema.fontStyle || 'normal';
  
  // Background color support
  const backgroundColor = schema.backgroundColor || 'transparent';
  
  // Border support
  const borderColor = schema.borderColor || 'transparent';
  const borderWidth = schema.borderWidth || 0;
  
  // Padding support
  const padding = schema.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const paddingStyle = typeof padding === 'object' 
    ? `${padding.top || 0}pt ${padding.right || 0}pt ${padding.bottom || 0}pt ${padding.left || 0}pt`
    : `${padding}pt`;
  
  // Vertical alignment mapping
  const alignItemsMap: Record<string, string> = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end'
  };
  const alignItems = alignItemsMap[verticalAlignment] || 'flex-start';
  
  // Dynamic word wrapping - match PDF behavior
  // If text contains actual line breaks, preserve them
  // Otherwise, allow natural word wrapping within the width constraint
  const htmlValue = escapeHTML(value).replace(/\n/g, '<br>');
  
  // Use table-cell for reliable vertical alignment that works in all browsers
  // This avoids flexbox issues with word-wrap in Chrome
  const verticalAlignMap: Record<string, string> = {
    top: 'top',
    middle: 'middle',
    bottom: 'bottom'
  };
  const verticalAlignValue = verticalAlignMap[verticalAlignment] || 'top';
  
  return `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    font-size: ${fontSize}pt;
    color: ${fontColor};
    background-color: ${backgroundColor};
    text-align: ${alignment};
    font-family: ${fontName}, Arial, sans-serif;
    font-weight: ${fontWeight};
    font-style: ${fontStyle};
    line-height: ${lineHeight};
    letter-spacing: ${characterSpacing}pt;
    opacity: ${opacity};
    transform: rotate(${rotate}deg);
    border: ${borderWidth}mm solid ${borderColor};
    padding: ${paddingStyle};
    overflow: hidden;
    box-sizing: border-box;
    display: table;
  "><div style="
    display: table-cell;
    vertical-align: ${verticalAlignValue};
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    width: 100%;
    height: ${schema.height}mm;
  ">${htmlValue}</div></div>`;
}

/**
 * Render multiVariableText field as HTML
 */
function renderMultiVariableTextField(schema: any, value: string): string {
  const fontSize = schema.fontSize || 12;
  const fontColor = schema.fontColor || '#000000';
  const alignment = schema.alignment || 'left';
  const verticalAlignment = schema.verticalAlignment || 'top';
  const fontName = schema.fontName || 'Arial';
  const lineHeight = schema.lineHeight || 1.4;
  const characterSpacing = schema.characterSpacing || 0;
  const opacity = schema.opacity !== undefined ? schema.opacity : 1;
  const rotate = schema.rotate || 0;
  const fontWeight = schema.fontWeight || 'normal';
  const fontStyle = schema.fontStyle || 'normal';
  
  // Background color support
  const backgroundColor = schema.backgroundColor || 'transparent';
  
  // Border support
  const borderColor = schema.borderColor || 'transparent';
  const borderWidth = schema.borderWidth || 0;
  
  // Padding support
  const padding = schema.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const paddingStyle = typeof padding === 'object' 
    ? `${padding.top || 0}pt ${padding.right || 0}pt ${padding.bottom || 0}pt ${padding.left || 0}pt`
    : `${padding}pt`;
  
  // Replace newlines with <br> for multi-line text
  const htmlValue = escapeHTML(value).replace(/\n/g, '<br>');
  
  // Vertical alignment for multi-line text using table-cell
  const verticalAlignMap: Record<string, string> = {
    top: 'top',
    middle: 'middle',
    bottom: 'bottom'
  };
  const verticalAlignValue = verticalAlignMap[verticalAlignment] || 'top';
  
  return `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    font-size: ${fontSize}pt;
    color: ${fontColor};
    background-color: ${backgroundColor};
    text-align: ${alignment};
    font-family: ${fontName}, Arial, sans-serif;
    font-weight: ${fontWeight};
    font-style: ${fontStyle};
    line-height: ${lineHeight};
    letter-spacing: ${characterSpacing}pt;
    opacity: ${opacity};
    transform: rotate(${rotate}deg);
    border: ${borderWidth}mm solid ${borderColor};
    padding: ${paddingStyle};
    overflow: hidden;
    box-sizing: border-box;
    display: table;
  "><div style="
    display: table-cell;
    vertical-align: ${verticalAlignValue};
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    width: 100%;
    height: ${schema.height}mm;
  ">${htmlValue}</div></div>`;
}

/**
 * Render SVG field as HTML
 */
function renderSVG(schema: any, value: string): string {
  const opacity = schema.opacity !== undefined ? schema.opacity : 1;
  const rotate = schema.rotate || 0;

  // Use the SVG content directly
  const svgContent = value || schema.content || '';

  return `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    opacity: ${opacity};
    transform: rotate(${rotate}deg);
    overflow: hidden;
    box-sizing: border-box;
  ">${svgContent}</div>`;
}

/**
 * Render table as HTML with column condition filtering
 */
function renderTable(schema: any, value: string, input: Record<string, any>): string {
  let body: string[][] = [];
  try {
    body = JSON.parse(value || '[]');
  } catch {
    body = [];
  }
  
  // Apply column conditions if they exist
  let head = schema.head || [];
  let widthPercentages = schema.headWidthPercentages || [];
  let visibleColumnIndices = head.map((_: any, i: number) => i);
  
  if (schema.columnConditions && Object.keys(schema.columnConditions).length > 0) {
    const filtered = filterTableColumns(schema, input);
    head = filtered.filteredHead;
    widthPercentages = filtered.filteredWidthPercentages;
    visibleColumnIndices = filtered.visibleColumnIndices;
    
    // Filter body rows
    body = filterTableBody(body, visibleColumnIndices);
  }
  
  const borderWidth = schema.tableStyles?.borderWidth || 0.3;
  const borderColor = schema.tableStyles?.borderColor || '#000000';
  const showHead = schema.showHead !== false;
  
  let tableHTML = `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    overflow: auto;
    box-sizing: border-box;
  ">`;
  
  tableHTML += `<table style="
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  ">`;
  
  // Header
  if (showHead && head.length > 0) {
    tableHTML += '<thead><tr>';
    head.forEach((header: string, i: number) => {
      const width = widthPercentages[i] || (100 / head.length);
      const headBg = schema.headStyles?.backgroundColor || '#2980ba';
      const headColor = schema.headStyles?.fontColor || '#ffffff';
      const headFontSize = schema.headStyles?.fontSize || 13;
      const headAlign = schema.headStyles?.alignment || 'left';
      const headPadding = schema.headStyles?.padding || { top: 5, right: 5, bottom: 5, left: 5 };
      
      tableHTML += `<th style="
        width: ${width}%;
        border: ${borderWidth}mm solid ${borderColor};
        background-color: ${headBg};
        color: ${headColor};
        font-size: ${headFontSize}pt;
        text-align: ${headAlign};
        padding: ${headPadding.top}pt ${headPadding.right}pt ${headPadding.bottom}pt ${headPadding.left}pt;
        font-weight: bold;
      ">${escapeHTML(header)}</th>`;
    });
    tableHTML += '</tr></thead>';
  }
  
  // Body
  if (body.length > 0) {
    tableHTML += '<tbody>';
    body.forEach((row: string[], rowIndex: number) => {
      const isAlternate = rowIndex % 2 === 1;
      const bodyBg = isAlternate
        ? (schema.bodyStyles?.alternateBackgroundColor || '#f5f5f5')
        : (schema.bodyStyles?.backgroundColor || '#ffffff');
      const bodyColor = schema.bodyStyles?.fontColor || '#000000';
      const bodyFontSize = schema.bodyStyles?.fontSize || 13;
      const bodyAlign = schema.bodyStyles?.alignment || 'left';
      const bodyPadding = schema.bodyStyles?.padding || { top: 5, right: 5, bottom: 5, left: 5 };
      
      tableHTML += '<tr>';
      row.forEach((cell: string) => {
        tableHTML += `<td style="
          border: ${borderWidth}mm solid ${borderColor};
          background-color: ${bodyBg};
          color: ${bodyColor};
          font-size: ${bodyFontSize}pt;
          text-align: ${bodyAlign};
          padding: ${bodyPadding.top}pt ${bodyPadding.right}pt ${bodyPadding.bottom}pt ${bodyPadding.left}pt;
        ">${escapeHTML(cell)}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody>';
  }
  
  tableHTML += '</table></div>';
  return tableHTML;
}

/**
 * Render image field as HTML
 */
function renderImage(schema: any, value: string): string {
  // Value should be base64 image data
  const opacity = schema.opacity !== undefined ? schema.opacity : 1;
  const rotate = schema.rotate || 0;
  const backgroundColor = schema.backgroundColor || 'transparent';
  const borderColor = schema.borderColor || 'transparent';
  const borderWidth = schema.borderWidth || 0;
  
  // Padding support
  const padding = schema.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const paddingStyle = typeof padding === 'object' 
    ? `${padding.top || 0}pt ${padding.right || 0}pt ${padding.bottom || 0}pt ${padding.left || 0}pt`
    : `${padding}pt`;
  
  return `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    background-color: ${backgroundColor};
    opacity: ${opacity};
    transform: rotate(${rotate}deg);
    border: ${borderWidth}mm solid ${borderColor};
    padding: ${paddingStyle};
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    ${value ? `<img src="${value}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="${escapeHTML(schema.name)}" />` : ''}
  </div>`;
}

/**
 * Render checkbox as HTML
 */
function renderCheckbox(schema: any, value: string | boolean): string {
  const checked = value === 'true' || value === true || value === 'checked' || value === '1';
  const size = Math.min(schema.width, schema.height);
  const backgroundColor = schema.backgroundColor || 'transparent';
  const borderColor = schema.borderColor || '#333333';
  const borderWidth = schema.borderWidth || 0.5;
  const checkColor = schema.checkColor || '#3b82f6';
  
  return `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    background-color: ${backgroundColor};
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  ">
    <div style="
      width: ${size * 0.8}mm;
      height: ${size * 0.8}mm;
      border: ${borderWidth}mm solid ${borderColor};
      background: ${checked ? checkColor : 'white'};
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 1mm;
      box-sizing: border-box;
    ">
      ${checked ? '<span style="color: white; font-size: 14pt; font-weight: bold;">✓</span>' : ''}
    </div>
  </div>`;
}

/**
 * Render line as HTML (horizontal or vertical)
 */
function renderLine(schema: any): string {
  const color = schema.color || '#000000';
  const width = schema.width;
  const height = schema.height;
  const opacity = schema.opacity !== undefined ? schema.opacity : 1;
  const rotate = schema.rotate || 0;
  
  // Line thickness - use the smaller dimension as thickness
  const thickness = Math.min(width, height);
  
  // Determine if horizontal or vertical based on dimensions
  const isHorizontal = width > height;
  
  // Line style (solid, dashed, dotted)
  const lineStyle = schema.lineStyle || 'solid';
  let borderStyle = 'solid';
  
  if (lineStyle === 'dashed') {
    borderStyle = 'dashed';
  } else if (lineStyle === 'dotted') {
    borderStyle = 'dotted';
  }
  
  // For horizontal lines
  if (isHorizontal) {
    return `<div style="
      position: absolute;
      left: ${schema.position.x}mm;
      top: ${schema.position.y}mm;
      width: ${width}mm;
      height: ${thickness}mm;
      background-color: ${color};
      opacity: ${opacity};
      transform: rotate(${rotate}deg);
      transform-origin: 0 0;
      box-sizing: border-box;
    "></div>`;
  } else {
    // For vertical lines
    return `<div style="
      position: absolute;
      left: ${schema.position.x}mm;
      top: ${schema.position.y}mm;
      width: ${thickness}mm;
      height: ${height}mm;
      background-color: ${color};
      opacity: ${opacity};
      transform: rotate(${rotate}deg);
      transform-origin: 0 0;
      box-sizing: border-box;
    "></div>`;
  }
}

/**
 * Render rectangle as HTML
 */
function renderRectangle(schema: any): string {
  const color = schema.color || '#000000';
  const borderColor = schema.borderColor || color;
  const borderWidth = schema.borderWidth || 1;
  const opacity = schema.opacity !== undefined ? schema.opacity : 1;
  const rotate = schema.rotate || 0;
  
  // Rectangle can be filled or just border
  const filled = schema.filled !== false; // Default to filled
  const backgroundColor = filled ? color : 'transparent';
  
  return `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    background-color: ${backgroundColor};
    border: ${borderWidth}mm solid ${borderColor};
    opacity: ${opacity};
    transform: rotate(${rotate}deg);
    transform-origin: 0 0;
    box-sizing: border-box;
  "></div>`;
}

/**
 * Render ellipse/circle as HTML
 */
function renderEllipse(schema: any): string {
  const color = schema.color || '#000000';
  const borderColor = schema.borderColor || color;
  const borderWidth = schema.borderWidth || 1;
  const opacity = schema.opacity !== undefined ? schema.opacity : 1;
  const rotate = schema.rotate || 0;
  
  // Ellipse can be filled or just border
  const filled = schema.filled !== false; // Default to filled
  const backgroundColor = filled ? color : 'transparent';
  
  return `<div style="
    position: absolute;
    left: ${schema.position.x}mm;
    top: ${schema.position.y}mm;
    width: ${schema.width}mm;
    height: ${schema.height}mm;
    background-color: ${backgroundColor};
    border: ${borderWidth}mm solid ${borderColor};
    border-radius: 50%;
    opacity: ${opacity};
    transform: rotate(${rotate}deg);
    transform-origin: center;
    box-sizing: border-box;
  "></div>`;
}

/**
 * Render a single field based on its type
 */
function renderField(schema: any, input: Record<string, any>): string {
  const value = input[schema.name] || schema.content || '';
  
  switch (schema.type) {
    case 'text':
      return renderTextField(schema, value);
    
    case 'multiVariableText':
      return renderMultiVariableTextField(schema, value);
    
    case 'table':
      return renderTable(schema, value, input);
    
    case 'image':
    case 'signature':
      return renderImage(schema, value);
    
    case 'checkbox':
      return renderCheckbox(schema, value);
    
    case 'line':
      return renderLine(schema);
    
    case 'rectangle':
      return renderRectangle(schema);
    
    case 'ellipse':
      return renderEllipse(schema);

    case 'svg':
      return renderSVG(schema, value);

    // Add more types as needed
    default:
      // Fallback to text rendering
      return renderTextField(schema, value);
  }
}

/**
 * Render a single page
 */
function renderPage(
  schemas: any[],
  input: Record<string, any>,
  fieldGroups: FieldGroup[],
  pageSize: PageSize,
  pageIndex: number
): string {
  let pageHTML = `<div class="pdf-page" data-page="${pageIndex + 1}" style="
    width: ${pageSize.width}mm;
    height: ${pageSize.height}mm;
    position: relative;
    background: white;
    margin: 0 auto 20px auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    page-break-after: always;
  ">`;
  
  // Filter and render visible fields
  schemas.forEach((schema: any) => {
    // Check if field should be visible based on conditions
    const visible = isFieldVisible(schema, fieldGroups, input);
    
    if (visible && !schema.hide) {
      const fieldHTML = renderField(schema, input);
      pageHTML += fieldHTML;
    }
  });
  
  pageHTML += '</div>';
  return pageHTML;
}

/**
 * Generate document styles
 */
function getDocumentStyles(options: { printFriendly?: boolean }): string {
  const { printFriendly = true } = options;
  
  return `<style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #f0f0f0;
      padding: 20px;
      margin: 0;
    }
    
    .pdf-page {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      margin: 0 auto 20px;
      position: relative;
    }
    
    .field {
      box-sizing: border-box;
    }
    
    table {
      border-collapse: collapse;
    }
    
    ${printFriendly ? `
    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      
      .pdf-page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
      }
      
      .pdf-page:last-child {
        page-break-after: auto;
      }
      
      /* Ensure exact sizing for print */
      @page {
        margin: 0;
      }
    }
    ` : ''}
  </style>`;
}

/**
 * Main HTML generation function
 * Generates HTML that looks exactly like the PDF output
 */
export async function generateHTML(props: GenerateHTMLProps): Promise<string> {
  const { template, inputs, plugins, options = {} } = props;
  const {
    title = 'Generated Report',
    includeStyles = true,
    printFriendly = true,
  } = options;

  console.log('📄 [generateHTML] Starting HTML generation');
  console.log('  Template pages:', template.schemas.length);
  console.log('  Input records:', inputs.length);
  console.log('  Field groups:', template.fieldGroups?.length || 0);

  // Get page sizes
  const pageSizes = await getPageSizes(template.basePdf);
  console.log('  Page sizes:', pageSizes);

  // Use first input (can be extended for multi-page reports)
  const input = inputs[0] || {};
  
  console.log('  Input data keys:', Object.keys(input));

  // Process each page
  const pagesHTML: string[] = [];
  
  for (let pageIndex = 0; pageIndex < template.schemas.length; pageIndex++) {
    const pageSchemas = template.schemas[pageIndex];
    const schemas = Array.isArray(pageSchemas) ? pageSchemas : Object.values(pageSchemas);
    
    console.log(`  Page ${pageIndex + 1}: ${schemas.length} fields`);
    
    // Render page with conditional filtering
    const pageHTML = renderPage(
      schemas,
      input,
      template.fieldGroups || [],
      pageSizes[pageIndex] || pageSizes[0],
      pageIndex
    );
    
    pagesHTML.push(pageHTML);
  }

  // Build complete HTML document
  const styles = includeStyles ? getDocumentStyles({ printFriendly }) : '';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <meta name="generator" content="PDFMe HTML Renderer">
  <meta name="generated-date" content="${new Date().toISOString()}">
  ${styles}
</head>
<body>
  <div class="document-container">
    ${pagesHTML.join('\n    ')}
  </div>
  
  <script>
    // Utility: Print document
    function printDocument() {
      window.print();
    }
    
    // Utility: Download as PDF (requires browser print-to-PDF)
    function downloadAsPDF() {
      alert('Use your browser\\'s Print function (Ctrl+P) and select "Save as PDF"');
      window.print();
    }
    
    console.log('📄 PDFMe HTML Report loaded');
    console.log('  Call printDocument() to print');
    console.log('  Call downloadAsPDF() for print-to-PDF instructions');
  </script>
</body>
</html>`;

  console.log('✅ [generateHTML] HTML generation complete');
  console.log('  Total length:', html.length, 'characters');
  
  return html;
}

/**
 * Generate HTML and trigger browser download
 */
export async function downloadAsHTML(
  props: GenerateHTMLProps,
  filename?: string
): Promise<void> {
  const html = await generateHTML(props);
  
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ HTML file downloaded:', a.download);
}

