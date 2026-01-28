// Jigsaw piece edge types
export type EdgeType = 'flat' | 'tab' | 'blank';

export interface PieceEdges {
  top: EdgeType;
  right: EdgeType;
  bottom: EdgeType;
  left: EdgeType;
}

export interface PiecePosition {
  row: number;
  col: number;
}

// Generate edge configuration for a 3x3 puzzle
export function generatePuzzleEdges(rows: number, cols: number): PieceEdges[][] {
  const edges: PieceEdges[][] = [];
  
  // Pre-generate horizontal and vertical edge types
  const horizontalEdges: ('tab' | 'blank')[][] = [];
  const verticalEdges: ('tab' | 'blank')[][] = [];
  
  // Generate horizontal edges (between rows)
  for (let row = 0; row < rows - 1; row++) {
    horizontalEdges[row] = [];
    for (let col = 0; col < cols; col++) {
      horizontalEdges[row][col] = Math.random() > 0.5 ? 'tab' : 'blank';
    }
  }
  
  // Generate vertical edges (between columns)
  for (let row = 0; row < rows; row++) {
    verticalEdges[row] = [];
    for (let col = 0; col < cols - 1; col++) {
      verticalEdges[row][col] = Math.random() > 0.5 ? 'tab' : 'blank';
    }
  }
  
  // Build piece edges
  for (let row = 0; row < rows; row++) {
    edges[row] = [];
    for (let col = 0; col < cols; col++) {
      const piece: PieceEdges = {
        top: row === 0 ? 'flat' : (horizontalEdges[row - 1][col] === 'tab' ? 'blank' : 'tab'),
        right: col === cols - 1 ? 'flat' : verticalEdges[row][col],
        bottom: row === rows - 1 ? 'flat' : horizontalEdges[row][col],
        left: col === 0 ? 'flat' : (verticalEdges[row][col - 1] === 'tab' ? 'blank' : 'tab'),
      };
      edges[row][col] = piece;
    }
  }
  
  return edges;
}

// Generate SVG path for a puzzle piece
export function generatePiecePath(
  edges: PieceEdges,
  size: number,
  tabSize: number = 0.2
): string {
  const s = size;
  const t = s * tabSize; // Tab protrusion
  const n = s * 0.15; // Neck width
  
  let path = '';
  
  // Start at top-left
  path += `M 0 0`;
  
  // Top edge
  if (edges.top === 'flat') {
    path += ` L ${s} 0`;
  } else if (edges.top === 'tab') {
    path += ` L ${s * 0.35} 0`;
    path += ` C ${s * 0.35} ${-n} ${s * 0.4} ${-t} ${s * 0.5} ${-t}`;
    path += ` C ${s * 0.6} ${-t} ${s * 0.65} ${-n} ${s * 0.65} 0`;
    path += ` L ${s} 0`;
  } else {
    path += ` L ${s * 0.35} 0`;
    path += ` C ${s * 0.35} ${n} ${s * 0.4} ${t} ${s * 0.5} ${t}`;
    path += ` C ${s * 0.6} ${t} ${s * 0.65} ${n} ${s * 0.65} 0`;
    path += ` L ${s} 0`;
  }
  
  // Right edge
  if (edges.right === 'flat') {
    path += ` L ${s} ${s}`;
  } else if (edges.right === 'tab') {
    path += ` L ${s} ${s * 0.35}`;
    path += ` C ${s + n} ${s * 0.35} ${s + t} ${s * 0.4} ${s + t} ${s * 0.5}`;
    path += ` C ${s + t} ${s * 0.6} ${s + n} ${s * 0.65} ${s} ${s * 0.65}`;
    path += ` L ${s} ${s}`;
  } else {
    path += ` L ${s} ${s * 0.35}`;
    path += ` C ${s - n} ${s * 0.35} ${s - t} ${s * 0.4} ${s - t} ${s * 0.5}`;
    path += ` C ${s - t} ${s * 0.6} ${s - n} ${s * 0.65} ${s} ${s * 0.65}`;
    path += ` L ${s} ${s}`;
  }
  
  // Bottom edge
  if (edges.bottom === 'flat') {
    path += ` L 0 ${s}`;
  } else if (edges.bottom === 'tab') {
    path += ` L ${s * 0.65} ${s}`;
    path += ` C ${s * 0.65} ${s + n} ${s * 0.6} ${s + t} ${s * 0.5} ${s + t}`;
    path += ` C ${s * 0.4} ${s + t} ${s * 0.35} ${s + n} ${s * 0.35} ${s}`;
    path += ` L 0 ${s}`;
  } else {
    path += ` L ${s * 0.65} ${s}`;
    path += ` C ${s * 0.65} ${s - n} ${s * 0.6} ${s - t} ${s * 0.5} ${s - t}`;
    path += ` C ${s * 0.4} ${s - t} ${s * 0.35} ${s - n} ${s * 0.35} ${s}`;
    path += ` L 0 ${s}`;
  }
  
  // Left edge
  if (edges.left === 'flat') {
    path += ` L 0 0`;
  } else if (edges.left === 'tab') {
    path += ` L 0 ${s * 0.65}`;
    path += ` C ${-n} ${s * 0.65} ${-t} ${s * 0.6} ${-t} ${s * 0.5}`;
    path += ` C ${-t} ${s * 0.4} ${-n} ${s * 0.35} 0 ${s * 0.35}`;
    path += ` L 0 0`;
  } else {
    path += ` L 0 ${s * 0.65}`;
    path += ` C ${n} ${s * 0.65} ${t} ${s * 0.6} ${t} ${s * 0.5}`;
    path += ` C ${t} ${s * 0.4} ${n} ${s * 0.35} 0 ${s * 0.35}`;
    path += ` L 0 0`;
  }
  
  path += ' Z';
  
  return path;
}

// Calculate the bounding box of a piece (including tabs)
export function getPieceBounds(edges: PieceEdges, size: number, tabSize: number = 0.2): {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
} {
  const t = size * tabSize;
  
  let offsetX = 0;
  let offsetY = 0;
  let width = size;
  let height = size;
  
  if (edges.left === 'tab') {
    offsetX = t;
    width += t;
  } else if (edges.left === 'blank') {
    width += t;
  }
  
  if (edges.right === 'tab') {
    width += t;
  } else if (edges.right === 'blank') {
    // Already accounted for in base size
  }
  
  if (edges.top === 'tab') {
    offsetY = t;
    height += t;
  } else if (edges.top === 'blank') {
    height += t;
  }
  
  if (edges.bottom === 'tab') {
    height += t;
  }
  
  // Adjust for both sides having tabs/blanks
  if (edges.right === 'tab' || edges.right === 'blank') {
    width += t;
  }
  if (edges.bottom === 'tab' || edges.bottom === 'blank') {
    height += t;
  }
  
  return { offsetX, offsetY, width, height };
}
