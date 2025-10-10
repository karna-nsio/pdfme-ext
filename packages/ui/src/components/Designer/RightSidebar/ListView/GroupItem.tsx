import React, { useState, useContext } from 'react';
import { I18nContext } from '../../../../contexts.js';
import {
  ChevronDown,
  ChevronRight,
  FolderClosed,
  EyeOff,
  Eye,
  MoreVertical,
  Trash2,
  Edit2,
  FolderX,
} from 'lucide-react';
import { Button, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import type { FieldGroup } from '@pdfme/common';

const { Text } = Typography;

interface GroupItemProps {
  group: FieldGroup;
  onToggleCollapse: () => void;
  onToggleHide: (hide: boolean) => void;
  onRename: () => void;
  onDelete: () => void;
  onDeleteWithFields: () => void;
  children?: React.ReactNode;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  onToggleCollapse,
  onToggleHide,
  onRename,
  onDelete,
  onDeleteWithFields,
  children,
}) => {
  const i18n = useContext(I18nContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: 'toggleHide',
      label: group.hide ? i18n('showAllFields') : i18n('hideAllFields'),
      icon: group.hide ? <Eye size={14} /> : <EyeOff size={14} />,
      onClick: () => onToggleHide(!group.hide),
    },
    {
      type: 'divider',
    },
    {
      key: 'rename',
      label: i18n('renameGroup'),
      icon: <Edit2 size={14} />,
      onClick: onRename,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: i18n('deleteGroup'),
      icon: <FolderX size={14} />,
      onClick: onDelete,
    },
    {
      key: 'deleteWithFields',
      label: i18n('deleteGroupAndFields'),
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: onDeleteWithFields,
    },
  ];

  return (
    <div style={{ marginTop: 10 }}>
      {/* Group Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          backgroundColor: group.hide ? '#f3f4f6' : '#f9fafb',
          borderRadius: '6px',
          cursor: 'pointer',
          border: '1px solid #e5e7eb',
          gap: '6px',
        }}
      >
        {/* Collapse toggle */}
        <div
          onClick={onToggleCollapse}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          {group.collapsed ? (
            <ChevronRight size={14} style={{ color: '#6b7280' }} />
          ) : (
            <ChevronDown size={14} style={{ color: '#6b7280' }} />
          )}
        </div>

        {/* Folder icon */}
        <FolderClosed size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />

        {/* Group name and count */}
        <Text
          strong
          style={{
            flex: 1,
            fontSize: '12px',
            color: group.hide ? '#9ca3af' : '#374151',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
          title={`${group.name} (${group.fieldIds.length} field${group.fieldIds.length !== 1 ? 's' : ''})`}
        >
          {group.name}
          <span style={{ marginLeft: '6px', color: '#9ca3af', fontWeight: 'normal' }}>
            ({group.fieldIds.length})
          </span>
        </Text>

        {/* Hide indicator */}
        {group.hide && (
          <span title={i18n('hideAllFields')} style={{ display: 'flex', alignItems: 'center' }}>
            <EyeOff size={14} style={{ color: '#6b7280' }} />
          </span>
        )}

        {/* Context menu */}
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreVertical size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            style={{
              padding: '2px 4px',
              height: 'auto',
              minWidth: 'auto',
              border: 'none',
            }}
          />
        </Dropdown>
      </div>

      {/* Group Members (collapsible) */}
      {!group.collapsed && (
        <div
          style={{
            marginLeft: '20px',
            marginTop: '4px',
            paddingLeft: '8px',
            borderLeft: '2px solid #e5e7eb',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default GroupItem;

