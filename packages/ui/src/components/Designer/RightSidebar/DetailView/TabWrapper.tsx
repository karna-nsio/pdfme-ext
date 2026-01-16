import React, { useState, useMemo } from 'react';
import { Tabs } from 'antd';
import FormRenderComponent from 'form-render';

interface TabWrapperProps {
  schema: Record<string, any>;
  form: any;
  widgets: Record<string, any>;
  watch: any;
  locale: 'zh-CN' | 'en-US';
}

/**
 * TabWrapper - Wraps FormRender with tab navigation for table schemas
 *
 * Detects schemas with __tableTabsEnabled flag and organizes properties
 * into tabs based on their __tab metadata.
 */
const TabWrapper: React.FC<TabWrapperProps> = ({ schema, form, widgets, watch, locale }) => {
  const [activeTab, setActiveTab] = useState('basic');

  // Check if tabs are enabled
  const tabsEnabled = schema.properties?.__tableTabsEnabled;

  // Extract tab information from schema properties
  const { tabs, filteredSchemas } = useMemo(() => {
    if (!tabsEnabled || !schema.properties) {
      return { tabs: [], filteredSchemas: {} };
    }

    const tabMap = new Map<string, string>();
    const tabProperties = new Map<string, Record<string, any>>();

    // Define tab order and labels
    const tabConfig = [
      { key: 'basic', label: 'Basic' },
      { key: 'header', label: 'Header' },
      { key: 'body', label: 'Body' },
      { key: 'sections', label: 'Sections' },
      { key: 'advanced', label: 'Advanced' },
    ];

    // Group properties by tab
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      if (key === '__tableTabsEnabled') return;

      const tab = prop.__tab || 'basic';

      if (!tabProperties.has(tab)) {
        tabProperties.set(tab, {});
      }

      // Remove __tab metadata before passing to FormRender
      const { __tab, ...cleanProp } = prop;
      tabProperties.get(tab)![key] = cleanProp;
    });

    // Create filtered schemas for each tab
    const schemas: Record<string, any> = {};
    tabConfig.forEach(({ key }) => {
      if (tabProperties.has(key)) {
        schemas[key] = {
          type: 'object',
          displayType: schema.displayType || 'column',
          properties: tabProperties.get(key),
        };
      }
    });

    // Only include tabs that have properties
    const availableTabs = tabConfig.filter(({ key }) => tabProperties.has(key));

    return { tabs: availableTabs, filteredSchemas: schemas };
  }, [schema, tabsEnabled]);

  // If tabs not enabled, render FormRender directly
  if (!tabsEnabled || tabs.length === 0) {
    return (
      <FormRenderComponent
        form={form}
        schema={schema}
        widgets={widgets}
        watch={watch}
        locale={locale}
      />
    );
  }

  // Create tab items (labels only)
  const tabItems = tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
  }));

  // Only render FormRender for the active tab
  const activeTabSchema = filteredSchemas[activeTab];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="small"
        items={tabItems}
        style={{ marginTop: -12 }}
      />
      <div style={{ padding: '12px 0' }}>
        {activeTabSchema && (
          <FormRenderComponent
            form={form}
            schema={activeTabSchema}
            widgets={widgets}
            watch={watch}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
};

export default TabWrapper;
