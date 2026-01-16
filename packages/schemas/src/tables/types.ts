import type { ALIGNMENT, VERTICAL_ALIGNMENT } from '../text/types.js';
import type { Schema } from '@pdfme/common';

export type Spacing = { top: number; right: number; bottom: number; left: number };
type BorderInsets = Spacing;
type BoxDimensions = Spacing;

export interface CellStyle {
  fontName?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  alignment: ALIGNMENT;
  verticalAlignment: VERTICAL_ALIGNMENT;
  fontSize: number;
  lineHeight: number;
  characterSpacing: number;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: BoxDimensions;
  padding: BoxDimensions;
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  whiteSpace?: 'normal' | 'nowrap' | 'pre-wrap';
  wordBreak?: 'normal' | 'break-all' | 'break-word';
}

export type CellSchema = Schema & CellStyle;

export interface RowGroupConfig {
  title: string;
  startRow: number;
  endRow?: number;
  height?: number;
  styles?: Partial<CellStyle>;
  colspan?: boolean;
  visible?: boolean;
}

export interface TableSchema extends Schema {
  showHead: boolean;
  head: string[];
  headWidthPercentages: number[];

  tableStyles: {
    borderColor: string;
    borderWidth: number;
  };
  headStyles: CellStyle;
  bodyStyles: CellStyle & { alternateBackgroundColor: string };
  columnStyles: {
    alignment?: { [colIndex: number]: ALIGNMENT };
  };

  // 🆕 Advanced styling features
  rowGroups?: RowGroupConfig[];
  rowStyles?: { [rowIndex: number]: Partial<CellStyle> };
  cellStyles?: {
    [rowIndex: number]: {
      [colIndex: number]: Partial<CellStyle>;
    };
  };
  cellMerge?: {
    [rowIndex: number]: {
      [colIndex: number]: {
        colspan?: number;
        rowspan?: number;
      };
    };
  };

  // 🆕 Column-level conditional visibility
  columnConditions?: {
    [colIndex: number]: {
      enabled: boolean;
      variable: string;
      operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'contains';
      value: string | number | string[];
    };
  };
}

export interface Styles {
  fontName: string | undefined;
  fontWeight?: string;
  fontStyle?: string;
  backgroundColor: string;
  textColor: string;
  lineHeight: number;
  characterSpacing: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  verticalAlignment: 'top' | 'middle' | 'bottom';
  fontSize: number;
  cellPadding: Spacing;
  lineColor: string;
  lineWidth: BorderInsets;
  cellWidth: number;
  minCellHeight: number;
  minCellWidth: number;
  textDecoration?: string;
  textTransform?: string;
  whiteSpace?: string;
  wordBreak?: string;
}

export interface TableInput {
  settings: Settings;
  styles: StylesProps;
  content: ContentInput;
}

interface ContentInput {
  body: string[][];
  head: string[][];
  columns: number[];
}

export interface Settings {
  startY: number;
  margin: Spacing;
  tableWidth: number;
  showHead: boolean;
  tableLineWidth: number;
  tableLineColor: string;
}

export interface StylesProps {
  styles: Partial<Styles>;
  headStyles: Partial<Styles>;
  bodyStyles: Partial<Styles>;
  alternateRowStyles: Partial<Styles>;
  columnStyles: { [key: string]: Partial<Styles> };
  rowStyles?: { [rowIndex: number]: Partial<CellStyle> };
  cellStyles?: {
    [rowIndex: number]: {
      [colIndex: number]: Partial<CellStyle>;
    };
  };
}

export type Section = 'head' | 'body';
