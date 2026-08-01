# Food Menu App

A responsive React food ordering app with bilingual (EN/ZH) support, a live backend API, order history, and a dish ranking board.

---

## 📁 Project Structure

```
food-menu/
│
├── public/                         # Static assets & index.html
│
├── src/
│   ├── assets/
│   │   ├── dishCovers/             # Dish cover images (.png)
│   │   ├── mealCovers/             # Weekly meal plan covers (.png)
│   │   ├── sounds/                 # UI sound effects (.mp3)
│   │   ├── svgs/                   # Category SVG icons
│   │   └── icons.js                # Exports SVG icon components
│   │
│   ├── components/                 # Shared / layout components
│   │   ├── Sidebar.js              # Desktop left navigation
│   │   ├── MobileNav.js            # Mobile slide-in drawer + bottom bar
│   │   ├── Header.js               # Top bar with search input
│   │   ├── MenuItem.js             # Menu item card
│   │   ├── MenuItemModal.js        # Dish detail modal (animated)
│   │   ├── CartItem.js             # Single row in the cart
│   │   └── SidePanel.js            # Generic right-side panel wrapper
│   │
│   ├── contexts/
│   │   └── LanguageContext.js      # EN/ZH language toggle (localStorage)
│   │
│   ├── data/
│   │   └── menuData.js             # Local fallback: MENU_ITEMS + CATEGORIES
│   │
│   ├── hooks/
│   │   └── useLocalStorage.js      # useState wrapper with localStorage sync
│   │
│   ├── pages/
│   │   ├── MenuPage/
│   │   │   ├── index.js            # Category filter + dish grid
│   │   │   ├── Cart.js             # Cart sidebar / overlay
│   │   │   ├── CustomDishModal.js  # Add a custom (off-menu) dish
│   │   │   └── OrderSummaryModal.js# Review order + secret code submit
│   │   │
│   │   ├── HistoryPage/
│   │   │   ├── index.js            # Order list with on-process / completed tabs
│   │   │   ├── OrderDetailsPanel.js# Right-panel order details view
│   │   │   └── OrderEditModal.js   # Edit an existing order
│   │   │
│   │   └── RankPage/
│   │       └── index.js            # Top-10 dish leaderboard with podium
│   │
│   ├── services/
│   │   ├── menuApi.js              # REST API calls (dishes, orders, stats)
│   │   └── wechatNotification.js   # Post order summary to backend message API
│   │
│   └── utils/
│       ├── iconMapping.js          # Centralised icon exports (FontAwesome)
│       ├── imageMapper.js          # Resolve dish/meal image URLs
│       └── soundManager.js         # Howler.js tap / add-to-cart sounds
│
├── sync-menu.js                    # CLI: sync menuData.js → backend database
├── .env.example                    # Environment variable template
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🔄 Component Hierarchy

```
App (LanguageProvider)
│
├── Sidebar              (desktop only)
├── MobileNav            (mobile/tablet)
├── Header               (search bar)
│
├── MenuPage             (activeView === 'menu')
│   ├── Category filter buttons
│   ├── MenuItem cards (grid)
│   ├── CustomDishModal
│   └── OrderSummaryModal
│
├── HistoryPage          (activeView === 'history')
│   ├── Order list (on-process / completed tabs)
│   └── OrderEditModal
│
├── RankPage             (activeView === 'rank')
│   └── Top-10 podium + leaderboard table
│
├── Cart                 (right panel, menu view only)
├── OrderDetailsPanel    (right panel, history view only)
└── MenuItemModal        (dish detail overlay)
```

---

## 📱 Responsive Layout

### Desktop (≥ 1024px)
```
┌──────────┬────────────────────────────┬─────────────────┐
│          │                            │                 │
│ Sidebar  │   Main Content             │  Cart / Details │
│ (fixed)  │   Header + Page content    │  (fixed panel)  │
│          │                            │                 │
└──────────┴────────────────────────────┴─────────────────┘
```

### Mobile / Tablet (< 1024px)
```
┌──────────────────────────────────┐
│  Header (search)                 │
│  Page content                    │
│                     [Cart Btn]   │  ← floating
└──────────────────────────────────┘
┌──────────────────────────────────┐
│  Bottom Navigation / Drawer      │
└──────────────────────────────────┘
```

---

## 🌐 API Integration

The app connects to a hosted REST API. All calls are in [`src/services/menuApi.js`](src/services/menuApi.js).

| Function | Method | Endpoint |
|---|---|---|
| `getDishes(params)` | GET | `/dishes` |
| `getDishById(id)` | GET | `/dishes/:id` |
| `getPopularDishes(limit)` | GET | `/dishes/popular` |
| `searchDishes(keyword)` | GET | `/dishes/search` |
| `createDish(data)` | POST | `/dishes` |
| `updateDish(id, data)` | PUT | `/dishes/:id` |
| `updateDishStock(id, qty)` | PATCH | `/dishes/:id/stock` |
| `createOrder(data)` | POST | `/orders` |
| `getOrders(params)` | GET | `/orders` |
| `getOrderByNumber(num)` | GET | `/orders/:num` |
| `updateOrder(num, data)` | PUT | `/orders/:num` |
| `updateOrderStatus(num, status)` | PATCH | `/orders/:num/status` |
| `updateOrderItems(num, items)` | PUT | `/orders/:num/items` |
| `cancelOrder(num)` | DELETE | `/orders/:num` |
| `getDishesStats()` | GET | `/stats/dishes` |
| `getOrdersStats()` | GET | `/stats/orders` |
| `checkHealth()` | GET | `/health` |

On API failure the app silently falls back to the local [`src/data/menuData.js`](src/data/menuData.js) dataset.

---

## 📊 Data Flow

```
menuData.js (local fallback)
        ↓
