export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image file natively using HTML Canvas and converts it to WebP format.
 */
export const compressImageToWebP = async (
  file: File | Blob,
  options: CompressOptions = {}
): Promise<{ blob: Blob; fileName: string }> => {
  const { maxWidth = 400, maxHeight = 400, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return reject(new Error('Failed to get canvas context'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            return reject(new Error('Canvas to Blob conversion failed'));
          }

          // Extract original file name to modify extension
          const originalName = file instanceof File ? file.name : 'image.png';
          const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
          const newFileName = `${nameWithoutExt}.webp`;

          resolve({ blob, fileName: newFileName });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
};
