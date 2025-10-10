import React, { useState, useEffect, useContext } from 'react';
import { Modal, Input, Typography } from 'antd';
import { I18nContext } from '../../../../contexts.js';

const { Text } = Typography;

interface GroupModalProps {
  open: boolean;
  mode: 'create' | 'rename';
  initialName?: string;
  existingNames: string[];
  selectedFieldCount?: number;
  onOk: (name: string) => void;
  onCancel: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({
  open,
  mode,
  initialName = '',
  existingNames,
  selectedFieldCount = 0,
  onOk,
  onCancel,
}) => {
  const i18n = useContext(I18nContext);
  const [groupName, setGroupName] = useState(initialName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setGroupName(initialName);
      setError('');
    }
  }, [open, initialName]);

  const validate = (name: string): boolean => {
    if (!name || name.trim() === '') {
      setError(i18n('groupNameRequired'));
      return false;
    }

    // Check for duplicate names (excluding current name in rename mode)
    const isDuplicate = existingNames.some(
      (existingName) =>
        existingName.toLowerCase() === name.trim().toLowerCase() &&
        (mode === 'create' || existingName.toLowerCase() !== initialName.toLowerCase()),
    );

    if (isDuplicate) {
      setError(i18n('groupNameExists'));
      return false;
    }

    setError('');
    return true;
  };

  const handleOk = () => {
    const trimmedName = groupName.trim();
    if (validate(trimmedName)) {
      onOk(trimmedName);
      setGroupName('');
      setError('');
    }
  };

  const handleCancel = () => {
    setGroupName('');
    setError('');
    onCancel();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGroupName(value);
    if (error) {
      validate(value);
    }
  };

  return (
    <Modal
      title={mode === 'create' ? i18n('createGroup') : i18n('renameGroup')}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={mode === 'create' ? i18n('createGroup') : i18n('set')}
      cancelText={i18n('cancel')}
      width={400}
    >
      <div style={{ marginTop: '16px' }}>
        <Text strong style={{ fontSize: '12px' }}>
          {i18n('groupName')}
        </Text>
        <Input
          value={groupName}
          onChange={handleInputChange}
          onPressEnter={handleOk}
          placeholder={`e.g., ${mode === 'create' ? 'Patient Information' : ''}`}
          status={error ? 'error' : ''}
          style={{ marginTop: '8px' }}
          autoFocus
        />
        {error && (
          <Text type="danger" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {error}
          </Text>
        )}

        {mode === 'create' && selectedFieldCount > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              border: '1px solid #bae6fd',
            }}
          >
            <Text style={{ fontSize: '12px', color: '#0369a1' }}>
              {selectedFieldCount} field{selectedFieldCount !== 1 ? 's' : ''} selected
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GroupModal;

