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
  isFieldInAnyGroup,
  isFieldVisible,
  filterTableColumns,
  filterTableBody,
  cleanTemplate
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
    
    // Clean template to remove null conditions (Zod expects undefined for optional properties)
    const cleanedTemplate = cleanTemplate(template);
    
    // CRITICAL: Store fieldGroups before getDynamicTemplate (it might not preserve them)
    const originalFieldGroups = cleanedTemplate.fieldGroups;
    
    getDynamicTemplate({
      template: cleanedTemplate,
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
        
        // EVALUATE FIELD & GROUP CONDITIONS AND FILTER FIELDS
        let filteredTemplate = dynamicTemplate;
        
        console.log('[@pdfme/ui Preview] Starting field & group condition evaluation...');
        console.log('  - Has fieldGroups:', !!dynamicTemplate.fieldGroups);
        console.log('  - fieldGroups count:', dynamicTemplate.fieldGroups?.length || 0);
        console.log('  - Has input data:', !!input);
        
        if (input) {
          console.log('[@pdfme/ui Preview] Step 1: Processing table column conditions...');
          
          // 🆕 Step 1: Filter table columns based on column conditions
          filteredTemplate = {
            ...dynamicTemplate,
            schemas: dynamicTemplate.schemas.map((page) => {
              if (Array.isArray(page)) {
                return page.map((schema: any) => {
                  // Handle table column filtering
                  if (schema.type === 'table' && schema.columnConditions) {
                    console.log(`  - Filtering table "${schema.name}" columns...`);
                    
                    const { visibleColumnIndices, filteredHead, filteredWidthPercentages } = 
                      filterTableColumns(schema, input);
                    
                    console.log(`    Original columns: ${schema.head.length}`);
                    console.log(`    Visible columns: ${visibleColumnIndices.length}`);
                    console.log(`    Filtered head:`, filteredHead);
                    
                    // Parse body content
                    let body: string[][] = [];
                    try {
                      body = JSON.parse(schema.content || '[]');
                    } catch (e) {
                      console.error('Failed to parse table content:', e);
                    }
                    
                    // Filter body rows
                    const filteredBody = filterTableBody(body, visibleColumnIndices);
                    
                    // Return modified table schema
                    return {
                      ...schema,
                      head: filteredHead,
                      headWidthPercentages: filteredWidthPercentages,
                      content: JSON.stringify(filteredBody),
                      _originalHead: schema.head,
                      _originalBody: body,
                    };
                  }
                  
                  return schema;
                });
              } else if (page && typeof page === 'object') {
                const filteredPage: any = {};
                Object.keys(page).forEach((key) => {
                  const schema: any = page[key];
                  
                  // Handle table column filtering for object format
                  if (schema.type === 'table' && schema.columnConditions) {
                    const { visibleColumnIndices, filteredHead, filteredWidthPercentages } = 
                      filterTableColumns(schema, input);
                    
                    let body: string[][] = [];
                    try {
                      body = JSON.parse(schema.content || '[]');
                    } catch (e) {
                      console.error('Failed to parse table content:', e);
                    }
                    
                    const filteredBody = filterTableBody(body, visibleColumnIndices);
                    
                    filteredPage[key] = {
                      ...schema,
                      head: filteredHead,
                      headWidthPercentages: filteredWidthPercentages,
                      content: JSON.stringify(filteredBody),
                    };
                  } else {
                    filteredPage[key] = schema;
                  }
                });
                return filteredPage;
              }
              return page;
            }),
          };
          
          console.log('[@pdfme/ui Preview] Step 2: Evaluating field & group conditions...');
          
          // Log groups if they exist
          const fieldGroups = filteredTemplate.fieldGroups || [];
          if (fieldGroups.length > 0) {
            console.log('  - Group conditions:');
            fieldGroups.forEach(group => {
              console.log(`    Group: ${group.name} (${group.fieldIds.length} fields)`);
              if (group.condition && group.condition.enabled) {
                console.log(`      Condition: ${group.condition.variable} ${group.condition.operator} ${group.condition.value}`);
              } else {
                console.log(`      No condition`);
              }
            });
          }
          
          // 🆕 Step 3: Filter fields using new field-level + group-level visibility logic
          filteredTemplate = {
            ...filteredTemplate,
            schemas: filteredTemplate.schemas.map((page) => {
              // Handle both array and object schema formats
              if (Array.isArray(page)) {
                return page.filter((schema: any) => {
                  const visible = isFieldVisible(schema, fieldGroups, input);
                  
                  const conditionInfo = schema.condition?.enabled 
                    ? `field condition (${schema.condition.variable} ${schema.condition.operator} ${schema.condition.value})`
                    : isFieldInAnyGroup(schema.id, fieldGroups)
                    ? 'group condition'
                    : 'no condition';
                  
                  console.log(
                    `  ${visible ? '✅' : '❌'} Field ${schema.name} (${schema.type}) - ${conditionInfo}`
                  );
                  
                  return visible;
                });
              } else if (page && typeof page === 'object') {
                // Object schema format
                const filteredPage: any = {};
                Object.keys(page).forEach((key) => {
                  const schema: any = page[key];
                  
                  // Use multiple possible IDs for matching
                  const possibleIds = [schema.id, key, schema.name].filter(Boolean);
                  const schemaWithId = { ...schema, id: possibleIds[0] };
                  
                  const visible = isFieldVisible(schemaWithId, fieldGroups, input);
                  
                  if (visible) {
                    filteredPage[key] = schema;
                  }
                  
                  const conditionInfo = schema.condition?.enabled 
                    ? 'field condition'
                    : possibleIds.some(id => isFieldInAnyGroup(id, fieldGroups))
                    ? 'group condition'
                    : 'no condition';
                  
                  console.log(
                    `  ${visible ? '✅' : '❌'} Field ${schema.name} (${schema.type}) - ${conditionInfo}`
                  );
                });
                return filteredPage;
              }
              return page;
            }),
          };
          
          // Count and log results
          const totalFieldsAfter = filteredTemplate.schemas.reduce((acc, page) => {
            if (Array.isArray(page)) return acc + page.length;
            if (page && typeof page === 'object') return acc + Object.keys(page).length;
            return acc;
          }, 0);
          
          console.log(`[@pdfme/ui Preview] ✅ Field filtering complete - ${totalFieldsAfter} fields visible`);
          
          // 🆕 Step 4: Filter out pages that have no visible fields (conditional page rendering)
          const originalPageCount = filteredTemplate.schemas.length;
          const pagesWithVisibleFields = filteredTemplate.schemas.filter((page, pageIndex) => {
            let hasVisibleFields = false;
            
            if (Array.isArray(page)) {
              hasVisibleFields = page.length > 0;
            } else if (page && typeof page === 'object') {
              hasVisibleFields = Object.keys(page).length > 0;
            } else {
              // Empty page or null - keep it (might be intentional)
              hasVisibleFields = true;
            }
            
            if (!hasVisibleFields) {
              console.log(`[@pdfme/ui Preview] 🚫 Hiding page ${pageIndex + 1} - no visible fields`);
            } else {
              console.log(`[@pdfme/ui Preview] ✅ Showing page ${pageIndex + 1} - has visible fields`);
            }
            
            return hasVisibleFields;
          });
          
          // Update template with filtered pages
          filteredTemplate = {
            ...filteredTemplate,
            schemas: pagesWithVisibleFields
          };
          
          const finalPageCount = filteredTemplate.schemas.length;
          console.log(`[@pdfme/ui Preview] 📄 Page filtering complete - ${finalPageCount}/${originalPageCount} pages visible`);
        } else {
          console.log('[@pdfme/ui Preview] No filtering needed - no input data');
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
