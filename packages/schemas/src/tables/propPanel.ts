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
      '-------': { type: 'void', widget: 'Divider', __tab: 'basic' },
      tableStyles: {
        title: i18n('schemas.table.tableStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
        __tab: 'basic',
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
      '--------': { type: 'void', widget: 'Divider', __tab: 'sections' },
      rowGroups: {
        title: i18n('schemas.table.sections') || 'Section Headers',
        type: 'array',
        span: 24,
        __tab: 'sections',
        props: {
          hideTitle: true,
          addBtnProps: { block: true },
        },
        items: {
          type: 'object',
          displayType: 'row',
          properties: {
            // Basic Settings (top level - no card to maintain data structure)
            title: {
              title: 'Title',
              type: 'string',
              widget: 'input',
              span: 24,
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
            '---divider-appearance': { type: 'void', widget: 'Divider', span: 24 },

            // Appearance Card (collapsed by default - acts as accordion)
            styles: {
              title: 'Appearance',
              type: 'object',
              widget: 'Card',
              span: 24,
              props: {
                defaultCollapsed: true,
              },
              properties: {
                // Colors Section
                backgroundColor: {
                  title: 'Background Color',
                  type: 'string',
                  widget: 'color',
                  props: { disabledAlpha: true },
                  rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
                  span: 12,
                  default: '#0C2340',
                },
                fontColor: {
                  title: 'Text Color',
                  type: 'string',
                  widget: 'color',
                  props: { disabledAlpha: true },
                  rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
                  span: 12,
                  default: '#FFFFFF',
                },
                '---typography': { type: 'void', widget: 'Divider', span: 24 },

                // Typography Section
                fontName: {
                  title: 'Font Family',
                  type: 'string',
                  widget: 'select',
                  props: { options: fontNames.map((name) => ({ label: name, value: name })) },
                  span: 24,
                },
                fontWeight: {
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
                fontSize: {
                  title: 'Font Size',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0 },
                  span: 12,
                  default: 9,
                },
                lineHeight: {
                  title: 'Line Height',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { step: 0.1, min: 0 },
                  span: 12,
                },
                characterSpacing: {
                  title: 'Letter Spacing',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 0.1 },
                  span: 12,
                },
                '---alignment': { type: 'void', widget: 'Divider', span: 24 },

                // Alignment Section
                alignment: {
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
                verticalAlignment: {
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
                textTransform: {
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
                  span: 24,
                  default: 'uppercase',
                },
                '---spacing': { type: 'void', widget: 'Divider', span: 24 },

                // Padding & Border Section
                padding: {
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
                borderColor: {
                  title: i18n('schemas.borderColor'),
                  type: 'string',
                  widget: 'color',
                  props: { disabledAlpha: true },
                  rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
                  span: 24,
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
      '---------': { type: 'void', widget: 'Divider', __tab: 'header' },
      headStyles: {
        hidden: !showHead,
        title: i18n('schemas.table.headStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
        __tab: 'header',
        properties: getCellPropPanelSchema({ i18n, fallbackFontName, fontNames }),
      },
      bodyStyles: {
        title: i18n('schemas.table.bodyStyle'),
        type: 'object',
        widget: 'Card',
        span: 24,
        __tab: 'body',
        properties: getCellPropPanelSchema({ i18n, fallbackFontName, fontNames, isBody: true }),
      },
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
