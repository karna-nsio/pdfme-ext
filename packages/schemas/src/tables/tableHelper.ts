import {
  Schema,
  isBlankPdf,
  BasePdf,
  CommonOptions,
  getDefaultFont,
  getFallbackFontName,
  cloneDeep,
} from '@pdfme/common';
import type { Font as FontKitFont } from 'fontkit';
import type {
  TableSchema,
  CellStyle,
  Styles,
  Spacing,
  TableInput,
  StylesProps,
  Section,
} from './types.js';
import { Cell, Column, Row, Table, RowGroup } from './classes.js';

type StyleProp = 'styles' | 'headStyles' | 'bodyStyles' | 'alternateRowStyles' | 'columnStyles' | 'rowStyles' | 'cellStyles';

interface CreateTableArgs {
  schema: Schema;
  basePdf: BasePdf;
  options: CommonOptions;
  _cache: Map<string | number, unknown>;
}

interface UserOptions {
  startY: number;
  tableWidth: number;
  margin: Spacing;
  showHead: boolean;
  tableLineWidth?: number;
  tableLineColor?: string;
  head?: string[][];
  body?: string[][];

  styles?: Partial<Styles>;
  bodyStyles?: Partial<Styles>;
  headStyles?: Partial<Styles>;
  alternateRowStyles?: Partial<Styles>;
  columnStyles?: {
    [key: string]: Partial<Styles>;
  };
  rowStyles?: { [rowIndex: number]: Partial<CellStyle> };
  cellStyles?: {
    [rowIndex: number]: {
      [colIndex: number]: Partial<CellStyle>;
    };
  };
}

function parseSection(
  sectionName: Section,
  sectionRows: string[][],
  columns: Column[],
  styleProps: StylesProps,
  fallbackFontName: string,
): Row[] {
  const rowSpansLeftForColumn: { [key: string]: { left: number; times: number } } = {};
  const result = sectionRows.map((rawRow, rowIndex) => {
    let skippedRowForRowSpans = 0;
    const cells: { [key: string]: Cell } = {};

    let colSpansAdded = 0;
    let columnSpansLeft = 0;
    for (const column of columns) {
      if (
        rowSpansLeftForColumn[column.index] == null ||
        rowSpansLeftForColumn[column.index].left === 0
      ) {
        if (columnSpansLeft === 0) {
          let rawCell;
          if (Array.isArray(rawRow)) {
            rawCell = rawRow[column.index - colSpansAdded - skippedRowForRowSpans];
          } else {
            rawCell = rawRow[column.index];
          }
          const styles = cellStyles(sectionName, column, rowIndex, styleProps, fallbackFontName);
          const cell = new Cell(rawCell, styles, sectionName);
          cells[column.index] = cell;

          columnSpansLeft = 0;
          rowSpansLeftForColumn[column.index] = {
            left: 0,
            times: columnSpansLeft,
          };
        } else {
          columnSpansLeft--;
          colSpansAdded++;
        }
      } else {
        rowSpansLeftForColumn[column.index].left--;
        columnSpansLeft = rowSpansLeftForColumn[column.index].times;
        skippedRowForRowSpans++;
      }
    }
    return new Row(rawRow, rowIndex, sectionName, cells);
  });
  return result;
}

function parseContent4Table(input: TableInput, fallbackFontName: string) {
  const content = input.content;
  const columns = content.columns.map((index) => new Column(index));
  const styles = input.styles;
  return {
    columns,
    head: parseSection('head', content.head, columns, styles, fallbackFontName),
    body: parseSection('body', content.body, columns, styles, fallbackFontName),
  };
}

