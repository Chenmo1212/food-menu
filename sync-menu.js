#!/usr/bin/env node

/**
 * Menu Data Synchronization Script
 * 
 * This script synchronizes dish data from src/data/menuData.js to the database
 * using the existing API endpoints. It compares local data with database data
 * and creates/updates dishes as needed.
 * 
 * Usage: node sync-menu.js
 */

const fs = require('fs');
const path = require('path');

// API Configuration
const API_BASE_URL = process.env.REACT_APP_MENU_API_BASE_URL || 'https://api.chenmo1212.cn/menu';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`API returned non-JSON response (${response.status}). Check if API server is running at ${API_BASE_URL}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`${colors.red}❌ API request failed [${endpoint}]:${colors.reset}`, error.message);
    throw error;
  }
}

/**
 * Get all dishes from database
 */
async function getDishesFromDB() {
  console.log(`${colors.blue}📡 Fetching dishes from database...${colors.reset}`);
  const response = await apiRequest('/dishes?limit=1000');
  return response.data || [];
}

/**
 * Create a new dish in database
 */
async function createDish(dishData) {
  return await apiRequest('/dishes', {
    method: 'POST',
    body: JSON.stringify(dishData),
  });
}

/**
 * Update an existing dish in database
 */
async function updateDish(dishId, dishData) {
  console.log("====", dishId)
  // Add _id to the request body as required by the new API
  const updateData = {
    _id: dishId,
    ...dishData
  };
  return await apiRequest(`/dishes/update`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

/**
 * Read and parse menuData.js
 */
function readLocalMenuData() {
  console.log(`${colors.blue}📂 Reading local menu data...${colors.reset}`);
  
  const menuDataPath = path.join(__dirname, 'src', 'data', 'menuData.js');
  
  if (!fs.existsSync(menuDataPath)) {
    throw new Error(`Menu data file not found: ${menuDataPath}`);
  }

  const content = fs.readFileSync(menuDataPath, 'utf-8');
  
  // Extract only MENU_ITEMS array content, excluding CATEGORIES
  const menuItemsMatch = content.match(/export const MENU_ITEMS = \[([\s\S]*?)\];/);
  if (!menuItemsMatch) {
    throw new Error('MENU_ITEMS array not found in menuData.js');
  }
  
  const menuItemsContent = menuItemsMatch[1];
  
  // Extract individual dish objects using regex (no longer looking for id field)
  const dishPattern = /\{\s*name:\s*['"][^'"]+['"],[\s\S]*?\}/g;
  const dishes = [];
  let match;
  
  while ((match = dishPattern.exec(menuItemsContent)) !== null) {
    const dishText = match[0];
    
    try {
      // Extract fields using regex (no id field)
      const dish = {
        name: extractField(dishText, 'name', 'string'),
        nameEn: extractField(dishText, 'nameEn', 'string'),
        price: parseFloat(extractField(dishText, 'price', 'number')),
        stock: parseInt(extractField(dishText, 'stock', 'number') || '0'),
        orderCount: parseInt(extractField(dishText, 'orderCount', 'number') || '0'),
        category: extractField(dishText, 'category', 'string'),
        image: extractField(dishText, 'image', 'require'),
        description: extractField(dishText, 'description', 'string'),
        descriptionEn: extractField(dishText, 'descriptionEn', 'string'),
        ingredients: extractArray(dishText, 'ingredients'),
        ingredientsEn: extractArray(dishText, 'ingredientsEn'),
        nutrition: extractNutrition(dishText)
      };
      
      dishes.push(dish);
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Skipping dish due to parse error: ${error.message}${colors.reset}`);
    }
  }
  
  if (dishes.length === 0) {
    throw new Error('No dishes found in MENU_ITEMS');
  }
  
  return dishes;
}

/**
 * Extract a field value from dish text
 */
function extractField(text, fieldName, type) {
  let pattern;
  
  if (type === 'string') {
    pattern = new RegExp(`${fieldName}:\\s*['"]([^'"]*?)['"]`, 's');
  } else if (type === 'number') {
    pattern = new RegExp(`${fieldName}:\\s*([\\d.]+)`);
  } else if (type === 'require') {
    pattern = new RegExp(`${fieldName}:\\s*require\\(['"]([^'"]+)['"]\\)`);
  }
  
  const match = text.match(pattern);
  return match ? match[1] : '';
}

