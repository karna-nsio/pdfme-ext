import type { Schema } from '@pdfme/common';
import type { Font as FontKitFont } from 'fontkit';

export type ALIGNMENT = 'left' | 'center' | 'right' | 'justify';
export type VERTICAL_ALIGNMENT = 'top' | 'middle' | 'bottom';
export type DYNAMIC_FONT_SIZE_FIT = 'horizontal' | 'vertical';

export type FontWidthCalcValues = {
  font: FontKitFont;
  fontSize: number;
  characterSpacing: number;
  boxWidthInPt: number;
};
export type FONT_WEIGHT = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'bold';

export interface TextSchema extends Schema {
  fontName?: string;
  fontWeight?: FONT_WEIGHT;
  fontStyle?: 'normal' | 'italic';
  alignment: ALIGNMENT;
  verticalAlignment: VERTICAL_ALIGNMENT;
  fontSize: number;
  lineHeight: number;
  strikethrough?: boolean;
  underline?: boolean;
  characterSpacing: number;
  dynamicFontSize?: {
    min: number;
    max: number;
    fit: DYNAMIC_FONT_SIZE_FIT;
  };
  fontColor: string;
  backgroundColor: string;
}
