import React, { useContext, useState } from 'react';
import type { SidebarProps } from '../../../../types.js';
import type { FieldGroup } from '@pdfme/common';
import { RIGHT_SIDEBAR_WIDTH } from '../../../../constants.js';
import { I18nContext } from '../../../../contexts.js';
import { getSidebarContentHeight } from '../../../../helper.js';
import { theme, Input, Typography, Divider, Button } from 'antd';
import { FolderPlus } from 'lucide-react';
import SelectableSortableContainer from './SelectableSortableContainer.js';
import GroupItem from './GroupItem.js';

const { Text } = Typography;
const { TextArea } = Input;

const headHeight = 40;

interface ListViewWithGroupsProps extends Pick<
  SidebarProps,
  | 'schemas'
  | 'onSortEnd'
  | 'onEdit'
  | 'size'
  | 'hoveringSchemaId'
  | 'onChangeHoveringSchemaId'
  | 'changeSchemas'
> {
  fieldGroups: FieldGroup[];
  onCreateGroup: (name: string, fieldIds: string[]) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeleteGroupWithFields: (groupId: string) => void;
  onToggleGroupHide: (groupId: string, hide: boolean) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  selectedFieldIds: string[];
}

const ListViewWithGroups = (props: ListViewWithGroupsProps) => {
  const {
    schemas,
    onSortEnd,
    onEdit,
    size,
    hoveringSchemaId,
    onChangeHoveringSchemaId,
    changeSchemas,
    fieldGroups = [],
    onCreateGroup,
    onRenameGroup,
    onDeleteGroup,
    onDeleteGroupWithFields,
    onToggleGroupHide,
    onToggleGroupCollapse,
    selectedFieldIds = [],
  } = props;

  const { token } = theme.useToken();
  const i18n = useContext(I18nContext);
  const [isBulkUpdateFieldNamesMode, setIsBulkUpdateFieldNamesMode] = useState(false);
  const [fieldNamesValue, setFieldNamesValue] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isRenamingGroup, setIsRenamingGroup] = useState(false);
  const [groupNameValue, setGroupNameValue] = useState('');
  const [editingGroup, setEditingGroup] = useState<FieldGroup | null>(null);
  const [groupNameError, setGroupNameError] = useState('');
  const height = getSidebarContentHeight(size.height);

  const commitBulk = () => {
    const names = fieldNamesValue.split('\n');
    if (names.length !== schemas.length) {
      alert(i18n('errorBulkUpdateFieldName'));
    } else {
      changeSchemas(
        names.map((value, index) => ({
          key: 'name',
          value,
          schemaId: schemas[index].id,
        })),
      );
      setIsBulkUpdateFieldNamesMode(false);
    }
  };

  const startBulk = () => {
    setFieldNamesValue(schemas.map((s) => s.name).join('\n'));
    setIsBulkUpdateFieldNamesMode(true);
  };

  // Handle create group button click
  const handleCreateGroupClick = () => {
    if (selectedFieldIds.length < 2) {
      alert('Please select at least 2 fields to create a group');
      return;
    }
    setGroupNameValue('');
    setGroupNameError('');
    setIsCreatingGroup(true);
  };

  // Commit group creation
  const commitCreateGroup = () => {
    const trimmedName = groupNameValue.trim();
    
    if (!trimmedName) {
      setGroupNameError(i18n('groupNameRequired'));
      return;
    }
    
    if (fieldGroups.some((g) => g.name.toLowerCase() === trimmedName.toLowerCase())) {
      setGroupNameError(i18n('groupNameExists'));
      return;
    }
    
    onCreateGroup(trimmedName, selectedFieldIds);
    setIsCreatingGroup(false);
    setGroupNameValue('');
    setGroupNameError('');
  };

  // Cancel group creation
  const cancelCreateGroup = () => {
    setIsCreatingGroup(false);
    setGroupNameValue('');
    setGroupNameError('');
  };

  // Handle rename group
  const handleRenameGroup = (group: FieldGroup) => {
    setEditingGroup(group);
    setGroupNameValue(group.name);
    setGroupNameError('');
    setIsRenamingGroup(true);
  };

  // Commit group rename
  const commitRenameGroup = () => {
    if (!editingGroup) return;
    
    const trimmedName = groupNameValue.trim();
    
    if (!trimmedName) {
      setGroupNameError(i18n('groupNameRequired'));
      return;
    }
    
    if (
      fieldGroups.some(
        (g) => g.id !== editingGroup.id && g.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setGroupNameError(i18n('groupNameExists'));
      return;
    }
    
    onRenameGroup(editingGroup.id, trimmedName);
    setIsRenamingGroup(false);
    setEditingGroup(null);
    setGroupNameValue('');
    setGroupNameError('');
  };

  // Cancel group rename
  const cancelRenameGroup = () => {
    setIsRenamingGroup(false);
    setEditingGroup(null);
    setGroupNameValue('');
    setGroupNameError('');
  };

  // Handle delete group
  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm(i18n('deleteGroupConfirm'))) {
      onDeleteGroup(groupId);
    }
  };

  // Handle delete group with fields
  const handleDeleteGroupWithFields = (groupId: string) => {
    if (window.confirm(i18n('deleteGroupAndFieldsConfirm'))) {
      onDeleteGroupWithFields(groupId);
    }
  };

  // Get ungrouped fields
  const ungroupedSchemas = schemas.filter(
    (schema) => !fieldGroups.some((group) => group.fieldIds.includes(schema.id)),
  );

  // Get fields for a specific group
  const getGroupFields = (group: FieldGroup) => {
    return schemas.filter((schema) => group.fieldIds.includes(schema.id));
  };

  return (
    <div>
      <div style={{ height: headHeight, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '4px', paddingRight: '52px' }}>
        <Text strong style={{ fontSize: '13px' }}>
          {i18n('fieldsList')}
        </Text>
        {!isBulkUpdateFieldNamesMode && !isCreatingGroup && !isRenamingGroup && selectedFieldIds.length >= 2 && (
          <Button
            size="small"
            type="primary"
            icon={<FolderPlus size={14} />}
            onClick={handleCreateGroupClick}
            style={{ whiteSpace: 'nowrap' }}
            title={i18n('createGroup')}
          >
            {i18n('createGroup')}
          </Button>
        )}
      </div>
      <Divider style={{ marginTop: token.marginXS, marginBottom: token.marginXS }} />
      <div style={{ height: height - headHeight, overflowY: 'auto' }}>
        {isBulkUpdateFieldNamesMode ? (
          <TextArea
            wrap="off"
            value={fieldNamesValue}
            onChange={(e) => setFieldNamesValue(e.target.value)}
            style={{
              paddingLeft: 30,
              height: height - headHeight - 50,
              width: RIGHT_SIDEBAR_WIDTH - 35,
              lineHeight: '2.75rem',
            }}
          />
        ) : isCreatingGroup || isRenamingGroup ? (
          // Inline form for creating or renaming group
          <div style={{ padding: '16px' }}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
              {isCreatingGroup ? i18n('createGroup') : i18n('renameGroup')}
            </Text>
            {isCreatingGroup && (
              <Text
                type="secondary"
                style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}
              >
                {selectedFieldIds.length} field{selectedFieldIds.length !== 1 ? 's' : ''} selected
              </Text>
            )}
            <Input
              value={groupNameValue}
              onChange={(e) => {
                setGroupNameValue(e.target.value);
                if (groupNameError) setGroupNameError('');
              }}
              onPressEnter={isCreatingGroup ? commitCreateGroup : commitRenameGroup}
              placeholder={i18n('groupName')}
              status={groupNameError ? 'error' : ''}
              autoFocus
              style={{ marginBottom: groupNameError ? '4px' : '0' }}
            />
            {groupNameError && (
              <Text type="danger" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                {groupNameError}
              </Text>
            )}
          </div>
        ) : (
          <div style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            {/* Render groups */}
            {fieldGroups.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                onToggleCollapse={() => onToggleGroupCollapse(group.id)}
                onToggleHide={(hide) => onToggleGroupHide(group.id, hide)}
                onRename={() => handleRenameGroup(group)}
                onDelete={() => handleDeleteGroup(group.id)}
                onDeleteWithFields={() => handleDeleteGroupWithFields(group.id)}
              >
                <SelectableSortableContainer
                  schemas={getGroupFields(group)}
                  hoveringSchemaId={hoveringSchemaId}
                  onChangeHoveringSchemaId={onChangeHoveringSchemaId}
                  onSortEnd={onSortEnd}
                  onEdit={onEdit}
                />
              </GroupItem>
            ))}

            {/* Render ungrouped fields */}
            {ungroupedSchemas.length > 0 && (
              <div style={{ marginTop: fieldGroups.length > 0 ? '16px' : '0' }}>
                {fieldGroups.length > 0 && (
                  <Text
                    type="secondary"
                    style={{ fontSize: '11px', marginBottom: '8px', display: 'block' }}
                  >
                    {i18n('ungrouped')}
                  </Text>
                )}
                <SelectableSortableContainer
                  schemas={ungroupedSchemas}
                  hoveringSchemaId={hoveringSchemaId}
                  onChangeHoveringSchemaId={onChangeHoveringSchemaId}
                  onSortEnd={onSortEnd}
                  onEdit={onEdit}
                />
              </div>
            )}
          </div>
        )}
        <div
          style={{
            paddingTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '8px',
          }}
        >
          {isBulkUpdateFieldNamesMode ? (
            <>
              <Button size="small" type="text" onClick={commitBulk}>
                <u> {i18n('commitBulkUpdateFieldName')}</u>
              </Button>
              <span style={{ margin: '0 1rem' }}>/</span>
              <Button
                size="small"
                type="text"
                onClick={() => setIsBulkUpdateFieldNamesMode(false)}
              >
                <u> {i18n('cancel')}</u>
              </Button>
            </>
          ) : isCreatingGroup || isRenamingGroup ? (
            <>
              <Button
                size="small"
                type="text"
                onClick={isCreatingGroup ? commitCreateGroup : commitRenameGroup}
              >
                <u> {i18n('set')}</u>
              </Button>
              <span style={{ margin: '0 1rem' }}>/</span>
              <Button
                size="small"
                type="text"
                onClick={isCreatingGroup ? cancelCreateGroup : cancelRenameGroup}
              >
                <u> {i18n('cancel')}</u>
              </Button>
            </>
          ) : (
            <Button size="small" type="text" onClick={startBulk}>
              <u> {i18n('bulkUpdateFieldName')}</u>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListViewWithGroups;

