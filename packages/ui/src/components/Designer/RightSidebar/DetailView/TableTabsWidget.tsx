import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import FormRender, { useForm } from 'form-render';
import type { PropPanelWidgetProps } from '@pdfme/common';

interface TabConfig {
  key: string;
  label: string;
  properties: Record<string, any>;
}

interface TableTabsWidgetProps extends PropPanelWidgetProps {
  schema: {
    tabs?: TabConfig[];
  };
}

/**
 * TableTabsWidget - Custom tabbed interface for table configuration
 *
 * Organizes 100+ table configuration fields into 5 logical tabs:
 * - Basic: Core table settings
 * - Header: Header row styling
 * - Body: Body row styling
 * - Sections: Section headers (row groups)
 * - Advanced: Column styles, cell styles, etc.
 */
const TableTabsWidget: React.FC<TableTabsWidgetProps> = (props) => {
  const { schema, value, onChange, changeSchemas, activeSchema, options, i18n } = props;
  const [activeTab, setActiveTab] = useState('basic');
  const form = useForm();

  const tabs = schema.tabs || [];

  // Merge all properties from all tabs into one schema
  const allProperties: Record<string, any> = {};
  tabs.forEach((tab) => {
    Object.assign(allProperties, tab.properties);
  });

  // Sync form values with prop value
  useEffect(() => {
    if (value) {
      form.setValues(value);
    }
  }, [value, form]);

  // Handle form changes
  const handleChange = (newValues: any) => {
    onChange(newValues);
  };

  // Create tab items - each tab shows only its properties via CSS
  const tabItems = tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    children: (
      <div style={{ padding: '12px 0' }}>
        <FormRender
          form={form}
          schema={{
            type: 'object',
            properties: tab.properties,
          }}
          widgets={props.widgets}
          displayType="inline"
          column={2}
          watch={{
            '#': handleChange,
          }}
        />
      </div>
    ),
  }));

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      type="card"
      size="small"
      items={tabItems}
      style={{ marginTop: -12 }}
    />
  );
};

export default TableTabsWidget;
