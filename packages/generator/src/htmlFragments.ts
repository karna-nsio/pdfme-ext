/**
 * HTML Fragment Generator
 * Exports pdfme templates as separate HTML fragments per group
 */

import type { Template, Schema, FieldGroup, GroupCondition } from '@pdfme/common';
import type { Plugins } from '@pdfme/common';
import { isBlankPdf } from '@pdfme/common';
import { extractCSS, generateBaseCSS, type CSSExtractionOptions } from './cssExtractor.js';

// ============================================
// Types
// ============================================

export interface HTMLFragment {
  /** Section/group name (used as filename) */
  sectionName: string;
  /** Group ID from template */
  groupId: string;
  /** Group display name */
  groupName: string;
  /** Rendered HTML content (just the fragment, no full document) */
  html: string;
  /** Field IDs included in this fragment */
  fieldIds: string[];
  /** Wrapper CSS class */
  wrapperClass: string;
}

export interface GenerateHTMLFragmentsResult {
  /** Named fragments by group */
  fragments: HTMLFragment[];
  /** Shared CSS for all fragments */
  css: string;
  /** HTML for fields not in any group */
  ungroupedHtml: string;
  /** Ungrouped field IDs */
  ungroupedFieldIds: string[];
  /** Complete HTML document combining all fragments (optional) */
  combinedHtml?: string;
}

export interface GenerateHTMLFragmentsProps {
  template: Template;
  inputs: Record<string, any>[];
  plugins: Plugins;
  options?: GenerateHTMLFragmentsOptions;
}

export interface GenerateHTMLFragmentsOptions {
  /** CSS extraction options */
  cssOptions?: CSSExtractionOptions;
  /** Include combined HTML document */
  includeCombined?: boolean;
  /** Title for combined document */
  title?: string;
  /** Only export groups with sectionName defined */
  onlyNamedSections?: boolean;
  /** Include print-friendly styles */
  printFriendly?: boolean;
}

// ============================================
// Helper Functions
// ============================================

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
 * Check if field should be visible
 */
function isFieldVisible(
  schema: any,
  fieldGroups: FieldGroup[],
  data: Record<string, any>
): boolean {
  // Field-level condition
  if (schema.condition?.enabled) {
    return evaluateGroupCondition(schema.condition, data);
  }

  // Group-level condition
  const group = fieldGroups.find((g) => g.fieldIds.includes(schema.id));
  if (group?.condition?.enabled) {
    return evaluateGroupCondition(group.condition, data);
  }

  return !schema.hide;
}

/**
 * Get all schemas as flat array with IDs
 */
function getAllSchemas(template: Template): Schema[] {
  const schemas: Schema[] = [];
  template.schemas.forEach((pageSchemas) => {
    const arr = Array.isArray(pageSchemas) ? pageSchemas : Object.values(pageSchemas);
    arr.forEach((schema: any) => {
      schemas.push(schema);
    });
  });
  return schemas;
}

/**
 * Get page size from template
 */
function getPageSize(template: Template): { width: number; height: number } {
  if (isBlankPdf(template.basePdf)) {
    return {
      width: (template.basePdf as any).width || 210,
      height: (template.basePdf as any).height || 297,
    };
  }
  // Default to A4
  return { width: 210, height: 297 };
}

// ============================================
// Field Renderers (simplified from generateHTML.ts)
// ============================================

function renderTextField(schema: any, value: string, className: string): string {
  const htmlValue = escapeHTML(value).replace(/\n/g, '<br>');
  return `<div class="${className}">${htmlValue}</div>`;
}

function renderMultiVariableTextField(schema: any, value: string, className: string): string {
  const htmlValue = escapeHTML(value).replace(/\n/g, '<br>');
  return `<div class="${className}">${htmlValue}</div>`;
}

