import React from 'react';
import { MenuIcon } from '../utils/iconMapping';
import soundManager from '../utils/soundManager';

function NavItem({ IconComponent, label, active, onClick }) {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer group relative px-4"
      onClick={() => {
        soundManager.playTap();
        onClick();
      }}
    >
      <div className={`p-3 rounded-xl transition-colors ${
        active
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
          : 'bg-transparent text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-400'
      }`}>
        {IconComponent && <IconComponent className="text-xl" />}
      </div>
      <span className={`text-xs font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <aside className="hidden lg:flex w-24 bg-white flex-col items-center py-8 shadow-lg z-10 rounded-r-3xl">
      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 font-bold text-2xl mb-10">
        C
      </div>
      
      <nav className="flex-1 flex flex-col gap-8 w-full">
        {/* <NavItem
          IconComponent={HomeIcon}
          label="Home"
          active={activeView === 'home'}
          onClick={() => onViewChange('home')}
        /> */}
        <NavItem
          IconComponent={MenuIcon}
          label="Menu"
          active={activeView === 'menu'}
          onClick={() => onViewChange('menu')}
        />
        {/* <NavItem
          IconComponent={ClockIcon}
          label="History"
          active={activeView === 'history'}
          onClick={() => onViewChange('history')}
        /> */}
        {/* <NavItem
          IconComponent={OrderIcon}
          label="Order"
          active={activeView === 'order'}
          onClick={() => onViewChange('order')}
        /> */}
        {/* <NavItem
          IconComponent={RankIcon}
          label="Rank"
          active={activeView === 'rank'}
          onClick={() => onViewChange('rank')}
        />
        <NavItem
          IconComponent={SettingsIcon}
          label="Settings"
          active={activeView === 'settings'}
          onClick={() => onViewChange('settings')}
        /> */}
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
