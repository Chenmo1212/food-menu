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
  return await apiRequest(`/dishes/${dishId}`, {
    method: 'PUT',
    body: JSON.stringify(dishData),
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
  
  // Extract individual dish objects using regex
  const dishPattern = /\{\s*id:\s*(\d+),[\s\S]*?\}/g;
  const dishes = [];
  let match;
  
  while ((match = dishPattern.exec(content)) !== null) {
    const dishText = match[0];
    
    try {
      // Extract fields using regex
      const dish = {
        id: parseInt(extractField(dishText, 'id', 'number')),
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
    throw new Error('No dishes found in menuData.js');
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
 * Convert local dish data to API format
 * Note: dish_id is NOT included here as it should come from the database
 */
function convertToAPIFormat(localDish, dbDishId = null) {
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
    category: localDish.category,
    image_url: imageUrl,
    description: localDish.description || '',
    description_en: localDish.descriptionEn || '',
    ingredients: localDish.ingredients || [],
    ingredients_en: localDish.ingredientsEn || [],
    nutrition: localDish.nutrition || {},
    is_active: true,
  };

  // Only include dish_id when creating a new dish (use database's next available ID)
  if (dbDishId !== null) {
    apiData.dish_id = dbDishId;
  }

  return apiData;
}

/**
 * Compare two dishes to check if they're different
 */
function isDishDifferent(localDish, dbDish) {
  const fieldsToCompare = [
    'name', 'name_en', 'price', 'category', 
    'description', 'description_en', 'image_url'
  ];

  for (const field of fieldsToCompare) {
    if (localDish[field] !== dbDish[field]) {
      return true;
    }
  }

  // Compare arrays
  if (JSON.stringify(localDish.ingredients) !== JSON.stringify(dbDish.ingredients)) {
    return true;
  }
  if (JSON.stringify(localDish.ingredients_en) !== JSON.stringify(dbDish.ingredients_en)) {
    return true;
  }

  // Compare nutrition object
  if (JSON.stringify(localDish.nutrition) !== JSON.stringify(dbDish.nutrition)) {
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

    // Create a map of database dishes by name (Chinese name)
    const dbDishMap = new Map();
    dbDishes.forEach(dish => {
      dbDishMap.set(dish.name, dish);
    });

    // Statistics
    const stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    console.log(`${colors.bright}Starting synchronization...${colors.reset}\n`);

    // Find the maximum dish_id in database for new dishes
    let maxDishId = 0;
    dbDishes.forEach(dish => {
      if (dish.dish_id > maxDishId) {
        maxDishId = dish.dish_id;
      }
    });

    // Process each local dish
    for (const localDish of localDishes) {
      const dbDish = dbDishMap.get(localDish.name);

      try {
        if (!dbDish) {
          // Dish doesn't exist in database - create it with new dish_id
          maxDishId++;
          const apiDish = convertToAPIFormat(localDish, maxDishId);
          console.log(`${colors.yellow}➕ Creating dish: ${localDish.name} (dish_id: ${maxDishId})${colors.reset}`);
          await createDish(apiDish);
          stats.created++;
          console.log(`${colors.green}   ✓ Created successfully${colors.reset}`);
        } else {
          // Dish exists - check if it needs updating
          const apiDish = convertToAPIFormat(localDish);
          
          if (isDishDifferent(apiDish, dbDish)) {
            // Update it using database dish_id
            console.log(`${colors.blue}🔄 Updating dish: ${localDish.name} (dish_id: ${dbDish.dish_id})${colors.reset}`);
            await updateDish(dbDish.dish_id, apiDish);
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
