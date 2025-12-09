// Image Mapper Utility
// Dynamically imports all dish cover images from the dishCovers directory

// Use Webpack's require.context to dynamically import all images
// This automatically includes any new images added to the directory
const dishImageContext = require.context('../assets/dishCovers', false, /\.(png|jpe?g|svg|webp)$/);
const mealImageContext = require.context('../assets/mealCovers', false, /\.(png|jpe?g|svg|webp)$/);

// Build dish image map dynamically
const IMAGE_MAP = {};
dishImageContext.keys().forEach((key) => {
  // Extract filename from './filename.png' format
  const filename = key.replace('./', '');
  IMAGE_MAP[filename] = dishImageContext(key);
});

// Build meal cover image map dynamically
const MEAL_COVER_MAP = {};
mealImageContext.keys().forEach((key) => {
  // Extract filename from './filename.png' format
  const filename = key.replace('./', '');
  MEAL_COVER_MAP[filename] = mealImageContext(key);
});

// Default fallback image
const DEFAULT_IMAGE = IMAGE_MAP['mapo_tofu.png'] || Object.values(IMAGE_MAP)[0];
const DEFAULT_MEAL_COVER = Object.values(MEAL_COVER_MAP)[0] || DEFAULT_IMAGE;

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
 * Resolve meal cover image by date
 * @param {string} date - Date in YYYYMMDD format or YYYY-MM-DD format
 * @returns {string} Resolved meal cover image path
 */
export function resolveMealCover(date) {
  if (!date) {
    return DEFAULT_MEAL_COVER;
  }

  // Convert date to YYYYMMDD format if it's in YYYY-MM-DD format
  const dateStr = date.replace(/-/g, '');
  
  // Try to find exact match
  const filename = `${dateStr}.png`;
  if (MEAL_COVER_MAP[filename]) {
    return MEAL_COVER_MAP[filename];
  }

  // Try other extensions
  const extensions = ['jpg', 'jpeg', 'webp', 'svg'];
  for (const ext of extensions) {
    const altFilename = `${dateStr}.${ext}`;
    if (MEAL_COVER_MAP[altFilename]) {
      return MEAL_COVER_MAP[altFilename];
    }
  }

  // Fallback to default
  return DEFAULT_MEAL_COVER;
}

/**
 * Get all available dish images
 * @returns {Object} Image map object
 */
export function getAllImages() {
  return IMAGE_MAP;
}

/**
 * Get all available meal cover images
 * @returns {Object} Meal cover map object
 */
export function getAllMealCovers() {
  return MEAL_COVER_MAP;
}

// Made with Bob