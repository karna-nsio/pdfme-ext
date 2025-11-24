/**
 * Razor Syntax Transformer
 * Transforms pdfme template syntax to C# Razor syntax
 */

export interface ModelMapping {
  /** Map of pdfme field (e.g., 'Patient.Name') to Razor path (e.g., 'Model.PatientDTO.FullName') */
  [key: string]: string;
}

export interface RazorTransformOptions {
  /** Model mapping from pdfme fields to Razor model paths */
  modelMapping?: ModelMapping;
  /** Default model prefix (default: 'Model') */
  modelPrefix?: string;
  /** Generate @foreach for table data */
  generateForEach?: boolean;
}

// Field-level conditional types
export interface RazorCondition {
  type: 'hasValue' | 'simple' | 'nested' | 'ifElse' | 'custom';
  hasValue?: {
    property: string;
  };
  simple?: {
    expression: string;
  };
  nested?: {
    outer: string;
    inner: string;
  };
  ifElse?: {
    condition: string;
    ifTrue: string;
    ifFalse: string;
  };
  custom?: {
    template: string;
  };
}

// Field-level transformation types
export interface RazorTransform {
  type: 'dateFormat' | 'stringReplace' | 'ternary' | 'custom';
  dateFormat?: {
    format: string;
    hasValueCheck?: boolean;
  };
  stringReplace?: {
    replacements: Array<{ from: string; to: string }>;
  };
  ternary?: {
    condition: string;
    ifTrue: string;
    ifFalse: string;
  };
  custom?: {
    template: string;
  };
}

/**
 * Transform placeholder syntax {{Entity.Property}} to Razor @Model.Entity.Property
 */
export function transformPlaceholders(
  html: string,
  options: RazorTransformOptions = {}
): string {
  const { modelMapping = {}, modelPrefix = 'Model' } = options;

  // Replace {{Entity.Property}} with @Model.Entity.Property
  return html.replace(/\{\{([^}]+)\}\}/g, (match, field) => {
    const trimmedField = field.trim();

    // Check if we have a custom mapping
    if (modelMapping[trimmedField]) {
      return `@${modelMapping[trimmedField]}`;
    }

    // Default: convert to @Model.Field
    return `@${modelPrefix}.${trimmedField}`;
  });
}

/**
 * Transform a condition expression to Razor syntax
 * e.g., "reportType == 'WGS'" -> "Model.ReportType == \"WGS\""
 */
export function transformCondition(
  condition: {
    variable: string;
    operator: string;
    value: any;
    enabled?: boolean;
  },
  options: RazorTransformOptions = {}
): string {
  if (!condition.enabled) return '';

  const { modelMapping = {}, modelPrefix = 'Model' } = options;

  // Get the Razor path for the variable
  const razorPath = modelMapping[condition.variable] || `${modelPrefix}.${condition.variable}`;

  // Format the value based on type
  let formattedValue: string;
  if (typeof condition.value === 'string') {
    formattedValue = `"${condition.value}"`;
  } else if (typeof condition.value === 'boolean') {
    formattedValue = condition.value ? 'true' : 'false';
  } else if (condition.value === null || condition.value === undefined) {
    formattedValue = 'null';
  } else if (Array.isArray(condition.value)) {
    // For 'in' operator
    formattedValue = `new[] { ${condition.value.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')} }`;
  } else {
    formattedValue = String(condition.value);
  }

  // Map operator to C# syntax
  let razorOperator: string;
  let expression: string;

  switch (condition.operator) {
    case '==':
      expression = `${razorPath} == ${formattedValue}`;
      break;
    case '!=':
      expression = `${razorPath} != ${formattedValue}`;
      break;
    case '>':
      expression = `${razorPath} > ${formattedValue}`;
      break;
    case '<':
      expression = `${razorPath} < ${formattedValue}`;
      break;
    case '>=':
      expression = `${razorPath} >= ${formattedValue}`;
      break;
    case '<=':
      expression = `${razorPath} <= ${formattedValue}`;
      break;
    case 'in':
      expression = `${formattedValue}.Contains(${razorPath})`;
      break;
    case 'contains':
      expression = `${razorPath}.Contains(${formattedValue})`;
      break;
    default:
      expression = `${razorPath} == ${formattedValue}`;
  }

  return expression;
}

/**
 * Wrap HTML content in a Razor @if block
 */
