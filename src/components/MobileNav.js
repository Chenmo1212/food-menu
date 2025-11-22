import React from 'react';

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-30">
      <div className="flex justify-around items-center py-3">
        <NavButton icon="🏠" label="Home" />
        <NavButton icon="🍱" label="Menu" active />
        <NavButton icon="🕐" label="History" />
        <NavButton icon="👜" label="Order" />
        <NavButton icon="⚙️" label="Settings" />
      </div>
    </nav>
  );
}

function NavButton({ icon, label, active }) {
  return (
    <button className="flex flex-col items-center gap-1">
      <div className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-orange-500 text-white'
          : 'text-gray-400'
      }`}>
        <span className="text-xl">{icon}</span>
      </div>
      <span className={`text-xs font-medium ${
        active ? 'text-orange-500' : 'text-gray-400'
      }`}>
        {label}
      </span>
    </button>
  );
}

// Made with Bob
