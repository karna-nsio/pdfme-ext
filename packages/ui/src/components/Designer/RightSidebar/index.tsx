import React, { useState, useEffect } from 'react';
import { theme, Button } from 'antd';
import type { SidebarProps } from '../../../types.js';
import type { FieldGroup, GroupCondition } from '@pdfme/common';
import { RIGHT_SIDEBAR_WIDTH } from '../../../constants.js';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ListViewWithGroups from './ListView/ListViewWithGroups.js';
import DetailView from './DetailView/index.js';

const Sidebar = (props: SidebarProps) => {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    activeElements, 
    schemas, 
    changeSchemas,
    fieldGroups: propFieldGroups = [],
    onFieldGroupsChange
  } = props;

  // Use props if provided, otherwise use internal state (for backwards compatibility)
  const [internalFieldGroups, setInternalFieldGroups] = useState<FieldGroup[]>([]);
  const fieldGroups = propFieldGroups.length > 0 ? propFieldGroups : internalFieldGroups;
  const setFieldGroups = onFieldGroupsChange || setInternalFieldGroups;
  
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

  const { token } = theme.useToken();
  
  // Track selected fields from activeElements
  useEffect(() => {
    const ids = activeElements.map((el) => el.id).filter(id => id); // Filter out undefined
    setSelectedFieldIds(ids);
  }, [activeElements]);
  const getActiveSchemas = () =>
    schemas.filter((s) => activeElements.map((ae) => ae.id).includes(s.id));
  const getLastActiveSchema = () => {
    const activeSchemas = getActiveSchemas();
    return activeSchemas[activeSchemas.length - 1];
  };

  // Group operation handlers
  const handleCreateGroup = (name: string, fieldIds: string[]) => {
    const newGroup: FieldGroup = {
      id: Date.now().toString(),
      name,
      fieldIds,
      collapsed: false,
      hide: false,
    };
    setFieldGroups([...fieldGroups, newGroup]);
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    setFieldGroups(fieldGroups.map((g) => (g.id === groupId ? { ...g, name: newName } : g)));
  };

  const handleDeleteGroup = (groupId: string) => {
    setFieldGroups(fieldGroups.filter((g) => g.id !== groupId));
  };

  const handleDeleteGroupWithFields = (groupId: string) => {
    const group = fieldGroups.find((g) => g.id === groupId);
    if (group && props.removeSchemas) {
      // Remove all fields in the group
      props.removeSchemas(group.fieldIds);
    }
    setFieldGroups(fieldGroups.filter((g) => g.id !== groupId));
  };

  const handleToggleGroupHide = (groupId: string, hide: boolean) => {
    // Update group state
    const updatedGroups = fieldGroups.map((g) => (g.id === groupId ? { ...g, hide } : g));
    setFieldGroups(updatedGroups);

    // Update field visibility on canvas
    const group = updatedGroups.find((g) => g.id === groupId);
    if (group && changeSchemas) {
      changeSchemas(
        group.fieldIds.map((fieldId) => ({
          key: 'hide',
          value: hide,
          schemaId: fieldId,
        })),
      );
    }
  };

  const handleToggleGroupCollapse = (groupId: string) => {
    setFieldGroups(fieldGroups.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g)));
  };

  const handleSetGroupCondition = (groupId: string, condition: GroupCondition | null) => {
    setFieldGroups(
      fieldGroups.map((g) => (g.id === groupId ? { ...g, condition: condition || undefined } : g)),
    );
  };

  const iconProps = { strokeWidth: 1.5, size: 20 };

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        zIndex: 1,
        height: '100%',
        width: sidebarOpen ? RIGHT_SIDEBAR_WIDTH : 0,
      }}
    >
        <div>
          <Button
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: '1rem',
              right: '1rem',
              zIndex: 100,
            }}
            icon={sidebarOpen ? <ArrowRight {...iconProps} /> : <ArrowLeft {...iconProps} />}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <div
            style={{
              width: RIGHT_SIDEBAR_WIDTH,
              height: '100%',
              display: sidebarOpen ? 'block' : 'none',
              top: 0,
              right: 0,
              position: 'absolute',
              padding: '0.7rem 1rem',
              overflowY: 'auto',
              fontFamily: "'Open Sans', sans-serif",
              boxSizing: 'border-box',
              background: token.colorBgLayout,
            }}
          >
          <div>
            {getActiveSchemas().length === 1 ? (
              // Single field selected - show DetailView to edit it
              <DetailView
                {...props}
                activeSchema={getLastActiveSchema()}
              />
            ) : (
              // 0 or 2+ fields selected - show ListView with Create Group button
              <ListViewWithGroups
                schemas={props.schemas}
                onSortEnd={props.onSortEnd}
                onEdit={props.onEdit}
                size={props.size}
                hoveringSchemaId={props.hoveringSchemaId}
                onChangeHoveringSchemaId={props.onChangeHoveringSchemaId}
                changeSchemas={props.changeSchemas}
                fieldGroups={fieldGroups}
                onCreateGroup={handleCreateGroup}
                onRenameGroup={handleRenameGroup}
                onDeleteGroup={handleDeleteGroup}
                onDeleteGroupWithFields={handleDeleteGroupWithFields}
                onToggleGroupHide={handleToggleGroupHide}
                onToggleGroupCollapse={handleToggleGroupCollapse}
                onSetGroupCondition={handleSetGroupCondition}
                selectedFieldIds={selectedFieldIds}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
