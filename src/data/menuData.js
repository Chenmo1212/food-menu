export const MENU_ITEMS = [
  {
    id: 1,
    name: '麻婆豆腐',
    nameEn: 'Mapo Tofu',
    price: 12.99,
    stock: 15,
    orderCount: 4,
    category: 'Pork',
    image: require('../assets/dishCovers/mapo_tofu.png'),
    description: '经典川菜，麻辣鲜香的豆腐配上香浓的肉末，口感嫩滑，回味无穷。',
    descriptionEn: 'Classic Sichuan dish with silky tofu in spicy sauce, topped with minced pork. Numbing and spicy flavors that leave you wanting more.',
    ingredients: ['豆腐', '猪肉末', '豆瓣酱', '花椒', '葱姜蒜'],
    ingredientsEn: ['Tofu', 'Minced Pork', 'Doubanjiang', 'Sichuan Pepper', 'Scallions'],
    nutrition: {
      calories: 93,
      protein: '6g',
      fat: '5g',
      carbs: '6.7g'
    }
  },
  {
    id: 2,
    name: '番茄炒蛋',
    nameEn: 'Tomato Egg Stir Fry',
    price: 9.99,
    stock: 20,
    orderCount: 4,
    category: 'Vegetables',
    image: require('../assets/dishCovers/tomato_egg_stir_fry.png'),
    description: '家常经典菜品，酸甜可口的番茄配上嫩滑的鸡蛋，营养丰富，老少皆宜。',
    descriptionEn: 'A beloved home-style dish featuring sweet and tangy tomatoes with fluffy scrambled eggs. Nutritious and loved by all ages.',
    ingredients: ['番茄', '鸡蛋', '葱', '糖', '盐'],
    ingredientsEn: ['Tomatoes', 'Eggs', 'Scallions', 'Sugar', 'Salt'],
    nutrition: {
      calories: 73,
      protein: '4g',
      fat: '4.7g',
      carbs: '5g'
    }
  },
  {
    id: 3,
    name: '肉末炒豆腐',
    nameEn: 'Minced Meat Fried Tofu',
    price: 13.99,
    stock: 12,
    orderCount: 1,
    category: 'Pork',
    image: require('../assets/dishCovers/minced_meat_fried_tofu.png'),
    description: '油炸豆腐配上鲜美的肉末，口感丰富，咸香适中，下饭佳品。',
    descriptionEn: 'Fried tofu with savory minced meat. Rich flavors and varied textures make it perfect with rice.',
    ingredients: ['豆腐', '猪肉末', '青椒', '酱油', '蒜'],
    ingredientsEn: ['Tofu', 'Minced Pork', 'Green Pepper', 'Soy Sauce', 'Garlic'],
    nutrition: {
      calories: 103,
      protein: '6.7g',
      fat: '6g',
      carbs: '6g'
    }
  },
  {
    id: 4,
    name: '家常花菜',
    nameEn: 'Home Style Cauliflower',
    price: 10.99,
    stock: 18,
    orderCount: 1,
    category: 'Vegetables',
    image: require('../assets/dishCovers/home_style_cauliflower.png'),
    description: '清爽可口的花菜，配上蒜蓉和辣椒，简单却美味，健康低卡。',
    descriptionEn: 'Fresh and crispy cauliflower stir-fried with garlic and chili. Simple yet delicious, healthy and low-calorie.',
    ingredients: ['花菜', '蒜', '干辣椒', '生抽', '盐'],
    ingredientsEn: ['Cauliflower', 'Garlic', 'Dried Chili', 'Light Soy Sauce', 'Salt'],
    nutrition: {
      calories: 60,
      protein: '2.7g',
      fat: '2.7g',
      carbs: '7.3g'
    }
  },
  {
    id: 5,
    name: '白灼西兰花',
    nameEn: 'Blanched Broccoli',
    price: 8.99,
    stock: 25,
    orderCount: 3,
    category: 'Vegetables',
    image: require('../assets/dishCovers/blanched_broccoli.png'),
    description: '保持蔬菜原味的健康做法，翠绿的西兰花配上蚝油，清淡营养。',
    descriptionEn: 'Healthy preparation that preserves the natural flavor of vegetables. Bright green broccoli with oyster sauce, light and nutritious.',
    ingredients: ['西兰花', '蚝油', '蒜', '盐', '油'],
    ingredientsEn: ['Broccoli', 'Oyster Sauce', 'Garlic', 'Salt', 'Oil'],
    nutrition: {
      calories: 50,
      protein: '2g',
      fat: '2g',
      carbs: '6g'
    }
  },
  {
    id: 6,
    name: '香辣排骨',
    nameEn: 'Spicy Pork Ribs',
    price: 16.99,
    stock: 10,
    orderCount: 1,
    category: 'Pork',
    image: require('../assets/dishCovers/spicy_pork_ribs.png'),
    description: '酥脆外皮，肉质鲜嫩的排骨，配上香辣调味，让人欲罢不能。',
    descriptionEn: 'Crispy on the outside, tender on the inside. These spicy ribs are seasoned to perfection and absolutely irresistible.',
    ingredients: ['排骨', '辣椒', '花椒', '姜蒜', '料酒'],
    ingredientsEn: ['Pork Ribs', 'Chili', 'Sichuan Pepper', 'Ginger & Garlic', 'Cooking Wine'],
    nutrition: {
      calories: 140,
      protein: '9.3g',
      fat: '8.3g',
      carbs: '7.3g'
    }
  },
  {
    id: 7,
    name: '小炒鸡肉',
    nameEn: 'Stir Fried Chicken Breast',
    price: 14.99,
    stock: 16,
    orderCount: 2,
    category: 'Chicken',
    image: require('../assets/dishCovers/stir_fried_chicken_breast.png'),
    description: '嫩滑的鸡胸肉/鸡腿肉配上时蔬，高蛋白低脂肪，健身人士的最爱。',
    descriptionEn: 'Tender chicken stir-fried with seasonal vegetables. High protein, low fat - a favorite among fitness enthusiasts.',
    ingredients: ['鸡胸肉/鸡腿肉', '彩椒', '洋葱', '生抽', '黑胡椒'],
    ingredientsEn: ['Chicken Breast', 'Bell Peppers', 'Onion', 'Soy Sauce', 'Black Pepper'],
    nutrition: {
      calories: 87,
      protein: '10.7g',
      fat: '2.7g',
      carbs: '5.3g'
    }
  },
  {
    id: 8,
    name: '炸鸡排',
    nameEn: 'Fried Chicken Cutlet',
    price: 13.99,
    stock: 14,
    orderCount: 2,
    category: 'Chicken',
    image: require('../assets/dishCovers/fried_chicken_cutlet.png'),
    description: '金黄酥脆的外皮，多汁鲜嫩的鸡肉，搭配特制酱料，美味无比。',
    descriptionEn: 'Golden crispy coating with juicy tender chicken inside. Served with special sauce for an amazing taste experience.',
    ingredients: ['鸡腿肉', '面包糠', '鸡蛋', '面粉', '调味料'],
    ingredientsEn: ['Chicken Thigh', 'Breadcrumbs', 'Egg', 'Flour', 'Seasonings'],
    nutrition: {
      calories: 127,
      protein: '8.7g',
      fat: '6.7g',
      carbs: '9.3g'
    }
  },
  {
    id: 9,
    name: '红烧肉',
    nameEn: 'Braised Pork Belly',
    price: 17.99,
    stock: 12,
    orderCount: 3,
    category: 'Pork',
    image: require('../assets/dishCovers/braised_pork_belly.png'),
    description: '肥而不腻的五花肉，色泽红亮，入口即化，是经典的中式美味。',
    descriptionEn: 'Rich but not greasy pork belly, beautifully caramelized and melt-in-your-mouth tender. A classic Chinese delicacy.',
    ingredients: ['五花肉', '冰糖', '酱油', '料酒', '八角'],
    ingredientsEn: ['Pork Belly', 'Rock Sugar', 'Soy Sauce', 'Cooking Wine', 'Star Anise'],
    nutrition: {
      calories: 160,
      protein: '7.3g',
      fat: '11.7g',
      carbs: '6g'
    }
  },
  {
    id: 10,
    name: '豆豉鲮鱼油麦菜',
    nameEn: 'Black Bean Sardines with Lettuce',
    price: 15.99,
    stock: 14,
    orderCount: 1,
    category: 'Seafood',
    image: require('../assets/dishCovers/broccoli_fish_black_bean.png'),
    description: '一道以豆豉鲮鱼增香提味、与爽脆油麦菜同炒而成的粤式家常菜，特点是咸香浓郁、口感清爽。',
    descriptionEn: 'A Cantonese home-style dish that pairs savory canned black bean sardines with crisp lettuce for a rich yet refreshing flavor.',
    ingredients: ['鱼肉', '西兰花', '豆豉', '姜蒜', '料酒'],
    ingredientsEn: ['Fish', 'Broccoli', 'Black Beans', 'Ginger & Garlic', 'Cooking Wine'],
    nutrition: {
      calories: 80,
      protein: '9.3g',
      fat: '2.7g',
      carbs: '5.3g'
    }
  },
  {
    id: 11,
    name: '西兰花虾仁',
    nameEn: 'Broccoli Shrimp',
    price: 16.99,
    stock: 15,
    orderCount: 1,
    category: 'Seafood',
    image: require('../assets/dishCovers/broccoli_shrimp.png'),
    description: 'Q弹的虾仁搭配翠绿的西兰花，清淡健康，高蛋白低脂肪。',
    descriptionEn: 'Bouncy shrimp with crisp broccoli. Light and healthy, high in protein and low in fat.',
    ingredients: ['虾仁', '西兰花', '蒜', '盐', '料酒'],
    ingredientsEn: ['Shrimp', 'Broccoli', 'Garlic', 'Salt', 'Cooking Wine'],
    nutrition: {
      calories: 60,
      protein: '8g',
      fat: '1.7g',
      carbs: '4g'
    }
  },
  {
    id: 12,
    name: '皮蛋茄子擂辣椒',
    nameEn: 'Century Egg Eggplant Chili',
    price: 11.99,
    stock: 16,
    orderCount: 1,
    category: 'Vegetables',
    image: require('../assets/dishCovers/century_egg_eggplant_chili.png'),
    description: '独特的皮蛋风味配上软糯的茄子和辣椒，口感丰富，别具一格。',
    descriptionEn: 'Unique century egg flavor with soft eggplant and chili. Rich textures and distinctive taste.',
    ingredients: ['皮蛋', '茄子', '辣椒', '蒜', '酱油'],
    ingredientsEn: ['Century Egg', 'Eggplant', 'Chili', 'Garlic', 'Soy Sauce'],
    nutrition: {
      calories: 70,
      protein: '3.3g',
      fat: '4g',
      carbs: '6g'
    }
  },
  {
    id: 13,
    name: '干煸四季豆',
    nameEn: 'Dry Fried Green Beans',
    price: 10.99,
    stock: 20,
    orderCount: 2,
    category: 'Pork',
    image: require('../assets/dishCovers/dry_fried_green_beans.png'),
    description: '外焦里嫩的四季豆，配上肉末和干辣椒，香脆可口，回味无穷。',
    descriptionEn: 'Crispy outside, tender inside green beans with minced meat and dried chili. Crunchy and flavorful.',
    ingredients: ['四季豆', '猪肉末', '干辣椒', '花椒', '蒜'],
    ingredientsEn: ['Green Beans', 'Minced Pork', 'Dried Chili', 'Sichuan Pepper', 'Garlic'],
    nutrition: {
      calories: 73,
      protein: '4g',
      fat: '4.7g',
      carbs: '5.3g'
    }
  },
  {
    id: 14,
    name: '鱼香肉丝',
    nameEn: 'Fish Flavored Pork',
    price: 14.99,
    stock: 18,
    orderCount: 1,
    category: 'Pork',
    image: require('../assets/dishCovers/fish_flavored_pork.png'),
    description: '经典川菜，酸甜咸辣的完美平衡，肉丝嫩滑，配饭一流。',
    descriptionEn: 'Classic Sichuan dish with perfect balance of sweet, sour, salty and spicy. Tender pork strips, excellent with rice.',
    ingredients: ['猪肉丝', '木耳', '胡萝卜', '泡椒', '糖醋汁'],
    ingredientsEn: ['Pork Strips', 'Wood Ear', 'Carrot', 'Pickled Chili', 'Sweet & Sour Sauce'],
    nutrition: {
      calories: 107,
      protein: '8g',
      fat: '5.3g',
      carbs: '8g'
    }
  },
  {
    id: 15,
    name: '柠檬鸡丝',
    nameEn: 'Lemon Shredded Chicken',
    price: 13.99,
    stock: 17,
    orderCount: 1,
    category: 'Chicken',
    image: require('../assets/dishCovers/lemon_shredded_chicken.png'),
    description: '清新的柠檬香气配上嫩滑的鸡丝，酸爽开胃，夏日必备。',
    descriptionEn: 'Fresh lemon aroma with tender chicken strips. Refreshing and appetizing, perfect for summer.',
    ingredients: ['鸡胸肉', '柠檬', '青椒', '洋葱', '香菜'],
    ingredientsEn: ['Chicken Breast', 'Lemon', 'Green Pepper', 'Onion', 'Cilantro'],
    nutrition: {
      calories: 80,
      protein: '10g',
      fat: '2.7g',
      carbs: '4.7g'
    }
  },
  {
    id: 16,
    name: '麦片鸡',
    nameEn: 'Oat Crusted Chicken',
    price: 14.99,
    stock: 15,
    orderCount: 1,
    category: 'Chicken',
    image: require('../assets/dishCovers/oat_crusted_chicken.png'),
    description: '健康的燕麦，酥脆不油腻，鸡肉鲜嫩多汁，营养美味两不误。',
    descriptionEn: 'Healthy oat crust, crispy without being greasy. Juicy chicken inside, nutritious and delicious.',
    ingredients: ['鸡胸肉', '燕麦', '鸡蛋', '面粉', '香料'],
    ingredientsEn: ['Chicken Breast', 'Oats', 'Egg', 'Flour', 'Spices'],
    nutrition: {
      calories: 107,
      protein: '10.7g',
      fat: '4g',
      carbs: '8g'
    }
  },
  {
    id: 17,
    name: '咸蛋虾',
    nameEn: 'Salted Egg Shrimp',
    price: 18.99,
    stock: 12,
    orderCount: 1,
    category: 'Seafood',
    image: require('../assets/dishCovers/salted_egg_shrimp.png'),
    description: '香浓的咸蛋黄包裹着Q弹的虾仁，咸香可口，让人回味无穷。',
    descriptionEn: 'Rich salted egg yolk coating bouncy shrimp. Savory and delicious, absolutely addictive.',
    ingredients: ['虾仁', '咸蛋黄', '牛奶', '黄油', '咖喱叶'],
    ingredientsEn: ['Shrimp', 'Salted Egg Yolk', 'Milk', 'Butter', 'Curry Leaves'],
    nutrition: {
      calories: 113,
      protein: '8.7g',
      fat: '7.3g',
      carbs: '4g'
    }
  },
  {
    id: 18,
    name: '酸菜鱼',
    nameEn: 'Sour Cabbage Fish',
    price: 19.99,
    stock: 10,
    orderCount: 1,
    category: 'Seafood',
    image: require('../assets/dishCovers/sour_cabbage_fish.png'),
    description: '酸爽开胃的酸菜配上鲜嫩的鱼片，汤汁浓郁，经典川菜代表。',
    descriptionEn: 'Tangy pickled cabbage with tender fish slices in rich broth. A classic Sichuan dish that\'s incredibly appetizing.',
    ingredients: ['鱼片', '酸菜', '豆芽', '辣椒', '花椒'],
    ingredientsEn: ['Fish Slices', 'Pickled Cabbage', 'Bean Sprouts', 'Chili', 'Sichuan Pepper'],
    nutrition: {
      calories: 93,
      protein: '10.7g',
      fat: '4g',
      carbs: '5.3g'
    }
  },
  {
    id: 19,
    name: '香辣鸡翅根',
    nameEn: 'Spicy Chicken Wings',
    price: 12.99,
    stock: 20,
    orderCount: 3,
    category: 'Chicken',
    image: require('../assets/dishCovers/spicy_chicken_wings.png'),
    description: '外酥里嫩的鸡翅，裹上香辣酱汁，是聚会和下酒的绝佳选择。',
    descriptionEn: 'Crispy outside, tender inside chicken wings coated in spicy sauce. Perfect for parties and as a drinking snack.',
    ingredients: ['鸡翅', '辣椒粉', '孜然', '蒜', '酱油'],
    ingredientsEn: ['Chicken Wings', 'Chili Powder', 'Cumin', 'Garlic', 'Soy Sauce'],
    nutrition: {
      calories: 120,
      protein: '8g',
      fat: '8g',
      carbs: '4.7g'
    }
  },
  {
    id: 20,
    name: '香辣鸡翅',
    nameEn: 'Spicy Chicken Wings 2',
    price: 12.99,
    stock: 18,
    orderCount: 1,
    category: 'Chicken',
    image: require('../assets/dishCovers/spicy_chicken_wings_2.png'),
    description: '另一种风味的香辣鸡翅，更加香脆，辣度适中，老少皆宜。',
    descriptionEn: 'Another style of spicy chicken wings, extra crispy with moderate spice level. Loved by all ages.',
    ingredients: ['鸡翅', '辣椒', '花椒', '姜蒜', '料酒'],
    ingredientsEn: ['Chicken Wings', 'Chili', 'Sichuan Pepper', 'Ginger & Garlic', 'Cooking Wine'],
    nutrition: {
      calories: 117,
      protein: '8.7g',
      fat: '7.3g',
      carbs: '4g'
    }
  },
  {
    id: 21,
    name: '香辣杏鲍菇',
    nameEn: 'Spicy King Oyster Mushroom',
    price: 11.99,
    stock: 22,
    orderCount: 1,
    category: 'Vegetables',
    image: require('../assets/dishCovers/spicy_king_oyster_mushroom.png'),
    description: '肉质厚实的杏鲍菇，配上香辣调味，口感类似肉类，素食者的最爱。',
    descriptionEn: 'Thick and meaty king oyster mushrooms with spicy seasoning. Meat-like texture, perfect for vegetarians.',
    ingredients: ['杏鲍菇', '辣椒', '孜然', '蒜', '酱油'],
    ingredientsEn: ['King Oyster Mushroom', 'Chili', 'Cumin', 'Garlic', 'Soy Sauce'],
    nutrition: {
      calories: 53,
      protein: '2.7g',
      fat: '2.7g',
      carbs: '6g'
    }
  },
  {
    id: 22,
    name: '香辣藕片',
    nameEn: 'Spicy Lotus Root',
    price: 10.99,
    stock: 20,
    orderCount: 1,
    category: 'Vegetables',
    image: require('../assets/dishCovers/spicy_lotus_root.png'),
    description: '爽脆的藕片配上麻辣调味，口感清脆，开胃下饭。',
    descriptionEn: 'Crispy lotus root slices with numbing spicy seasoning. Crunchy texture, great appetizer.',
    ingredients: ['莲藕', '辣椒', '花椒', '醋', '糖'],
    ingredientsEn: ['Lotus Root', 'Chili', 'Sichuan Pepper', 'Vinegar', 'Sugar'],
    nutrition: {
      calories: 47,
      protein: '1.3g',
      fat: '2g',
      carbs: '6.7g'
    }
  },
  {
    id: 23,
    name: '香辣平菇',
    nameEn: 'Spicy Oyster Mushroom',
    price: 10.99,
    stock: 24,
    orderCount: 1,
    category: 'Vegetables',
    image: require('../assets/dishCovers/spicy_oyster_mushroom.png'),
    description: '鲜嫩的平菇配上香辣酱汁，口感滑嫩，味道鲜美。',
    descriptionEn: 'Tender oyster mushrooms in spicy sauce. Smooth texture and delicious umami flavor.',
    ingredients: ['平菇', '辣椒', '蒜', '酱油', '香油'],
    ingredientsEn: ['Oyster Mushroom', 'Chili', 'Garlic', 'Soy Sauce', 'Sesame Oil'],
    nutrition: {
      calories: 40,
      protein: '2g',
      fat: '2g',
      carbs: '4.7g'
    }
  },
  {
    id: 24,
    name: '香辣鱿鱼圈',
    nameEn: 'Spicy Squid Rings',
    price: 15.99,
    stock: 16,
    orderCount: 2,
    category: 'Seafood',
    image: require('../assets/dishCovers/spicy_squid_rings.png'),
    description: 'Q弹的鱿鱼圈配上香辣调味，口感劲道，海鲜爱好者必点。',
    descriptionEn: 'Bouncy squid rings with spicy seasoning. Chewy texture, a must-try for seafood lovers.',
    ingredients: ['鱿鱼', '辣椒粉', '孜然', '蒜', '柠檬'],
    ingredientsEn: ['Squid', 'Chili Powder', 'Cumin', 'Garlic', 'Lemon'],
    nutrition: {
      calories: 67,
      protein: '7.3g',
      fat: '2.7g',
      carbs: '4g'
    }
  },
  {
    id: 25,
    name: '酿青椒',
    nameEn: 'Stuffed Bell Peppers',
    price: 13.99,
    stock: 14,
    orderCount: 3,
    category: 'Pork',
    image: require('../assets/dishCovers/stuffed_bell_peppers.png'),
    description: '青椒内填满肉馅，营养丰富，口感独特。',
    descriptionEn: 'Bell peppers stuffed with meat filling. Colorful, nutritious, and uniquely delicious.',
    ingredients: ['青椒', '猪肉馅', '牛肉馅', '酱油', '红皮洋葱'],
    ingredientsEn: ['Peppers', 'Minced Pork', 'Minced Beef', 'Soy Sauce', 'Red Onion'],
    nutrition: {
      calories: 93,
      protein: '6g',
      fat: '4.7g',
      carbs: '8g'
    }
  },
  {
    id: 26,
    name: '豆腐干虾米葱',
    nameEn: 'Tofu Dried Shrimp Scallions',
    price: 11.99,
    stock: 18,
    orderCount: 1,
    category: 'Vegetables',
    image: require('../assets/dishCovers/tofu_dried_shrimp_scallions.png'),
    description: '香干配上虾米和葱花，简单家常，却别有风味。',
    descriptionEn: 'Dried tofu with dried shrimp and scallions. Simple home-style dish with distinctive flavor.',
    ingredients: ['豆腐干', '虾米', '葱', '酱油', '香油'],
    ingredientsEn: ['Dried Tofu', 'Dried Shrimp', 'Scallions', 'Soy Sauce', 'Sesame Oil'],
    nutrition: {
      calories: 60,
      protein: '5.3g',
      fat: '3.3g',
      carbs: '3.3g'
    }
  },
  {
    id: 27,
    name: '回锅肉',
    nameEn: 'Twice Cooked Pork',
    price: 15.99,
    stock: 14,
    orderCount: 1,
    category: 'Pork',
    image: require('../assets/dishCovers/twice_cooked_pork.png'),
    description: '经典川菜，肥瘦相间的五花肉配上青蒜，香而不腻，回味无穷。',
    descriptionEn: 'Classic Sichuan dish with fatty and lean pork belly and garlic sprouts. Aromatic without being greasy.',
    ingredients: ['五花肉', '青蒜', '豆瓣酱', '甜面酱', '料酒'],
    ingredientsEn: ['Pork Belly', 'Garlic Sprouts', 'Doubanjiang', 'Sweet Bean Sauce', 'Cooking Wine'],
    nutrition: {
      calories: 140,
      protein: '6.7g',
      fat: '10.7g',
      carbs: '5.3g'
    }
  },
  {
    id: 28,
    name: '马来西亚柠檬鸡',
    nameEn: 'Malaysian Lemon Chicken',
    price: 15.99,
    stock: 14,
    orderCount: 1,
    category: 'Chicken',
    image: require('../assets/dishCovers/malaysian_lemon_chicken.png'),
    description: '以鸡腿肉或鸡胸肉搭配新鲜柠檬、洋葱与香菜制成，酸香开胃，口感清爽不腻。',
    descriptionEn: 'Made with chicken thigh or breast, fresh lemon, onion, and cilantro. Refreshing and tangy with a bright citrus aroma.',
    ingredients: ['鸡腿肉/鸡胸肉', '柠檬', '洋葱', '香菜', '生抽', '糖', '蒜'],
    ingredientsEn: ['Chicken Thigh/Breast', 'Lemon', 'Onion', 'Cilantro', 'Soy Sauce', 'Sugar', 'Garlic'],
    nutrition: {
      calories: 87,
      protein: '10g',
      fat: '2.7g',
      carbs: '4.7g'
    }
  },
  {
    id: 29,
    name: '万能肉酱',
    nameEn: 'Sichuan Style Meat Sauce',
    price: 15.99,
    stock: 14,
    orderCount: 3,
    category: 'Pork',
    image: require('../assets/dishCovers/sichuan-style_meat_sauce.png'),
    description: '以猪肉与牛肉混合炒制，加入洋葱与豆瓣酱增香提味，咸香浓郁，可搭配任意主食或蔬菜。',
    descriptionEn: 'A rich Sichuan-style meat sauce made from mixed pork and beef, enhanced with onion and Doubanjiang for deep umami flavor. Pairs well with rice, noodles, or vegetables.',
    ingredients: ['猪肉', '牛肉', '洋葱', '豆瓣酱', '姜蒜', '生抽', '糖'],
    ingredientsEn: ['Pork', 'Beef', 'Onion', 'Doubanjiang', 'Ginger & Garlic', 'Soy Sauce', 'Sugar'],
    nutrition: {
      calories: 160,
      protein: '10g',
      fat: '10g',
      carbs: '6g'
    }
  },
];

export const CATEGORIES = [
  { name: 'All', nameZh: '全部', iconName: 'all' },
  { name: 'Pork', nameZh: '猪肉', iconName: 'pork' },
  { name: 'Chicken', nameZh: '鸡肉', iconName: 'chicken' },
  { name: 'Seafood', nameZh: '海鲜', iconName: 'seafood' },
  { name: 'Vegetables', nameZh: '素菜', iconName: 'vegetables' },
];

// Made with Bob
