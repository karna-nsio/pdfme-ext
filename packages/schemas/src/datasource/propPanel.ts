import { PropPanel, PropPanelSchema, getFallbackFontName, DEFAULT_FONT_NAME } from '@pdfme/common';
import type { DatasourceSchema, DatasourceOption } from './types.js';
import { DEFAULT_DATASOURCE_FIELD, DEFAULT_DATASOURCE_OPTIONS } from './constants.js';
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_ALIGNMENT,
  DEFAULT_VERTICAL_ALIGNMENT,
  DEFAULT_CHARACTER_SPACING,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_FONT_COLOR,
} from '../text/constants.js';
import { DEFAULT_OPACITY, HEX_COLOR_PATTERN } from '../constants.js';

/**
 * PropPanel configuration for datasource field
 * Supports dynamic options from Designer via options.datasourceOptions
 */
export const propPanel: PropPanel<DatasourceSchema> = {
  schema: (propPanelProps) => {
    const { options, i18n, activeSchema } = propPanelProps;

    // Get datasource options from Designer options
    // Falls back to default options if not provided
    const datasourceOptions: DatasourceOption[] =
      options.datasourceOptions || DEFAULT_DATASOURCE_OPTIONS;

    console.log('🔥 [Datasource PropPanel] Options count:', datasourceOptions.length);

    // Get font configuration
    const font = options.font || { [DEFAULT_FONT_NAME]: { data: '', fallback: true } };
    const fontNames = Object.keys(font);
    const fallbackFontName = getFallbackFontName(font);

    const datasourceSchema: Record<string, PropPanelSchema> = {
      // Main datasource field selector
      datasourceField: {
        title: i18n('schemas.datasource.field') || 'Data Source Field',
        type: 'string',
        widget: 'select',
        default: DEFAULT_DATASOURCE_FIELD,
        props: {
          options: datasourceOptions.map(opt => ({
            label: opt.label,
            value: opt.value,
            disabled: opt.disabled || false,
          })),
          showSearch: true,
          placeholder: i18n('schemas.datasource.placeholder') || 'Select a field to bind',
        },
        span: 24,
      },

      // Divider
      '-------1': { type: 'void', widget: 'Divider' },

      // Text formatting options (inherited from text schema)
      fontName: {
        title: i18n('schemas.text.fontName'),
        type: 'string',
        widget: 'select',
        default: fallbackFontName,
        placeholder: fallbackFontName,
        props: { options: fontNames.map((name) => ({ label: name, value: name })) },
        span: 12,
      },
      fontSize: {
        title: i18n('schemas.text.size'),
        type: 'number',
        widget: 'inputNumber',
        span: 6,
        props: { min: 6, max: 72 },
      },
      characterSpacing: {
        title: i18n('schemas.text.spacing'),
        type: 'number',
        widget: 'inputNumber',
        span: 6,
        props: { min: 0 },
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
        rules: [
          {
            pattern: HEX_COLOR_PATTERN,
            message: i18n('validation.hexColor'),
          },
        ],
      },
      backgroundColor: {
        title: i18n('schemas.bgColor'),
        type: 'string',
        widget: 'color',
        props: {
          disabledAlpha: true,
        },
        rules: [
          {
            pattern: HEX_COLOR_PATTERN,
            message: i18n('validation.hexColor'),
          },
        ],
      },
    };

    return datasourceSchema;
  },

  defaultSchema: {
    type: 'datasource',
    name: 'datasource',
    datasourceField: DEFAULT_DATASOURCE_FIELD,
    content: '',
    position: { x: 0, y: 0 },
    width: 100,
    height: 16,
    rotate: 0,
    alignment: DEFAULT_ALIGNMENT,
    verticalAlignment: DEFAULT_VERTICAL_ALIGNMENT,
    fontSize: DEFAULT_FONT_SIZE,
    lineHeight: DEFAULT_LINE_HEIGHT,
    characterSpacing: DEFAULT_CHARACTER_SPACING,
    fontColor: DEFAULT_FONT_COLOR,
    fontName: undefined,
    backgroundColor: '',
    opacity: DEFAULT_OPACITY,
  },
};
