# MongoDB 数据库设置指南

本文档提供了食品订餐系统 MongoDB 数据库的完整设置步骤和命令。

## 📋 目录

1. [前置要求](#前置要求)
2. [快速开始](#快速开始)
3. [详细步骤](#详细步骤)
4. [数据导入](#数据导入)
5. [常用命令](#常用命令)
6. [故障排除](#故障排除)

---

## 前置要求

- MongoDB 6.0 或更高版本
- mongosh (MongoDB Shell)
- Node.js 16+ (用于数据导入脚本)

### 安装 MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
下载并安装 [MongoDB Community Server](https://www.mongodb.com/try/download/community)

---

## 快速开始

### 方法 1: 使用初始化脚本（推荐）

```bash
# 1. 确保 MongoDB 服务正在运行
mongosh --eval "db.version()"

# 2. 执行初始化脚本
mongosh mongodb://localhost:27017/food_menu_db < mongodb-init.js

# 3. 验证创建结果
mongosh mongodb://localhost:27017/food_menu_db --eval "db.getCollectionNames()"
```

### 方法 2: 使用 Docker

```bash
# 1. 启动 MongoDB 容器
docker run -d \
  --name food-menu-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=food_menu_db \
  -v $(pwd)/mongodb-data:/data/db \
  mongo:6.0

# 2. 执行初始化脚本
docker exec -i food-menu-mongodb mongosh food_menu_db < mongodb-init.js
```

---

## 详细步骤

### 步骤 1: 连接到 MongoDB

```bash
# 连接到本地 MongoDB
mongosh mongodb://localhost:27017

# 或连接到远程 MongoDB（需要认证）
mongosh "mongodb://username:password@host:port/food_menu_db"
```

### 步骤 2: 创建数据库和集合

在 mongosh 中执行以下命令：

```javascript
// 切换到目标数据库
use food_menu_db;

// 加载初始化脚本
load('mongodb-init.js');
```

### 步骤 3: 验证集合创建

```javascript
// 查看所有集合
show collections;

// 查看集合统计
db.dishes.stats();
db.categories.stats();
db.orders.stats();
db.order_items.stats();

// 查看索引
db.dishes.getIndexes();
db.categories.getIndexes();
db.orders.getIndexes();
db.order_items.getIndexes();
```

---

## 数据导入

### 导入菜品数据

创建数据导入脚本 `import-dishes.js`:

```javascript
// import-dishes.js
use food_menu_db;

// 示例：导入菜品数据
db.dishes.insertMany([
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
    description_en: "Classic Sichuan dish with silky tofu in spicy sauce, topped with minced pork.",
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
  // ... 更多菜品数据
]);

print("菜品数据导入完成！总计: " + db.dishes.countDocuments() + " 条");
```

执行导入：

```bash
mongosh mongodb://localhost:27017/food_menu_db < import-dishes.js
```

### 使用 Node.js 导入数据

创建 `import-data.js`:

```javascript
const { MongoClient } = require('mongodb');
const menuData = require('./src/data/menuData.js');

const uri = 'mongodb://localhost:27017';
const dbName = 'food_menu_db';

async function importData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✓ 连接到 MongoDB');
    
    const db = client.db(dbName);
    
    // 导入菜品数据
    const dishes = menuData.MENU_ITEMS.map((item, index) => ({
      dish_id: item.id,
      name: item.name,
      name_en: item.nameEn,
      price: item.price,
      stock: item.stock,
      order_count: item.orderCount,
      category: item.category,
      image_url: item.image,
      description: item.description,
      description_en: item.descriptionEn,
      ingredients: item.ingredients,
      ingredients_en: item.ingredientsEn,
      nutrition: item.nutrition,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    const result = await db.collection('dishes').insertMany(dishes);
    console.log(`✓ 成功导入 ${result.insertedCount} 个菜品`);
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    await client.close();
  }
}

importData();
```

运行导入脚本：

```bash
npm install mongodb
node import-data.js
```

---

## 常用命令

### 数据库管理

```bash
# 查看所有数据库
mongosh --eval "show dbs"

# 删除数据库（谨慎使用！）
mongosh mongodb://localhost:27017/food_menu_db --eval "db.dropDatabase()"

# 备份数据库
mongodump --db=food_menu_db --out=/path/to/backup

# 恢复数据库
mongorestore --db=food_menu_db /path/to/backup/food_menu_db
```

### 集合操作

```javascript
// 查看集合中的文档数量
db.dishes.countDocuments();

// 查看前10条记录
db.dishes.find().limit(10).pretty();

// 删除集合（谨慎使用！）
db.dishes.drop();

// 清空集合数据
db.dishes.deleteMany({});
```

### 查询示例

```javascript
// 1. 查询所有上架的猪肉类菜品
db.dishes.find({ 
  is_active: true, 
  category: "Pork" 
}).sort({ order_count: -1 });

// 2. 查询价格在10-15美元之间的菜品
db.dishes.find({ 
  price: { $gte: 10, $lte: 15 },
  is_active: true 
});

// 3. 全文搜索
db.dishes.find({ 
  $text: { $search: "chicken spicy" } 
});

// 4. 查询某个用户的所有订单
db.orders.find({ 
  customer_email: "user@example.com" 
}).sort({ created_at: -1 });

// 5. 聚合查询：统计每个分类的菜品数量
db.dishes.aggregate([
  { $match: { is_active: true } },
  { $group: { 
    _id: "$category", 
    count: { $sum: 1 },
    avgPrice: { $avg: "$price" }
  }},
  { $sort: { count: -1 } }
]);

// 6. 查询订单详情（包含菜品明细）
db.orders.aggregate([
  { $match: { order_number: "ORD20240101001" } },
  {
    $lookup: {
      from: "order_items",
      localField: "_id",
      foreignField: "order_id",
      as: "items"
    }
  }
]);
```

### 更新操作

```javascript
// 更新菜品库存
db.dishes.updateOne(
  { dish_id: 1 },
  { 
    $inc: { stock: -1, order_count: 1 },
    $set: { updated_at: new Date() }
  }
);

// 批量更新价格（增加10%）
db.dishes.updateMany(
  { category: "Seafood" },
  { 
    $mul: { price: 1.1 },
    $set: { updated_at: new Date() }
  }
);

// 更新订单状态
db.orders.updateOne(
  { order_number: "ORD20240101001" },
  { 
    $set: { 
      status: "confirmed",
      updated_at: new Date()
    }
  }
);
```

---

## 创建用户和权限

### 创建管理员用户

```javascript
use admin;

db.createUser({
  user: "admin",
  pwd: "your_secure_password",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
});
```

### 创建应用用户

```javascript
use food_menu_db;

db.createUser({
  user: "food_menu_app",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "food_menu_db" }
  ]
});
```

### 启用认证

编辑 MongoDB 配置文件 `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled
```

重启 MongoDB:

```bash
sudo systemctl restart mongod
```

连接时使用认证：

```bash
mongosh "mongodb://food_menu_app:app_password@localhost:27017/food_menu_db"
```

---

## Docker Compose 配置

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: food-menu-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin_password
      MONGO_INITDB_DATABASE: food_menu_db
    volumes:
      - mongodb_data:/data/db
      - ./mongodb-init.js:/docker-entrypoint-initdb.d/mongodb-init.js:ro
    networks:
      - food-menu-network

  mongo-express:
    image: mongo-express:latest
    container_name: food-menu-mongo-express
    restart: always
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: admin_password
      ME_CONFIG_MONGODB_URL: mongodb://admin:admin_password@mongodb:27017/
    depends_on:
      - mongodb
    networks:
      - food-menu-network

volumes:
  mongodb_data:

networks:
  food-menu-network:
    driver: bridge
```

启动服务：

```bash
docker-compose up -d
```

访问 Mongo Express (Web UI): http://localhost:8081

---

## 故障排除

### 问题 1: 无法连接到 MongoDB

**解决方案:**

```bash
# 检查 MongoDB 服务状态
sudo systemctl status mongod

# 启动 MongoDB
sudo systemctl start mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 问题 2: 认证失败

**解决方案:**

```bash
# 临时禁用认证
sudo systemctl stop mongod
mongod --dbpath /var/lib/mongodb --noauth

# 在另一个终端重置用户密码
mongosh
use admin;
db.changeUserPassword("admin", "new_password");
```

### 问题 3: 磁盘空间不足

**解决方案:**

```bash
# 检查磁盘使用情况
df -h

# 清理旧的日志文件
sudo rm /var/log/mongodb/mongod.log.*

# 压缩数据库
mongosh
use food_menu_db;
db.runCommand({ compact: 'dishes' });
```

### 问题 4: 索引创建失败

**解决方案:**

```javascript
// 删除所有索引（除了 _id）
db.dishes.dropIndexes();

// 重新创建索引
db.dishes.createIndex({ dish_id: 1 }, { unique: true });
```

---

## 性能优化建议

1. **使用连接池**: 在应用中配置合适的连接池大小
2. **创建合适的索引**: 为常用查询字段创建索引
3. **使用投影**: 只查询需要的字段
4. **批量操作**: 使用 `insertMany`、`bulkWrite` 等批量操作
5. **监控性能**: 使用 `explain()` 分析查询性能

```javascript
// 查询性能分析
db.dishes.find({ category: "Pork" }).explain("executionStats");
```

---

## 监控和维护

### 监控命令

```javascript
// 查看数据库状态
db.serverStatus();

// 查看当前操作
db.currentOp();

// 查看慢查询
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

### 定期维护任务

```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --db=food_menu_db --out=/backup/mongodb_$DATE
find /backup -name "mongodb_*" -mtime +30 -exec rm -rf {} \;
```

---

## 相关文档

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 数据库架构详细说明
- [MongoDB 官方文档](https://docs.mongodb.com/)
- [mongosh 文档](https://docs.mongodb.com/mongodb-shell/)

---

## 联系支持

如有问题，请查看：
- GitHub Issues
- 项目文档
- MongoDB 社区论坛

**最后更新**: 2024-01-01