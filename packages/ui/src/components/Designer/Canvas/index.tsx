import React, {
  Ref,
  useMemo,
  useContext,
  MutableRefObject,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useCallback,
} from 'react';
import { theme, Button } from 'antd';
import MoveableComponent, { OnDrag, OnRotate, OnResize } from 'react-moveable';
import {
  ZOOM,
  SchemaForUI,
  Size,
  ChangeSchemas,
  BasePdf,
  isBlankPdf,
  replacePlaceholders,
} from '@pdfme/common';
import { PluginsRegistry } from '../../../contexts.js';
import { X } from 'lucide-react';
import { RULER_HEIGHT, RIGHT_SIDEBAR_WIDTH } from '../../../constants.js';
import { usePrevious } from '../../../hooks.js';
import { uuid, round, flatten } from '../../../helper.js';
import Paper from '../../Paper.js';
import Renderer from '../../Renderer.js';
import Selecto from './Selecto.js';
import Moveable from './Moveable.js';
import Guides from './Guides.js';
import Mask from './Mask.js';
import Padding from './Padding.js';
import StaticSchema from '../../StaticSchema.js';
import HiddenAreaIndicator from './HiddenFieldIndicator.js';

const mm2px = (mm: number) => mm * 3.7795275591;

const DELETE_BTN_ID = uuid();
const fmt4Num = (prop: string) => Number(prop.replace('px', ''));
const fmt = (prop: string) => round(fmt4Num(prop) / ZOOM, 2);
const isTopLeftResize = (d: string) => d === '-1,-1' || d === '-1,0' || d === '0,-1';
const normalizeRotate = (angle: number) => ((angle % 360) + 360) % 360;

const DeleteButton = ({ activeElements: aes }: { activeElements: HTMLElement[] }) => {
  const { token } = theme.useToken();
  const [isHovered, setIsHovered] = React.useState(false);

  const size = 28;
  const top = Math.min(...aes.map(({ style }) => fmt4Num(style.top)));
  const left = Math.max(...aes.map(({ style }) => fmt4Num(style.left) + fmt4Num(style.width))) + 10;

  return (
    <Button
      id={DELETE_BTN_ID}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        zIndex: 1,
        top,
        left,
        width: size,
        height: size,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: token.borderRadiusLG,
        border: 'none',
        color: token.colorWhite,
        background: token.colorError,
        opacity: isHovered ? 1 : 0.9,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isHovered
          ? '0 4px 12px rgba(255, 77, 79, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
    >
      <X size={16} style={{ pointerEvents: 'none' }} strokeWidth={2.5} />
    </Button>
  );
};

interface GuidesInterface {
  getGuides(): number[];
  scroll(pos: number): void;
  scrollGuides(pos: number): void;
  loadGuides(guides: number[]): void;
  resize(): void;
}

interface Props {
  basePdf: BasePdf;
  height: number;
  hoveringSchemaId: string | null;
  onChangeHoveringSchemaId: (id: string | null) => void;
  pageCursor: number;
  schemasList: SchemaForUI[][];
  scale: number;
  backgrounds: string[];
  pageSizes: Size[];
  size: Size;
  activeElements: HTMLElement[];
  onEdit: (targets: HTMLElement[]) => void;
  changeSchemas: ChangeSchemas;
  removeSchemas: (ids: string[]) => void;
  paperRefs: MutableRefObject<HTMLDivElement[]>;
  sidebarOpen: boolean;
}

