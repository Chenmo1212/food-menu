/**
 * MongoDB 数据库初始化脚本
 * 食品订餐系统 - 创建集合、索引和验证规则
 * 
 * 使用方法:
 * mongosh mongodb://localhost:27017/food_menu_db < mongodb-init.js
 * 或者在 mongosh 中执行: load('mongodb-init.js')
 */

// 切换到目标数据库
use food_menu_db;

print("========================================");
print("开始初始化食品订餐系统数据库...");
print("========================================\n");

// ============================================
// 1. 创建 dishes（菜品信息表）
// ============================================
print("1. 创建 dishes 集合...");

db.createCollection("dishes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["dish_id", "name", "name_en", "price", "stock", "order_count", "category", "description", "description_en", "ingredients", "ingredients_en", "nutrition", "is_active", "created_at", "updated_at"],
      properties: {
        dish_id: {
          bsonType: "int",
          description: "菜品ID - 必填且必须为整数"
        },
        name: {
          bsonType: "string",
          description: "菜品中文名称 - 必填"
        },
        name_en: {
          bsonType: "string",
          description: "菜品英文名称 - 必填"
        },
        price: {
          bsonType: "double",
          minimum: 0,
          description: "价格 - 必填且必须大于等于0"
        },
        stock: {
          bsonType: "int",
          minimum: 0,
          description: "库存数量 - 必填且必须大于等于0"
        },
        order_count: {
          bsonType: "int",
          minimum: 0,
          description: "累计订单数 - 必填且必须大于等于0"
        },
        category: {
          bsonType: "string",
          enum: ["Pork", "Chicken", "Seafood", "Vegetables", "Other"],
          description: "菜品分类 - 必填"
        },
        image_url: {
          bsonType: "string",
          description: "图片URL - 可选"
        },
        description: {
          bsonType: "string",
          description: "中文描述 - 必填"
        },
        description_en: {
          bsonType: "string",
          description: "英文描述 - 必填"
        },
        ingredients: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "中文食材列表 - 必填"
        },
        ingredients_en: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "英文食材列表 - 必填"
        },
        nutrition: {
          bsonType: "object",
          required: ["calories", "protein", "fat", "carbs"],
          properties: {
            calories: {
              bsonType: "int",
              minimum: 0,
              description: "卡路里"
            },
            protein: {
              bsonType: "string",
              description: "蛋白质"
            },
            fat: {
              bsonType: "string",
              description: "脂肪"
            },
            carbs: {
              bsonType: "string",
              description: "碳水化合物"
            }
          }
        },
        is_active: {
          bsonType: "bool",
          description: "是否上架 - 必填"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间 - 必填"
        },
        updated_at: {
          bsonType: "date",
          description: "更新时间 - 必填"
        }
      }
    }
  }
});

// 创建索引
db.dishes.createIndex({ dish_id: 1 }, { unique: true, name: "idx_dish_id_unique" });
db.dishes.createIndex({ category: 1, is_active: 1 }, { name: "idx_category_active" });
db.dishes.createIndex({ order_count: -1 }, { name: "idx_order_count_desc" });
db.dishes.createIndex({ price: 1 }, { name: "idx_price" });
db.dishes.createIndex({ name: "text", name_en: "text", description: "text", description_en: "text" }, { name: "idx_text_search" });

print("✓ dishes 集合创建完成\n");

print("========================================");
print("开始导入菜品数据...");
print("========================================\n");

// 清空现有菜品数据（可选，如果需要重新导入）
// db.dishes.deleteMany({});
// print("✓ 已清空现有菜品数据\n");

