import React, { useState, useCallback } from 'react';
import PuzzleBoard from './PuzzleBoard';
import { Shuffle, RotateCcw, Puzzle } from 'lucide-react';

// Default demo image
const DEFAULT_IMAGE = '/Sinhu.png';

const JigsawPuzzle: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleImageSelect = useCallback((url: string) => {
    setImageUrl(url);
    setIsComplete(false);
    setHasStarted(true);
    // Shuffle after a short delay to ensure the new image is loaded
    setTimeout(() => {
      setShuffleTrigger((prev) => prev + 1);
    }, 100);
  }, []);

  const handleShuffle = useCallback(() => {
    setIsComplete(false);
    setHasStarted(true);
    setShuffleTrigger((prev) => prev + 1);
  }, []);

  const handleReset = useCallback(() => {
    setIsComplete(false);
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          <h1 className="font-sans-serif text-2xl sm:text-3xl font-semibold text-foreground">
            Solve the puzzle See the Speaker
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 gap-6 sm:gap-8">
        {/* Puzzle board */}
        <div className="animate-fade-in">
          <PuzzleBoard
            imageUrl={imageUrl}
            gridSize={3}
            onComplete={handleComplete}
            shuffleTrigger={shuffleTrigger}
            resetTrigger={resetTrigger}
          />
        </div>

        {/* Success message */}
        {isComplete && (
          <p className="text-lg font-medium text-success text-center animate-fade-in">
            🎉 Puzzle Solved!
          </p>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={handleShuffle}
            className="btn-puzzle"
            aria-label="Shuffle puzzle pieces"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Instructions */}
        {!hasStarted && (
          <p className="text-sm text-muted-foreground text-center max-w-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Solve the puzzle to reveal the face of the speaker.
          </p>
        )}
      </main>

    </div>
  );
};

export default JigsawPuzzle;