const Canvas = (props: Props, ref: Ref<HTMLDivElement>) => {
  const {
    basePdf,
    pageCursor,
    scale,
    backgrounds,
    pageSizes,
    size,
    activeElements,
    schemasList,
    hoveringSchemaId,
    onEdit,
    changeSchemas,
    removeSchemas,
    onChangeHoveringSchemaId,
    paperRefs,
    sidebarOpen,
  } = props;
  const { token } = theme.useToken();
  const pluginsRegistry = useContext(PluginsRegistry);
  const verticalGuides = useRef<GuidesInterface[]>([]);
  const horizontalGuides = useRef<GuidesInterface[]>([]);
  const moveable = useRef<MoveableComponent>(null);

  const [isPressShiftKey, setIsPressShiftKey] = useState(false);
  const [editing, setEditing] = useState(false);

  const prevSchemas = usePrevious(schemasList[pageCursor]);

  // Calculate bounding boxes for clusters of hidden fields (PERFORMANT with useMemo)
  const hiddenFieldIndicators = useMemo(() => {
    const currentSchemas = schemasList[pageCursor] || [];
    const hiddenSchemas = currentSchemas.filter((s) => s.hide);

    if (hiddenSchemas.length === 0) return [];

    // Cluster hidden fields by proximity (fields within 30mm vertically are in same cluster)
    const clusters: SchemaForUI[][] = [];
    const CLUSTER_DISTANCE = 30; // mm - fields within this distance are considered part of same cluster

    // Sort by Y position first
    const sortedSchemas = [...hiddenSchemas].sort((a, b) => a.position.y - b.position.y);

    sortedSchemas.forEach((schema) => {
      // Find a cluster this field belongs to (based on Y proximity)
      let foundCluster = false;

      for (const cluster of clusters) {
        // Check if this field is within CLUSTER_DISTANCE of any field in the cluster
        const isNearby = cluster.some((clusterField) => {
          const yDiff = Math.abs(schema.position.y - clusterField.position.y);
          const xOverlap =
            schema.position.x < clusterField.position.x + clusterField.width &&
            schema.position.x + schema.width > clusterField.position.x;
          
          // Fields are in same cluster if they're close vertically and overlap/near horizontally
          return yDiff < CLUSTER_DISTANCE && (xOverlap || Math.abs(schema.position.x - clusterField.position.x) < CLUSTER_DISTANCE);
        });

        if (isNearby) {
          cluster.push(schema);
          foundCluster = true;
          break;
        }
      }

      if (!foundCluster) {
        clusters.push([schema]);
      }
    });

    // For each cluster, calculate the bounding box that encompasses all fields
    return clusters.map((cluster) => {
      // Find min/max positions in mm (same as schema.position units)
      const minX = Math.min(...cluster.map((s) => s.position.x));
      const minY = Math.min(...cluster.map((s) => s.position.y));
      const maxX = Math.max(...cluster.map((s) => s.position.x + s.width));
      const maxY = Math.max(...cluster.map((s) => s.position.y + s.height));

      // Add small padding (1mm) for better visibility
      const padding = 1;

      // Calculate final bounds in mm
      const x_mm = Math.max(0, minX - padding);
      const y_mm = Math.max(0, minY - padding);
      const width_mm = maxX - minX + padding * 2;
      const height_mm = maxY - minY + padding * 2;

      return {
        id: cluster.map((s) => s.id).join('-'),
        // Use exact same positioning as Renderer: position * ZOOM
        // Scale is applied by parent Paper transform, not here
        x: x_mm * ZOOM,
        y: y_mm * ZOOM,
        width: width_mm * ZOOM,
        height: height_mm * ZOOM,
        count: cluster.length,
      };
    });
  }, [schemasList, pageCursor, scale]);

  const onKeydown = (e: KeyboardEvent) => {
    if (e.shiftKey) setIsPressShiftKey(true);
  };
  const onKeyup = (e: KeyboardEvent) => {
    if (e.key === 'Shift' || !e.shiftKey) setIsPressShiftKey(false);
    if (e.key === 'Escape' || e.key === 'Esc') setEditing(false);
  };

  const initEvents = useCallback(() => {
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyup);
  }, []);

  const destroyEvents = useCallback(() => {
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('keyup', onKeyup);
  }, []);

  useEffect(() => {
    initEvents();

    return destroyEvents;
  }, [initEvents, destroyEvents]);

  useEffect(() => {
    moveable.current?.updateRect();
    if (!prevSchemas) {
      return;
    }

    const prevSchemaKeys = JSON.stringify(prevSchemas[pageCursor] || {});
    const schemaKeys = JSON.stringify(schemasList[pageCursor] || {});

    if (prevSchemaKeys === schemaKeys) {
      moveable.current?.updateRect();
    }
  }, [pageCursor, schemasList, prevSchemas]);

  const onDrag = ({ target, top, left }: OnDrag) => {
    const { width: _width, height: _height } = target.style;
    const targetWidth = fmt(_width);
    const targetHeight = fmt(_height);
    const actualTop = top / ZOOM;
    const actualLeft = left / ZOOM;
    const { width: pageWidth, height: pageHeight } = pageSizes[pageCursor];
    let topPadding = 0;
    let rightPadding = 0;
    let bottomPadding = 0;
    let leftPadding = 0;

    if (isBlankPdf(basePdf)) {
      const [t, r, b, l] = basePdf.padding;
      topPadding = t * ZOOM;
      rightPadding = r;
      bottomPadding = b;
      leftPadding = l * ZOOM;
    }

    if (actualTop + targetHeight > pageHeight - bottomPadding) {
      target.style.top = `${(pageHeight - targetHeight - bottomPadding) * ZOOM}px`;
    } else {
      target.style.top = `${top < topPadding ? topPadding : top}px`;
    }

    if (actualLeft + targetWidth > pageWidth - rightPadding) {
      target.style.left = `${(pageWidth - targetWidth - rightPadding) * ZOOM}px`;
    } else {
      target.style.left = `${left < leftPadding ? leftPadding : left}px`;
    }
  };

  const onDragEnd = ({ target }: { target: HTMLElement | SVGElement }) => {
    const { top, left } = target.style;
    changeSchemas([
      { key: 'position.y', value: fmt(top), schemaId: target.id },
      { key: 'position.x', value: fmt(left), schemaId: target.id },
    ]);
  };

  const onDragEnds = ({ targets }: { targets: (HTMLElement | SVGElement)[] }) => {
    const arg = targets.map(({ style: { top, left }, id }) => [
      { key: 'position.y', value: fmt(top), schemaId: id },
      { key: 'position.x', value: fmt(left), schemaId: id },
    ]);
    changeSchemas(flatten(arg));
  };

  const onRotate = ({ target, rotate }: OnRotate) => {
    target.style.transform = `rotate(${rotate}deg)`;
  };

  const onRotateEnd = ({ target }: { target: HTMLElement | SVGElement }) => {
    const { transform } = target.style;
    const rotate = Number(transform.replace('rotate(', '').replace('deg)', ''));
    const normalizedRotate = normalizeRotate(rotate);
    changeSchemas([{ key: 'rotate', value: normalizedRotate, schemaId: target.id }]);
  };

  const onRotateEnds = ({ targets }: { targets: (HTMLElement | SVGElement)[] }) => {
    const arg = targets.map(({ style: { transform }, id }) => {
      const rotate = Number(transform.replace('rotate(', '').replace('deg)', ''));
      const normalizedRotate = normalizeRotate(rotate);
      return [{ key: 'rotate', value: normalizedRotate, schemaId: id }];
    });
    changeSchemas(flatten(arg));
  };

  const onResizeEnd = ({ target }: { target: HTMLElement | SVGElement }) => {
    const { id, style } = target;
    const { width, height, top, left } = style;
    changeSchemas([
      { key: 'position.x', value: fmt(left), schemaId: id },
      { key: 'position.y', value: fmt(top), schemaId: id },
      { key: 'width', value: fmt(width), schemaId: id },
      { key: 'height', value: fmt(height), schemaId: id },
    ]);

    const targetSchema = schemasList[pageCursor].find((schema) => schema.id === id);

    if (!targetSchema) return;

    targetSchema.position.x = fmt(left);
    targetSchema.position.y = fmt(top);
    targetSchema.width = fmt(width);
    targetSchema.height = fmt(height);
  };

  const onResizeEnds = ({ targets }: { targets: (HTMLElement | SVGElement)[] }) => {
    const arg = targets.map(({ style: { width, height, top, left }, id }) => [
      { key: 'width', value: fmt(width), schemaId: id },
      { key: 'height', value: fmt(height), schemaId: id },
      { key: 'position.y', value: fmt(top), schemaId: id },
      { key: 'position.x', value: fmt(left), schemaId: id },
    ]);
    changeSchemas(flatten(arg));
  };

  const onResize = ({ target, width, height, direction }: OnResize) => {
    if (!target) return;
    let topPadding = 0;
    let rightPadding = 0;
    let bottomPadding = 0;
    let leftPadding = 0;

    if (isBlankPdf(basePdf)) {
      const [t, r, b, l] = basePdf.padding;
      topPadding = t * ZOOM;
      rightPadding = mm2px(r);
      bottomPadding = mm2px(b);
      leftPadding = l * ZOOM;
    }

    const pageWidth = mm2px(pageSizes[pageCursor].width);
    const pageHeight = mm2px(pageSizes[pageCursor].height);

    const obj: { top?: string; left?: string; width: string; height: string } = {
      width: `${width}px`,
      height: `${height}px`,
    };

    const s = target.style;
    let newLeft = fmt4Num(s.left) + (fmt4Num(s.width) - width);
    let newTop = fmt4Num(s.top) + (fmt4Num(s.height) - height);
    if (newLeft < leftPadding) {
      newLeft = leftPadding;
    }
    if (newTop < topPadding) {
      newTop = topPadding;
    }
    if (newLeft + width > pageWidth - rightPadding) {
      obj.width = `${pageWidth - rightPadding - newLeft}px`;
    }
    if (newTop + height > pageHeight - bottomPadding) {
      obj.height = `${pageHeight - bottomPadding - newTop}px`;
    }

    const d = direction.toString();
    if (isTopLeftResize(d)) {
      obj.top = `${newTop}px`;
      obj.left = `${newLeft}px`;
    } else if (d === '1,-1') {
      obj.top = `${newTop}px`;
    } else if (d === '-1,1') {
      obj.left = `${newLeft}px`;
    }
    Object.assign(s, obj);
  };

  const getGuideLines = (guides: GuidesInterface[], index: number) =>
    guides[index] && guides[index].getGuides().map((g) => g * ZOOM);

  const onClickMoveable = () => {
    // Just set editing to true without trying to access event properties
    setEditing(true);
  };

  const rotatable = useMemo(() => {
    const selectedSchemas = (schemasList[pageCursor] || []).filter((s) =>
      activeElements.map((ae) => ae.id).includes(s.id),
    );
    const schemaTypes = selectedSchemas.map((s) => s.type);
    const uniqueSchemaTypes = [...new Set(schemaTypes)];

    // Create a type-safe array of default schemas
    const defaultSchemas: Record<string, unknown>[] = [];

    pluginsRegistry.entries().forEach(([, plugin]) => {
      if (plugin.propPanel.defaultSchema) {
        defaultSchemas.push(plugin.propPanel.defaultSchema as Record<string, unknown>);
      }
    });

    // Check if all schema types have rotate property
    return uniqueSchemaTypes.every((type) => {
      const matchingSchema = defaultSchemas.find((ds) => ds && 'type' in ds && ds.type === type);
      return matchingSchema && 'rotate' in matchingSchema;
    });
  }, [activeElements, pageCursor, schemasList, pluginsRegistry]);

  const scrollbarStyles = `
    .canvas-scrollable::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .canvas-scrollable::-webkit-scrollbar-track {
      background: transparent;
    }
    .canvas-scrollable::-webkit-scrollbar-thumb {
      background: ${token.colorBorder};
      border-radius: 4px;
    }
    .canvas-scrollable::-webkit-scrollbar-thumb:hover {
      background: ${token.colorBorderSecondary};
    }
    .canvas-scrollable::-webkit-scrollbar-corner {
      background: transparent;
    }
  `;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        className="canvas-scrollable"
        style={{
          position: 'relative',
          overflow: 'auto',
          marginRight: sidebarOpen ? RIGHT_SIDEBAR_WIDTH : 0,
          ...size,
        }}
        ref={ref}
      >
      <Selecto
        container={paperRefs.current[pageCursor]}
        continueSelect={isPressShiftKey}
        onDragStart={(e) => {
          // Use type assertion to safely access inputEvent properties
          const inputEvent = e.inputEvent as MouseEvent | TouchEvent;
          const target = inputEvent.target as Element | null;
          const isMoveableElement = moveable.current?.isMoveableElement(target as Element);

          if ((inputEvent.type === 'touchstart' && e.isTrusted) || isMoveableElement) {
            e.stop();
          }

          if (paperRefs.current[pageCursor] === target) {
            onEdit([]);
          }

          // Check if the target is an HTMLElement and has an id property
          const targetElement = target as HTMLElement | null;
          if (targetElement && targetElement.id === DELETE_BTN_ID) {
            removeSchemas(activeElements.map((ae) => ae.id));
          }
        }}
        onSelect={(e) => {
          // Use type assertions to safely access properties
          const inputEvent = e.inputEvent as MouseEvent | TouchEvent;
          const added = e.added as HTMLElement[];
          const removed = e.removed as HTMLElement[];
          const selected = e.selected as HTMLElement[];

          const isClick = inputEvent.type === 'mousedown';
          let newActiveElements: HTMLElement[] = isClick ? selected : [];

          if (!isClick && added.length > 0) {
            newActiveElements = activeElements.concat(added);
          }
          if (!isClick && removed.length > 0) {
            newActiveElements = activeElements.filter((ae) => !removed.includes(ae));
          }
          onEdit(newActiveElements);

          if (newActiveElements != activeElements) {
            setEditing(false);
          }

          // For MacOS CMD+SHIFT+3/4 screenshots where the keydown event is never received, check mouse too
          const mouseEvent = inputEvent as MouseEvent;
          if (mouseEvent && typeof mouseEvent.shiftKey === 'boolean' && !mouseEvent.shiftKey) {
            setIsPressShiftKey(false);
          }
        }}
      />
      <Paper
        paperRefs={paperRefs}
        scale={scale}
        size={size}
        schemasList={schemasList}
        pageSizes={pageSizes}
        backgrounds={backgrounds}
        hasRulers={true}
        renderPaper={({ index, paperSize }) => (
          <>
            {!editing && activeElements.length > 0 && pageCursor === index && (
              <DeleteButton activeElements={activeElements} />
            )}
            <Padding basePdf={basePdf} />
            <StaticSchema
              template={{ schemas: schemasList, basePdf }}
              input={Object.fromEntries(
                schemasList.flat().map(({ name, content = '' }) => [name, content]),
              )}
              scale={scale}
              totalPages={schemasList.length}
              currentPage={index + 1}
            />
            <Guides
              paperSize={paperSize}
              horizontalRef={(e) => {
                if (e) horizontalGuides.current[index] = e;
              }}
              verticalRef={(e) => {
                if (e) verticalGuides.current[index] = e;
              }}
            />
            {/* Render hidden field area indicators on current page */}
            {pageCursor === index &&
              hiddenFieldIndicators.map((indicator) => (
                <HiddenAreaIndicator
                  key={indicator.id}
                  x={indicator.x}
                  y={indicator.y}
                  width={indicator.width}
                  height={indicator.height}
                  count={indicator.count}
                />
              ))}
            {pageCursor !== index ? (
              <Mask
                width={paperSize.width + RULER_HEIGHT}
                height={paperSize.height + RULER_HEIGHT}
              />
            ) : (
              !editing && (
                <Moveable
                  ref={moveable}
                  target={activeElements}
                  bounds={{ left: 0, top: 0, bottom: paperSize.height, right: paperSize.width }}
                  horizontalGuidelines={getGuideLines(horizontalGuides.current, index)}
                  verticalGuidelines={getGuideLines(verticalGuides.current, index)}
                  keepRatio={isPressShiftKey}
                  rotatable={rotatable}
                  onDrag={onDrag}
                  onDragEnd={onDragEnd}
                  onDragGroupEnd={onDragEnds}
                  onRotate={onRotate}
                  onRotateEnd={onRotateEnd}
                  onRotateGroupEnd={onRotateEnds}
                  onResize={onResize}
                  onResizeEnd={onResizeEnd}
                  onResizeGroupEnd={onResizeEnds}
                  onClick={onClickMoveable}
                />
              )
            )}
          </>
        )}
        renderSchema={({ schema, index }) => {
          // Don't render hidden schemas
          if (schema.hide) {
            return null;
          }

          const mode =
            editing && activeElements.map((ae) => ae.id).includes(schema.id)
              ? 'designer'
              : 'viewer';

          const content = schema.content || '';
          let value = content;

          if (mode !== 'designer' && schema.readOnly) {
            const variables = {
              ...schemasList.flat().reduce(
                (acc, currSchema) => {
                  acc[currSchema.name] = currSchema.content || '';
                  return acc;
                },
                {} as Record<string, string>,
              ),
              totalPages: schemasList.length,
              currentPage: index + 1,
            };

            value = replacePlaceholders({ content, variables, schemas: schemasList });
          }

          return (
            <Renderer
              key={schema.id}
              schema={schema}
              basePdf={basePdf}
              value={value}
              onChangeHoveringSchemaId={onChangeHoveringSchemaId}
              mode={mode}
              onChange={
                (schemasList[pageCursor] || []).some((s) => s.id === schema.id)
                  ? (arg) => {
                      // Use type assertion to safely handle the argument
                      type ChangeArg = { key: string; value: unknown };
                      const args = Array.isArray(arg) ? (arg as ChangeArg[]) : [arg as ChangeArg];
                      changeSchemas(
                        args.map(({ key, value }) => ({ key, value, schemaId: schema.id })),
                      );
                    }
                  : undefined
              }
              stopEditing={() => setEditing(false)}
              outline={`1px ${hoveringSchemaId === schema.id ? 'solid' : 'dashed'} ${
                schema.readOnly && hoveringSchemaId !== schema.id
                  ? 'transparent'
                  : token.colorPrimary
              }`}
              scale={scale}
            />
          );
        }}
      />
      </div>
    </>
  );
};
export default forwardRef<HTMLDivElement, Props>(Canvas);
