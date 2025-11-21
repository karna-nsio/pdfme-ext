import React, { useContext } from 'react';
import { Size } from '@pdfme/common';
// Import icons from lucide-react
// Note: In tests, these will be mocked by the mock file in __mocks__/lucide-react.js
import { Plus, Minus, ChevronLeft, ChevronRight, Ellipsis, FileCode, Download, Files } from 'lucide-react';

import type { MenuProps } from 'antd';
import { theme, Typography, Button, Dropdown } from 'antd';
import { I18nContext } from '../contexts.js';
import { useMaxZoom } from '../helper.js';

const { Text } = Typography;

type TextStyle = { color: string; fontSize: number; margin: number };
type ZoomProps = {
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  style: { textStyle: TextStyle };
};

const Zoom = ({ zoomLevel, setZoomLevel, style }: ZoomProps) => {
  const zoomStep = 0.25;
  const maxZoom = useMaxZoom();
  const minZoom = 0.25;

  const nextZoomOut = zoomLevel - zoomStep;
  const nextZoomIn = zoomLevel + zoomStep;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Button
        type="text"
        disabled={minZoom >= nextZoomOut}
        onClick={() => setZoomLevel(nextZoomOut)}
        icon={<Minus size={16} color={style.textStyle.color} />}
      />
      <Text strong style={style.textStyle}>
        {Math.round(zoomLevel * 100)}%
      </Text>
      <Button
        type="text"
        disabled={maxZoom < nextZoomIn}
        onClick={() => setZoomLevel(nextZoomIn)}
        icon={<Plus size={16} color={style.textStyle.color} />}
      />
    </div>
  );
};

type PagerProps = {
  pageCursor: number;
  pageNum: number;
  setPageCursor: (page: number) => void;
  style: { textStyle: TextStyle };
};

const Pager = ({ pageCursor, pageNum, setPageCursor, style }: PagerProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Button type="text" disabled={pageCursor <= 0} onClick={() => setPageCursor(pageCursor - 1)}>
        <ChevronLeft size={16} color={style.textStyle.color} />
      </Button>
      <Text strong style={style.textStyle}>
        {pageCursor + 1}/{pageNum}
      </Text>
      <Button
        type="text"
        disabled={pageCursor + 1 >= pageNum}
        onClick={() => setPageCursor(pageCursor + 1)}
      >
        <ChevronRight size={16} color={style.textStyle.color} />
      </Button>
    </div>
  );
};

type ContextMenuProps = {
  items: MenuProps['items'];
  style: { textStyle: TextStyle };
};
const ContextMenu = ({ items, style }: ContextMenuProps) => (
  <Dropdown menu={{ items }} placement="top" arrow trigger={['click']}>
    <Button type="text">
      <Ellipsis size={16} color={style.textStyle.color} />
    </Button>
  </Dropdown>
);

type CtlBarProps = {
  size: Size;
  pageCursor: number;
  pageNum: number;
  setPageCursor: (page: number) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  addPageAfter?: () => void;
  removePage?: () => void;
  onExportHTML?: () => void;
  onExportHTMLFragments?: () => void;
  onExportJSON?: () => void;
};

const CtlBar = (props: CtlBarProps) => {
  const { token } = theme.useToken();
  const i18n = useContext(I18nContext);

  const {
    size,
    pageCursor,
    pageNum,
    setPageCursor,
    zoomLevel,
    setZoomLevel,
    addPageAfter,
    removePage,
    onExportHTML,
    onExportHTMLFragments,
    onExportJSON,
  } = props;

  const contextMenuItems: MenuProps['items'] = [];
  
  // Export options
  if (onExportHTML || onExportHTMLFragments || onExportJSON) {
    if (onExportHTML) {
      contextMenuItems.push({
        key: 'export-html',
        label: (
          <div onClick={onExportHTML} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={14} />
            <span>Export HTML</span>
          </div>
        ),
      });
    }
    if (onExportHTMLFragments) {
      contextMenuItems.push({
        key: 'export-html-fragments',
        label: (
          <div onClick={onExportHTMLFragments} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Files size={14} />
            <span>{i18n('exportHTMLFragments')}</span>
          </div>
        ),
      });
    }
    if (onExportJSON) {
      contextMenuItems.push({
        key: 'export-json',
        label: (
          <div onClick={onExportJSON} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={14} />
            <span>Export JSON</span>
          </div>
        ),
      });
    }
    if ((onExportHTML || onExportHTMLFragments || onExportJSON) && (addPageAfter || removePage)) {
      contextMenuItems.push({ type: 'divider' });
    }
  }
  
  // Page management options
  if (addPageAfter) {
    contextMenuItems.push({
      key: '1',
      label: <div onClick={addPageAfter}>{i18n('addPageAfter')}</div>,
    });
  }
  if (removePage && pageNum > 1 && pageCursor !== 0) {
    contextMenuItems.push({
      key: '2',
      label: <div onClick={removePage}>{i18n('removePage')}</div>,
    });
  }

  const barWidth = 300;
  const contextMenuWidth = contextMenuItems.length > 0 ? 50 : 0;
  const width = (pageNum > 1 ? barWidth : barWidth / 2) + contextMenuWidth;

  const textStyle = {
    color: token.colorWhite,
    fontSize: token.fontSize,
    margin: token.marginXS,
  };

  return (
    <div style={{ position: 'absolute', top: 'auto', bottom: '6%', width: size.width }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          position: 'relative',
          zIndex: 1,
          left: `calc(50% - ${width / 2}px)`,
          width,
          height: 44,
          boxSizing: 'border-box',
          padding: `${token.paddingSM}px ${token.padding}px`,
          borderRadius: 22,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        {pageNum > 1 && (
          <Pager
            style={{ textStyle }}
            pageCursor={pageCursor}
            pageNum={pageNum}
            setPageCursor={setPageCursor}
          />
        )}
        <Zoom style={{ textStyle }} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
        {contextMenuItems.length > 0 && (
          <ContextMenu items={contextMenuItems} style={{ textStyle }} />
        )}
      </div>
    </div>
  );
};

export default CtlBar;
