import React, { useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';

interface SuccessOverlayProps {
  show: boolean;
}

const CONFETTI_COLORS = [
  'hsl(175, 60%, 50%)', // Primary
  'hsl(35, 90%, 55%)',  // Accent
  'hsl(145, 60%, 50%)', // Success
  'hsl(280, 70%, 60%)', // Purple
  'hsl(340, 80%, 60%)', // Pink
];

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ show }) => {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; color: string; delay: number; size: number }>
  >([]);

  useEffect(() => {
    if (show) {
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        size: 8 + Math.random() * 8,
      }));
      setConfetti(pieces);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute celebration-confetti"
          style={{
            left: `${piece.x}%`,
            top: 0,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: '2px',
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      {/* Success message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <div className="bg-card/95 backdrop-blur-sm border border-success/30 rounded-2xl p-8 shadow-2xl animate-scale-in text-center max-w-xs mx-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center success-pulse">
            <PartyPopper className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Puzzle Complete!
          </h2>
          <p className="text-muted-foreground">
            Congratulations! You solved the puzzle.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
