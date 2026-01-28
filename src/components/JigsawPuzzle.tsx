import React, { useState, useCallback } from 'react';
import PuzzleBoard from './PuzzleBoard';
import ImageUploader from './ImageUploader';
import SuccessOverlay from './SuccessOverlay';
import { Shuffle, RotateCcw, Puzzle } from 'lucide-react';

// Default demo image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=600&fit=crop';

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
      <header className="flex-shrink-0 px-4 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          <Puzzle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Jigsaw Puzzle
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

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <ImageUploader
            onImageSelect={handleImageSelect}
            hasImage={imageUrl !== DEFAULT_IMAGE}
          />
          <button
            onClick={handleShuffle}
            className="btn-puzzle"
            aria-label="Shuffle puzzle pieces"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
          <button
            onClick={handleReset}
            className="btn-puzzle-secondary"
            aria-label="Reset puzzle to solved state"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Instructions */}
        {!hasStarted && (
          <p className="text-sm text-muted-foreground text-center max-w-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Drag pieces to connect them. They'll snap together when aligned correctly!
          </p>
        )}
      </main>

      {/* Success overlay */}
      <SuccessOverlay show={isComplete} />
    </div>
  );
};

export default JigsawPuzzle;
