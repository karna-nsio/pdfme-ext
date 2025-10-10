// EXAMPLE: How to integrate Field Grouping into RightSidebar
// File: packages/ui/src/components/Designer/RightSidebar/index.tsx

import React, { useState, useEffect } from 'react';
import { theme, Button } from 'antd';
import type { SidebarProps } from '../../../types.js';
import { RIGHT_SIDEBAR_WIDTH } from '../../../constants.js';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// CHANGE 1: Import ListViewWithGroups instead of ListView
import ListViewWithGroups from './ListView/ListViewWithGroups.js';
import DetailView from './DetailView/index.js';

const Sidebar = (props: SidebarProps) => {
  const { sidebarOpen, setSidebarOpen, activeElements, schemas } = props;

  // CHANGE 2: Add state for groups and selected fields
  const [fieldGroups, setFieldGroups] = useState([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

  const { token } = theme.useToken();
  
  const getActiveSchemas = () =>
    schemas.filter((s) => activeElements.map((ae) => ae.id).includes(s.id));
  
  const getLastActiveSchema = () => {
    const activeSchemas = getActiveSchemas();
    return activeSchemas[activeSchemas.length - 1];
  };

  // CHANGE 3: Track selected field IDs from activeElements
  useEffect(() => {
    const ids = activeElements.map(el => el.id);
    setSelectedFieldIds(ids);
  }, [activeElements]);

  // CHANGE 4: Add group operation handlers
  const handleCreateGroup = (name: string, fieldIds: string[]) => {
    const newGroup = {
      id: Date.now().toString(),
      name,
      fieldIds,
      collapsed: false,
      hide: false,
    };
    setFieldGroups([...fieldGroups, newGroup]);
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    setFieldGroups(fieldGroups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    ));
  };

  const handleDeleteGroup = (groupId: string) => {
    setFieldGroups(fieldGroups.filter(g => g.id !== groupId));
  };

  const handleDeleteGroupWithFields = (groupId: string) => {
    const group = fieldGroups.find(g => g.id === groupId);
    if (group) {
      // Remove the fields from the canvas
      props.removeSchemas(group.fieldIds);
    }
    setFieldGroups(fieldGroups.filter(g => g.id !== groupId));
  };

  const handleToggleGroupHide = (groupId: string, hide: boolean) => {
    // Update group state
    const updatedGroups = fieldGroups.map(g => 
      g.id === groupId ? { ...g, hide } : g
    );
    setFieldGroups(updatedGroups);
    
    // Update field visibility on canvas
    const group = updatedGroups.find(g => g.id === groupId);
    if (group) {
      props.changeSchemas(
        group.fieldIds.map(fieldId => ({
          key: 'hide',
          value: hide,
          schemaId: fieldId,
        }))
      );
    }
  };

  const handleToggleGroupCollapse = (groupId: string) => {
    setFieldGroups(fieldGroups.map(g => 
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    ));
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
          {activeElements.length > 0 ? (
            <DetailView
              activeSchema={getLastActiveSchema()}
              activeSchemas={getActiveSchemas()}
              changeSchemas={props.changeSchemas}
              deselectSchema={props.deselectSchema}
              schemas={schemas}
              pageSize={props.pageSize}
            />
          ) : (
            // CHANGE 5: Replace ListView with ListViewWithGroups
            <ListViewWithGroups
              schemas={props.schemas}
              onSortEnd={props.onSortEnd}
              onEdit={props.onEdit}
              size={props.size}
              hoveringSchemaId={props.hoveringSchemaId}
              onChangeHoveringSchemaId={props.onChangeHoveringSchemaId}
              changeSchemas={props.changeSchemas}
              // NEW PROPS for grouping
              fieldGroups={fieldGroups}
              onCreateGroup={handleCreateGroup}
              onRenameGroup={handleRenameGroup}
              onDeleteGroup={handleDeleteGroup}
              onDeleteGroupWithFields={handleDeleteGroupWithFields}
              onToggleGroupHide={handleToggleGroupHide}
              onToggleGroupCollapse={handleToggleGroupCollapse}
              selectedFieldIds={selectedFieldIds}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

