import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PuzzlePiece from './PuzzlePiece';
import { PieceEdges, generatePuzzleEdges } from '@/lib/puzzleShapes';

interface PuzzleBoardProps {
  imageUrl: string;
  gridSize?: number;
  onComplete: () => void;
  shuffleTrigger: number;
  resetTrigger: number;
}

interface PieceState {
  id: number;
  row: number;
  col: number;
  position: { x: number; y: number };
  correctPosition: { x: number; y: number };
  edges: PieceEdges;
  groupId: number;
  zIndex: number;
}

const SNAP_THRESHOLD = 30;

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  imageUrl,
  gridSize = 3,
  onComplete,
  shuffleTrigger,
  resetTrigger,
}) => {
  const [containerSize, setContainerSize] = useState(0);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [edges, setEdges] = useState<PieceEdges[][]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [initialEdges, setInitialEdges] = useState<PieceEdges[][] | null>(null);

  const pieceSize = useMemo(() => {
    return containerSize / gridSize;
  }, [containerSize, gridSize]);

  // Initialize puzzle
  const initializePuzzle = useCallback((shouldShuffle: boolean, useExistingEdges: boolean = false) => {
    if (containerSize === 0) return;

    const newEdges = useExistingEdges && initialEdges ? initialEdges : generatePuzzleEdges(gridSize, gridSize);
    if (!useExistingEdges) {
      setInitialEdges(newEdges);
    }
    setEdges(newEdges);

    const newPieces: PieceState[] = [];
    const size = containerSize / gridSize;
    const tabExtension = size * 0.2;
    const boardPadding = tabExtension * 2;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const id = row * gridSize + col;
        const correctX = col * size;
        const correctY = row * size;

        let posX = correctX;
        let posY = correctY;

        if (shouldShuffle) {
          // Scatter pieces around the board with padding for tabs
          posX = boardPadding + Math.random() * (containerSize - size - boardPadding * 2);
          posY = boardPadding + Math.random() * (containerSize - size - boardPadding * 2);
        }

        newPieces.push({
          id,
          row,
          col,
          position: { x: posX, y: posY },
          correctPosition: { x: correctX, y: correctY },
          edges: newEdges[row][col],
          groupId: id,
          zIndex: id + 1,
        });
      }
    }

    setPieces(newPieces);
    setIsComplete(false);
    setHighestZIndex(gridSize * gridSize + 1);
  }, [containerSize, gridSize, initialEdges]);

  // Calculate container size based on viewport
  useEffect(() => {
    const calculateSize = () => {
      const padding = 40;
      const maxWidth = Math.min(window.innerWidth - padding * 2, 600);
      const maxHeight = window.innerHeight - 280; // Leave room for buttons
      const size = Math.min(maxWidth, maxHeight);
      setContainerSize(size);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, []);

  // Initialize on first load and when container size changes
  useEffect(() => {
    if (containerSize > 0 && pieces.length === 0) {
      initializePuzzle(true);
    }
  }, [containerSize, initializePuzzle, pieces.length]);

  // Handle shuffle trigger
  useEffect(() => {
    if (shuffleTrigger > 0 && containerSize > 0) {
      initializePuzzle(true, true); // Use existing edges when shuffling
    }
  }, [shuffleTrigger, containerSize, initializePuzzle]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger > 0 && containerSize > 0) {
      initializePuzzle(false, true); // Reset to solved position with existing edges
    }
  }, [resetTrigger, containerSize, initializePuzzle]);

  const handleDragStart = useCallback((id: number) => {
    setHighestZIndex((prev) => prev + 1);
    setPieces((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, zIndex: highestZIndex + 1 } : p
      )
    );
  }, [highestZIndex]);

  const handleDrag = useCallback((id: number, x: number, y: number) => {
    setPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, position: { x, y } } : p))
    );
  }, []);

  const checkSnap = useCallback((
    piece: PieceState,
    allPieces: PieceState[]
  ): { snapTo: { x: number; y: number } | null; mergeWith: number | null } => {
    const size = pieceSize;

    // Check against all other pieces
    for (const other of allPieces) {
      if (other.id === piece.id || other.groupId === piece.groupId) continue;

      // Check if pieces are neighbors in the original puzzle
      const rowDiff = other.row - piece.row;
      const colDiff = other.col - piece.col;

      if (Math.abs(rowDiff) + Math.abs(colDiff) !== 1) continue;

      // Calculate expected offset
      const expectedDx = colDiff * size;
      const expectedDy = rowDiff * size;

      // Check if pieces are close to correct relative position
      const actualDx = other.position.x - piece.position.x;
      const actualDy = other.position.y - piece.position.y;

      const diffX = Math.abs(actualDx - expectedDx);
      const diffY = Math.abs(actualDy - expectedDy);

      if (diffX < SNAP_THRESHOLD && diffY < SNAP_THRESHOLD) {
        // Snap to the other piece
        const snapX = other.position.x - expectedDx;
        const snapY = other.position.y - expectedDy;
        return { snapTo: { x: snapX, y: snapY }, mergeWith: other.id };
      }
    }

    return { snapTo: null, mergeWith: null };
  }, [pieceSize]);

  const handleDragEnd = useCallback((id: number, x: number, y: number) => {
    setPieces((prev) => {
      const piece = prev.find((p) => p.id === id);
      if (!piece) return prev;

      const { snapTo, mergeWith } = checkSnap(piece, prev);

      if (snapTo && mergeWith !== null) {
        const targetPiece = prev.find((p) => p.id === mergeWith);
        if (!targetPiece) return prev;

        const targetGroupId = targetPiece.groupId;
        const currentGroupId = piece.groupId;
        const size = pieceSize;

        // Calculate offset from the snapped piece to all pieces in its group
        const piecesInCurrentGroup = prev.filter((p) => p.groupId === currentGroupId);
        const offsetX = snapTo.x - piece.position.x;
        const offsetY = snapTo.y - piece.position.y;

        // Update all pieces in the dragged group
        return prev.map((p) => {
          if (p.groupId === currentGroupId) {
            return {
              ...p,
              position: {
                x: p.position.x + offsetX,
                y: p.position.y + offsetY,
              },
              groupId: targetGroupId,
            };
          }
          return p;
        });
      }

      return prev;
    });

    // Check for completion after state update
    setTimeout(() => {
      setPieces((current) => {
        // Check if all pieces are in the same group
        const groups = new Set(current.map((p) => p.groupId));
        if (groups.size === 1 && current.length === gridSize * gridSize) {
          // Check if all pieces are near their correct positions
          const allCorrect = current.every((p) => {
            const diffX = Math.abs(p.position.x - p.correctPosition.x);
            const diffY = Math.abs(p.position.y - p.correctPosition.y);
            return diffX < SNAP_THRESHOLD && diffY < SNAP_THRESHOLD;
          });

          if (allCorrect) {
            setIsComplete(true);
            // Snap all pieces to exact positions
            onComplete();
            return current.map((p) => ({
              ...p,
              position: { ...p.correctPosition },
            }));
          }
        }
        return current;
      });
    }, 50);
  }, [checkSnap, pieceSize, gridSize, onComplete]);

  if (containerSize === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div
      className="relative puzzle-board mx-auto"
      style={{
        width: containerSize,
        height: containerSize,
      }}
    >
      {pieces.map((piece) => (
        <PuzzlePiece
          key={piece.id}
          id={piece.id}
          edges={piece.edges}
          imageUrl={imageUrl}
          pieceSize={pieceSize}
          row={piece.row}
          col={piece.col}
          gridSize={gridSize}
          position={piece.position}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrag={handleDrag}
          isConnected={false}
          connectedGroupId={piece.groupId}
          disabled={isComplete}
          zIndex={piece.zIndex}
        />
      ))}
    </div>
  );
};

export default PuzzleBoard;
