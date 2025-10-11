import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  Template,
  SchemaForUI,
  PreviewProps,
  Size,
  getDynamicTemplate,
  replacePlaceholders,
} from '@pdfme/common';
import { getDynamicHeightsForTable } from '@pdfme/schemas/utils';
import UnitPager from './UnitPager.js';
import Root from './Root.js';
import StaticSchema from './StaticSchema.js';
import ErrorScreen from './ErrorScreen.js';
import CtlBar from './CtlBar.js';
import Paper from './Paper.js';
import Renderer from './Renderer.js';
import { useUIPreProcessor, useScrollPageCursor } from '../hooks.js';
import { FontContext, OptionsContext } from '../contexts.js';
import { 
  template2SchemasList, 
  getPagesScrollTopByIndex, 
  useMaxZoom,
  getConditionallyVisibleFieldIds,
  isFieldInAnyGroup
} from '../helper.js';
import { theme } from 'antd';

const _cache = new Map<string | number, unknown>();

const Preview = ({
  template,
  inputs,
  size,
  onChangeInput,
}: Omit<PreviewProps, 'domContainer'> & {
  onChangeInput?: (args: { index: number; value: string; name: string }) => void;
  size: Size;
}) => {
  const { token } = theme.useToken();

  const font = useContext(FontContext);
  const options = useContext(OptionsContext);
  const maxZoom = useMaxZoom();

  const containerRef = useRef<HTMLDivElement>(null);
  const paperRefs = useRef<HTMLDivElement[]>([]);

  const [unitCursor, setUnitCursor] = useState(0);
  const [pageCursor, setPageCursor] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(options.zoomLevel ?? 1);
  const [schemasList, setSchemasList] = useState<SchemaForUI[][]>([[]] as SchemaForUI[][]);

  const { backgrounds, pageSizes, scale, error, refresh } = useUIPreProcessor({
    template,
    size,
    zoomLevel,
    maxZoom,
  });

  const isForm = Boolean(onChangeInput);

  const input = inputs[unitCursor];

  const init = (template: Template) => {
    const options = { font };
    
    // CRITICAL: Store fieldGroups before getDynamicTemplate (it might not preserve them)
    const originalFieldGroups = template.fieldGroups;
    
    getDynamicTemplate({
      template,
      input,
      options,
      _cache,
      getDynamicHeights: (value, args) => {
        switch (args.schema.type) {
          case 'table':
            return getDynamicHeightsForTable(value, args);
          default:
            return Promise.resolve([args.schema.height]);
        }
      },
    })
      .then(async (dynamicTemplate) => {
        // CRITICAL FIX: Restore fieldGroups if getDynamicTemplate removed them
        if (originalFieldGroups && !dynamicTemplate.fieldGroups) {
          console.log('[@pdfme/ui Preview] Restoring fieldGroups lost by getDynamicTemplate');
          dynamicTemplate.fieldGroups = originalFieldGroups;
        }
        
        // EVALUATE GROUP CONDITIONS AND FILTER FIELDS
        let filteredTemplate = dynamicTemplate;
        
        console.log('[@pdfme/ui Preview] Starting condition evaluation...');
        console.log('  - Has fieldGroups:', !!dynamicTemplate.fieldGroups);
        console.log('  - fieldGroups count:', dynamicTemplate.fieldGroups?.length || 0);
        console.log('  - Has input data:', !!input);
        
        if (dynamicTemplate.fieldGroups && dynamicTemplate.fieldGroups.length > 0 && input) {
          console.log('[@pdfme/ui Preview] Evaluating group conditions...');
          console.log('  - Input data:', input);
          
          // Log each group and its condition
          dynamicTemplate.fieldGroups.forEach(group => {
            console.log(`  - Group: ${group.name}`);
            console.log(`    Fields: ${group.fieldIds.join(', ')}`);
            if (group.condition && group.condition.enabled) {
              console.log(`    Condition: ${group.condition.variable} ${group.condition.operator} ${group.condition.value}`);
              console.log(`    Input value for ${group.condition.variable}:`, input[group.condition.variable]);
            } else {
              console.log(`    No condition or disabled`);
            }
          });
          
          // Get fields that should be visible based on conditions
          const visibleFieldIds = getConditionallyVisibleFieldIds(
            dynamicTemplate.fieldGroups,
            input
          );
          
          console.log('[@pdfme/ui Preview] Visible field IDs after evaluation:', visibleFieldIds);
          
          // Count fields before filtering
          const totalFieldsBefore = dynamicTemplate.schemas.reduce((acc, page) => {
            if (Array.isArray(page)) return acc + page.length;
            if (page && typeof page === 'object') return acc + Object.keys(page).length;
            return acc;
          }, 0);
          
          // Filter schemas to only include visible fields
          filteredTemplate = {
            ...dynamicTemplate,
            schemas: dynamicTemplate.schemas.map((page) => {
              // Handle both array and object schema formats
              if (Array.isArray(page)) {
                return page.filter((schema: any) => {
                  // DEBUG: Log schema details for array format
                  console.log(`    🔍 ARRAY FORMAT - schema.id: "${schema.id}", schema.name: "${schema.name}"`);
                  console.log(`       Checking against visibleFieldIds:`, visibleFieldIds);
                  
                  // If field is not in any group, always show it
                  const isInGroup = isFieldInAnyGroup(schema.id, dynamicTemplate.fieldGroups || []);
                  console.log(`       isInGroup: ${isInGroup}`);
                  
                  if (!isInGroup) {
                    console.log(`    ✅ Field ${schema.id} (${schema.name}) - not in any group, showing`);
                    return true;
                  }
                  
                  // If field is in a group, check if it should be visible
                  const shouldShow = visibleFieldIds.includes(schema.id);
                  console.log(`       shouldShow: ${shouldShow}`);
                  console.log(`    ${shouldShow ? '✅' : '❌'} Field ${schema.id} (${schema.name}) - ${shouldShow ? 'condition met' : 'condition not met'}`);
                  return shouldShow;
                });
              } else if (page && typeof page === 'object') {
                // Object schema format
                const filteredPage: any = {};
                Object.keys(page).forEach((key) => {
                  const schema: any = page[key];
                  
                  // DEBUG: Log all possible identifiers
                  console.log(`    🔍 Checking field - key: "${key}", schema.id: "${schema.id}", schema.name: "${schema.name}"`);
                  
                  // Try multiple identifier strategies
                  const possibleIds = [
                    schema.id,      // UUID from designer
                    key,            // Object key
                    schema.name,    // Schema name
                  ].filter(Boolean);
                  
                  console.log(`       Possible IDs: [${possibleIds.join(', ')}]`);
                  console.log(`       Checking against visibleFieldIds:`, visibleFieldIds);
                  
                  // Check if ANY of the possible IDs match
                  const isInGroup = possibleIds.some(id => {
                    const result = isFieldInAnyGroup(id, dynamicTemplate.fieldGroups || []);
                    if (result) console.log(`       ✅ Found in group using ID: ${id}`);
                    return result;
                  });
                  
                  const shouldShow = possibleIds.some(id => visibleFieldIds.includes(id));
                  
                  console.log(`       isInGroup: ${isInGroup}, shouldShow: ${shouldShow}`);
                  
                  if (!isInGroup) {
                    console.log(`    ✅ Field ${schema.id || key} (${schema.name}) - not in any group, showing`);
                    filteredPage[key] = schema;
                  } else if (shouldShow) {
                    console.log(`    ✅ Field ${schema.id || key} (${schema.name}) - condition met, showing`);
                    filteredPage[key] = schema;
                  } else {
                    console.log(`    ❌ Field ${schema.id || key} (${schema.name}) - condition not met, HIDING`);
                  }
                });
                return filteredPage;
              }
              return page;
            }),
          };
          
          // Count fields after filtering
          const totalFieldsAfter = filteredTemplate.schemas.reduce((acc, page) => {
            if (Array.isArray(page)) return acc + page.length;
            if (page && typeof page === 'object') return acc + Object.keys(page).length;
            return acc;
          }, 0);
          
          console.log(`[@pdfme/ui Preview] Filtered: ${totalFieldsBefore} fields → ${totalFieldsAfter} fields (${totalFieldsAfter - totalFieldsBefore} change)`);
        } else {
          console.log('[@pdfme/ui Preview] No filtering needed - no conditions or no input');
        }
        
        const sl = await template2SchemasList(filteredTemplate);
        setSchemasList(sl);
        await refresh(filteredTemplate);
      })
      .catch((err) => console.error(`[@pdfme/ui] `, err));
  };

  // Update component state only when _options_ changes
  // Ignore exhaustive useEffect dependency warnings here
  useEffect(() => {
    if (typeof options.zoomLevel === 'number' && options.zoomLevel !== zoomLevel) {
      setZoomLevel(options.zoomLevel);
    }
    // eslint-disable-next-line
  }, [options]);

  useEffect(() => {
    if (unitCursor > inputs.length - 1) {
      setUnitCursor(inputs.length - 1);
    }

    init(template);
  }, [template, inputs, size]);

  useScrollPageCursor({
    ref: containerRef,
    pageSizes,
    scale,
    pageCursor,
    onChangePageCursor: setPageCursor,
  });

  const handleChangeInput = ({ name, value }: { name: string; value: string }) =>
    onChangeInput && onChangeInput({ index: unitCursor, name, value });

  const handleOnChangeRenderer = (args: { key: string; value: unknown }[], schema: SchemaForUI) => {
    let isNeedInit = false;
    args.forEach(({ key: _key, value }) => {
      if (_key === 'content') {
        const newValue = value as string;
        const oldValue = (input?.[schema.name] as string) || '';
        if (newValue === oldValue) return;
        handleChangeInput({ name: schema.name, value: newValue });
        // TODO Improve this to allow schema types to determine whether the execution of getDynamicTemplate is required.
        if (schema.type === 'table') isNeedInit = true;
      } else {
        const targetSchema = schemasList[pageCursor].find((s) => s.id === schema.id) as SchemaForUI;
        if (!targetSchema) return;

        // @ts-expect-error Dynamic property assignment
        targetSchema[_key] = value as string;
      }
    });
    if (isNeedInit) {
      init(template);
    }
    setSchemasList([...schemasList]);
  };

  if (error) {
    return <ErrorScreen size={size} error={error} />;
  }

  return (
    <Root size={size} scale={scale}>
      <CtlBar
        size={size}
        pageCursor={pageCursor}
        pageNum={schemasList.length}
        setPageCursor={(p) => {
          if (!containerRef.current) return;
          containerRef.current.scrollTop = getPagesScrollTopByIndex(pageSizes, p, scale);
          setPageCursor(p);
        }}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
      <UnitPager
        size={size}
        unitCursor={unitCursor}
        unitNum={inputs.length}
        setUnitCursor={setUnitCursor}
      />
      <div ref={containerRef} style={{ ...size, position: 'relative', overflow: 'auto' }}>
        <Paper
          paperRefs={paperRefs}
          scale={scale}
          size={size}
          schemasList={schemasList}
          pageSizes={pageSizes}
          backgrounds={backgrounds}
          renderSchema={({ schema, index }) => {
            const value = schema.readOnly
              ? replacePlaceholders({
                  content: schema.content || '',
                  variables: { ...input, totalPages: schemasList.length, currentPage: index + 1 },
                  schemas: schemasList,
                })
              : String((input && input[schema.name]) || '');
            return (
              <Renderer
                key={schema.id}
                schema={schema}
                basePdf={template.basePdf}
                value={value}
                mode={isForm ? 'form' : 'viewer'}
                placeholder={schema.content}
                tabIndex={index + 100}
                onChange={(arg) => {
                  const args = Array.isArray(arg) ? arg : [arg];
                  handleOnChangeRenderer(args, schema);
                }}
                outline={
                  isForm && !schema.readOnly ? `1px dashed ${token.colorPrimary}` : 'transparent'
                }
                scale={scale}
              />
            );
          }}
          renderPaper={({ index }) => (
            <StaticSchema
              template={template}
              scale={scale}
              input={input}
              totalPages={schemasList.length}
              currentPage={index + 1}
            />
          )}
        />
      </div>
    </Root>
  );
};

export default Preview;
