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
        span: 24, // Full width for each field
        labelWidth: isNestedObject ? undefined : 120, // Fixed label width for simple fields only
        __tab: 'header',
        hidden: !showHead,
        props: isNestedObject ? field.props : {
          ...field.props,
          style: { width: '100%' },
        },
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
        span: 24, // Full width for each field
        labelWidth: isNestedObject ? undefined : 120, // Fixed label width for simple fields only
        __tab: 'body',
        props: isNestedObject ? field.props : {
          ...field.props,
          style: { width: '100%' },
        },
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
          cardProps: {
            bordered: false,
            style: { border: 'none', boxShadow: 'none', background: 'transparent', marginBottom: 0 },
            bodyStyle: { padding: 0 }
          },
        },
        items: {
          type: 'object',
          displayType: 'row',
          properties: {
            title: {
              title: 'Title',
              type: 'string',
              widget: 'input',
              span: 24,
              labelWidth: 120,
              props: { placeholder: 'Primary Findings', style: { width: '100%' } },
              default: '',
            },
            startRow: {
              title: 'Start Row',
              type: 'number',
              widget: 'inputNumber',
              props: { min: 0, style: { width: '100%' } },
              span: 24,
              labelWidth: 120,
              default: 0,
            },
            visible: {
              title: 'Visible',
              type: 'boolean',
              widget: 'checkbox',
              span: 24,
              labelWidth: 120,
              default: true,
            },
            colspan: {
              title: 'Span All Columns',
              type: 'boolean',
              widget: 'checkbox',
              span: 24,
              labelWidth: 120,
              default: true,
            },
            styles: {
              type: 'object',
              displayType: 'row',
              span: 24,
              properties: {
                backgroundColor: {
                  title: 'Background Color',
                  type: 'string',
                  widget: 'color',
                  props: { disabledAlpha: true, style: { width: '100%' } },
                  rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
                  span: 24,
                  labelWidth: 120,
                  default: '#0C2340',
                },
                fontColor: {
                  title: 'Text Color',
                  type: 'string',
                  widget: 'color',
                  props: { disabledAlpha: true, style: { width: '100%' } },
                  rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
                  span: 24,
                  labelWidth: 120,
                  default: '#FFFFFF',
                },
                fontName: {
                  title: 'Font Family',
                  type: 'string',
                  widget: 'select',
                  props: { options: fontNames.map((name) => ({ label: name, value: name })), style: { width: '100%' } },
                  span: 24,
                  labelWidth: 120,
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
                    style: { width: '100%' },
                  },
                  span: 24,
                  labelWidth: 120,
                  default: '700',
                },
                fontSize: {
                  title: 'Font Size',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, style: { width: '100%' } },
                  span: 24,
                  labelWidth: 120,
                  default: 9,
                },
                lineHeight: {
                  title: 'Line Height',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { step: 0.1, min: 0, style: { width: '100%' } },
                  span: 24,
                  labelWidth: 120,
                },
                characterSpacing: {
                  title: 'Letter Spacing',
                  type: 'number',
                  widget: 'inputNumber',
                  props: { min: 0, step: 0.1, style: { width: '100%' } },
                  span: 24,
                  labelWidth: 120,
                },
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
                    style: { width: '100%' },
                  },
                  span: 24,
                  labelWidth: 120,
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
                    style: { width: '100%' },
                  },
                  span: 24,
                  labelWidth: 120,
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
                    style: { width: '100%' },
                  },
                  span: 24,
                  labelWidth: 120,
                  default: 'uppercase',
                },
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
                  props: { disabledAlpha: true, style: { width: '100%' } },
                  rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('validation.hexColor') }],
                  span: 24,
                  labelWidth: 120,
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
