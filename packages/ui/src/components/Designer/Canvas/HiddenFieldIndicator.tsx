import React from 'react';
import { EyeOff } from 'lucide-react';

interface HiddenAreaIndicatorProps {
  x: number;
  y: number;
  width: number;
  height: number;
  count: number;
}

/**
 * Highlights a rectangular area on the canvas where hidden fields exist
 * Shows a subtle semi-transparent overlay with a small badge indicating count
 */
const HiddenAreaIndicator: React.FC<HiddenAreaIndicatorProps> = ({ x, y, width, height, count }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        pointerEvents: 'none', // Don't interfere with mouse events
        backgroundColor: 'rgba(251, 191, 36, 0.08)', // Very subtle amber/yellow tint
        border: '1px dashed rgba(251, 191, 36, 0.3)', // Subtle amber dashed border
        borderRadius: '3px',
        transition: 'all 0.2s ease',
        zIndex: 1, // Behind visible fields but above background
      }}
      title={`${count} hidden field${count !== 1 ? 's' : ''} in this area`}
    >
      {/* Small badge in top-right corner */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(251, 191, 36, 0.9)', // Amber badge
          color: '#78350f', // Dark amber text
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px',
          fontWeight: 600,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        }}
      >
        <EyeOff size={10} strokeWidth={2.5} />
        <span>{count}</span>
      </div>
    </div>
  );
};

export default React.memo(HiddenAreaIndicator);

