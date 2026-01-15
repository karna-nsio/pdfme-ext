import {
  DEFAULT_ALIGNMENT,
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_CHARACTER_SPACING,
  DEFAULT_FONT_COLOR,
  ALIGN_RIGHT,
  ALIGN_CENTER,
  ALIGN_LEFT,
  VERTICAL_ALIGN_TOP,
  VERTICAL_ALIGN_MIDDLE,
  VERTICAL_ALIGN_BOTTOM,
} from '../text/constants.js';
import { HEX_COLOR_PATTERN } from '../constants.js';

export const getDefaultCellStyles = () => ({
  fontName: undefined,
  fontWeight: 'normal' as const,
  fontStyle: 'normal' as const,
  alignment: DEFAULT_ALIGNMENT,
  verticalAlignment: VERTICAL_ALIGN_MIDDLE,
  fontSize: DEFAULT_FONT_SIZE,
  lineHeight: DEFAULT_LINE_HEIGHT,
  characterSpacing: DEFAULT_CHARACTER_SPACING,
  fontColor: DEFAULT_FONT_COLOR,
  backgroundColor: '',
  borderColor: '#888888',
  borderWidth: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
  padding: { top: 5, bottom: 5, left: 5, right: 5 },
  textDecoration: 'none' as const,
  textTransform: 'none' as const,
  whiteSpace: 'normal' as const,
  wordBreak: 'normal' as const,
});

const getBoxDimensionProp = (step = 1) => {
  const getCommonProp = () => ({
    type: 'number',
    widget: 'inputNumber',
    props: { min: 0, step },
    span: 6,
  });
  return {
    top: { title: 'Top', ...getCommonProp() },
    right: { title: 'Right', ...getCommonProp() },
    bottom: { title: 'Bottom', ...getCommonProp() },
    left: { title: 'Left', ...getCommonProp() },
  };
};

export const getCellPropPanelSchema = (arg: {
  i18n: (key: string) => string;
  fallbackFontName: string;
  fontNames: string[];
  isBody?: boolean;
}) => {
  const { i18n, fallbackFontName, fontNames, isBody } = arg;

  return {
    fontName: {
      title: i18n('schemas.text.fontName'),
      type: 'string',
      widget: 'select',
      default: fallbackFontName,
      placeholder: fallbackFontName,
      props: { options: fontNames.map((name) => ({ label: name, value: name })) },
      span: 12,
    },
    fontWeight: {
      title: i18n('schemas.text.fontWeight') || 'Font Weight',
      type: 'string',
      widget: 'select',
      default: 'normal',
      props: {
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Bold', value: 'bold' },
          { label: '100 (Thin)', value: '100' },
          { label: '200 (Extra Light)', value: '200' },
          { label: '300 (Light)', value: '300' },
          { label: '400 (Normal)', value: '400' },
          { label: '500 (Medium)', value: '500' },
          { label: '600 (Semi Bold)', value: '600' },
          { label: '700 (Bold)', value: '700' },
          { label: '800 (Extra Bold)', value: '800' },
          { label: '900 (Black)', value: '900' },
        ],
      },
      span: 12,
    },
    fontSize: {
      title: i18n('schemas.text.size'),
      type: 'number',
      widget: 'inputNumber',
      props: { min: 0 },
      span: 6,
    },
    characterSpacing: {
      title: i18n('schemas.text.spacing'),
      type: 'number',
      widget: 'inputNumber',
      props: { min: 0 },
      span: 6,
    },
    alignment: {
      title: i18n('schemas.text.textAlign'),
      type: 'string',
      widget: 'select',
      props: {
        options: [
          { label: i18n('schemas.left'), value: ALIGN_LEFT },
          { label: i18n('schemas.center'), value: ALIGN_CENTER },
          { label: i18n('schemas.right'), value: ALIGN_RIGHT },
        ],
      },
      span: 8,
    },
    verticalAlignment: {
      title: i18n('schemas.text.verticalAlign'),
      type: 'string',
      widget: 'select',
      props: {
        options: [
          { label: i18n('schemas.top'), value: VERTICAL_ALIGN_TOP },
          { label: i18n('schemas.middle'), value: VERTICAL_ALIGN_MIDDLE },
          { label: i18n('schemas.bottom'), value: VERTICAL_ALIGN_BOTTOM },
        ],
      },
      span: 8,
    },
    lineHeight: {
      title: i18n('schemas.text.lineHeight'),
      type: 'number',
      widget: 'inputNumber',
      props: { step: 0.1, min: 0 },
      span: 8,
    },
    fontColor: {
      title: i18n('schemas.textColor'),
      type: 'string',
      widget: 'color',
      props: {
        disabledAlpha: true,
      },
      rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
    },
    borderColor: {
      title: i18n('schemas.borderColor'),
      type: 'string',
      widget: 'color',
      props: {
        disabledAlpha: true,
      },
      rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
    },
    backgroundColor: {
      title: i18n('schemas.backgroundColor'),
      type: 'string',
      widget: 'color',
      props: {
        disabledAlpha: true,
      },
      rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
    },
    ...(isBody
      ? {
          alternateBackgroundColor: {
            title: i18n('schemas.table.alternateBackgroundColor'),
            type: 'string',
            widget: 'color',
            props: {
              disabledAlpha: true,
            },
            rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
          },
        }
      : {}),
    borderWidth: {
      title: i18n('schemas.borderWidth'),
      type: 'object',
      widget: 'lineTitle',
      span: 24,
      properties: getBoxDimensionProp(0.1),
    },
    padding: {
      title: i18n('schemas.padding'),
      type: 'object',
      widget: 'lineTitle',
      span: 24,
      properties: getBoxDimensionProp(),
    },
  };
};

export const getColumnStylesPropPanelSchema = ({
  head,
  i18n,
}: {
  head: string[];
  i18n: (key: string) => string;
}) => ({
  alignment: {
    type: 'object',
    widget: 'lineTitle',
    title: i18n('schemas.text.textAlign'),
    column: 3,
    properties: head.reduce(
      (acc, cur, i) =>
        Object.assign(acc, {
          [i]: {
            title: cur || 'Column ' + String(i + 1),
            type: 'string',
            widget: 'select',
            props: {
              options: [
                { label: i18n('schemas.left'), value: ALIGN_LEFT },
                { label: i18n('schemas.center'), value: ALIGN_CENTER },
                { label: i18n('schemas.right'), value: ALIGN_RIGHT },
              ],
            },
          },
        }),
      {},
    ),
  },
});

export const getBody = (value: string | string[][]): string[][] => {
  if (typeof value === 'string') {
    return JSON.parse(value || '[]') as string[][];
  }
  return value || [];
};

export const getBodyWithRange = (
  value: string | string[][],
  range?: { start: number; end?: number | undefined },
) => {
  const body = getBody(value);
  if (!range) return body;
  return body.slice(range.start, range.end);
};

// Helper function to deep merge cell styles with proper precedence
export const mergeCellStyles = <T extends Record<string, any>>(
  baseStyles: T,
  ...overrides: Array<Partial<T> | undefined>
): T => {
  let result = { ...baseStyles };

  for (const override of overrides) {
    if (!override) continue;

    for (const key in override) {
      const value = override[key];
      if (value !== undefined && value !== null) {
        result[key] = value as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
};
