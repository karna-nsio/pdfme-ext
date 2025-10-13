import React, { useState, useContext, useEffect } from 'react';
import { Input, Select, Checkbox, Typography } from 'antd';
import { I18nContext } from '../../../../contexts.js';
import type { GroupCondition } from '@pdfme/common';

const { Text } = Typography;

interface FieldConditionEditorProps {
  fieldName: string;
  condition?: GroupCondition;
  onChange: (condition: GroupCondition | undefined) => void;
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

  const handleChange = (updates: {
    enabled?: boolean;
    variable?: string;
    operator?: GroupCondition['operator'];
    value?: string;
  }) => {
    const newEnabled = updates.enabled !== undefined ? updates.enabled : enabled;
    const newVariable = updates.variable !== undefined ? updates.variable : variable;
    const newOperator = updates.operator !== undefined ? updates.operator : operator;
    const newValue = updates.value !== undefined ? updates.value : value;

    // Update local state
    if (updates.enabled !== undefined) setEnabled(newEnabled);
    if (updates.variable !== undefined) setVariable(newVariable);
    if (updates.operator !== undefined) setOperator(updates.operator);
    if (updates.value !== undefined) setValue(newValue);

    // Don't save if condition is disabled - use undefined to remove the property
    if (!newEnabled) {
      onChange(undefined);
      return;
    }

    // Don't save incomplete conditions
    const trimmedValue = String(newValue).trim();
    if (!newVariable || !trimmedValue) {
      return;
    }

    // Parse value based on operator
    let parsedValue: string | number | string[];
    
    if (newOperator === 'in') {
      parsedValue = trimmedValue.split(',').map((v) => v.trim());
    } else if (['>', '<', '>=', '<='].includes(newOperator)) {
      parsedValue = !isNaN(Number(trimmedValue)) ? Number(trimmedValue) : trimmedValue;
    } else {
      parsedValue = trimmedValue;
    }

    const finalCondition: GroupCondition = {
      enabled: true,
      variable: newVariable,
      operator: newOperator as GroupCondition['operator'],
      value: parsedValue,
    };

    onChange(finalCondition);
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
        onChange={(e) => {
          handleChange({ enabled: e.target.checked });
        }}
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
              onChange={(e) => {
                handleChange({ variable: e.target.value });
              }}
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
              onChange={(val: string) => {
                handleChange({ operator: val as GroupCondition['operator'] });
              }}
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
              onChange={(e) => {
                handleChange({ value: e.target.value });
              }}
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
        </>
      )}
    </div>
  );
};

export default FieldConditionEditor;

