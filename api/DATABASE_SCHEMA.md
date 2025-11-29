# 食品订餐系统 MongoDB 数据库设计文档

## 概述

本文档描述了食品订餐系统的 MongoDB 数据库架构设计。系统需要支持菜品管理、订单处理和历史订单查询功能。

## 数据库表设计

根据系统需求，共需要建立 **3个集合（Collections）**：

1. **dishes** - 菜品信息表
2. **orders** - 订单表
3. **order_items** - 订单明细表

---

## 1. dishes（菜品信息表）

存储所有菜品的详细信息，包括中英文名称、价格、库存、营养信息等。

### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| _id | ObjectId | 是 | MongoDB自动生成的唯一标识 | ObjectId("...") |
| dish_id | Number | 是 | 菜品ID（业务主键） | 1 |
| name | String | 是 | 菜品中文名称 | "麻婆豆腐" |
| name_en | String | 是 | 菜品英文名称 | "Mapo Tofu" |
| price | Number | 是 | 价格（美元） | 12.99 |
| stock | Number | 是 | 库存数量 | 15 |
| order_count | Number | 是 | 累计订单数 | 4 |
| category | String | 是 | 菜品分类 | "Pork" |
| image_url | String | 否 | 图片URL或路径 | "/assets/dishCovers/mapo_tofu.png" |
| description | String | 是 | 中文描述 | "经典川菜..." |
| description_en | String | 是 | 英文描述 | "Classic Sichuan dish..." |
| ingredients | Array[String] | 是 | 中文食材列表 | ["豆腐", "猪肉末", "豆瓣酱"] |
| ingredients_en | Array[String] | 是 | 英文食材列表 | ["Tofu", "Minced Pork"] |
| nutrition | Object | 是 | 营养信息对象 | 见下方 |
| nutrition.calories | Number | 是 | 卡路里 | 93 |
| nutrition.protein | String | 是 | 蛋白质 | "6g" |
| nutrition.fat | String | 是 | 脂肪 | "5g" |
| nutrition.carbs | String | 是 | 碳水化合物 | "6.7g" |
| is_active | Boolean | 是 | 是否上架 | true |
| created_at | Date | 是 | 创建时间 | ISODate("2024-01-01T00:00:00Z") |
| updated_at | Date | 是 | 更新时间 | ISODate("2024-01-01T00:00:00Z") |

### 索引设计

```javascript
// 唯一索引
{ dish_id: 1 }  // unique

// 复合索引
{ category: 1, is_active: 1 }
{ order_count: -1 }  // 用于热门菜品排序
{ price: 1 }  // 用于价格排序
```

---

## 2. orders（订单表）

存储订单主表信息，包括订单状态、配送信息、总价等。

### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| _id | ObjectId | 是 | MongoDB自动生成的唯一标识 | ObjectId("...") |
| order_number | String | 是 | 订单号（唯一） | "ORD20240101001" |
| customer_name | String | 否 | 客户姓名 | "张三" |
| customer_email | String | 否 | 客户邮箱 | "order@foodmenu.app" |
| customer_phone | String | 否 | 客户电话 | "+86 138****1234" |
| delivery_date | String | 是 | 配送日期 | "2024-01-15" |
| delivery_time | String | 是 | 配送时间 | "12:00-13:00" |
| delivery_address | String | 否 | 配送地址 | "北京市朝阳区..." |
| total_amount | Number | 是 | 订单总金额 | 89.97 |
| total_items | Number | 是 | 商品总数量 | 5 |
| status | String | 是 | 订单状态 | "pending" |
| payment_status | String | 是 | 支付状态 | "unpaid" |
| payment_method | String | 否 | 支付方式 | "wechat" |
| notes | String | 否 | 订单备注 | "不要辣" |
| markdown_content | String | 否 | 订单Markdown格式内容 | "## 订单详情..." |
| website | String | 否 | 下单网站 | "https://foodmenu.app" |
| user_agent | String | 否 | 用户代理信息 | "Mozilla/5.0..." |
| notification_sent | Boolean | 是 | 是否已发送通知 | true |
| notification_time | Date | 否 | 通知发送时间 | ISODate("2024-01-01T12:00:00Z") |
| created_at | Date | 是 | 创建时间 | ISODate("2024-01-01T00:00:00Z") |
| updated_at | Date | 是 | 更新时间 | ISODate("2024-01-01T00:00:00Z") |

### 订单状态枚举

