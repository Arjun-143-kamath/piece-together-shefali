import React, { useRef, useEffect, useState } from 'react';
import { PieceEdges, generatePiecePath } from '@/lib/puzzleShapes';

interface PuzzlePieceProps {
  id: number;
  edges: PieceEdges;
  imageUrl: string;
  pieceSize: number;
  row: number;
  col: number;
  gridSize: number;
  position: { x: number; y: number };
  onDragStart: (id: number) => void;
  onDragEnd: (id: number, x: number, y: number) => void;
  onDrag: (id: number, x: number, y: number) => void;
  isConnected: boolean;
  connectedGroupId: number | null;
  disabled: boolean;
  zIndex: number;
}

const PuzzlePiece: React.FC<PuzzlePieceProps> = ({
  id,
  edges,
  imageUrl,
  pieceSize,
  row,
  col,
  gridSize,
  position,
  onDragStart,
  onDragEnd,
  onDrag,
  isConnected,
  disabled,
  zIndex,
}) => {
  const pieceRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSnapping, setIsSnapping] = useState(false);

  const tabSize = 0.2;
  const tabExtension = pieceSize * tabSize;
  const path = generatePiecePath(edges, pieceSize, tabSize);

  // Calculate SVG viewport size to include tabs
  const svgSize = pieceSize + tabExtension * 2;
  const clipId = `clip-${id}`;

  // Calculate image offset within the piece
  const imageOffset = {
    x: -col * pieceSize + tabExtension,
    y: -row * pieceSize + tabExtension,
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = pieceRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    setIsDragging(true);
    onDragStart(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    e.preventDefault();

    const container = pieceRef.current?.parentElement;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;
      onDrag(id, newX, newY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    onDragEnd(id, position.x, position.y);
  };

  // Trigger snap animation
  useEffect(() => {
    if (isConnected) {
      setIsSnapping(true);
      const timer = setTimeout(() => setIsSnapping(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  return (
    <div
      ref={pieceRef}
      className={`absolute touch-none select-none puzzle-piece ${
        isDragging ? 'dragging' : ''
      } ${isSnapping ? 'piece-snap-animation' : ''} ${
        disabled ? 'pointer-events-none' : ''
      }`}
      style={{
        left: position.x - tabExtension,
        top: position.y - tabExtension,
        width: svgSize,
        height: svgSize,
        zIndex: isDragging ? 1000 : zIndex,
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`${-tabExtension} ${-tabExtension} ${svgSize} ${svgSize}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <image
            href={imageUrl}
            x={imageOffset.x}
            y={imageOffset.y}
            width={pieceSize * gridSize}
            height={pieceSize * gridSize}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>
    </div>
  );
};

export default PuzzlePiece;