function renderTable(schema: any, value: string, className: string): string {
  let body: string[][] = [];
  try {
    body = JSON.parse(value || '[]');
  } catch {
    body = [];
  }

  const head = schema.head || [];
  const showHead = schema.showHead !== false;

  let tableHTML = `<div class="${className}">
    <table>`;

  if (showHead && head.length > 0) {
    tableHTML += '<thead><tr>';
    head.forEach((header: string) => {
      tableHTML += `<th>${escapeHTML(header)}</th>`;
    });
    tableHTML += '</tr></thead>';
  }

  if (body.length > 0) {
    tableHTML += '<tbody>';
    body.forEach((row: string[]) => {
      tableHTML += '<tr>';
      row.forEach((cell: string) => {
        tableHTML += `<td>${escapeHTML(cell)}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody>';
  }

  tableHTML += '</table></div>';
  return tableHTML;
}

function renderImage(schema: any, value: string, className: string): string {
  return `<div class="${className}">${value ? `<img src="${value}" alt="${escapeHTML(schema.name)}" />` : ''}</div>`;
}

function renderCheckbox(schema: any, value: string | boolean, className: string): string {
  const checked = value === 'true' || value === true || value === 'checked' || value === '1';
  return `<div class="${className}">${checked ? '✓' : ''}</div>`;
}

function renderLine(schema: any, className: string): string {
  return `<div class="${className}"></div>`;
}

function renderRectangle(schema: any, className: string): string {
  return `<div class="${className}"></div>`;
}

function renderEllipse(schema: any, className: string): string {
  return `<div class="${className}"></div>`;
}

function renderSVG(schema: any, value: string, className: string): string {
  const svgContent = value || schema.content || '';
  return `<div class="${className}">${svgContent}</div>`;
}

/**
 * Render a field based on type
 */
function renderField(schema: any, input: Record<string, any>, className: string): string {
  const value = input[schema.name] || schema.content || '';

  switch (schema.type) {
    case 'text':
      return renderTextField(schema, value, className);
    case 'multiVariableText':
      return renderMultiVariableTextField(schema, value, className);
    case 'table':
      return renderTable(schema, value, className);
    case 'image':
    case 'signature':
      return renderImage(schema, value, className);
    case 'checkbox':
      return renderCheckbox(schema, value, className);
    case 'line':
      return renderLine(schema, className);
    case 'rectangle':
      return renderRectangle(schema, className);
    case 'ellipse':
      return renderEllipse(schema, className);
    case 'svg':
      return renderSVG(schema, value, className);
    default:
      return renderTextField(schema, value, className);
  }
}

// ============================================
// Main Export Function
// ============================================

/**
 * Generate HTML fragments for each group in the template
 */
export async function generateHTMLFragments(
  props: GenerateHTMLFragmentsProps
): Promise<GenerateHTMLFragmentsResult> {
  const { template, inputs, options = {} } = props;
  const {
    cssOptions = {},
    includeCombined = false,
    title = 'Generated Report',
    onlyNamedSections = false,
    printFriendly = true,
  } = options;

  console.log('📄 [generateHTMLFragments] Starting fragment generation');

  const fieldGroups = template.fieldGroups || [];
  const allSchemas = getAllSchemas(template);
  const input = inputs[0] || {};
  const pageSize = getPageSize(template);

  console.log(`  Total fields: ${allSchemas.length}`);
  console.log(`  Field groups: ${fieldGroups.length}`);

  // Extract CSS for all schemas
  const { css: fieldCSS, classMap } = extractCSS(allSchemas, {
    classPrefix: 'pdfme-',
    includePrintStyles: printFriendly,
    ...cssOptions,
  });

  // Generate base CSS
  const baseCSS = generateBaseCSS({
    pageWidth: pageSize.width,
    pageHeight: pageSize.height,
    minify: cssOptions.minify,
  });

  const combinedCSS = `${baseCSS}\n\n${fieldCSS}`;

  // Track which fields are in groups
  const groupedFieldIds = new Set<string>();
  fieldGroups.forEach((group) => {
    group.fieldIds.forEach((id) => groupedFieldIds.add(id));
  });

  // Generate fragments for each group
  const fragments: HTMLFragment[] = [];

  for (const group of fieldGroups) {
    // Skip groups without sectionName if onlyNamedSections is true
    if (onlyNamedSections && !group.sectionName) {
      continue;
    }

    // Skip if group should not be exported
    if (group.exportAsFragment === false) {
      continue;
    }

    // Check group visibility condition
    if (group.condition?.enabled) {
      const visible = evaluateGroupCondition(group.condition, input);
      if (!visible) {
        console.log(`  Skipping hidden group: ${group.name}`);
        continue;
      }
    }

    // Skip hidden groups
    if (group.hide) {
      continue;
    }

    const sectionName = group.sectionName || group.name.toLowerCase().replace(/\s+/g, '-');
    const wrapperClass = group.wrapperClass || `pdfme-section-${sectionName}`;

    // Get schemas for this group
    const groupSchemas = allSchemas.filter((s: any) => group.fieldIds.includes(s.id));

    // Render fields
    let fragmentHTML = '';
    const renderedFieldIds: string[] = [];

    for (const schema of groupSchemas) {
      // Check field visibility
      if (!isFieldVisible(schema, fieldGroups, input)) {
        continue;
      }

      const className = classMap.get((schema as any).id || (schema as any).name) || 'pdfme-field';
      fragmentHTML += renderField(schema, input, className);
      renderedFieldIds.push((schema as any).id);
    }

    // Wrap in section div (use wrapperClass if defined, like WGSv2 uses wes-resultsSummary)
    const cssClass = wrapperClass || `section-${sectionName}`;
    const wrappedHTML = `<div class="${cssClass}">
${fragmentHTML}
</div>`;

    fragments.push({
      sectionName,
      groupId: group.id,
      groupName: group.name,
      html: wrappedHTML,
      fieldIds: renderedFieldIds,
      wrapperClass,
    });

    console.log(`  Fragment: ${sectionName} (${renderedFieldIds.length} fields)`);
  }

  // Handle ungrouped fields
  const ungroupedSchemas = allSchemas.filter((s: any) => !groupedFieldIds.has(s.id));
  let ungroupedHtml = '';
  const ungroupedFieldIds: string[] = [];

  for (const schema of ungroupedSchemas) {
    if (!isFieldVisible(schema, fieldGroups, input)) {
      continue;
    }

    const className = classMap.get((schema as any).id || (schema as any).name) || 'pdfme-field';
    ungroupedHtml += renderField(schema, input, className);
    ungroupedFieldIds.push((schema as any).id);
  }

  if (ungroupedHtml) {
    ungroupedHtml = `<div class="section-ungrouped">
${ungroupedHtml}
</div>`;
  }

  console.log(`  Ungrouped fields: ${ungroupedFieldIds.length}`);

  // Generate combined HTML if requested
  let combinedHtml: string | undefined;
  if (includeCombined) {
    const allFragmentsHtml = fragments.map((f) => f.html).join('\n');
    combinedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <meta name="generator" content="PDFMe HTML Fragment Generator">
  <style>
${combinedCSS}
  </style>
</head>
<body>
  <div class="pdfme-document">
    <div class="pdfme-page" style="width: ${pageSize.width}mm; height: ${pageSize.height}mm;">
${allFragmentsHtml}
${ungroupedHtml}
    </div>
  </div>
</body>
</html>`;
  }

  console.log('✅ [generateHTMLFragments] Generation complete');
  console.log(`  Total fragments: ${fragments.length}`);

  return {
    fragments,
    css: combinedCSS,
    ungroupedHtml,
    ungroupedFieldIds,
    combinedHtml,
  };
}

/**
 * Export fragments as separate files (browser download)
 */
export async function downloadHTMLFragments(
  props: GenerateHTMLFragmentsProps,
  options?: {
    zipFilename?: string;
    cssFilename?: string;
  }
): Promise<void> {
  const result = await generateHTMLFragments(props);
  const { zipFilename = 'html-fragments.zip', cssFilename = 'styles.css' } = options || {};

  // For browser environment, we'd need JSZip or similar
  // For now, log what would be exported
  console.log('📦 Would export:');
  console.log(`  ${cssFilename} (${result.css.length} bytes)`);
  result.fragments.forEach((f) => {
    console.log(`  ${f.sectionName}.html (${f.html.length} bytes)`);
  });
  if (result.ungroupedHtml) {
    console.log(`  ungrouped.html (${result.ungroupedHtml.length} bytes)`);
  }

  // In real implementation, use JSZip to create downloadable archive
  console.log('⚠️ Actual file download requires JSZip integration');
}

/**
 * Get fragment by section name
 */
export function getFragmentBySection(
  result: GenerateHTMLFragmentsResult,
  sectionName: string
): HTMLFragment | undefined {
  return result.fragments.find((f) => f.sectionName === sectionName);
}

/**
 * Generate a standalone HTML file for a single fragment
 */
export function wrapFragmentAsDocument(
  fragment: HTMLFragment,
  css: string,
  options?: { title?: string; pageWidth?: number; pageHeight?: number }
): string {
  const { title = fragment.groupName, pageWidth = 210, pageHeight = 297 } = options || {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
${css}
  </style>
</head>
<body>
  <div class="pdfme-document">
    <div class="pdfme-page" style="width: ${pageWidth}mm; height: ${pageHeight}mm; position: relative;">
${fragment.html}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Wrap fragment with external CSS link (for use with separate CSS file)
 */
export function wrapFragmentWithCSSLink(
  fragment: HTMLFragment,
  cssFilename: string = 'styles.css',
  options?: { title?: string }
): string {
  const { title = fragment.groupName } = options || {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <link rel="stylesheet" href="${cssFilename}">
</head>
<body>
${fragment.html}
</body>
</html>`;
}

/**
 * Generate raw fragment (just the div, no wrapper) - for backend assembly
 */
export function getRawFragment(fragment: HTMLFragment): string {
  return fragment.html;
}
