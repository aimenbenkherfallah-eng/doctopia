import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, slugifyFileName } from './constants';

export function validateImageFile(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'imageType';
  if (file.size > MAX_IMAGE_BYTES) return 'imageSize';
  return null;
}

export function optimizeImage(file, { maxEdge = 1600, quality = 0.82 } = {}) {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const { width, height } = img;
          const scale = Math.min(1, maxEdge / Math.max(width, height));
          const w = Math.round(width * scale);
          const h = Math.round(height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const base = slugifyFileName(file.name.replace(/\.[a-z0-9]+$/i, ''));
              resolve(new File([blob], `${base}.webp`, { type: 'image/webp' }));
            },
            'image/webp',
            quality
          );
        } catch {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    } catch {
      resolve(file);
    }
  });
}

export function previewUrl(file) {
  return URL.createObjectURL(file);
}