menuApi.js  (live API, fetched on mount)
        ↓
App.js  (state: menuItems, cart, activeView, orders…)
        ↓
Pages & Components (props)
```

**Key App.js state:**

| State | Type | Purpose |
|---|---|---|
| `cart` | array | Cart items (persisted via `useLocalStorage`) |
| `menuItems` | array | Dishes from API (or local fallback) |
| `activeView` | string | `menu` / `history` / `rank` / `home` / `settings` |
| `searchQuery` | string | Global search string from Header |
| `selectedOrder` | object | Currently viewed order in HistoryPage |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Backend API base URL
REACT_APP_API_BASE_URL=https://api.chenmo1212.cn

# Secret code required to submit an order
REACT_APP_SECRET_CODE=your_secret_word
```

> ⚠️ `REACT_APP_SECRET_CODE` **must** be set. Without it, order submission will always fail with an "Incorrect code" error.

---

## 🎯 Key Features

- **Bilingual UI** — English / Chinese toggle, persisted in `localStorage`
- **Live API + local fallback** — dishes load from backend; falls back to `menuData.js` silently
- **Cart persistence** — cart survives page refresh via `localStorage`
- **Custom dish requests** — add any off-menu item via `CustomDishModal`
- **Order history** — on-process and completed tabs with detail panel and edit/delete/restore
- **Rank leaderboard** — top-10 dishes by order count with animated podium
- **Sound effects** — tap and add-to-cart sounds via Howler.js
- **Secret code gate** — `OrderSummaryModal` requires a passphrase before submitting

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Edit .env.local and set REACT_APP_SECRET_CODE
```

### 3. Start development server
```bash
npm start
```

### 4. Build for production
```bash
npm run build
```

---

## 🔧 Menu Data Sync

When you update dish data locally in [`src/data/menuData.js`](src/data/menuData.js), sync it to the database:

```bash
npm run sync-menu
```

The script compares local dishes against the database by `name` and creates or updates records as needed. It prints a summary of created / updated / skipped / errored dishes.

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `react` ^19 | UI framework |
| `react-dom` ^19 | DOM renderer |
| `howler` ^2.2 | Audio playback (sound effects) |
| `@fortawesome/react-fontawesome` ^0.2 | Icon library |
| `tailwindcss` ^3.4 | Utility-first CSS |

---

**Last Updated:** 2025-07-10
