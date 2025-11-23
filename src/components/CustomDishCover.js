import React from 'react';

export default function CustomDishCover({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Background */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <linearGradient id="plateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f0f0f0" stopOpacity="0.9" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="400" height="300" fill="url(#bgGradient)" />

      {/* Decorative circles */}
      <circle cx="50" cy="50" r="30" fill="white" opacity="0.1" />
      <circle cx="350" cy="250" r="40" fill="white" opacity="0.1" />
      <circle cx="320" cy="60" r="20" fill="white" opacity="0.15" />
      <circle cx="80" cy="240" r="25" fill="white" opacity="0.12" />

      {/* Plate */}
      <g filter="url(#shadow)">
        <ellipse cx="200" cy="180" rx="120" ry="100" fill="url(#plateGradient)" />
        <ellipse cx="200" cy="180" rx="110" ry="90" fill="none" stroke="#e0e0e0" strokeWidth="2" />
      </g>

      {/* Fork (left) */}
      <g transform="translate(120, 120)">
        {/* Fork handle */}
        <rect x="0" y="0" width="8" height="80" rx="4" fill="#9333ea" opacity="0.8" />
        {/* Fork prongs */}
        <rect x="-6" y="-15" width="4" height="20" rx="2" fill="#9333ea" opacity="0.8" />
        <rect x="2" y="-15" width="4" height="20" rx="2" fill="#9333ea" opacity="0.8" />
        <rect x="10" y="-15" width="4" height="20" rx="2" fill="#9333ea" opacity="0.8" />
      </g>

      {/* Knife (right) */}
      <g transform="translate(272, 120)">
        {/* Knife handle */}
        <rect x="0" y="0" width="8" height="80" rx="4" fill="#9333ea" opacity="0.8" />
        {/* Knife blade */}
        <path d="M 0 -15 L 4 -25 L 8 -15 Z" fill="#c084fc" opacity="0.9" />
        <rect x="0" y="-15" width="8" height="15" fill="#c084fc" opacity="0.9" />
      </g>

      {/* Sparkles */}
      <g opacity="0.6">
        <path d="M 200 80 L 202 85 L 207 87 L 202 89 L 200 94 L 198 89 L 193 87 L 198 85 Z" fill="white" />
        <path d="M 160 140 L 161 143 L 164 144 L 161 145 L 160 148 L 159 145 L 156 144 L 159 143 Z" fill="white" />
        <path d="M 240 140 L 241 143 L 244 144 L 241 145 L 240 148 L 239 145 L 236 144 L 239 143 Z" fill="white" />
        <path d="M 200 240 L 202 245 L 207 247 L 202 249 L 200 254 L 198 249 L 193 247 L 198 245 Z" fill="white" />
      </g>

      {/* Text */}
      <text
        x="200"
        y="270"
        textAnchor="middle"
        fill="white"
        fontSize="24"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        opacity="0.9"
      >
        Custom Dish
      </text>
    </svg>
  );
}

// Made with Bob