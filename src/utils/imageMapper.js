// Image Mapper Utility
// Dynamically imports all dish cover images from the dishCovers directory

// Use Webpack's require.context to dynamically import all images
// This automatically includes any new images added to the directory
const imageContext = require.context('../assets/dishCovers', false, /\.(png|jpe?g|svg|webp)$/);

// Build image map dynamically
const IMAGE_MAP = {};
imageContext.keys().forEach((key) => {
  // Extract filename from './filename.png' format
  const filename = key.replace('./', '');
  IMAGE_MAP[filename] = imageContext(key);
});

// Default fallback image
const DEFAULT_IMAGE = IMAGE_MAP['mapo_tofu.png'] || Object.values(IMAGE_MAP)[0];

/**
 * Resolve image URL to actual imported asset
 * Supports both full URLs and relative filenames
 *
 * @param {string} imageUrl - Image URL or filename from API
 * @returns {string} Resolved image path for use in img src
 */
export function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return DEFAULT_IMAGE;
  }

  // If it's already a full URL (starts with http:// or https://), use it directly
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a data URL, use it directly
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Extract filename from path if it contains slashes
  const filename = imageUrl.includes('/') ? imageUrl.split('/').pop() : imageUrl;

  // Look up in our image map
  if (IMAGE_MAP[filename]) {
    return IMAGE_MAP[filename];
  }

  // If not found, try to match without extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const matchedKey = Object.keys(IMAGE_MAP).find(key =>
    key.replace(/\.[^/.]+$/, '') === nameWithoutExt
  );

  if (matchedKey) {
    return IMAGE_MAP[matchedKey];
  }

  // Fallback to default image
  console.warn(`Image not found: ${imageUrl}, using default`);
  return DEFAULT_IMAGE;
}

/**
 * Get all available images
 * @returns {Object} Image map object
 */
export function getAllImages() {
  return IMAGE_MAP;
}

// Made with Bob