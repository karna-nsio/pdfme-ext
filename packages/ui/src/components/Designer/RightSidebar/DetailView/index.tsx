import { useForm } from 'form-render';
import React, { useRef, useContext, useState, useEffect } from 'react';
import type {
  Dict,
  ChangeSchemaItem,
  SchemaForUI,
  PropPanelWidgetProps,
  PropPanelSchema,
  Schema,
} from '@pdfme/common';
import type { SidebarProps } from '../../../../types.js';
import { Menu } from 'lucide-react';
import { I18nContext, PluginsRegistry, OptionsContext } from '../../../../contexts.js';
import { getSidebarContentHeight, debounce } from '../../../../helper.js';
import { theme, Typography, Button, Divider } from 'antd';
import AlignWidget from './AlignWidget.js';
import WidgetRenderer from './WidgetRenderer.js';
import ButtonGroupWidget from './ButtonGroupWidget.js';
import FieldConditionEditor from './FieldConditionEditor.js';
import { InternalNamePath, ValidateErrorEntity } from 'rc-field-form/es/interface.js';

// Import FormRender as a default import
import FormRenderComponent from 'form-render';

const { Text } = Typography;

type DetailViewProps = Pick<
  SidebarProps,
  | 'size'
  | 'schemas'
  | 'schemasList'
  | 'pageSize'
  | 'changeSchemas'
  | 'activeElements'
  | 'deselectSchema'
> & {
  activeSchema: SchemaForUI;
};

