import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  hasImage: boolean;
}

const MIN_IMAGE_SIZE = 300;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, hasImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check minimum size
          if (img.width < MIN_IMAGE_SIZE || img.height < MIN_IMAGE_SIZE) {
            reject(new Error(`Image must be at least ${MIN_IMAGE_SIZE}×${MIN_IMAGE_SIZE} pixels`));
            return;
          }

          // Create a square crop
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not process image'));
            return;
          }

          // Center crop
          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;

          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image');
      return;
    }

    try {
      const processedUrl = await processImage(file);
      onImageSelect(processedUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process image');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload puzzle image"
      />
      <button
        onClick={handleClick}
        className="btn-puzzle-secondary"
        aria-label={hasImage ? 'Change puzzle image' : 'Upload puzzle image'}
      >
        {hasImage ? (
          <>
            <ImageIcon className="w-4 h-4" />
            <span>Change Image</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </>
        )}
      </button>
    </>
  );
};

export default ImageUploader;
