// Image Mapper Utility
// Maps image filenames to imported assets for Vercel deployment compatibility

// Import all dish cover images
import blanched_broccoli from '../assets/dishCovers/blanched_broccoli.png';
import braised_pork_belly from '../assets/dishCovers/braised_pork_belly.png';
import broccoli_fish_black_bean from '../assets/dishCovers/broccoli_fish_black_bean.png';
import broccoli_shrimp from '../assets/dishCovers/broccoli_shrimp.png';
import century_egg_eggplant_chili from '../assets/dishCovers/century_egg_eggplant_chili.png';
import dry_fried_green_beans from '../assets/dishCovers/dry_fried_green_beans.png';
import fish_flavored_pork from '../assets/dishCovers/fish_flavored_pork.png';
import fried_chicken_cutlet from '../assets/dishCovers/fried_chicken_cutlet.png';
import home_style_cauliflower from '../assets/dishCovers/home_style_cauliflower.png';
import lemon_shredded_chicken from '../assets/dishCovers/lemon_shredded_chicken.png';
import malaysian_lemon_chicken from '../assets/dishCovers/malaysian_lemon_chicken.png';
import mapo_tofu from '../assets/dishCovers/mapo_tofu.png';
import minced_meat_fried_tofu from '../assets/dishCovers/minced_meat_fried_tofu.png';
import oat_crusted_chicken from '../assets/dishCovers/oat_crusted_chicken.png';
import salted_egg_shrimp from '../assets/dishCovers/salted_egg_shrimp.png';
import sichuan_style_meat_sauce from '../assets/dishCovers/sichuan-style_meat_sauce.png';
import sour_cabbage_fish from '../assets/dishCovers/sour_cabbage_fish.png';
import spicy_chicken_wings from '../assets/dishCovers/spicy_chicken_wings.png';
import spicy_chicken_wings_2 from '../assets/dishCovers/spicy_chicken_wings_2.png';
import spicy_king_oyster_mushroom from '../assets/dishCovers/spicy_king_oyster_mushroom.png';
import spicy_lotus_root from '../assets/dishCovers/spicy_lotus_root.png';
import spicy_oyster_mushroom from '../assets/dishCovers/spicy_oyster_mushroom.png';
import spicy_pork_ribs from '../assets/dishCovers/spicy_pork_ribs.png';
import spicy_squid_rings from '../assets/dishCovers/spicy_squid_rings.png';
import stir_fried_chicken_breast from '../assets/dishCovers/stir_fried_chicken_breast.png';
import stuffed_bell_peppers from '../assets/dishCovers/stuffed_bell_peppers.png';
import tofu_dried_shrimp_scallions from '../assets/dishCovers/tofu_dried_shrimp_scallions.png';
import tomato_egg_stir_fry from '../assets/dishCovers/tomato_egg_stir_fry.png';
import twice_cooked_pork from '../assets/dishCovers/twice_cooked_pork.png';

// Image mapping object
const IMAGE_MAP = {
  'blanched_broccoli.png': blanched_broccoli,
  'braised_pork_belly.png': braised_pork_belly,
  'broccoli_fish_black_bean.png': broccoli_fish_black_bean,
  'broccoli_shrimp.png': broccoli_shrimp,
  'century_egg_eggplant_chili.png': century_egg_eggplant_chili,
  'dry_fried_green_beans.png': dry_fried_green_beans,
  'fish_flavored_pork.png': fish_flavored_pork,
  'fried_chicken_cutlet.png': fried_chicken_cutlet,
  'home_style_cauliflower.png': home_style_cauliflower,
  'lemon_shredded_chicken.png': lemon_shredded_chicken,
  'malaysian_lemon_chicken.png': malaysian_lemon_chicken,
  'mapo_tofu.png': mapo_tofu,
  'minced_meat_fried_tofu.png': minced_meat_fried_tofu,
  'oat_crusted_chicken.png': oat_crusted_chicken,
  'salted_egg_shrimp.png': salted_egg_shrimp,
  'sichuan-style_meat_sauce.png': sichuan_style_meat_sauce,
  'sour_cabbage_fish.png': sour_cabbage_fish,
  'spicy_chicken_wings.png': spicy_chicken_wings,
  'spicy_chicken_wings_2.png': spicy_chicken_wings_2,
  'spicy_king_oyster_mushroom.png': spicy_king_oyster_mushroom,
  'spicy_lotus_root.png': spicy_lotus_root,
  'spicy_oyster_mushroom.png': spicy_oyster_mushroom,
  'spicy_pork_ribs.png': spicy_pork_ribs,
  'spicy_squid_rings.png': spicy_squid_rings,
  'stir_fried_chicken_breast.png': stir_fried_chicken_breast,
  'stuffed_bell_peppers.png': stuffed_bell_peppers,
  'tofu_dried_shrimp_scallions.png': tofu_dried_shrimp_scallions,
  'tomato_egg_stir_fry.png': tomato_egg_stir_fry,
  'twice_cooked_pork.png': twice_cooked_pork,
};

/**
 * Resolve image URL to actual imported asset
 * Supports both full URLs and relative filenames
 * 
 * @param {string} imageUrl - Image URL or filename from API
 * @returns {string} Resolved image path for use in img src
 */
export function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return mapo_tofu; // Default fallback image
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
  const resolvedImage = IMAGE_MAP[filename];

  if (resolvedImage) {
    return resolvedImage;
  }

  // If not found in map, try to match without extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const matchedKey = Object.keys(IMAGE_MAP).find(key => 
    key.replace(/\.[^/.]+$/, '') === nameWithoutExt
  );

  if (matchedKey) {
    return IMAGE_MAP[matchedKey];
  }

  // Fallback to default image
  console.warn(`Image not found in map: ${imageUrl}, using default`);
  return mapo_tofu;
}

/**
 * Get all available images
 * @returns {Object} Image map object
 */
export function getAllImages() {
  return IMAGE_MAP;
}

// Made with Bob