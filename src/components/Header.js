import React from 'react';

export default function Header({ searchQuery, onSearchChange }) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Welcome, Yuan Bao ❤️</h1>
        <p className="text-gray-500 text-sm">What would you like to eat today?</p>
      </div>
      <div className="relative w-full md:w-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search category or menu..."
          className="pl-10 pr-4 py-3 rounded-xl bg-white w-full md:w-80 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
        />
        <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </header>
  );
}

// Made with Bob