/**
 * Extract array field
 */
function extractArray(text, fieldName) {
  const pattern = new RegExp(`${fieldName}:\\s*\\[([^\\]]+)\\]`, 's');
  const match = text.match(pattern);
  
  if (!match) return [];
  
  // Extract strings from array
  const items = match[1].match(/['"]([^'"]+)['"]/g);
  return items ? items.map(item => item.replace(/['"]/g, '')) : [];
}

/**
 * Extract nutrition object
 */
function extractNutrition(text) {
  const nutritionMatch = text.match(/nutrition:\s*\{([^}]+)\}/s);
  
  if (!nutritionMatch) return {};
  
  const nutritionText = nutritionMatch[1];
  const nutrition = {};
  
  // Extract calories
  const caloriesMatch = nutritionText.match(/calories:\s*(\d+)/);
  if (caloriesMatch) nutrition.calories = parseInt(caloriesMatch[1]);
  
  // Extract protein
  const proteinMatch = nutritionText.match(/protein:\s*['"]([^'"]+)['"]/);
  if (proteinMatch) nutrition.protein = proteinMatch[1];
  
  // Extract fat
  const fatMatch = nutritionText.match(/fat:\s*['"]([^'"]+)['"]/);
  if (fatMatch) nutrition.fat = fatMatch[1];
  
  // Extract carbs
  const carbsMatch = nutritionText.match(/carbs:\s*['"]([^'"]+)['"]/);
  if (carbsMatch) nutrition.carbs = carbsMatch[1];
  
  return nutrition;
}

/**
 * Map local category names to database-accepted values
 */
function mapCategory(localCategory) {
  const categoryMap = {
    'Vegetarian': 'Vegetables',
    'Veggie': 'Vegetables',
    'Veg': 'Vegetables',
    // Add other mappings if needed
  };
  
  return categoryMap[localCategory] || localCategory;
}

/**
 * Convert local dish data to API format
 * Note: dish_id is no longer used - MongoDB will auto-generate _id
 */
function convertToAPIFormat(localDish) {
  // Extract image filename from require path if it exists
  let imageUrl = '';
  if (localDish.image) {
    const match = String(localDish.image).match(/dishCovers\/([^)'"]+)/);
    if (match) {
      imageUrl = match[1];
    }
  }

  const apiData = {
    name: localDish.name,
    name_en: localDish.nameEn,
    price: localDish.price,
    stock: localDish.stock || 0,
    order_count: localDish.orderCount || 0,
    category: mapCategory(localDish.category),
    image_url: imageUrl,
    description: localDish.description || '',
    description_en: localDish.descriptionEn || '',
    ingredients: localDish.ingredients || [],
    ingredients_en: localDish.ingredientsEn || [],
    nutrition: localDish.nutrition || {},
    is_active: true,
  };

  // No dish_id field - MongoDB will use _id

  return apiData;
}

/**
 * Deep compare two objects (order-independent)
 */
function deepCompareObjects(obj1, obj2) {
  const keys1 = Object.keys(obj1 || {}).sort();
  const keys2 = Object.keys(obj2 || {}).sort();
  
  if (keys1.length !== keys2.length) return false;
  if (keys1.join(',') !== keys2.join(',')) return false;
  
  for (const key of keys1) {
    if (String(obj1[key]) !== String(obj2[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Compare two dishes to check if they're different
 */
function isDishDifferent(localDish, dbDish) {
  // Map of local field names to database field names
  const fieldMapping = {
    'name': 'name',
    'name_en': 'name_en',
    'price': 'price',
    'category': 'category',
    'order_count': 'order_count',  // localDish already converted to order_count in convertToAPIFormat
    'description': 'description',
    'description_en': 'description_en',
    'image_url': 'image_url',
    'stock': 'stock'
  };

  for (const [localField, dbField] of Object.entries(fieldMapping)) {
    const localValue = localDish[localField];
    const dbValue = dbDish[dbField];
    
    // Convert to string for comparison to handle number/string differences
    if (String(localValue) !== String(dbValue)) {
      console.log(`   📝 Field '${dbField}' changed: "${dbValue}" → "${localValue}"`);
      return true;
    }
  }

  // Compare arrays (order matters)
  const localIngredients = JSON.stringify(localDish.ingredients || []);
  const dbIngredients = JSON.stringify(dbDish.ingredients || []);
  if (localIngredients !== dbIngredients) {
    console.log(`   📝 Field 'ingredients' changed`);
    return true;
  }
  
  const localIngredientsEn = JSON.stringify(localDish.ingredients_en || []);
  const dbIngredientsEn = JSON.stringify(dbDish.ingredients_en || []);
  if (localIngredientsEn !== dbIngredientsEn) {
    console.log(`   📝 Field 'ingredients_en' changed`);
    return true;
  }

  // Compare nutrition object (order-independent)
  if (!deepCompareObjects(localDish.nutrition, dbDish.nutrition)) {
    console.log(`   📝 Field 'nutrition' changed:`);
    console.log(`      Local: ${JSON.stringify(localDish.nutrition || {})}`);
    console.log(`      DB:    ${JSON.stringify(dbDish.nutrition || {})}`);
    return true;
  }

  return false;
}

/**
 * Main synchronization function
 */
async function syncMenu() {
  console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════╗
║   Menu Data Synchronization Script    ║
╚════════════════════════════════════════╝
${colors.reset}`);

  try {
    // Read local menu data
    const localDishes = readLocalMenuData();
    console.log(`${colors.green}✓ Found ${localDishes.length} dishes in local file${colors.reset}\n`);

    // Get dishes from database
    const dbDishes = await getDishesFromDB();
    console.log(`${colors.green}✓ Found ${dbDishes.length} dishes in database${colors.reset}\n`);

    // Create a map of database dishes by name (Chinese name only, since local data has no id)
    const dbDishMapByName = new Map();
    dbDishes.forEach(dish => {
      dbDishMapByName.set(dish.name, dish);
    });

    // Statistics
    const stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    console.log(`${colors.bright}Starting synchronization...${colors.reset}\n`);

    // Process each local dish
    for (const localDish of localDishes) {
      // Match by name only (since local data has no id)
      const dbDish = dbDishMapByName.get(localDish.name);

      try {
        if (!dbDish) {
          // Dish doesn't exist in database - create it (MongoDB will auto-generate _id)
          const apiDish = convertToAPIFormat(localDish);
          console.log(`${colors.yellow}➕ Creating dish: ${localDish.name}${colors.reset}`);
          await createDish(apiDish);
          stats.created++;
          console.log(`${colors.green}   ✓ Created successfully${colors.reset}`);
        } else {
          // Dish exists - check if it needs updating
          const apiDish = convertToAPIFormat(localDish);
          
          if (isDishDifferent(apiDish, dbDish)) {
            // Update it using database _id (MongoDB ObjectId)
            console.log(`${colors.blue}🔄 Updating dish: ${localDish.name} (_id: ${dbDish._id})${colors.reset}`);
            await updateDish(dbDish._id, apiDish);
            stats.updated++;
            console.log(`${colors.green}   ✓ Updated successfully${colors.reset}`);
          } else {
            // Dish is the same - skip
            stats.skipped++;
            console.log(`${colors.cyan}⏭️  Skipping dish: ${localDish.name} (no changes)${colors.reset}`);
          }
        }
      } catch (error) {
        stats.errors++;
        console.log(`${colors.red}   ✗ Error: ${error.message}${colors.reset}`);
      }
    }

    // Print summary
    console.log(`\n${colors.bright}${colors.cyan}
╔════════════════════════════════════════╗
║         Synchronization Summary        ║
╚════════════════════════════════════════╝${colors.reset}`);
    console.log(`${colors.green}✓ Created:  ${stats.created}${colors.reset}`);
    console.log(`${colors.blue}🔄 Updated:  ${stats.updated}${colors.reset}`);
    console.log(`${colors.cyan}⏭️  Skipped:  ${stats.skipped}${colors.reset}`);
    console.log(`${colors.red}✗ Errors:   ${stats.errors}${colors.reset}`);
    console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}Total:      ${localDishes.length}${colors.reset}\n`);

    if (stats.errors > 0) {
      console.log(`${colors.yellow}⚠️  Some dishes failed to sync. Please check the errors above.${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`${colors.green}${colors.bright}✨ Synchronization completed successfully!${colors.reset}\n`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`${colors.red}${colors.bright}\n❌ Synchronization failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run the script
syncMenu();

// Made with Bob
