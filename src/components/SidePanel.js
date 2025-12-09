import React, { useRef, useEffect } from 'react';
import { TimesIcon } from '../utils/iconMapping';

/**
 * SidePanel - A reusable side panel component
 *
 * @param {boolean} isOpen - Controls panel visibility
 * @param {function} onClose - Callback when panel closes
 * @param {string} title - Panel title
 * @param {string} description - Optional description text below title
 * @param {React.ReactNode} children - Main content area
 * @param {React.ReactNode} footer - Footer content (buttons, etc.)
 * @param {string} width - Panel width class (default: 'w-full sm:w-96')
 * @param {boolean} showBackdrop - Show backdrop overlay on mobile (default: true)
 * @param {boolean} closeOnClickOutside - Close when clicking outside (default: false)
 * @param {boolean} closeOnEscape - Close when pressing ESC key (default: true)
 * @param {boolean} showCloseButton - Show close button in header (default: true)
 * @param {string} position - Panel position 'left' or 'right' (default: 'right')
 */
export default function SidePanel({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'w-full sm:w-96',
  showBackdrop = true,
  closeOnClickOutside = false,
  closeOnEscape = true,
  showCloseButton = true,
  position = 'right'
}) {
  const panelRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Slide animation classes for mobile only
  const mobileSlideClasses = position === 'left'
    ? isOpen ? 'left-0' : '-left-full'
    : isOpen ? 'right-0' : '-right-full';

  // Border radius based on position
  const borderRadius = position === 'left' ? 'rounded-r-3xl' : 'rounded-l-3xl';

  return (
    <>
      {/* Backdrop Overlay - Mobile only, shown when panel is open */}
      {showBackdrop && isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <aside
        ref={panelRef}
        className={`
          fixed lg:relative
          ${mobileSlideClasses} lg:left-auto lg:right-auto
          top-0 lg:top-auto h-full
          ${width}
          bg-white
          ${borderRadius}
          flex flex-col
          transition-all duration-300 ease-in-out
          z-50 lg:z-auto
        `}
      >
        {/* Header */}
        {title && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="lg:hidden w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close panel"
                >
                  <TimesIcon />
                </button>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-600 mt-2">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

// Made with Bob