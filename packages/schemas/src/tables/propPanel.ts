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
    return {
      showHead: {
        title: i18n('schemas.table.showHead'),
        type: 'boolean',
        widget: 'checkbox',
        span: 24,
      },
      '-------': { type: 'void', widget: 'Divider' },
      tableStyles: {
        title: i18n('schemas.table.tableStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
        properties: {
          borderWidth: {
            title: i18n('schemas.borderWidth'),
            type: 'number',
            widget: 'inputNumber',
            props: { min: 0, step: 0.1 },
            step: 1,
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
        },
      },
      '--------': { type: 'void', widget: 'Divider' },
      rowGroups: {
        title: i18n('schemas.table.rowGroups') || 'Row Groups',
        type: 'array',
        span: 24,
        items: {
          type: 'object',
          properties: {
            title: {
              title: i18n('schemas.table.rowGroupTitle') || 'Title',
              type: 'string',
              widget: 'input',
            },
            startRow: {
              title: i18n('schemas.table.startRow') || 'Start Row',
              type: 'number',
              widget: 'inputNumber',
              props: { min: 0 },
            },
            colspan: {
              title: i18n('schemas.table.spanAllColumns') || 'Span All Columns',
              type: 'boolean',
              widget: 'checkbox',
              default: true,
            },
            visible: {
              title: i18n('schemas.table.visible') || 'Visible',
              type: 'boolean',
              widget: 'checkbox',
              default: true,
            },
            styles: {
              title: i18n('schemas.table.rowGroupStyles') || 'Styles',
              type: 'object',
              widget: 'Card',
              properties: {
                backgroundColor: {
                  title: i18n('schemas.backgroundColor'),
                  type: 'string',
                  widget: 'color',
                  props: {
                    disabledAlpha: true,
                  },
                  rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
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
                fontName: {
                  title: i18n('schemas.text.fontName'),
                  type: 'string',
                  widget: 'select',
                  props: { options: fontNames.map((name) => ({ label: name, value: name })) },
                  span: 12,
                },
                fontWeight: {
                  title: i18n('schemas.text.fontWeight') || 'Font Weight',
                  type: 'string',
                  widget: 'select',
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
                  span: 8,
                },
                lineHeight: {
                  title: i18n('schemas.text.lineHeight'),
                  type: 'number',
                  widget: 'inputNumber',
                  props: { step: 0.1, min: 0 },
                  span: 8,
                },
                characterSpacing: {
                  title: i18n('schemas.text.spacing'),
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0 },
                  span: 8,
                },
                alignment: {
                  title: i18n('schemas.text.textAlign'),
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
                },
                verticalAlignment: {
                  title: i18n('schemas.text.verticalAlign'),
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
                },
                textTransform: {
                  title: i18n('schemas.text.textTransform') || 'Text Transform',
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
                },
                padding: {
                  title: i18n('schemas.padding'),
                  type: 'object',
                  widget: 'lineTitle',
                  span: 24,
                  properties: {
                    top: {
                      title: 'Top',
                      type: 'number',
                      widget: 'inputNumber',
                      props: { min: 0, step: 1 },
                      span: 6,
                    },
                    right: {
                      title: 'Right',
                      type: 'number',
                      widget: 'inputNumber',
                      props: { min: 0, step: 1 },
                      span: 6,
                    },
                    bottom: {
                      title: 'Bottom',
                      type: 'number',
                      widget: 'inputNumber',
                      props: { min: 0, step: 1 },
                      span: 6,
                    },
                    left: {
                      title: 'Left',
                      type: 'number',
                      widget: 'inputNumber',
                      props: { min: 0, step: 1 },
                      span: 6,
                    },
                  },
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
                borderWidth: {
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
        },
      },
      '---------': { type: 'void', widget: 'Divider' },
      headStyles: {
        hidden: !showHead,
        title: i18n('schemas.table.headStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
        properties: getCellPropPanelSchema({ i18n, fallbackFontName, fontNames }),
      },
      bodyStyles: {
        title: i18n('schemas.table.bodyStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
        properties: getCellPropPanelSchema({ i18n, fallbackFontName, fontNames, isBody: true }),
      },
      columnStyles: {
        title: i18n('schemas.table.columnStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
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
