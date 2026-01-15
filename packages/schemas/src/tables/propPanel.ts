import type { PropPanel } from '@pdfme/common';
import type { TableSchema } from './types.js';
import { getFallbackFontName, DEFAULT_FONT_NAME } from '@pdfme/common';
import {
  getDefaultCellStyles,
  getCellPropPanelSchema,
  getColumnStylesPropPanelSchema,
} from './helper.js';
import { HEX_COLOR_PATTERN } from '../constants.js';

export const propPanel: PropPanel<TableSchema> = {
  schema: ({ activeSchema, options, i18n }) => {
    // @ts-expect-error Type casting is necessary here as the activeSchema type is generic
    const tableSchema = activeSchema as TableSchema;
    const head = tableSchema.head || [];
    const showHead = tableSchema.showHead || false;
    const font = options.font || { [DEFAULT_FONT_NAME]: { data: '', fallback: true } };
    const fontNames = Object.keys(font);
    const fallbackFontName = getFallbackFontName(font);

    // Flatten header properties to avoid card wrapper
    const headerCellProps = getCellPropPanelSchema({ i18n, fallbackFontName, fontNames });
    const flattenedHeaderProps = Object.keys(headerCellProps).reduce((acc, key) => {
      const field = (headerCellProps as any)[key];
      const isNestedObject = field.widget === 'lineTitle' || field.type === 'object';

      acc[`headStyles.${key}`] = {
        ...field,
        span: isNestedObject ? 24 : 12, // Half width for simple fields (2 per row), full width for nested
        __tab: 'header',
        hidden: !showHead,
      };
      return acc;
    }, {} as Record<string, any>);

    // Flatten body properties to avoid card wrapper
    const bodyCellProps = getCellPropPanelSchema({ i18n, fallbackFontName, fontNames, isBody: true });
    const flattenedBodyProps = Object.keys(bodyCellProps).reduce((acc, key) => {
      const field = (bodyCellProps as any)[key];
      const isNestedObject = field.widget === 'lineTitle' || field.type === 'object';

      acc[`bodyStyles.${key}`] = {
        ...field,
        span: isNestedObject ? 24 : 12, // Half width for simple fields (2 per row), full width for nested
        __tab: 'body',
      };
      return acc;
    }, {} as Record<string, any>);

    return {
      __tableTabsEnabled: {
        type: 'void',
        default: true,
        hidden: true,
      },
      showHead: {
        title: i18n('schemas.table.showHead'),
        type: 'boolean',
        widget: 'checkbox',
        span: 24,
        __tab: 'basic',
      },
      'tableStyles.borderWidth': {
        title: i18n('schemas.borderWidth'),
        type: 'number',
        widget: 'inputNumber',
        props: { min: 0, step: 0.1 },
        span: 12,
        __tab: 'basic',
      },
      'tableStyles.borderColor': {
        title: i18n('schemas.borderColor'),
        type: 'string',
        widget: 'color',
        props: { disabledAlpha: true },
        rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
        span: 12,
        __tab: 'basic',
      },
      rowGroups: {
        type: 'array',
        widget: 'InlineSections',
        span: 24,
        __tab: 'sections',
        bind: false,
        items: {
          type: 'object',
          properties: {
            title: {
              title: 'Title',
              type: 'string',
              widget: 'input',
              span: 12,
              props: { placeholder: 'Primary Findings' },
              default: '',
            },
            startRow: {
              title: 'Start Row',
              type: 'number',
              widget: 'inputNumber',
              props: { min: 0 },
              span: 12,
              default: 0,
            },
            visible: {
              title: 'Visible',
              type: 'boolean',
              widget: 'checkbox',
              span: 12,
              default: true,
            },
            colspan: {
              title: 'Span All Columns',
              type: 'boolean',
              widget: 'checkbox',
              span: 12,
              default: true,
            },
            'styles.backgroundColor': {
              title: 'Background Color',
              type: 'string',
              widget: 'color',
              props: { disabledAlpha: true },
              rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
              span: 12,
              default: '#0C2340',
            },
            'styles.fontColor': {
              title: 'Text Color',
              type: 'string',
              widget: 'color',
              props: { disabledAlpha: true },
              rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
              span: 12,
              default: '#FFFFFF',
            },
            'styles.fontName': {
              title: 'Font Family',
              type: 'string',
              widget: 'select',
              props: { options: fontNames.map((name) => ({ label: name, value: name })) },
              span: 12,
            },
            'styles.fontWeight': {
              title: 'Font Weight',
              type: 'string',
              widget: 'select',
              props: {
                options: [
                  { label: 'Normal', value: 'normal' },
                  { label: 'Bold', value: 'bold' },
                  { label: '700', value: '700' },
                ],
              },
              span: 12,
              default: '700',
            },
            'styles.fontSize': {
              title: 'Font Size',
              type: 'number',
              widget: 'inputNumber',
              props: { min: 0 },
              span: 12,
              default: 9,
            },
            'styles.lineHeight': {
              title: 'Line Height',
              type: 'number',
              widget: 'inputNumber',
              props: { step: 0.1, min: 0 },
              span: 12,
            },
            'styles.characterSpacing': {
              title: 'Letter Spacing',
              type: 'number',
              widget: 'inputNumber',
              props: { min: 0, step: 0.1 },
              span: 12,
            },
            'styles.alignment': {
              title: 'Text Align',
              type: 'string',
              widget: 'select',
              props: {
                options: [
                  { label: i18n('schemas.left'), value: 'left' },
                  { label: i18n('schemas.center'), value: 'center' },
                  { label: i18n('schemas.right'), value: 'right' },
                ],
              },
              span: 12,
              default: 'left',
            },
            'styles.verticalAlignment': {
              title: 'Vertical Align',
              type: 'string',
              widget: 'select',
              props: {
                options: [
                  { label: i18n('schemas.top'), value: 'top' },
                  { label: i18n('schemas.middle'), value: 'middle' },
                  { label: i18n('schemas.bottom'), value: 'bottom' },
                ],
              },
              span: 12,
              default: 'middle',
            },
            'styles.textTransform': {
              title: 'Text Transform',
              type: 'string',
              widget: 'select',
              props: {
                options: [
                  { label: 'None', value: 'none' },
                  { label: 'UPPERCASE', value: 'uppercase' },
                  { label: 'lowercase', value: 'lowercase' },
                  { label: 'Capitalize', value: 'capitalize' },
                ],
              },
              span: 12,
              default: 'uppercase',
            },
            'styles.padding': {
              title: i18n('schemas.padding'),
              type: 'object',
              widget: 'lineTitle',
              span: 24,
              default: { top: 4, right: 8, bottom: 4, left: 8 },
              properties: {
                top: {
                  title: 'Top',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 1 },
                  span: 6,
                  default: 4,
                },
                right: {
                  title: 'Right',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 1 },
                  span: 6,
                  default: 8,
                },
                bottom: {
                  title: 'Bottom',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 1 },
                  span: 6,
                  default: 4,
                },
                left: {
                  title: 'Left',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 1 },
                  span: 6,
                  default: 8,
                },
              },
            },
            'styles.borderColor': {
              title: i18n('schemas.borderColor'),
              type: 'string',
              widget: 'color',
              props: { disabledAlpha: true },
              rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
              span: 12,
            },
            'styles.borderWidth': {
              title: i18n('schemas.borderWidth'),
              type: 'object',
              widget: 'lineTitle',
              span: 24,
              properties: {
                top: {
                  title: 'Top',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 0.1 },
                  span: 6,
                },
                right: {
                  title: 'Right',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 0.1 },
                  span: 6,
                },
                bottom: {
                  title: 'Bottom',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 0.1 },
                  span: 6,
                },
                left: {
                  title: 'Left',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 0.1 },
                  span: 6,
                },
              },
            },
          },
        },
      },
      ...flattenedHeaderProps,
      ...flattenedBodyProps,
      columnStyles: {
        title: i18n('schemas.table.columnStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
        __tab: 'advanced',
        properties: getColumnStylesPropPanelSchema({ head, i18n }),
      },
    };
  },
  defaultSchema: {
    name: '',
    type: 'table',
    position: { x: 0, y: 0 },
    width: 150,
    height: 20,
    content: JSON.stringify([
      ['Alice', 'New York', 'Alice is a freelance web designer and developer'],
      ['Bob', 'Paris', 'Bob is a freelance illustrator and graphic designer'],
    ]),
    showHead: true,
    head: ['Name', 'City', 'Description'],
    headWidthPercentages: [30, 30, 40],
    tableStyles: {
      borderColor: '#000000',
      borderWidth: 0.3,
    },
    headStyles: Object.assign(getDefaultCellStyles(), {
      fontWeight: 'bold', // 🆕 Bold headers by default
      fontColor: '#ffffff',
      backgroundColor: '#2980ba',
      borderColor: '',
      borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
    }),
    bodyStyles: Object.assign(getDefaultCellStyles(), {
      alternateBackgroundColor: '#f5f5f5',
    }),
    columnStyles: {},
    columnConditions: {},
    rowGroups: [], // 🆕
    rowStyles: {}, // 🆕
    cellStyles: {}, // 🆕
    cellMerge: {}, // 🆕
  },
};
