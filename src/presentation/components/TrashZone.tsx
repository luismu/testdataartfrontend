import React, { useEffect, useRef } from 'react';
import { Rect } from '../../domain/types';

interface TrashZoneProps {
  isHovered: boolean;
  onRegisterRect: (rect: Rect | null) => void;
}

export const TrashZone: React.FC<TrashZoneProps> = ({ isHovered, onRegisterRect }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        onRegisterRect({
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
        });
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      onRegisterRect(null);
    };
  }, [onRegisterRect]);

  return (
    <div
      ref={containerRef}
      className={`trash-zone ${isHovered ? 'trash-hovered' : ''}`}
      aria-label="Trash drop zone"
    >
      <div className="trash-icon-wrapper">
        <svg
          className="trash-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </div>
      <div className="trash-label">
        <strong>{isHovered ? 'Release to Delete!' : 'Trash Zone'}</strong>
        <span>Drag note here to remove</span>
      </div>
    </div>
  );
};