const DetailView = (props: DetailViewProps) => {
  const { token } = theme.useToken();

  const { size, schemasList, changeSchemas, deselectSchema, activeSchema } = props;
  const form = useForm();

  const i18n = useContext(I18nContext);
  const pluginsRegistry = useContext(PluginsRegistry);
  const options = useContext(OptionsContext);

  // Define a type-safe i18n function that accepts string keys
  const typedI18n = (key: string): string => {
    // Use a type assertion to handle the union type constraint
    return typeof i18n === 'function' ? i18n(key as keyof Dict) : key;
  };

  const [widgets, setWidgets] = useState<{
    [key: string]: (props: PropPanelWidgetProps) => React.JSX.Element;
  }>({});

  useEffect(() => {
    const newWidgets: typeof widgets = {
      AlignWidget: (p) => <AlignWidget {...p} {...props} options={options} />,
      Divider: () => (
        <Divider style={{ marginTop: token.marginXS, marginBottom: token.marginXS }} />
      ),
      ButtonGroup: (p) => <ButtonGroupWidget {...p} {...props} options={options} />,
      // 🆕 Field condition editor widget
      FieldConditionWidget: (p) => {
        const currentCondition = p.value as any;
        return (
          <FieldConditionEditor
            fieldName={activeSchema.name}
            condition={currentCondition}
            onChange={(newCondition) => {
              // Update the schema condition
              // Use undefined instead of null to properly remove the property
              changeSchemas([{
                key: 'condition',
                value: newCondition === undefined ? undefined : newCondition,
                schemaId: activeSchema.id
              }]);
            }}
          />
        );
      },
    };
    for (const plugin of pluginsRegistry.values()) {
      const widgets = plugin.propPanel.widgets || {};
      Object.entries(widgets).forEach(([widgetKey, widgetValue]) => {
        newWidgets[widgetKey] = (p) => (
          <WidgetRenderer
            {...p}
            {...props}
            options={options}
            theme={token}
            i18n={typedI18n}
            widget={widgetValue}
          />
        );
      });
    }
    setWidgets(newWidgets);
  }, [activeSchema, pluginsRegistry, JSON.stringify(options)]);

  useEffect(() => {
    // Create a type-safe copy of the schema with editable property
    const values: Record<string, unknown> = { ...activeSchema };
    // Safely access and set properties
    const readOnly = typeof values.readOnly === 'boolean' ? values.readOnly : false;
    values.editable = !readOnly;
    form.setValues(values);
  }, [activeSchema, form]);

  useEffect(() => form.resetFields(), [activeSchema.id]);

  useEffect(() => {
    uniqueSchemaName.current = (value: string): boolean => {
      for (const page of schemasList) {
        for (const s of Object.values(page)) {
          if (s.name === value && s.id !== activeSchema.id) {
            return false;
          }
        }
      }
      return true;
    };
  }, [schemasList, activeSchema]);

  // Reference to a function that validates schema name uniqueness
  const uniqueSchemaName = useRef(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_unused: string): boolean => true,
  );

  // Use proper type for validator function parameter
  const validateUniqueSchemaName = (_: unknown, value: string): boolean =>
    uniqueSchemaName.current(value);

  // Use explicit type for debounce function that matches the expected signature
  const handleWatch = debounce(function (...args: unknown[]) {
    const formSchema = args[0] as Record<string, unknown>;
    const formAndSchemaValuesDiffer = (formValue: unknown, schemaValue: unknown): boolean => {
      if (typeof formValue === 'object' && formValue !== null) {
        return JSON.stringify(formValue) !== JSON.stringify(schemaValue);
      }
      return formValue !== schemaValue;
    };

    let changes: ChangeSchemaItem[] = [];
    for (const key in formSchema) {
      if (['id', 'content'].includes(key)) continue;

      let value = formSchema[key];
      if (formAndSchemaValuesDiffer(value, (activeSchema as Record<string, unknown>)[key])) {
        // FIXME memo: https://github.com/pdfme/pdfme/pull/367#issuecomment-1857468274
        if (value === null && ['rotate', 'opacity'].includes(key)) {
          value = undefined;
        }

        if (key === 'editable') {
          const readOnlyValue = !value;
          changes.push({ key: 'readOnly', value: readOnlyValue, schemaId: activeSchema.id });
          if (readOnlyValue) {
            changes.push({ key: 'required', value: false, schemaId: activeSchema.id });
          }
          continue;
        }

        changes.push({ key, value, schemaId: activeSchema.id });
      }
    }

    if (changes.length) {
      // Only commit these schema changes if they have passed form validation
      form
        .validateFields()
        .then(() => changeSchemas(changes))
        .catch((reason: ValidateErrorEntity) => {
          if (reason.errorFields.length) {
            changes = changes.filter(
              (change: ChangeSchemaItem) =>
                !reason.errorFields.find((field: { name: InternalNamePath; errors: string[] }) =>
                  field.name.includes(change.key),
                ),
            );
          }
          if (changes.length) {
            changeSchemas(changes);
          }
        });
    }
  }, 100);

  const activePlugin = pluginsRegistry.findByType(activeSchema.type);
  if (!activePlugin) {
    throw Error(`[@pdfme/ui] Failed to find plugin used for ${activeSchema.type}`);
  }

  const activePropPanelSchema = activePlugin.propPanel.schema;
  const typeOptions: Array<{ label: string; value: string | undefined }> = [];

  pluginsRegistry.entries().forEach(([label, plugin]) => {
    typeOptions.push({ label, value: plugin.propPanel.defaultSchema?.type ?? undefined });
  });

  // Create a safe empty schema as fallback
  const emptySchema: Record<string, unknown> = {};

  // Safely access the default schema with proper null checking
  const defaultSchema: Record<string, unknown> = activePlugin?.propPanel?.defaultSchema
    ? // Create a safe copy of the schema
      (() => {
        const result: Record<string, unknown> = {};

        // Only copy properties that exist on the object
        for (const key in activePlugin.propPanel.defaultSchema) {
          if (Object.prototype.hasOwnProperty.call(activePlugin.propPanel.defaultSchema, key)) {
            result[key] = (activePlugin.propPanel.defaultSchema as Record<string, unknown>)[key];
          }
        }

        return result;
      })()
    : emptySchema;

  // Create a type-safe schema object
  const propPanelSchema: PropPanelSchema = {
    type: 'object',
    column: 2,
    properties: {
      type: {
        title: typedI18n('type'),
        type: 'string',
        widget: 'select',
        props: { options: typeOptions },
        required: true,
        span: 12,
      },
      name: {
        title: typedI18n('fieldName'),
        type: 'string',
        required: true,
        span: 12,
        rules: [
          {
            validator: validateUniqueSchemaName,
            message: typedI18n('validation.uniqueName'),
          },
        ],
        props: { autoComplete: 'off' },
      },
      editable: {
        title: typedI18n('editable'),
        type: 'boolean',
        span: 8,
        hidden: typeof defaultSchema.readOnly !== 'undefined',
      },
      required: {
        title: typedI18n('required'),
        type: 'boolean',
        span: 8,
        hidden: '{{!formData.editable}}',
      },
      hide: {
        title: 'Hide',
        type: 'boolean',
        span: 8,
      },
      '-': { type: 'void', widget: 'Divider' },
      // 🆕 Field condition widget (displayed after divider, before position)
      condition: {
        type: 'object',
        widget: 'FieldConditionWidget',
        span: 24,
      },
      '--': { type: 'void', widget: 'Divider' },
      align: { title: typedI18n('align'), type: 'void', widget: 'AlignWidget' },
      position: {
        type: 'object',
        widget: 'card',
        properties: {
          x: { title: 'X', type: 'number', widget: 'inputNumber', required: true, span: 8, min: 0 },
          y: { title: 'Y', type: 'number', widget: 'inputNumber', required: true, span: 8, min: 0 },
        },
      },
      width: {
        title: typedI18n('width'),
        type: 'number',
        widget: 'inputNumber',
        required: true,
        span: 6,
        props: { min: 0 },
      },
      height: {
        title: typedI18n('height'),
        type: 'number',
        widget: 'inputNumber',
        required: true,
        span: 6,
        props: { min: 0 },
      },
      rotate: {
        title: typedI18n('rotate'),
        type: 'number',
        widget: 'inputNumber',
        disabled: typeof defaultSchema.rotate === 'undefined',
        max: 360,
        props: { min: 0 },
        span: 6,
      },
      opacity: {
        title: typedI18n('opacity'),
        type: 'number',
        widget: 'inputNumber',
        disabled: typeof defaultSchema.opacity === 'undefined',
        props: { step: 0.1, min: 0, max: 1 },
        span: 6,
      },
    },
  };

  // Create a safe copy of the properties
  const safeProperties = { ...propPanelSchema.properties };

  if (typeof activePropPanelSchema === 'function') {
    // Create a new object without the schemasList property
    const { size, schemas, pageSize, changeSchemas, activeElements, deselectSchema, activeSchema } =
      props;
    const propPanelProps = {
      size,
      schemas,
      pageSize,
      changeSchemas,
      activeElements,
      deselectSchema,
      activeSchema,
    };

    // Use the typedI18n function to avoid type issues
    const functionResult = activePropPanelSchema({
      ...propPanelProps,
      options,
      theme: token,
      i18n: typedI18n,
    });

    // Safely handle the result
    const apps = functionResult && typeof functionResult === 'object' ? functionResult : {};

    // Create a divider if needed
    const dividerObj =
      Object.keys(apps).length === 0 ? {} : { '--': { type: 'void', widget: 'Divider' } };

    // Assign properties safely - use type assertion to satisfy TypeScript
    propPanelSchema.properties = {
      ...safeProperties,
      ...(dividerObj as Record<string, Partial<Schema>>),
      ...(apps as Record<string, Partial<Schema>>),
    };
  } else {
    // Handle non-function case
    const apps =
      activePropPanelSchema && typeof activePropPanelSchema === 'object'
        ? activePropPanelSchema
        : {};

    // Create a divider if needed
    const dividerObj =
      Object.keys(apps).length === 0 ? {} : { '--': { type: 'void', widget: 'Divider' } };

    // Assign properties safely - use type assertion to satisfy TypeScript
    propPanelSchema.properties = {
      ...safeProperties,
      ...(dividerObj as Record<string, Partial<Schema>>),
      ...(apps as Record<string, Partial<Schema>>),
    };
  }

  const detailViewStyles = `
    /* Scrollbar styling */
    .detail-view-scrollable::-webkit-scrollbar {
      width: 6px;
    }
    .detail-view-scrollable::-webkit-scrollbar-track {
      background: transparent;
    }
    .detail-view-scrollable::-webkit-scrollbar-thumb {
      background: ${token.colorBorder};
      border-radius: 3px;
    }
    .detail-view-scrollable::-webkit-scrollbar-thumb:hover {
      background: ${token.colorBorderSecondary};
    }

    /* Form styling - Figma-inspired clean design */
    .detail-view-scrollable .ant-form-item {
      margin-bottom: 16px;
    }

    .detail-view-scrollable .ant-form-item-label > label {
      font-size: 12px;
      font-weight: 500;
      color: ${token.colorTextSecondary};
      height: auto;
    }

    .detail-view-scrollable .ant-input,
    .detail-view-scrollable .ant-input-number,
    .detail-view-scrollable .ant-select-selector {
      border-radius: ${token.borderRadius}px;
      border-color: ${token.colorBorder};
      font-size: 13px;
    }

    .detail-view-scrollable .ant-input:hover,
    .detail-view-scrollable .ant-input-number:hover,
    .detail-view-scrollable .ant-select-selector:hover {
      border-color: ${token.colorPrimaryHover};
    }

    .detail-view-scrollable .ant-input:focus,
    .detail-view-scrollable .ant-input-number:focus,
    .detail-view-scrollable .ant-select-focused .ant-select-selector {
      border-color: ${token.colorPrimary};
      box-shadow: 0 0 0 2px ${token.colorPrimaryBg};
    }

    .detail-view-scrollable .ant-card {
      border-radius: ${token.borderRadiusLG}px;
      border-color: ${token.colorBorderSecondary};
      box-shadow: none;
      margin-bottom: 12px;
    }

    .detail-view-scrollable .ant-card-head {
      padding: 12px 16px;
      min-height: auto;
      border-bottom: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgLayout};
    }

    .detail-view-scrollable .ant-card-head-title {
      font-size: 13px;
      font-weight: 600;
      padding: 0;
    }

    .detail-view-scrollable .ant-card-body {
      padding: 16px;
    }

    .detail-view-scrollable .ant-switch {
      background-color: ${token.colorBgTextHover};
    }

    .detail-view-scrollable .ant-switch-checked {
      background-color: ${token.colorPrimary};
    }

    .detail-view-scrollable .ant-divider {
      margin: 20px 0 16px 0;
      border-color: ${token.colorBorderSecondary};
    }

    /* Compact input number buttons */
    .detail-view-scrollable .ant-input-number-handler-wrap {
      opacity: 0;
      transition: opacity 0.2s;
    }

    .detail-view-scrollable .ant-input-number:hover .ant-input-number-handler-wrap {
      opacity: 1;
    }
  `;

  return (
    <>
      <style>{detailViewStyles}</style>
      <div>
        {/* Header with back button and title */}
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.5rem',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              padding: 0,
              marginRight: '0.5rem',
              borderRadius: token.borderRadius,
            }}
            onClick={deselectSchema}
            icon={<Menu strokeWidth={1.5} size={18} />}
          />
          <Text
            strong
            style={{
              fontSize: token.fontSizeLG,
              color: token.colorText,
            }}
          >
            {typedI18n('editField')}
          </Text>
        </div>

        {/* Form content with custom scrollbar */}
        <div
          className="detail-view-scrollable"
          style={{
            height: getSidebarContentHeight(size.height) - 88, // Account for both headers (40px + 48px)
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '1rem 0.75rem',
          }}
        >
          <FormRenderComponent
            form={form}
            schema={propPanelSchema}
            widgets={widgets}
            watch={{ '#': handleWatch }}
            locale="en-US"
          />
        </div>
      </div>
    </>
  );
};

const propsAreUnchanged = (prevProps: DetailViewProps, nextProps: DetailViewProps) => {
  return JSON.stringify(prevProps.activeSchema) == JSON.stringify(nextProps.activeSchema);
};

export default React.memo(DetailView, propsAreUnchanged);
