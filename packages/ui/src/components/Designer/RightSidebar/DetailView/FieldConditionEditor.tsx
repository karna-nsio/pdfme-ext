import React, { useState, useContext, useEffect } from 'react';
import { Input, Select, Checkbox, Typography, Button } from 'antd';
import { I18nContext } from '../../../../contexts.js';
import type { GroupCondition } from '@pdfme/common';

const { Text } = Typography;

interface FieldConditionEditorProps {
  fieldName: string;
  condition?: GroupCondition;
  onChange: (condition: GroupCondition | undefined) => void;
  onCancel?: () => void;
}

const OPERATORS = [
  { value: '==', label: 'equals (==)' },
  { value: '!=', label: 'not equals (!=)' },
  { value: '>', label: 'greater than (>)' },
  { value: '<', label: 'less than (<)' },
  { value: '>=', label: 'greater or equal (>=)' },
  { value: '<=', label: 'less or equal (<=)' },
  { value: 'in', label: 'in list (in)' },
  { value: 'contains', label: 'contains' },
];

export const FieldConditionEditor: React.FC<FieldConditionEditorProps> = ({
  fieldName,
  condition,
  onChange,
  onCancel,
}) => {
  const i18n = useContext(I18nContext);
  
  const [enabled, setEnabled] = useState(condition?.enabled ?? false);
  const [variable, setVariable] = useState(condition?.variable ?? '');
  const [operator, setOperator] = useState<GroupCondition['operator']>(condition?.operator ?? '==');
  const [value, setValue] = useState(
    condition?.value
      ? Array.isArray(condition.value)
        ? condition.value.join(', ')
        : String(condition.value)
      : '',
  );

  // Update state when condition prop changes
  useEffect(() => {
    if (condition) {
      setEnabled(condition.enabled ?? false);
      setVariable(condition.variable ?? '');
      setOperator(condition.operator ?? '==');
      setValue(
        condition.value
          ? Array.isArray(condition.value)
            ? condition.value.join(', ')
            : String(condition.value)
          : '',
      );
    } else {
      setEnabled(false);
      setVariable('');
      setOperator('==' as GroupCondition['operator']);
      setValue('');
    }
  }, [condition]);

  // Manual save (like GroupConditionEditor with Save/Cancel buttons)
  const handleSave = () => {
    if (!enabled) {
      onChange(undefined); // Remove condition
      return;
    }

    const trimmedValue = value.trim();
    if (!variable || !trimmedValue) {
      return; // Don't save incomplete conditions
    }

    // Parse value based on operator
    let parsedValue: string | number | string[];
    
    if (operator === 'in') {
      // For 'in' operator, split by comma
      parsedValue = trimmedValue.split(',').map((v) => v.trim());
    } else if (['>', '<', '>=', '<='].includes(operator)) {
      // For numeric operators, try to parse as number
      parsedValue = !isNaN(Number(trimmedValue)) ? Number(trimmedValue) : trimmedValue;
    } else {
      parsedValue = trimmedValue;
    }

    const newCondition: GroupCondition = {
      enabled,
      variable,
      operator: operator as GroupCondition['operator'],
      value: parsedValue,
    };

    onChange(newCondition);
  };

  // Handle individual field changes (no auto-save except for enable checkbox)
  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    
    // If disabling the condition, save immediately
    if (!checked) {
      onChange(undefined); // Remove condition immediately
    }
  };

  const handleVariableChange = (newVariable: string) => {
    setVariable(newVariable);
  };

  const handleOperatorChange = (newOperator: GroupCondition['operator']) => {
    setOperator(newOperator);
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
  };

  // Cancel changes
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getPreviewText = () => {
    if (!enabled) return 'Condition disabled - field always visible';
    
    const valueDisplay = operator === 'in' 
      ? `[${value}]`
      : `"${value}"`;
    
    return `IF data.${variable} ${operator} ${valueDisplay} THEN show "${fieldName}"`;
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <Checkbox
        checked={enabled}
        onChange={(e) => handleEnabledChange(e.target.checked)}
        style={{ marginBottom: '16px' }}
      >
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          {i18n('enableCondition')}
        </span>
      </Checkbox>

      {enabled && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '8px' }}>
              {i18n('conditionVariable')}
            </label>
            <Input
              value={variable}
              onChange={(e) => handleVariableChange(e.target.value)}
              placeholder="e.g., resultType"
              style={{ width: '100%', fontSize: '13px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '8px' }}>
              {i18n('conditionOperator')}
            </label>
            <Select
              value={operator}
              onChange={(val: string) => handleOperatorChange(val as GroupCondition['operator'])}
              options={OPERATORS}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '8px' }}>
              {i18n('conditionValue')}
              {operator === 'in' && (
                <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px', fontWeight: 400 }}>
                  (comma-separated)
                </span>
              )}
            </label>
            <Input
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={operator === 'in' ? 'positive, negative' : 'positive'}
              style={{ width: '100%', fontSize: '13px' }}
            />
          </div>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '4px',
              border: '1px solid #bae6fd',
              marginTop: '8px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#0369a1', marginBottom: '4px', fontWeight: 600 }}>
              {i18n('conditionPreview')}:
            </div>
            <div style={{ fontSize: '11px', color: '#075985', fontFamily: 'monospace', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {getPreviewText()}
            </div>
          </div>

          {/* Save/Cancel links (like group condition section) */}
          <div style={{ marginTop: '16px' }}>
            <Button size="small" type="text" onClick={handleSave}>
              <u> {i18n('set')}</u>
            </Button>
            <span style={{ margin: '0 1rem' }}>/</span>
            <Button size="small" type="text" onClick={handleCancel}>
              <u> {i18n('cancel')}</u>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FieldConditionEditor;