function cellStyles(
  sectionName: Section,
  column: Column,
  rowIndex: number,
  styles: StylesProps,
  fallbackFontName: string,
) {
  let sectionStyles;
  if (sectionName === 'head') {
    sectionStyles = styles.headStyles;
  } else if (sectionName === 'body') {
    sectionStyles = styles.bodyStyles;
  }
  const otherStyles = Object.assign({}, styles.styles, sectionStyles);

  const colStyles = styles.columnStyles[column.index] || styles.columnStyles[column.index] || {};

  const alternateRowStyles =
    sectionName === 'body' && rowIndex % 2 === 0
      ? Object.assign({}, styles.alternateRowStyles)
      : {};

  // 🆕 Apply schema's rowStyles for specific rows
  const schemaRowStyles =
    sectionName === 'body' && styles.rowStyles && styles.rowStyles[rowIndex]
      ? mapCellStyle(styles.rowStyles[rowIndex] as CellStyle)
      : {};

  // 🆕 Apply schema's cellStyles for specific cells
  const schemaCellStyles =
    sectionName === 'body' && styles.cellStyles && styles.cellStyles[rowIndex] && styles.cellStyles[rowIndex][column.index]
      ? mapCellStyle(styles.cellStyles[rowIndex][column.index] as CellStyle)
      : {};

  const defaultStyle = {
    fontName: fallbackFontName,
    backgroundColor: '',
    textColor: '#000000',
    lineHeight: 1,
    characterSpacing: 0,
    alignment: 'left',
    verticalAlignment: 'middle',
    fontSize: 10,
    cellPadding: 5,
    lineColor: '#000000',
    lineWidth: 0,
    minCellHeight: 0,
    minCellWidth: 0,
  };
  // Apply styles in order of precedence: default < section < alternateRow < column < row < cell
  return Object.assign(defaultStyle, otherStyles, alternateRowStyles, colStyles, schemaRowStyles, schemaCellStyles) as Styles;
}

function mapCellStyle(style: CellStyle): Partial<Styles> {
  const result: Partial<Styles> = {};

  if (style.fontName !== undefined) result.fontName = style.fontName;
  if (style.fontWeight !== undefined) result.fontWeight = style.fontWeight;
  if (style.fontStyle !== undefined) result.fontStyle = style.fontStyle;
  if (style.alignment !== undefined) result.alignment = style.alignment;
  if (style.verticalAlignment !== undefined) result.verticalAlignment = style.verticalAlignment;
  if (style.fontSize !== undefined) result.fontSize = style.fontSize;
  if (style.lineHeight !== undefined) result.lineHeight = style.lineHeight;
  if (style.characterSpacing !== undefined) result.characterSpacing = style.characterSpacing;
  if (style.backgroundColor !== undefined) result.backgroundColor = style.backgroundColor;
  if (style.textDecoration !== undefined) result.textDecoration = style.textDecoration;
  if (style.textTransform !== undefined) result.textTransform = style.textTransform;
  if (style.whiteSpace !== undefined) result.whiteSpace = style.whiteSpace;
  if (style.wordBreak !== undefined) result.wordBreak = style.wordBreak;

  // Map to different property names
  if (style.fontColor !== undefined) result.textColor = style.fontColor;
  if (style.borderColor !== undefined) result.lineColor = style.borderColor;
  if (style.borderWidth !== undefined) result.lineWidth = style.borderWidth;
  if (style.padding !== undefined) result.cellPadding = style.padding;

  return result;
}

function getTableOptions(schema: TableSchema, body: string[][]): UserOptions {
  const columnStylesWidth = schema.headWidthPercentages.reduce(
    (acc, cur, i) => ({ ...acc, [i]: { cellWidth: schema.width * (cur / 100) } }),
    {} as Record<number, Partial<Styles>>,
  );

  const columnStylesAlignment = Object.entries(schema.columnStyles.alignment || {}).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: { alignment: value } }),
    {} as Record<number, Partial<Styles>>,
  );

  const allKeys = new Set([
    ...Object.keys(columnStylesWidth).map(Number),
    ...Object.keys(columnStylesAlignment).map(Number),
  ]);
  const columnStyles = Array.from(allKeys).reduce(
    (acc, key) => {
      const widthStyle = columnStylesWidth[key] || {};
      const alignmentStyle = columnStylesAlignment[key] || {};
      return { ...acc, [key]: { ...widthStyle, ...alignmentStyle } };
    },
    {} as Record<number, Partial<Styles>>,
  );

  return {
    head: [schema.head],
    body,
    showHead: schema.showHead,
    startY: schema.position.y,
    tableWidth: schema.width,
    tableLineColor: schema.tableStyles.borderColor,
    tableLineWidth: schema.tableStyles.borderWidth,
    headStyles: mapCellStyle(schema.headStyles),
    bodyStyles: mapCellStyle(schema.bodyStyles),
    alternateRowStyles: { backgroundColor: schema.bodyStyles.alternateBackgroundColor },
    columnStyles,
    rowStyles: schema.rowStyles || {},
    cellStyles: schema.cellStyles || {},
    margin: { top: 0, right: 0, left: schema.position.x, bottom: 0 },
  };
}

