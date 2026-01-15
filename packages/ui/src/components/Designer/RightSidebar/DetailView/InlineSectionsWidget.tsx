import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, InputNumber, Select, Checkbox, ColorPicker } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

/**
 * InlineSectionsWidget - Renders section header fields inline without cards
 *
 * Provides a flat, card-free interface matching the design of other tabs
 */
const InlineSectionsWidget: React.FC<any> = (props) => {
  const { changeSchemas, activeSchema } = props;

  // Get current sections from activeSchema
  const sections = Array.isArray(activeSchema?.rowGroups) ? activeSchema.rowGroups : [];

  // Local state for editing (responsive UI without focus loss)
  const [localSections, setLocalSections] = useState(sections);

  // Sync local state when activeSchema changes from external source
  useEffect(() => {
    setLocalSections(sections);
  }, [JSON.stringify(sections)]);

  // Update sections using PDFme's changeSchemas API
  const updateSchema = (newValue: any[]) => {
    if (typeof changeSchemas === 'function' && activeSchema) {
      changeSchemas([{
        key: 'rowGroups',
        value: newValue,
        schemaId: activeSchema.id
      }]);
    }
  };

  // Get font names from options
  const fontNames = (props as any).options?.font ? Object.keys((props as any).options.font) : ['NotoSerifJP'];

  const handleAdd = () => {
    const defaultSection = {
      title: '',
      startRow: 0,
      visible: true,
      colspan: true,
      styles: {
        backgroundColor: '#0C2340',
        fontColor: '#FFFFFF',
        fontWeight: '700',
        fontSize: 9,
        textTransform: 'uppercase',
        alignment: 'left',
        verticalAlignment: 'middle',
        padding: { top: 4, right: 8, bottom: 4, left: 8 },
        borderColor: '',
        borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    };
    const newSections = [...localSections, defaultSection];
    setLocalSections(newSections);
    updateSchema(newSections);
  };

  const handleRemove = (index: number) => {
    const newSections = localSections.filter((_: any, i: number) => i !== index);
    setLocalSections(newSections);
    updateSchema(newSections);
  };

  // Update local state only (for responsive typing in text inputs)
  const handleLocalChange = (index: number, field: string, fieldValue: any) => {
    const newSections = [...localSections];

    if (field.startsWith('styles.')) {
      const styleField = field.replace('styles.', '');
      if (styleField.includes('.')) {
        const [parent, child] = styleField.split('.');
        newSections[index] = {
          ...newSections[index],
          styles: {
            ...newSections[index].styles,
            [parent]: {
              ...newSections[index].styles[parent],
              [child]: fieldValue,
            },
          },
        };
      } else {
        newSections[index] = {
          ...newSections[index],
          styles: {
            ...newSections[index].styles,
            [styleField]: fieldValue,
          },
        };
      }
    } else {
      newSections[index] = {
        ...newSections[index],
        [field]: fieldValue,
      };
    }

    setLocalSections(newSections);
  };

  // Update both local state and schema (for blur or immediate updates)
  const handleBlur = (index: number, field: string) => {
    // Use current local state value to update schema
    updateSchema(localSections);
  };

  // Immediate update for non-text fields (select, checkbox, number, color)
  const handleImmediateChange = (index: number, field: string, fieldValue: any) => {
    const newSections = [...localSections];

    if (field.startsWith('styles.')) {
      const styleField = field.replace('styles.', '');
      if (styleField.includes('.')) {
        const [parent, child] = styleField.split('.');
        newSections[index] = {
          ...newSections[index],
          styles: {
            ...newSections[index].styles,
            [parent]: {
              ...newSections[index].styles[parent],
              [child]: fieldValue,
            },
          },
        };
      } else {
        newSections[index] = {
          ...newSections[index],
          styles: {
            ...newSections[index].styles,
            [styleField]: fieldValue,
          },
        };
      }
    } else {
      newSections[index] = {
        ...newSections[index],
        [field]: fieldValue,
      };
    }

    setLocalSections(newSections);
    updateSchema(newSections);
  };

  const renderField = (
    index: number,
    label: string,
    field: string,
    value: any,
    type: 'input' | 'number' | 'select' | 'checkbox' | 'color',
    options?: { label: string; value: any }[],
    span: number = 12
  ) => {
    const containerStyle: React.CSSProperties = {
      display: 'inline-block',
      width: span === 24 ? '100%' : span === 12 ? '50%' : '25%',
      paddingRight: span !== 24 ? '8px' : '0',
      marginBottom: '16px',
      verticalAlign: 'top',
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      marginBottom: '4px',
      fontSize: '14px',
      color: '#000000d9',
    };

    return (
      <div key={field} style={containerStyle}>
        <label style={labelStyle}>{label}</label>
        {type === 'input' && (
          <Input
            value={value}
            onChange={(e) => handleLocalChange(index, field, e.target.value)}
            onBlur={() => handleBlur(index, field)}
            style={{ width: '100%' }}
          />
        )}
        {type === 'number' && (
          <InputNumber
            value={value}
            onChange={(val) => handleImmediateChange(index, field, val)}
            style={{ width: '100%' }}
            min={0}
          />
        )}
        {type === 'select' && (
          <Select
            value={value}
            onChange={(val) => handleImmediateChange(index, field, val)}
            style={{ width: '100%' }}
            options={options}
          />
        )}
        {type === 'checkbox' && (
          <Checkbox
            checked={value}
            onChange={(e) => handleImmediateChange(index, field, e.target.checked)}
          >
            {label}
          </Checkbox>
        )}
        {type === 'color' && (
          <ColorPicker
            value={value}
            onChange={(_, hex) => handleImmediateChange(index, field, hex)}
            showText
            style={{ width: '100%' }}
            disabledAlpha
          />
        )}
      </div>
    );
  };

  return (
    <div>
      {localSections.map((section: any, index: number) => (
        <div key={index} style={{ marginBottom: '24px', position: 'relative' }}>
          {/* Remove button */}
          <Button
            type="text"
            danger
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => handleRemove(index)}
            style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
          >
            Remove
          </Button>

          {/* Basic fields */}
          <div style={{ marginBottom: '8px' }}>
            {renderField(index, 'Title', 'title', section.title, 'input', undefined, 12)}
            {renderField(index, 'Start Row', 'startRow', section.startRow, 'number', undefined, 12)}
            {renderField(index, 'Visible', 'visible', section.visible, 'checkbox', undefined, 12)}
            {renderField(index, 'Span All Columns', 'colspan', section.colspan, 'checkbox', undefined, 12)}
          </div>

          {/* Style fields */}
          <div style={{ marginBottom: '8px' }}>
            {renderField(index, 'Background Color', 'styles.backgroundColor', section.styles?.backgroundColor, 'color', undefined, 12)}
            {renderField(index, 'Text Color', 'styles.fontColor', section.styles?.fontColor, 'color', undefined, 12)}
            {renderField(index, 'Font Family', 'styles.fontName', section.styles?.fontName, 'select', fontNames.map(n => ({ label: n, value: n })), 12)}
            {renderField(index, 'Font Weight', 'styles.fontWeight', section.styles?.fontWeight, 'select', [
              { label: 'Normal', value: 'normal' },
              { label: 'Bold', value: 'bold' },
              { label: '700', value: '700' },
            ], 12)}
            {renderField(index, 'Font Size', 'styles.fontSize', section.styles?.fontSize, 'number', undefined, 12)}
            {renderField(index, 'Text Align', 'styles.alignment', section.styles?.alignment, 'select', [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ], 12)}
            {renderField(index, 'Vertical Align', 'styles.verticalAlignment', section.styles?.verticalAlignment, 'select', [
              { label: 'Top', value: 'top' },
              { label: 'Middle', value: 'middle' },
              { label: 'Bottom', value: 'bottom' },
            ], 12)}
            {renderField(index, 'Text Transform', 'styles.textTransform', section.styles?.textTransform, 'select', [
              { label: 'None', value: 'none' },
              { label: 'UPPERCASE', value: 'uppercase' },
              { label: 'lowercase', value: 'lowercase' },
              { label: 'Capitalize', value: 'capitalize' },
            ], 12)}
          </div>

          {/* Separator between sections */}
          {index < localSections.length - 1 && (
            <div style={{
              borderTop: '1px solid #d9d9d9',
              marginTop: '16px',
              paddingTop: '16px'
            }} />
          )}
        </div>
      ))}

      {/* Add button */}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginTop: localSections.length > 0 ? '16px' : 0 }}
      >
        Add Section Header
      </Button>
    </div>
  );
};

export default InlineSectionsWidget;
