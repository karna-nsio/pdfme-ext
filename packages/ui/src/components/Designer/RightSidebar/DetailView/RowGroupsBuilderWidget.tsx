import React, { useState, useEffect } from 'react';
import { Button, List, Modal, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import FormRender, { useForm } from 'form-render';
import type { PropPanelWidgetProps } from '@pdfme/common';

// Hex color validation pattern
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

interface RowGroup {
  title: string;
  startRow: number;
  colspan: boolean;
  visible: boolean;
  styles: Record<string, any>;
}

interface RowGroupsBuilderWidgetProps extends PropPanelWidgetProps {
  value: RowGroup[];
}

/**
 * RowGroupsBuilderWidget - Visual builder for table section headers
 *
 * Provides an intuitive UI for managing row groups (section headers) instead of
 * the complex nested array form. Users can add, edit, delete, and reorder sections.
 */
const RowGroupsBuilderWidget: React.FC<RowGroupsBuilderWidgetProps> = (props) => {
  console.log('RowGroupsBuilderWidget rendered with props:', props);
  console.log('Available prop keys:', Object.keys(props));

  const { i18n, changeSchemas, activeSchema, form: parentForm } = props as any;
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localGroups, setLocalGroups] = useState<RowGroup[]>([]);
  const form = useForm();

  // Sync local state with activeSchema.rowGroups when it changes
  useEffect(() => {
    const schemaGroups = Array.isArray(activeSchema?.rowGroups) ? activeSchema.rowGroups : [];
    console.log('Syncing with activeSchema.rowGroups:', schemaGroups);
    setLocalGroups(schemaGroups);
  }, [activeSchema?.rowGroups]);

  const groups = localGroups;
  console.log('Current groups (local state):', groups);

  // Handle changes - update local state and schema directly
  const handleChange = (newValue: RowGroup[]) => {
    console.log('handleChange called with:', newValue);

    // Optimistic update - update local state immediately for instant UI feedback
    setLocalGroups(newValue);

    // Update schema directly (now that we know canvas rendering works)
    if (changeSchemas && activeSchema) {
      console.log('Updating schema via changeSchemas');
      const updatedSchema = { ...activeSchema, rowGroups: newValue };
      changeSchemas([updatedSchema]);
      console.log('Schema updated - canvas should refresh');
    }
  };

  // Get font names from props
  const fontNames = props.options?.font ? Object.keys(props.options.font) : [];

  // Open modal for adding new group
  const handleAdd = () => {
    console.log('handleAdd called - opening modal');
    form.setValues({
      title: '',
      startRow: 0,
      colspan: true,
      visible: true,
      styles: {
        backgroundColor: '#0C2340',
        fontColor: '#FFFFFF',
        fontWeight: '700',
        fontSize: 9,
        textTransform: 'uppercase',
        alignment: 'left',
        verticalAlignment: 'middle',
        padding: { top: 4, bottom: 4, left: 8, right: 8 },
        borderColor: '',
        borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    });
    setEditingIndex(null);
    setModalVisible(true);
    console.log('Modal should now be visible');
  };

  // Open modal for editing existing group
  const handleEdit = (index: number) => {
    form.setValues(groups[index]);
    setEditingIndex(index);
    setModalVisible(true);
  };

  // Delete group
  const handleDelete = (index: number) => {
    const newGroups = groups.filter((_: RowGroup, i: number) => i !== index);
    handleChange(newGroups);
  };

  // Move group up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newGroups = [...groups];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGroups.length) return;

    [newGroups[index], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[index]];
    handleChange(newGroups);
  };

  // Save group from modal
  const handleSave = async () => {
    console.log('handleSave called');
    try {
      // Validate form before saving
      console.log('Validating form...');
      await form.submit();
      const values = form.getValues();
      console.log('Form values:', values);

      const newGroups = [...groups];

      if (editingIndex !== null) {
        console.log('Editing existing group at index:', editingIndex);
        newGroups[editingIndex] = values;
      } else {
        console.log('Adding new group');
        newGroups.push(values);
      }

      console.log('New groups array:', newGroups);
      handleChange(newGroups);
      setModalVisible(false);
      console.log('Modal closed');
    } catch (error) {
      // Don't close modal if validation fails
      console.error('Form validation error:', error);
    }
  };

  // Edit form schema
  const editSchema = {
    type: 'object',
    displayType: 'row',
    properties: {
      title: {
        title: 'Section Title',
        type: 'string',
        widget: 'input',
        span: 24,
        rules: [{ required: true, message: 'Title is required' }],
      },
      startRow: {
        title: 'Insert Before Row',
        type: 'number',
        widget: 'inputNumber',
        props: { min: 0 },
        span: 12,
      },
      visible: {
        title: 'Visible',
        type: 'boolean',
        widget: 'checkbox',
        span: 6,
      },
      colspan: {
        title: 'Span All Columns',
        type: 'boolean',
        widget: 'checkbox',
        span: 6,
      },
      '----': { type: 'void', widget: 'Divider', span: 24 },
      styles: {
        title: 'Styles',
        type: 'object',
        widget: 'Card',
        span: 24,
        properties: {
          backgroundColor: {
            title: 'Background Color',
            type: 'string',
            widget: 'color',
            props: { disabledAlpha: true },
            rules: [{ pattern: HEX_COLOR_PATTERN, message: 'Invalid color' }],
            span: 12,
          },
          fontColor: {
            title: 'Text Color',
            type: 'string',
            widget: 'color',
            props: { disabledAlpha: true },
            rules: [{ pattern: HEX_COLOR_PATTERN, message: 'Invalid color' }],
            span: 12,
          },
          fontName: {
            title: 'Font',
            type: 'string',
            widget: 'select',
            props: { options: fontNames.map((name: string) => ({ label: name, value: name })) },
            span: 12,
          },
          fontWeight: {
            title: 'Font Weight',
            type: 'string',
            widget: 'select',
            props: {
              options: [
                { label: 'Normal', value: 'normal' },
                { label: 'Bold', value: 'bold' },
                { label: '700', value: '700' },
              ],
            },
            span: 12,
          },
          fontSize: {
            title: 'Font Size',
            type: 'number',
            widget: 'inputNumber',
            props: { min: 0 },
            span: 8,
          },
          alignment: {
            title: 'Align',
            type: 'string',
            widget: 'select',
            props: {
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
            },
            span: 8,
          },
          verticalAlignment: {
            title: 'Vertical',
            type: 'string',
            widget: 'select',
            props: {
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Middle', value: 'middle' },
                { label: 'Bottom', value: 'bottom' },
              ],
            },
            span: 8,
          },
          textTransform: {
            title: 'Transform',
            type: 'string',
            widget: 'select',
            props: {
              options: [
                { label: 'None', value: 'none' },
                { label: 'UPPERCASE', value: 'uppercase' },
                { label: 'lowercase', value: 'lowercase' },
                { label: 'Capitalize', value: 'capitalize' },
              ],
            },
            span: 12,
          },
          padding: {
            title: 'Padding',
            type: 'object',
            widget: 'lineTitle',
            span: 24,
            properties: {
              top: { title: 'Top', type: 'number', widget: 'inputNumber', props: { min: 0 }, span: 6 },
              right: { title: 'Right', type: 'number', widget: 'inputNumber', props: { min: 0 }, span: 6 },
              bottom: { title: 'Bottom', type: 'number', widget: 'inputNumber', props: { min: 0 }, span: 6 },
              left: { title: 'Left', type: 'number', widget: 'inputNumber', props: { min: 0 }, span: 6 },
            },
          },
        },
      },
    },
  };

  return (
    <div>
      <List
        size="small"
        dataSource={groups}
        locale={{ emptyText: 'No section headers. Click "Add Section" to create one.' }}
        renderItem={(group, index) => (
          <List.Item
            style={{
              padding: '12px',
              marginBottom: '8px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: group.styles?.backgroundColor || '#f5f5f5',
            }}
            actions={[
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => handleMove(index, 'up')}
              />,
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === groups.length - 1}
                onClick={() => handleMove(index, 'down')}
              />,
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(index)}
              />,
              <Popconfirm
                title="Delete this section header?"
                onConfirm={() => handleDelete(index)}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <div style={{
                fontWeight: 'bold',
                color: group.styles?.fontColor || '#000',
              }}>
                {group.title || '(Untitled)'}
              </div>
              <Space size={8}>
                <Tag>Row {group.startRow}</Tag>
                {group.visible === false && <Tag color="red">Hidden</Tag>}
                {group.colspan && <Tag>Full Width</Tag>}
              </Space>
            </Space>
          </List.Item>
        )}
      />

      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginTop: '12px' }}
      >
        Add Section Header
      </Button>

      <Modal
        title={editingIndex !== null ? 'Edit Section Header' : 'Add Section Header'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText="Save"
      >
        <FormRender
          form={form}
          schema={editSchema}
          widgets={props.widgets}
          displayType="row"
        />
      </Modal>
    </div>
  );
};

export default RowGroupsBuilderWidget;
