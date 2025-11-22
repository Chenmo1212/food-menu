import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import MenuGrid from './components/MenuGrid';
import Cart from './components/Cart';
import { MENU_ITEMS } from './data/menuData';

export default function App() {
  const [cart, setCart] = useState([
    {
      id: 101,
      name: 'Orange Juice',
      price: 2.87,
      qty: 4,
      note: 'Less Ice',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60'
    },
  ]);
  const [activeCategory, setActiveCategory] = useState('Pizza');

  // Add to cart logic
  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // Update quantity
  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  // Handle checkout
  const handleCheckout = (total) => {
    alert(`Order placed for my love! Total: $${total.toFixed(2)}`);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* Left Sidebar Navigation - Hidden on mobile */}
      <Sidebar />

      {/* Main Content Area - Responsive with bottom padding for mobile nav */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
        <Header />
        
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <MenuGrid
          items={MENU_ITEMS}
          activeCategory={activeCategory}
          onAddToCart={addToCart}
        />
      </main>

      {/* Right Sidebar (Order Summary) - Responsive */}
      <Cart
        cart={cart}
        onUpdateQty={updateQty}
        onCheckout={handleCheckout}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}

// Made with Bob
