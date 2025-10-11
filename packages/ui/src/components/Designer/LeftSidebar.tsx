import React, { useContext, useState, useEffect } from 'react';
import { Schema, Plugin, BasePdf, getFallbackFontName } from '@pdfme/common';
import { theme, Button, Tooltip } from 'antd';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Renderer from '../Renderer.js';
import { LEFT_SIDEBAR_WIDTH } from '../../constants.js';
import { setFontNameRecursively } from '../../helper';
import { OptionsContext, PluginsRegistry } from '../../contexts.js';
import PluginIcon from './PluginIcon.js';

const Draggable = (props: {
  plugin: Plugin<Schema>;
  scale: number;
  basePdf: BasePdf;
  label: string;
  children: React.ReactNode;
}) => {
  const { scale, basePdf, plugin, label } = props;
  const { token } = theme.useToken();
  const options = useContext(OptionsContext);
  const [isHovered, setIsHovered] = useState(false);
  const defaultSchema = plugin.propPanel.defaultSchema;
  if (options.font) {
    const fontName = getFallbackFontName(options.font);
    setFontNameRecursively(defaultSchema, fontName);
  }
  const draggable = useDraggable({ id: defaultSchema.type, data: defaultSchema });
  const { listeners, setNodeRef, attributes, transform, isDragging } = draggable;
  const style = { transform: CSS.Translate.toString(transform) };

  const renderedSchema = React.useMemo(
    () => (
      <div style={{ transform: `scale(${scale})` }}>
        <Renderer
          schema={{ ...defaultSchema, id: defaultSchema.type }}
          basePdf={basePdf}
          value={defaultSchema.content || ''}
          onChangeHoveringSchemaId={() => {
            void 0;
          }}
          mode={'viewer'}
          outline={`1px solid ${token.colorPrimary}`}
          scale={scale}
        />
      </div>
    ),
    [defaultSchema, basePdf, scale, token.colorPrimary],
  );

  return (
    <Tooltip title={label} placement="right" mouseEnterDelay={0.5}>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isDragging && renderedSchema}
        <div style={{ visibility: isDragging ? 'hidden' : 'visible' }}>
          {React.cloneElement(props.children as React.ReactElement, { isHovered })}
        </div>
      </div>
    </Tooltip>
  );
};

const ToolButton = ({
  isHovered,
  onMouseDown,
  children
}: {
  isHovered?: boolean;
  onMouseDown: () => void;
  children: React.ReactNode;
}) => {
  const { token } = theme.useToken();

  return (
    <Button
      onMouseDown={onMouseDown}
      style={{
        width: 36,
        height: 36,
        padding: '0.375rem',
        marginBottom: '0.375rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: token.borderRadius,
        border: 'none',
        background: isHovered ? token.colorPrimaryBg : 'transparent',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: 'none',
      }}
    >
      {children}
    </Button>
  );
};

const LeftSidebar = ({
  height,
  scale,
  basePdf,
}: {
  height: number;
  scale: number;
  basePdf: BasePdf;
}) => {
  const { token } = theme.useToken();
  const pluginsRegistry = useContext(PluginsRegistry);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const scrollbarStyles = `
    .left-sidebar-scrollable::-webkit-scrollbar {
      width: 4px;
    }
    .left-sidebar-scrollable::-webkit-scrollbar-track {
      background: transparent;
    }
    .left-sidebar-scrollable::-webkit-scrollbar-thumb {
      background: ${token.colorBorder};
      border-radius: 2px;
    }
    .left-sidebar-scrollable::-webkit-scrollbar-thumb:hover {
      background: ${token.colorBorderSecondary};
    }
  `;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        className="left-sidebar-scrollable"
        style={{
          left: 0,
          right: 0,
          position: 'absolute',
          zIndex: 1,
          height,
          width: LEFT_SIDEBAR_WIDTH,
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorder}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.5rem 0.375rem',
          overflow: isDragging ? 'visible' : 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
      {pluginsRegistry.entries().map(([label, plugin]) => {
        if (!plugin?.propPanel.defaultSchema) return null;

        return (
          <Draggable key={label} scale={scale} basePdf={basePdf} plugin={plugin} label={label}>
            <ToolButton onMouseDown={() => setIsDragging(true)}>
              <PluginIcon plugin={plugin} label={label} />
            </ToolButton>
          </Draggable>
        );
      })}
      </div>
    </>
  );
};

export default LeftSidebar;