- `pending` - 待处理
- `confirmed` - 已确认
- `preparing` - 准备中
- `delivering` - 配送中
- `completed` - 已完成
- `cancelled` - 已取消

### 支付状态枚举

- `unpaid` - 未支付
- `paid` - 已支付
- `refunded` - 已退款

### 索引设计

```javascript
// 唯一索引
{ order_number: 1 }  // unique

// 复合索引
{ status: 1, created_at: -1 }
{ customer_email: 1, created_at: -1 }
{ delivery_date: 1, delivery_time: 1 }
{ created_at: -1 }  // 用于订单列表排序
```

---

## 3. order_items（订单明细表）

存储订单中的具体菜品信息。

### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| _id | ObjectId | 是 | MongoDB自动生成的唯一标识 | ObjectId("...") |
| order_id | ObjectId | 是 | 关联订单ID | ObjectId("...") |
| order_number | String | 是 | 订单号（冗余字段） | "ORD20240101001" |
| dish_id | Number | 是 | 菜品ID | 1 |
| dish_name | String | 是 | 菜品中文名称（快照） | "麻婆豆腐" |
| dish_name_en | String | 是 | 菜品英文名称（快照） | "Mapo Tofu" |
| category | String | 是 | 菜品分类（快照） | "Pork" |
| price | Number | 是 | 单价（快照） | 12.99 |
| quantity | Number | 是 | 数量 | 2 |
| subtotal | Number | 是 | 小计金额 | 25.98 |
| is_custom | Boolean | 是 | 是否为自定义菜品 | false |
| custom_notes | String | 否 | 自定义菜品备注 | "少油少盐" |
| created_at | Date | 是 | 创建时间 | ISODate("2024-01-01T00:00:00Z") |

### 索引设计

```javascript
// 复合索引
{ order_id: 1 }
{ order_number: 1 }
{ dish_id: 1, created_at: -1 }  // 用于统计菜品销量
```

---

## 数据关系说明

```
orders (1) ----< (N) order_items
  |
  └─ order_id 关联

dishes (1) ----< (N) order_items
  |
  └─ dish_id 关联
```

**说明**：
- dishes 表中的 category 字段直接存储分类信息（Pork, Chicken, Seafood, Vegetables）
- 不需要单独的 categories 表，分类信息在前端硬编码即可

---

## 数据迁移说明

### 从前端数据迁移到MongoDB

1. **菜品数据**：将 `src/data/menuData.js` 中的 `MENU_ITEMS` 数组导入到 `dishes` 集合
2. **订单数据**：新建订单时，从前端提交的数据创建 `orders` 和 `order_items` 记录

---

## 查询示例

### 1. 获取所有上架菜品（按分类）

```javascript
db.dishes.find({ 
  is_active: true,
  category: "Pork" 
}).sort({ order_count: -1 })
```

### 2. 获取热门菜品（Top 10）

```javascript
db.dishes.find({ 
  is_active: true 
}).sort({ order_count: -1 }).limit(10)
```

### 3. 获取用户历史订单

```javascript
db.orders.find({ 
  customer_email: "user@example.com" 
}).sort({ created_at: -1 })
```

### 4. 获取订单详情（包含菜品明细）

```javascript
// 使用聚合查询
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
])
```

### 5. 统计某个菜品的销量

```javascript
db.order_items.aggregate([
  { $match: { dish_id: 1 } },
  { $group: { _id: "$dish_id", total_sold: { $sum: "$quantity" } } }
])
```

---

## 性能优化建议

1. **索引优化**：为常用查询字段创建索引
2. **数据冗余**：在 `order_items` 中保存菜品快照，避免关联查询
3. **分页查询**：订单列表使用分页，避免一次性加载大量数据
4. **缓存策略**：热门菜品、分类信息可以使用 Redis 缓存
5. **归档策略**：定期归档历史订单数据（如6个月前的订单）

---

## 备份策略

1. **每日备份**：每天凌晨自动备份数据库
2. **增量备份**：每小时进行增量备份
3. **异地备份**：将备份文件同步到云存储
4. **保留策略**：保留最近30天的每日备份，最近7天的每小时备份

---

## 版本历史

| 版本 | 日期 | 修改内容 | 修改人 |
|------|------|----------|--------|
| 1.0 | 2024-01-01 | 初始版本 | Bob |

---

**文档生成时间**: 2024-01-01  
**数据库版本**: MongoDB 6.0+  
**字符编码**: UTF-8