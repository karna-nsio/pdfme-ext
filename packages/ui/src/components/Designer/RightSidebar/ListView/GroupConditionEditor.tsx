import React, { useState, useContext } from 'react';
import { Input, Select, Checkbox, Typography } from 'antd';
import { I18nContext } from '../../../../contexts.js';
import type { GroupCondition } from '@pdfme/common';

const { Text } = Typography;

interface GroupConditionEditorProps {
  condition?: GroupCondition;
  groupName: string;
  onSave: (condition: GroupCondition | null) => void;
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

const GroupConditionEditor: React.FC<GroupConditionEditorProps> = ({
  condition,
  groupName,
  onSave,
}) => {
  const i18n = useContext(I18nContext);
  
  const [enabled, setEnabled] = useState(condition?.enabled ?? true);
  const [variable, setVariable] = useState(condition?.variable ?? 'resultType');
  const [operator, setOperator] = useState(condition?.operator ?? '==');
  const [value, setValue] = useState(
    condition?.value
      ? Array.isArray(condition.value)
        ? condition.value.join(', ')
        : String(condition.value)
      : '',
  );

  // Auto-save on changes
  const handleSave = () => {
    if (!enabled) {
      onSave(null); // Remove condition
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

    onSave(newCondition);
  };

  const getPreviewText = () => {
    if (!enabled) return 'Condition disabled - group always visible';
    
    const valueDisplay = operator === 'in' 
      ? `[${value}]`
      : `"${value}"`;
    
    return `IF data.${variable} ${operator} ${valueDisplay} THEN show "${groupName}"`;
  };

  return (
    <div style={{ padding: '16px' }}>
      <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
        {i18n('setCondition')}
      </Text>
      
      <Text
        type="secondary"
        style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}
      >
        {groupName}
      </Text>

      <Checkbox
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
        style={{ marginBottom: '12px', fontSize: '12px' }}
      >
        {i18n('enableCondition')}
      </Checkbox>

      {enabled && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <Text style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#6b7280' }}>
              {i18n('conditionVariable')}
            </Text>
            <Input
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              placeholder="e.g., resultType"
              size="small"
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Text style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#6b7280' }}>
              {i18n('conditionOperator')}
            </Text>
            <Select
              value={operator}
              onChange={setOperator}
              options={OPERATORS}
              size="small"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Text style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#6b7280' }}>
              {i18n('conditionValue')}
              {operator === 'in' && (
                <Text type="secondary" style={{ fontSize: '10px', marginLeft: '4px' }}>
                  (comma-separated)
                </Text>
              )}
            </Text>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={operator === 'in' ? 'positive, negative' : 'positive'}
              size="small"
            />
          </div>

          <div
            style={{
              padding: '8px',
              backgroundColor: '#f0f9ff',
              borderRadius: '4px',
              border: '1px solid #bae6fd',
            }}
          >
            <Text style={{ fontSize: '10px', color: '#0369a1', display: 'block', marginBottom: '2px' }}>
              {i18n('conditionPreview')}:
            </Text>
            <Text style={{ fontSize: '10px', color: '#075985', fontFamily: 'monospace' }}>
              {getPreviewText()}
            </Text>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupConditionEditor;