function parseStyles(cInput: UserOptions) {
  const styleOptions: StylesProps = {
    styles: {},
    headStyles: {},
    bodyStyles: {},
    alternateRowStyles: {},
    columnStyles: {},
    rowStyles: {},
    cellStyles: {},
  };
  for (const prop of Object.keys(styleOptions) as StyleProp[]) {
    if (prop === 'columnStyles') {
      const current = cInput[prop];
      styleOptions.columnStyles = Object.assign({}, current);
    } else if (prop === 'rowStyles') {
      styleOptions.rowStyles = cInput.rowStyles || {};
    } else if (prop === 'cellStyles') {
      styleOptions.cellStyles = cInput.cellStyles || {};
    } else {
      const allOptions = [cInput];
      const styles = allOptions.map((opts) => opts[prop] || {});
      styleOptions[prop] = Object.assign({}, styles[0], styles[1], styles[2]);
    }
  }
  return styleOptions;
}

function parseContent4Input(options: UserOptions) {
  const head = options.head || [];
  const body = options.body || [];
  const columns = (head[0] || body[0] || []).map((_, index) => index);
  return { columns, head, body };
}

function parseInput(schema: TableSchema, body: string[][]): TableInput {
  const options = getTableOptions(schema, body);
  const styles = parseStyles(options);
  const settings = {
    startY: options.startY,
    margin: options.margin,
    tableWidth: options.tableWidth,
    showHead: options.showHead,
    tableLineWidth: options.tableLineWidth ?? 0,
    tableLineColor: options.tableLineColor ?? '',
  };

  const content = parseContent4Input(options);

  return { content, styles, settings };
}

// 🆕 Create row groups from schema
function createRowGroups(schema: TableSchema, fallbackFontName: string): RowGroup[] {
  if (!schema.rowGroups || schema.rowGroups.length === 0) {
    return [];
  }

  return schema.rowGroups
    .filter(rg => rg && rg.visible !== false)
    .map(config => {
      const defaultStyles: Styles = {
        fontName: fallbackFontName,
        fontWeight: 'bold',
        fontStyle: 'normal',
        backgroundColor: '#2c5282',
        textColor: '#ffffff',
        lineHeight: 1.2,
        characterSpacing: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 11,
        cellPadding: { top: 6, bottom: 6, left: 10, right: 10 },
        lineColor: '#000000',
        lineWidth: { top: 0, bottom: 0, left: 0, right: 0 },
        minCellHeight: 0,
        minCellWidth: 0,
        cellWidth: 0,
      };

      // Merge with provided styles
      const styles = config.styles ? {
        ...defaultStyles,
        ...mapCellStyle(config.styles as CellStyle),
      } : defaultStyles;

      return new RowGroup(
        config.title,
        config.startRow,
        styles,
        config.colspan !== false,
        config.visible !== false,
        config.height
      );
    });
}

export async function createSingleTable(body: string[][], args: CreateTableArgs) {
  const { options, _cache, basePdf } = args;
  if (!isBlankPdf(basePdf)) {
    console.warn(
      '[@pdfme/schema/table]' +
        'When specifying a custom PDF for basePdf, ' +
        'you cannot use features such as page breaks or re-layout of other elements.' +
        'To utilize these features, please define basePdf as follows:\n' +
        '{ width: number; height: number; padding: [number, number, number, number]; }',
    );
  }

  const schema = cloneDeep(args.schema) as TableSchema;
  const { start } = schema.__bodyRange || { start: 0 };
  if (start % 2 === 1) {
    const alternateBackgroundColor = schema.bodyStyles.alternateBackgroundColor;
    schema.bodyStyles.alternateBackgroundColor = schema.bodyStyles.backgroundColor;
    schema.bodyStyles.backgroundColor = alternateBackgroundColor;
  }
  schema.showHead = schema.showHead === false ? false : !schema.__isSplit;

  const input = parseInput(schema, body);

  const font = options.font || getDefaultFont();

  const fallbackFontName = getFallbackFontName(font);

  const content = parseContent4Table(input, fallbackFontName);

  const table = await Table.create({
    input,
    content,
    font,
    _cache: _cache as unknown as Map<string | number, FontKitFont>,
  });

  // 🆕 Create and attach row groups
  const rowGroups = createRowGroups(schema, fallbackFontName);
  table.rowGroups.push(...rowGroups);

  // 🆕 Create cells for row groups that span all columns
  for (const rowGroup of table.rowGroups) {
    if (rowGroup.colspan) {
      rowGroup.cell = new Cell(rowGroup.title, rowGroup.styles, 'body');
      rowGroup.cell.width = table.getCalculatedWidth();
      // Use custom height if provided (and > 0), otherwise calculate from content
      rowGroup.cell.height = rowGroup.height && rowGroup.height > 0
        ? rowGroup.height
        : rowGroup.cell.getContentHeight();
    }
  }

  return table;
}
