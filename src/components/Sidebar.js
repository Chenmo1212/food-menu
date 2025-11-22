import React from 'react';

function NavItem({ icon, label, active }) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer group relative px-4">
      <div className={`p-3 rounded-xl transition-colors ${
        active 
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
          : 'bg-transparent text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-400'
      }`}>
        <span className="text-xl">{icon}</span>
      </div>
      <span className={`text-xs font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-24 bg-white flex-col items-center py-8 shadow-lg z-10 rounded-r-3xl">
      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 font-bold text-2xl mb-10">
        C
      </div>
      
      <nav className="flex-1 flex flex-col gap-8 w-full">
        <NavItem icon="🏠" label="Home" />
        <NavItem icon="🍱" label="Menu" active />
        <NavItem icon="🕐" label="History" />
        <NavItem icon="👜" label="Order" />
        <NavItem icon="🔔" label="Alert" />
        <NavItem icon="⚙️" label="Settings" />
      </nav>

      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-md">
          <img src="https://i.pravatar.cc/150?u=boyfriend" alt="Profile" />
        </div>
      </div>
    </aside>
  );
}

// Made with Bob
