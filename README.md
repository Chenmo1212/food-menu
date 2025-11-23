# Food Menu App - Project Structure

## 📁 File Organization

```
food-menu/
│
├── public/                      # Static files
│   ├── index.html
│   └── ...
│
├── src/
│   ├── components/              # ✨ NEW: Reusable components
│   │   ├── Sidebar.js          # Desktop left navigation (hidden on mobile)
│   │   ├── MobileNav.js        # Mobile bottom navigation (hidden on desktop)
│   │   ├── Header.js           # Page header with search bar
│   │   ├── CategoryFilter.js   # Category selection buttons
│   │   ├── MenuGrid.js         # Grid container for menu items
│   │   ├── MenuItem.js         # Individual menu item card
│   │   ├── Cart.js             # Shopping cart (sidebar/overlay)
│   │   └── CartItem.js         # Individual cart item row
│   │
│   ├── data/                    # ✨ NEW: Data files
│   │   └── menuData.js         # Menu items & categories
│   │
│   ├── App.js                   # ✅ REFACTORED: Main app (now clean!)
│   ├── icons.js                 # Entry point
│   ├── index.css                # ✅ UPDATED: Global styles + utilities
│   └── ...
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── REFACTORING_GUIDE.md         # ✨ NEW: Detailed guide
└── PROJECT_STRUCTURE.md         # ✨ NEW: This file
```

## 🔄 Component Hierarchy

```
App
├── Sidebar (Desktop only)
│   └── NavItem (x6)
│
├── Main Content
│   ├── Header
│   │   └── Search Input
│   │
│   ├── CategoryFilter
│   │   └── Category Buttons (x5)
│   │
│   └── MenuGrid
│       └── MenuItem (x6)
│           └── Add to Order Button
│
├── Cart (Responsive)
│   ├── Cart Header
│   ├── Dine In/Take Away Toggle
│   ├── Cart Items List
│   │   └── CartItem (multiple)
│   │       └── Quantity Controls
│   ├── Totals Summary
│   └── Print Bills Button
│
└── MobileNav (Mobile/Tablet only)
    └── NavButton (x5)
```

## 📱 Responsive Behavior

### Desktop (≥ 1024px)
```
┌─────────┬──────────────────────────┬─────────────┐
│         │                          │             │
│ Sidebar │    Main Content          │    Cart     │
│         │    - Header              │  (Sidebar)  │
│ (Fixed) │    - Categories          │             │
│         │    - Menu Grid (3 cols)  │  (Fixed)    │
│         │                          │             │
└─────────┴──────────────────────────┴─────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────────┐
│         Main Content                 │
│         - Header                     │
│         - Categories                 │
│         - Menu Grid (2 cols)         │
│                                      │
│                          [Cart Btn]  │ ← Floating
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│     Bottom Navigation Bar            │
└──────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────────┐
│    Main Content        │
│    - Header (stacked)  │
│    - Categories        │
│    - Menu Grid (2 col) │
│                        │
│            [Cart Btn]  │ ← Floating
└────────────────────────┘
┌────────────────────────┐
│  Bottom Navigation     │
└────────────────────────┘

When Cart Opens:
┌────────────────────────┐
│ [Overlay]   │  Cart    │
│             │  Panel   │
│             │  [X]     │
│             │          │
│             │  Items   │
│             │          │
│             │  Total   │
└─────────────┴──────────┘
```

## 🎨 Component Responsibilities

### **Sidebar.js**
- Desktop navigation
- Logo/branding
- Navigation items with icons
- User profile avatar
- Hidden on mobile/tablet

### **MobileNav.js**
- Bottom navigation bar
- 5 main navigation items
- Active state highlighting
- Only visible on mobile/tablet

### **Header.js**
- Welcome message
- Search input
- Responsive layout (stacked on mobile)

### **CategoryFilter.js**
- Category selection buttons
- Horizontal scrollable on mobile
- Active category highlighting
- Receives: `activeCategory`, `onCategoryChange`

### **MenuGrid.js**
- Container for menu items
- Section title with item count
- Responsive grid (2-3 columns)
- Receives: `items`, `activeCategory`, `onAddToCart`

### **MenuItem.js**
- Individual menu item card
- Product image (circular)
- Name, price, stock info
- "Add to Order" button
- Receives: `item`, `onAddToCart`

### **Cart.js**
- Shopping cart display
- Responsive (sidebar/overlay)
- Floating button on mobile
- Order summary and totals
- Checkout button
- Receives: `cart`, `onUpdateQty`, `onCheckout`

### **CartItem.js**
- Individual cart item row
- Product image and details
- Quantity controls (+/-)
- Price calculation
- Receives: `item`, `onUpdateQty`

## 📊 Data Flow

```
menuData.js
    ↓
  App.js (State Management)
    ├── activeCategory
    ├── cart
    ├── addToCart()
    ├── updateQty()
    └── handleCheckout()
    ↓
Components (Props)
    ├── CategoryFilter ← activeCategory, onCategoryChange
    ├── MenuGrid ← items, activeCategory, onAddToCart
    └── Cart ← cart, onUpdateQty, onCheckout
```

## 🔧 State Management

All state is managed in `App.js`:

```javascript
const [cart, setCart] = useState([...])
const [activeCategory, setActiveCategory] = useState('Pizza')
```

Functions:
- `addToCart(item)` - Add item to cart or increment quantity
- `updateQty(id, delta)` - Update item quantity (+1 or -1)
- `handleCheckout(total)` - Process checkout

## 🎯 Key Features

### ✅ Responsive Design
- Mobile-first approach
- Tailwind breakpoints (sm, md, lg, xl)
- Adaptive layouts for all screen sizes

### ✅ Component Separation
- Single Responsibility Principle
- Reusable components
- Clean prop interfaces

### ✅ User Experience
- Smooth transitions
- Intuitive mobile cart
- Touch-friendly buttons
- Horizontal scroll for categories

### ✅ Code Organization
- Separated data from logic
- Clear file structure
- Easy to maintain and extend

## 📈 Lines of Code Comparison

**Before Refactoring:**
- App.js: ~224 lines (everything in one file)

**After Refactoring:**
- App.js: ~80 lines (clean and focused)
- Components: ~8 files (~30-40 lines each)
- Data: 1 file (~56 lines)
- **Total: Better organized, more maintainable!**

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Test responsive design:**
   - Resize browser window
   - Use browser DevTools device toolbar
   - Test on actual devices

## 📚 Related Documentation

- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Detailed refactoring guide
- [README.md](./README.md) - Project overview
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Styling reference

---

**Last Updated:** 2025-11-22