export function wrapInCondition(
  html: string,
  condition: {
    variable: string;
    operator: string;
    value: any;
    enabled?: boolean;
  },
  options: RazorTransformOptions = {}
): string {
  if (!condition.enabled) return html;

  const conditionExpr = transformCondition(condition, options);

  return `@if (${conditionExpr})
{
${html}
}`;
}

/**
 * Generate a Razor @foreach block for table data
 */
export function generateForEachBlock(
  collectionPath: string,
  itemName: string,
  rowTemplate: string,
  options: RazorTransformOptions = {}
): string {
  const { modelPrefix = 'Model' } = options;

  return `@foreach (var ${itemName} in ${modelPrefix}.${collectionPath})
{
${rowTemplate}
}`;
}

/**
 * Transform table schema to Razor with @foreach
 */
export function transformTableToRazor(
  schema: any,
  className: string,
  options: RazorTransformOptions = {}
): string {
  const { modelMapping = {}, modelPrefix = 'Model' } = options;

  const head = schema.head || [];
  const showHead = schema.showHead !== false;

  // Determine collection path from schema metadata or mapping
  const collectionField = schema.datasourceCollection || schema.name;
  const collectionPath = modelMapping[collectionField] || `${modelPrefix}.${collectionField}`;

  let tableHTML = `<div class="${className}">
    <table>`;

  // Table header
  if (showHead && head.length > 0) {
    tableHTML += '\n        <thead><tr>';
    head.forEach((header: string) => {
      tableHTML += `<th>${escapeHTML(header)}</th>`;
    });
    tableHTML += '</tr></thead>';
  }

  // Table body with @foreach
  tableHTML += '\n        <tbody>';
  tableHTML += `\n@foreach (var item in ${collectionPath})
{
        <tr>`;

  // Generate cells - if column mappings exist, use them
  if (schema.columnMappings && Array.isArray(schema.columnMappings)) {
    schema.columnMappings.forEach((col: string) => {
      tableHTML += `<td>@item.${col}</td>`;
    });
  } else if (head.length > 0) {
    // Fallback: use header names as property names
    head.forEach((header: string) => {
      const propName = header.replace(/\s+/g, '');
      tableHTML += `<td>@item.${propName}</td>`;
    });
  }

  tableHTML += `</tr>
}`;
  tableHTML += '\n        </tbody>';
  tableHTML += '\n    </table>\n</div>';

  return tableHTML;
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

/**
 * Generate a HasValue check for nullable properties
 */
export function generateHasValueCheck(
  property: string,
  content: string,
  options: RazorTransformOptions = {}
): string {
  const { modelPrefix = 'Model' } = options;

  // If property already starts with @Model, remove it
  const cleanProperty = property.replace(/^@?Model\./, '');

  return `@if (${modelPrefix}.${cleanProperty}.HasValue)
{
    ${content}
}`;
}

/**
 * Generate a nested conditional (outer @if containing inner @if)
 */
export function generateNestedCondition(
  outer: string,
  inner: string,
  content: string
): string {
  return `@if(${outer})
{
    @if (${inner})
    {
        ${content}
    }
}`;
}

/**
 * Generate an if-else block with @{ } syntax
 */
export function generateIfElseBlock(
  condition: string,
  ifTrue: string,
  ifFalse: string
): string {
  return `@{
    if(${condition})
    {
        @: ${ifTrue}
    }
    else
    {
        @: ${ifFalse}
    }
}`;
}

/**
 * Apply data transformation to a value
 */
export function applyTransformation(
  value: string,
  transform: RazorTransform,
  options: RazorTransformOptions = {}
): string {
  const { modelPrefix = 'Model' } = options;

  // Remove @ prefix from value if present (we'll add it back appropriately)
  const cleanValue = value.replace(/^@/, '');

  switch (transform.type) {
    case 'dateFormat':
      if (transform.dateFormat) {
        const formatted = `${cleanValue}.Value.ToString("${transform.dateFormat.format}")`;
        return transform.dateFormat.hasValueCheck
          ? generateHasValueCheck(cleanValue, `@${formatted}`, options)
          : `@${formatted}`;
      }
      return value;

    case 'stringReplace':
      if (transform.stringReplace && transform.stringReplace.replacements.length > 0) {
        let result = `${cleanValue}.ToString()`;
        transform.stringReplace.replacements.forEach(({ from, to }) => {
          result += `.Replace("${from}","${to}")`;
        });
        return `@${result}`;
      }
      return value;

    case 'ternary':
      if (transform.ternary) {
        const ifTrueValue = transform.ternary.ifTrue.startsWith('Model.')
          ? transform.ternary.ifTrue
          : `"${transform.ternary.ifTrue}"`;
        const ifFalseValue = transform.ternary.ifFalse.startsWith('Model.')
          ? transform.ternary.ifFalse
          : `"${transform.ternary.ifFalse}"`;
        return `@(${transform.ternary.condition} ? ${ifTrueValue} : ${ifFalseValue})`;
      }
      return value;

    case 'custom':
      return transform.custom?.template || value;

    default:
      return value;
  }
}

/**
 * Transform a field with conditional logic and transformations
 */
export function transformFieldWithCondition(
  schema: any,
  className: string,
  options: RazorTransformOptions = {}
): string {
  const { modelPrefix = 'Model' } = options;

  // Get the base value (with placeholder transformation)
  let baseValue = schema.datasourceField
    ? `@${modelPrefix}.${schema.datasourceField}`
    : schema.content || '';

  // Apply transformation if present
  if (schema.razorTransform) {
    baseValue = applyTransformation(baseValue, schema.razorTransform, options);
  }

  // Build the content
  let content = baseValue;

  // Apply conditional wrapping if present
  if (schema.razorCondition) {
    const condition = schema.razorCondition;

    switch (condition.type) {
      case 'hasValue':
        if (condition.hasValue) {
          content = generateHasValueCheck(
            condition.hasValue.property,
            baseValue,
            options
          );
        }
        break;

      case 'simple':
        if (condition.simple) {
          content = `@if (${condition.simple.expression})
{
    ${baseValue}
}`;
        }
        break;

      case 'nested':
        if (condition.nested) {
          content = generateNestedCondition(
            condition.nested.outer,
            condition.nested.inner,
            baseValue
          );
        }
        break;

      case 'ifElse':
        if (condition.ifElse) {
          content = generateIfElseBlock(
            condition.ifElse.condition,
            condition.ifElse.ifTrue,
            condition.ifElse.ifFalse
          );
        }
        break;

      case 'custom':
        if (condition.custom) {
          content = condition.custom.template;
        }
        break;
    }
  }

  // Wrap in div with className
  return `<div class="${className}">\n${content}\n</div>`;
}

/**
 * Generate a collection loop (@for) with optional conditional check
 */
export function generateCollectionLoop(
  loopConfig: {
    collection: string;
    startIndex: number;
    loopVariable: string;
    condition?: string;
  },
  fields: Array<{
    fieldName: string;
    className: string;
    propertyPath: string;
    isLabel?: boolean;
    labelText?: string;
  }>,
  options: RazorTransformOptions = {}
): string {
  const { modelPrefix = 'Model' } = options;
  const { collection, startIndex, loopVariable, condition } = loopConfig;

  // Build field HTML inside loop
  let loopContent = '';
  fields.forEach(field => {
    if (field.isLabel) {
      // Static label
      loopContent += `        <div class="${field.className}">${field.labelText || ''}</div>\n`;
    } else {
      // Dynamic field
      loopContent += `        <div class="${field.className}">@${modelPrefix}.${collection}.ElementAt(@${loopVariable}).${field.propertyPath}</div>\n`;
    }
  });

  // Build loop structure
  let loopHtml = `    @for (int ${loopVariable} = ${startIndex}; ${loopVariable} < ${modelPrefix}.${collection}.Count(); ${loopVariable}++)
    {
${loopContent}    }`;

  // Wrap in condition if provided
  if (condition) {
    loopHtml = `@if (${condition})
{
${loopHtml}
}`;
  }

  return loopHtml;
}

/**
 * Transform an entire HTML fragment to Razor syntax
 */
export function transformFragmentToRazor(
  html: string,
  groupCondition: { variable: string; operator: string; value: any; enabled?: boolean } | undefined,
  options: RazorTransformOptions = {}
): string {
  // First, transform all placeholders
  let razorHtml = transformPlaceholders(html, options);

  // Then, wrap in condition if group has one
  if (groupCondition?.enabled) {
    razorHtml = wrapInCondition(razorHtml, groupCondition, options);
  }

  return razorHtml;
}