// 菜品数据
const dishesData = [
  {
    dish_id: 1,
    name: "麻婆豆腐",
    name_en: "Mapo Tofu",
    price: 12.99,
    stock: 15,
    order_count: 4,
    category: "Pork",
    image_url: "/assets/dishCovers/mapo_tofu.png",
    description: "经典川菜，麻辣鲜香的豆腐配上香浓的肉末，口感嫩滑，回味无穷。",
    description_en: "Classic Sichuan dish with silky tofu in spicy sauce, topped with minced pork. Numbing and spicy flavors that leave you wanting more.",
    ingredients: ["豆腐", "猪肉末", "豆瓣酱", "花椒", "葱姜蒜"],
    ingredients_en: ["Tofu", "Minced Pork", "Doubanjiang", "Sichuan Pepper", "Scallions"],
    nutrition: {
      calories: 93,
      protein: "6g",
      fat: "5g",
      carbs: "6.7g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 2,
    name: "番茄炒蛋",
    name_en: "Tomato Egg Stir Fry",
    price: 9.99,
    stock: 20,
    order_count: 4,
    category: "Vegetables",
    image_url: "/assets/dishCovers/tomato_egg_stir_fry.png",
    description: "家常经典菜品，酸甜可口的番茄配上嫩滑的鸡蛋，营养丰富，老少皆宜。",
    description_en: "A beloved home-style dish featuring sweet and tangy tomatoes with fluffy scrambled eggs. Nutritious and loved by all ages.",
    ingredients: ["番茄", "鸡蛋", "葱", "糖", "盐"],
    ingredients_en: ["Tomatoes", "Eggs", "Scallions", "Sugar", "Salt"],
    nutrition: {
      calories: 73,
      protein: "4g",
      fat: "4.7g",
      carbs: "5g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 3,
    name: "肉末炒豆腐",
    name_en: "Minced Meat Fried Tofu",
    price: 13.99,
    stock: 12,
    order_count: 1,
    category: "Pork",
    image_url: "/assets/dishCovers/minced_meat_fried_tofu.png",
    description: "油炸豆腐配上鲜美的肉末，口感丰富，咸香适中，下饭佳品。",
    description_en: "Fried tofu with savory minced meat. Rich flavors and varied textures make it perfect with rice.",
    ingredients: ["豆腐", "猪肉末", "青椒", "酱油", "蒜"],
    ingredients_en: ["Tofu", "Minced Pork", "Green Pepper", "Soy Sauce", "Garlic"],
    nutrition: {
      calories: 103,
      protein: "6.7g",
      fat: "6g",
      carbs: "6g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 4,
    name: "家常花菜",
    name_en: "Home Style Cauliflower",
    price: 10.99,
    stock: 18,
    order_count: 1,
    category: "Vegetables",
    image_url: "/assets/dishCovers/home_style_cauliflower.png",
    description: "清爽可口的花菜，配上蒜蓉和辣椒，简单却美味，健康低卡。",
    description_en: "Fresh and crispy cauliflower stir-fried with garlic and chili. Simple yet delicious, healthy and low-calorie.",
    ingredients: ["花菜", "蒜", "干辣椒", "生抽", "盐"],
    ingredients_en: ["Cauliflower", "Garlic", "Dried Chili", "Light Soy Sauce", "Salt"],
    nutrition: {
      calories: 60,
      protein: "2.7g",
      fat: "2.7g",
      carbs: "7.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 5,
    name: "白灼西兰花",
    name_en: "Blanched Broccoli",
    price: 8.99,
    stock: 25,
    order_count: 3,
    category: "Vegetables",
    image_url: "/assets/dishCovers/blanched_broccoli.png",
    description: "保持蔬菜原味的健康做法，翠绿的西兰花配上蚝油，清淡营养。",
    description_en: "Healthy preparation that preserves the natural flavor of vegetables. Bright green broccoli with oyster sauce, light and nutritious.",
    ingredients: ["西兰花", "蚝油", "蒜", "盐", "油"],
    ingredients_en: ["Broccoli", "Oyster Sauce", "Garlic", "Salt", "Oil"],
    nutrition: {
      calories: 50,
      protein: "2g",
      fat: "2g",
      carbs: "6g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 6,
    name: "香辣排骨",
    name_en: "Spicy Pork Ribs",
    price: 16.99,
    stock: 10,
    order_count: 1,
    category: "Pork",
    image_url: "/assets/dishCovers/spicy_pork_ribs.png",
    description: "酥脆外皮，肉质鲜嫩的排骨，配上香辣调味，让人欲罢不能。",
    description_en: "Crispy on the outside, tender on the inside. These spicy ribs are seasoned to perfection and absolutely irresistible.",
    ingredients: ["排骨", "辣椒", "花椒", "姜蒜", "料酒"],
    ingredients_en: ["Pork Ribs", "Chili", "Sichuan Pepper", "Ginger & Garlic", "Cooking Wine"],
    nutrition: {
      calories: 140,
      protein: "9.3g",
      fat: "8.3g",
      carbs: "7.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 7,
    name: "小炒鸡肉",
    name_en: "Stir Fried Chicken Breast",
    price: 14.99,
    stock: 16,
    order_count: 2,
    category: "Chicken",
    image_url: "/assets/dishCovers/stir_fried_chicken_breast.png",
    description: "嫩滑的鸡胸肉/鸡腿肉配上时蔬，高蛋白低脂肪，健身人士的最爱。",
    description_en: "Tender chicken stir-fried with seasonal vegetables. High protein, low fat - a favorite among fitness enthusiasts.",
    ingredients: ["鸡胸肉/鸡腿肉", "彩椒", "洋葱", "生抽", "黑胡椒"],
    ingredients_en: ["Chicken Breast", "Bell Peppers", "Onion", "Soy Sauce", "Black Pepper"],
    nutrition: {
      calories: 87,
      protein: "10.7g",
      fat: "2.7g",
      carbs: "5.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 8,
    name: "炸鸡排",
    name_en: "Fried Chicken Cutlet",
    price: 13.99,
    stock: 14,
    order_count: 2,
    category: "Chicken",
    image_url: "/assets/dishCovers/fried_chicken_cutlet.png",
    description: "金黄酥脆的外皮，多汁鲜嫩的鸡肉，搭配特制酱料，美味无比。",
    description_en: "Golden crispy coating with juicy tender chicken inside. Served with special sauce for an amazing taste experience.",
    ingredients: ["鸡腿肉", "面包糠", "鸡蛋", "面粉", "调味料"],
    ingredients_en: ["Chicken Thigh", "Breadcrumbs", "Egg", "Flour", "Seasonings"],
    nutrition: {
      calories: 127,
      protein: "8.7g",
      fat: "6.7g",
      carbs: "9.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 9,
    name: "红烧肉",
    name_en: "Braised Pork Belly",
    price: 17.99,
    stock: 12,
    order_count: 3,
    category: "Pork",
    image_url: "/assets/dishCovers/braised_pork_belly.png",
    description: "肥而不腻的五花肉，色泽红亮，入口即化，是经典的中式美味。",
    description_en: "Rich but not greasy pork belly, beautifully caramelized and melt-in-your-mouth tender. A classic Chinese delicacy.",
    ingredients: ["五花肉", "冰糖", "酱油", "料酒", "八角"],
    ingredients_en: ["Pork Belly", "Rock Sugar", "Soy Sauce", "Cooking Wine", "Star Anise"],
    nutrition: {
      calories: 160,
      protein: "7.3g",
      fat: "11.7g",
      carbs: "6g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 10,
    name: "豆豉鲮鱼油麦菜",
    name_en: "Black Bean Sardines with Lettuce",
    price: 15.99,
    stock: 14,
    order_count: 1,
    category: "Seafood",
    image_url: "/assets/dishCovers/broccoli_fish_black_bean.png",
    description: "一道以豆豉鲮鱼增香提味、与爽脆油麦菜同炒而成的粤式家常菜，特点是咸香浓郁、口感清爽。",
    description_en: "A Cantonese home-style dish that pairs savory canned black bean sardines with crisp lettuce for a rich yet refreshing flavor.",
    ingredients: ["鱼肉", "西兰花", "豆豉", "姜蒜", "料酒"],
    ingredients_en: ["Fish", "Broccoli", "Black Beans", "Ginger & Garlic", "Cooking Wine"],
    nutrition: {
      calories: 80,
      protein: "9.3g",
      fat: "2.7g",
      carbs: "5.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 11,
    name: "西兰花虾仁",
    name_en: "Broccoli Shrimp",
    price: 16.99,
    stock: 15,
    order_count: 1,
    category: "Seafood",
    image_url: "/assets/dishCovers/broccoli_shrimp.png",
    description: "Q弹的虾仁搭配翠绿的西兰花，清淡健康，高蛋白低脂肪。",
    description_en: "Bouncy shrimp with crisp broccoli. Light and healthy, high in protein and low in fat.",
    ingredients: ["虾仁", "西兰花", "蒜", "盐", "料酒"],
    ingredients_en: ["Shrimp", "Broccoli", "Garlic", "Salt", "Cooking Wine"],
    nutrition: {
      calories: 60,
      protein: "8g",
      fat: "1.7g",
      carbs: "4g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 12,
    name: "皮蛋茄子擂辣椒",
    name_en: "Century Egg Eggplant Chili",
    price: 11.99,
    stock: 16,
    order_count: 1,
    category: "Vegetables",
    image_url: "/assets/dishCovers/century_egg_eggplant_chili.png",
    description: "独特的皮蛋风味配上软糯的茄子和辣椒，口感丰富，别具一格。",
    description_en: "Unique century egg flavor with soft eggplant and chili. Rich textures and distinctive taste.",
    ingredients: ["皮蛋", "茄子", "辣椒", "蒜", "酱油"],
    ingredients_en: ["Century Egg", "Eggplant", "Chili", "Garlic", "Soy Sauce"],
    nutrition: {
      calories: 70,
      protein: "3.3g",
      fat: "4g",
      carbs: "6g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 13,
    name: "干煸四季豆",
    name_en: "Dry Fried Green Beans",
    price: 10.99,
    stock: 20,
    order_count: 2,
    category: "Pork",
    image_url: "/assets/dishCovers/dry_fried_green_beans.png",
    description: "外焦里嫩的四季豆，配上肉末和干辣椒，香脆可口，回味无穷。",
    description_en: "Crispy outside, tender inside green beans with minced meat and dried chili. Crunchy and flavorful.",
    ingredients: ["四季豆", "猪肉末", "干辣椒", "花椒", "蒜"],
    ingredients_en: ["Green Beans", "Minced Pork", "Dried Chili", "Sichuan Pepper", "Garlic"],
    nutrition: {
      calories: 73,
      protein: "4g",
      fat: "4.7g",
      carbs: "5.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 14,
    name: "鱼香肉丝",
    name_en: "Fish Flavored Pork",
    price: 14.99,
    stock: 18,
    order_count: 1,
    category: "Pork",
    image_url: "/assets/dishCovers/fish_flavored_pork.png",
    description: "经典川菜，酸甜咸辣的完美平衡，肉丝嫩滑，配饭一流。",
    description_en: "Classic Sichuan dish with perfect balance of sweet, sour, salty and spicy. Tender pork strips, excellent with rice.",
    ingredients: ["猪肉丝", "木耳", "胡萝卜", "泡椒", "糖醋汁"],
    ingredients_en: ["Pork Strips", "Wood Ear", "Carrot", "Pickled Chili", "Sweet & Sour Sauce"],
    nutrition: {
      calories: 107,
      protein: "8g",
      fat: "5.3g",
      carbs: "8g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 15,
    name: "柠檬鸡丝",
    name_en: "Lemon Shredded Chicken",
    price: 13.99,
    stock: 17,
    order_count: 1,
    category: "Chicken",
    image_url: "/assets/dishCovers/lemon_shredded_chicken.png",
    description: "清新的柠檬香气配上嫩滑的鸡丝，酸爽开胃，夏日必备。",
    description_en: "Fresh lemon aroma with tender chicken strips. Refreshing and appetizing, perfect for summer.",
    ingredients: ["鸡胸肉", "柠檬", "青椒", "洋葱", "香菜"],
    ingredients_en: ["Chicken Breast", "Lemon", "Green Pepper", "Onion", "Cilantro"],
    nutrition: {
      calories: 80,
      protein: "10g",
      fat: "2.7g",
      carbs: "4.7g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 16,
    name: "麦片鸡",
    name_en: "Oat Crusted Chicken",
    price: 14.99,
    stock: 15,
    order_count: 1,
    category: "Chicken",
    image_url: "/assets/dishCovers/oat_crusted_chicken.png",
    description: "健康的燕麦，酥脆不油腻，鸡肉鲜嫩多汁，营养美味两不误。",
    description_en: "Healthy oat crust, crispy without being greasy. Juicy chicken inside, nutritious and delicious.",
    ingredients: ["鸡胸肉", "燕麦", "鸡蛋", "面粉", "香料"],
    ingredients_en: ["Chicken Breast", "Oats", "Egg", "Flour", "Spices"],
    nutrition: {
      calories: 107,
      protein: "10.7g",
      fat: "4g",
      carbs: "8g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 17,
    name: "咸蛋虾",
    name_en: "Salted Egg Shrimp",
    price: 18.99,
    stock: 12,
    order_count: 1,
    category: "Seafood",
    image_url: "/assets/dishCovers/salted_egg_shrimp.png",
    description: "香浓的咸蛋黄包裹着Q弹的虾仁，咸香可口，让人回味无穷。",
    description_en: "Rich salted egg yolk coating bouncy shrimp. Savory and delicious, absolutely addictive.",
    ingredients: ["虾仁", "咸蛋黄", "牛奶", "黄油", "咖喱叶"],
    ingredients_en: ["Shrimp", "Salted Egg Yolk", "Milk", "Butter", "Curry Leaves"],
    nutrition: {
      calories: 113,
      protein: "8.7g",
      fat: "7.3g",
      carbs: "4g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 18,
    name: "酸菜鱼",
    name_en: "Sour Cabbage Fish",
    price: 19.99,
    stock: 10,
    order_count: 1,
    category: "Seafood",
    image_url: "/assets/dishCovers/sour_cabbage_fish.png",
    description: "酸爽开胃的酸菜配上鲜嫩的鱼片，汤汁浓郁，经典川菜代表。",
    description_en: "Tangy pickled cabbage with tender fish slices in rich broth. A classic Sichuan dish that's incredibly appetizing.",
    ingredients: ["鱼片", "酸菜", "豆芽", "辣椒", "花椒"],
    ingredients_en: ["Fish Slices", "Pickled Cabbage", "Bean Sprouts", "Chili", "Sichuan Pepper"],
    nutrition: {
      calories: 93,
      protein: "10.7g",
      fat: "4g",
      carbs: "5.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 19,
    name: "香辣鸡翅根",
    name_en: "Spicy Chicken Wings",
    price: 12.99,
    stock: 20,
    order_count: 3,
    category: "Chicken",
    image_url: "/assets/dishCovers/spicy_chicken_wings.png",
    description: "外酥里嫩的鸡翅，裹上香辣酱汁，是聚会和下酒的绝佳选择。",
    description_en: "Crispy outside, tender inside chicken wings coated in spicy sauce. Perfect for parties and as a drinking snack.",
    ingredients: ["鸡翅", "辣椒粉", "孜然", "蒜", "酱油"],
    ingredients_en: ["Chicken Wings", "Chili Powder", "Cumin", "Garlic", "Soy Sauce"],
    nutrition: {
      calories: 120,
      protein: "8g",
      fat: "8g",
      carbs: "4.7g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 20,
    name: "香辣鸡翅",
    name_en: "Spicy Chicken Wings 2",
    price: 12.99,
    stock: 18,
    order_count: 1,
    category: "Chicken",
    image_url: "/assets/dishCovers/spicy_chicken_wings_2.png",
    description: "另一种风味的香辣鸡翅，更加香脆，辣度适中，老少皆宜。",
    description_en: "Another style of spicy chicken wings, extra crispy with moderate spice level. Loved by all ages.",
    ingredients: ["鸡翅", "辣椒", "花椒", "姜蒜", "料酒"],
    ingredients_en: ["Chicken Wings", "Chili", "Sichuan Pepper", "Ginger & Garlic", "Cooking Wine"],
    nutrition: {
      calories: 117,
      protein: "8.7g",
      fat: "7.3g",
      carbs: "4g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 21,
    name: "香辣杏鲍菇",
    name_en: "Spicy King Oyster Mushroom",
    price: 11.99,
    stock: 22,
    order_count: 1,
    category: "Vegetables",
    image_url: "/assets/dishCovers/spicy_king_oyster_mushroom.png",
    description: "肉质厚实的杏鲍菇，配上香辣调味，口感类似肉类，素食者的最爱。",
    description_en: "Thick and meaty king oyster mushrooms with spicy seasoning. Meat-like texture, perfect for vegetarians.",
    ingredients: ["杏鲍菇", "辣椒", "孜然", "蒜", "酱油"],
    ingredients_en: ["King Oyster Mushroom", "Chili", "Cumin", "Garlic", "Soy Sauce"],
    nutrition: {
      calories: 53,
      protein: "2.7g",
      fat: "2.7g",
      carbs: "6g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 22,
    name: "香辣藕片",
    name_en: "Spicy Lotus Root",
    price: 10.99,
    stock: 20,
    order_count: 1,
    category: "Vegetables",
    image_url: "/assets/dishCovers/spicy_lotus_root.png",
    description: "爽脆的藕片配上麻辣调味，口感清脆，开胃下饭。",
    description_en: "Crispy lotus root slices with numbing spicy seasoning. Crunchy texture, great appetizer.",
    ingredients: ["莲藕", "辣椒", "花椒", "醋", "糖"],
    ingredients_en: ["Lotus Root", "Chili", "Sichuan Pepper", "Vinegar", "Sugar"],
    nutrition: {
      calories: 47,
      protein: "1.3g",
      fat: "2g",
      carbs: "6.7g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 23,
    name: "香辣平菇",
    name_en: "Spicy Oyster Mushroom",
    price: 10.99,
    stock: 24,
    order_count: 1,
    category: "Vegetables",
    image_url: "/assets/dishCovers/spicy_oyster_mushroom.png",
    description: "鲜嫩的平菇配上香辣酱汁，口感滑嫩，味道鲜美。",
    description_en: "Tender oyster mushrooms in spicy sauce. Smooth texture and delicious umami flavor.",
    ingredients: ["平菇", "辣椒", "蒜", "酱油", "香油"],
    ingredients_en: ["Oyster Mushroom", "Chili", "Garlic", "Soy Sauce", "Sesame Oil"],
    nutrition: {
      calories: 40,
      protein: "2g",
      fat: "2g",
      carbs: "4.7g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 24,
    name: "香辣鱿鱼圈",
    name_en: "Spicy Squid Rings",
    price: 15.99,
    stock: 16,
    order_count: 2,
    category: "Seafood",
    image_url: "/assets/dishCovers/spicy_squid_rings.png",
    description: "Q弹的鱿鱼圈配上香辣调味，口感劲道，海鲜爱好者必点。",
    description_en: "Bouncy squid rings with spicy seasoning. Chewy texture, a must-try for seafood lovers.",
    ingredients: ["鱿鱼", "辣椒粉", "孜然", "蒜", "柠檬"],
    ingredients_en: ["Squid", "Chili Powder", "Cumin", "Garlic", "Lemon"],
    nutrition: {
      calories: 67,
      protein: "7.3g",
      fat: "2.7g",
      carbs: "4g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 25,
    name: "酿青椒",
    name_en: "Stuffed Bell Peppers",
    price: 13.99,
    stock: 14,
    order_count: 3,
    category: "Pork",
    image_url: "/assets/dishCovers/stuffed_bell_peppers.png",
    description: "青椒内填满肉馅，营养丰富，口感独特。",
    description_en: "Bell peppers stuffed with meat filling. Colorful, nutritious, and uniquely delicious.",
    ingredients: ["青椒", "猪肉馅", "牛肉馅", "酱油", "红皮洋葱"],
    ingredients_en: ["Peppers", "Minced Pork", "Minced Beef", "Soy Sauce", "Red Onion"],
    nutrition: {
      calories: 93,
      protein: "6g",
      fat: "4.7g",
      carbs: "8g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 26,
    name: "豆腐干虾米葱",
    name_en: "Tofu Dried Shrimp Scallions",
    price: 11.99,
    stock: 18,
    order_count: 1,
    category: "Vegetables",
    image_url: "/assets/dishCovers/tofu_dried_shrimp_scallions.png",
    description: "香干配上虾米和葱花，简单家常，却别有风味。",
    description_en: "Dried tofu with dried shrimp and scallions. Simple home-style dish with distinctive flavor.",
    ingredients: ["豆腐干", "虾米", "葱", "酱油", "香油"],
    ingredients_en: ["Dried Tofu", "Dried Shrimp", "Scallions", "Soy Sauce", "Sesame Oil"],
    nutrition: {
      calories: 60,
      protein: "5.3g",
      fat: "3.3g",
      carbs: "3.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 27,
    name: "回锅肉",
    name_en: "Twice Cooked Pork",
    price: 15.99,
    stock: 14,
    order_count: 1,
    category: "Pork",
    image_url: "/assets/dishCovers/twice_cooked_pork.png",
    description: "经典川菜，肥瘦相间的五花肉配上青蒜，香而不腻，回味无穷。",
    description_en: "Classic Sichuan dish with fatty and lean pork belly and garlic sprouts. Aromatic without being greasy.",
    ingredients: ["五花肉", "青蒜", "豆瓣酱", "甜面酱", "料酒"],
    ingredients_en: ["Pork Belly", "Garlic Sprouts", "Doubanjiang", "Sweet Bean Sauce", "Cooking Wine"],
    nutrition: {
      calories: 140,
      protein: "6.7g",
      fat: "10.7g",
      carbs: "5.3g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 28,
    name: "马来西亚柠檬鸡",
    name_en: "Malaysian Lemon Chicken",
    price: 15.99,
    stock: 14,
    order_count: 1,
    category: "Chicken",
    image_url: "/assets/dishCovers/malaysian_lemon_chicken.png",
    description: "以鸡腿肉或鸡胸肉搭配新鲜柠檬、洋葱与香菜制成，酸香开胃，口感清爽不腻。",
    description_en: "Made with chicken thigh or breast, fresh lemon, onion, and cilantro. Refreshing and tangy with a bright citrus aroma.",
    ingredients: ["鸡腿肉/鸡胸肉", "柠檬", "洋葱", "香菜", "生抽", "糖", "蒜"],
    ingredients_en: ["Chicken Thigh/Breast", "Lemon", "Onion", "Cilantro", "Soy Sauce", "Sugar", "Garlic"],
    nutrition: {
      calories: 87,
      protein: "10g",
      fat: "2.7g",
      carbs: "4.7g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    dish_id: 29,
    name: "万能肉酱",
    name_en: "Sichuan Style Meat Sauce",
    price: 15.99,
    stock: 14,
    order_count: 3,
    category: "Pork",
    image_url: "/assets/dishCovers/sichuan-style_meat_sauce.png",
    description: "以猪肉与牛肉混合炒制，加入洋葱与豆瓣酱增香提味，咸香浓郁，可搭配任意主食或蔬菜。",
    description_en: "A rich Sichuan-style meat sauce made from mixed pork and beef, enhanced with onion and Doubanjiang for deep umami flavor. Pairs well with rice, noodles, or vegetables.",
    ingredients: ["猪肉", "牛肉", "洋葱", "豆瓣酱", "姜蒜", "生抽", "糖"],
    ingredients_en: ["Pork", "Beef", "Onion", "Doubanjiang", "Ginger & Garlic", "Soy Sauce", "Sugar"],
    nutrition: {
      calories: 160,
      protein: "10g",
      fat: "10g",
      carbs: "6g"
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// 批量插入菜品数据
try {
  const result = db.dishes.insertMany(dishesData);
  print("✓ 菜品数据导入成功！");
  print("  总计导入: " + result.insertedIds.length + " 个菜品\n");
} catch (error) {
  print("❌ 导入失败: " + error.message);
  print("提示: 如果是重复键错误，请先清空现有数据或使用 upsert 操作\n");
}

// 显示统计信息
print("========================================");
print("数据库统计信息:");
print("========================================");
print("菜品总数: " + db.dishes.countDocuments());
print("\n按分类统计:");

// ============================================
// 2. 创建 orders（订单表）
// ============================================
print("2. 创建 orders 集合...");

db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_number", "delivery_date", "delivery_time", "total_amount", "total_items", "status", "payment_status", "notification_sent", "created_at", "updated_at"],
      properties: {
        order_number: {
          bsonType: "string",
          description: "订单号 - 必填且唯一"
        },
        customer_name: {
          bsonType: "string",
          description: "客户姓名 - 可选"
        },
        customer_email: {
          bsonType: "string",
          description: "客户邮箱 - 可选"
        },
        customer_phone: {
          bsonType: "string",
          description: "客户电话 - 可选"
        },
        delivery_date: {
          bsonType: "string",
          description: "配送日期 - 必填"
        },
        delivery_time: {
          bsonType: "string",
          description: "配送时间 - 必填"
        },
        delivery_address: {
          bsonType: "string",
          description: "配送地址 - 可选"
        },
        total_amount: {
          bsonType: "double",
          minimum: 0,
          description: "订单总金额 - 必填"
        },
        total_items: {
          bsonType: "int",
          minimum: 1,
          description: "商品总数量 - 必填"
        },
        status: {
          bsonType: "string",
          enum: ["pending", "confirmed", "preparing", "delivering", "completed", "cancelled"],
          description: "订单状态 - 必填"
        },
        payment_status: {
          bsonType: "string",
          enum: ["unpaid", "paid", "refunded"],
          description: "支付状态 - 必填"
        },
        payment_method: {
          bsonType: "string",
          description: "支付方式 - 可选"
        },
        notes: {
          bsonType: "string",
          description: "订单备注 - 可选"
        },
        markdown_content: {
          bsonType: "string",
          description: "订单Markdown格式内容 - 可选"
        },
        website: {
          bsonType: "string",
          description: "下单网站 - 可选"
        },
        user_agent: {
          bsonType: "string",
          description: "用户代理信息 - 可选"
        },
        notification_sent: {
          bsonType: "bool",
          description: "是否已发送通知 - 必填"
        },
        notification_time: {
          bsonType: "date",
          description: "通知发送时间 - 可选"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间 - 必填"
        },
        updated_at: {
          bsonType: "date",
          description: "更新时间 - 必填"
        }
      }
    }
  }
});

// 创建索引
db.orders.createIndex({ order_number: 1 }, { unique: true, name: "idx_order_number_unique" });
db.orders.createIndex({ status: 1, created_at: -1 }, { name: "idx_status_created" });
db.orders.createIndex({ customer_email: 1, created_at: -1 }, { name: "idx_customer_email_created" });
db.orders.createIndex({ delivery_date: 1, delivery_time: 1 }, { name: "idx_delivery_datetime" });
db.orders.createIndex({ created_at: -1 }, { name: "idx_created_desc" });

print("✓ orders 集合创建完成\n");

// ============================================
// 3. 创建 order_items（订单明细表）
// ============================================
print("3. 创建 order_items 集合...");

db.createCollection("order_items", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "order_number", "dish_id", "dish_name", "dish_name_en", "category", "price", "quantity", "subtotal", "is_custom", "created_at"],
      properties: {
        order_id: {
          bsonType: "objectId",
          description: "关联订单ID - 必填"
        },
        order_number: {
          bsonType: "string",
          description: "订单号 - 必填"
        },
        dish_id: {
          bsonType: "int",
          description: "菜品ID - 必填"
        },
        dish_name: {
          bsonType: "string",
          description: "菜品中文名称 - 必填"
        },
        dish_name_en: {
          bsonType: "string",
          description: "菜品英文名称 - 必填"
        },
        category: {
          bsonType: "string",
          description: "菜品分类 - 必填"
        },
        price: {
          bsonType: "double",
          minimum: 0,
          description: "单价 - 必填"
        },
        quantity: {
          bsonType: "int",
          minimum: 1,
          description: "数量 - 必填"
        },
        subtotal: {
          bsonType: "double",
          minimum: 0,
          description: "小计金额 - 必填"
        },
        is_custom: {
          bsonType: "bool",
          description: "是否为自定义菜品 - 必填"
        },
        custom_notes: {
          bsonType: "string",
          description: "自定义菜品备注 - 可选"
        },
        created_at: {
          bsonType: "date",
          description: "创建时间 - 必填"
        }
      }
    }
  }
});

// 创建索引
db.order_items.createIndex({ order_id: 1 }, { name: "idx_order_id" });
db.order_items.createIndex({ order_number: 1 }, { name: "idx_order_number" });
db.order_items.createIndex({ dish_id: 1, created_at: -1 }, { name: "idx_dish_id_created" });

print("✓ order_items 集合创建完成\n");

// ============================================
// 4. 显示集合信息
// ============================================
print("========================================");
print("数据库初始化完成！");
print("========================================\n");

print("集合列表:");
db.getCollectionNames().forEach(function(collection) {
  print("  - " + collection);
});

print("\n集合统计:");
print("  dishes: " + db.dishes.countDocuments() + " 条记录");
print("  orders: " + db.orders.countDocuments() + " 条记录");
print("  order_items: " + db.order_items.countDocuments() + " 条记录");

print("\n索引信息:");
print("  dishes 索引:");
db.dishes.getIndexes().forEach(function(index) {
  print("    - " + index.name);
});

print("  orders 索引:");
db.orders.getIndexes().forEach(function(index) {
  print("    - " + index.name);
});

print("  order_items 索引:");
db.order_items.getIndexes().forEach(function(index) {
  print("    - " + index.name);
});

print("\n========================================");
print("下一步操作:");
print("1. 运行数据导入脚本导入菜品数据");
print("2. 配置后端API连接此数据库");
print("3. 测试订单创建和查询功能");
print("========================================\n");

// Made with Bob
