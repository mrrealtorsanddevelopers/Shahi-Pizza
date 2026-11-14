import React from 'react';
import { motion } from 'motion/react';
import { Moon, ShoppingBag, Sun, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LOGO_IMAGE, type MenuCategory } from '../data/menuData';

export const GoogleLogoSvg: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.09.73-2.48 1.16-4.22 1.16-3.24 0-5.99-2.19-6.97-5.13H1.04v3.14C3.05 21.14 7.24 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.03 14.02c-.25-.73-.39-1.52-.39-2.32s.14-1.59.39-2.32V6.24H1.04A11.98 11.98 0 0 0 0 11.7c0 1.93.46 3.76 1.04 5.46l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.79 0 3.4.62 4.67 1.83l3.5-3.5C18.07 1.19 15.3 0 12 0 7.24 0 3.05 2.86 1.04 6.24l3.99 3.14c.98-2.94 3.73-4.63 6.97-4.63Z"
    />
  </svg>
);

interface NavbarProps {
  onSelectCategory?: (category: MenuCategory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectCategory }) => {
  const {
    theme,
    toggleTheme,
    user,
    cartCount,
    cartIconRef,
    cartBounceKey,
    setIsCartOpen,
    setIsDashboardOpen,
    setIsAuthModalOpen,
  } = useApp();

  const scrollToSection = (id: string, category?: MenuCategory) => {
    if (category && onSelectCategory) {
      onSelectCategory(category);
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full border-b border-[#ebcac4] dark:border-[#3d151a] bg-[#fdf0ee]/95 dark:bg-[#110406]/95 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Brand Mark */}
        <a
          href="#top"
          className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap shrink-0 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg"
        >
          <img
            src={LOGO_IMAGE}
            alt="Shahi Pizza Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 ring-red-600/40 shrink-0"
          />
          <span className="font-display text-base sm:text-xl font-bold tracking-tight text-[#240a0d] dark:text-[#fdf4f3]">
            Shahi Pizza
          </span>
        </a>

        {/* Zone 2: Clean Desktop Navigation Links (No mobile hamburger) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#5e2a30] dark:text-red-100/85"
        >
          <button
            type="button"
            onClick={() => scrollToSection('menu-section', 'Pizza Deals')}
            className="hover:text-red-700 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Deals
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('menu-section', 'Special Pizzas')}
            className="hover:text-red-700 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pizza Flavours
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('menu-section', 'BBQ Tikka Deals')}
            className="hover:text-red-700 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            BBQ &amp; Rolls
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('location-footer')}
            className="hover:text-red-700 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Find Us
          </button>
        </nav>

        {/* Zone 3: Theme Toggle + Google Account + Always-Visible Cart Count */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="h-9 w-9 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-xl border border-[#e7c2bc] dark:border-[#461920] bg-[#fae4e0] dark:bg-[#1f090c] text-[#3d1216] dark:text-red-100 hover:border-red-600 transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-red-800" />
            )}
          </button>

          {user ? (
            <button
              type="button"
              onClick={() => setIsDashboardOpen(true)}
              className="h-9 sm:h-10 px-2.5 sm:px-3 inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[#e7c2bc] dark:border-[#461920] bg-[#fff8f6] dark:bg-[#1f090c] text-[#240a0d] dark:text-white hover:border-red-600 transition-colors text-xs sm:text-sm font-semibold max-w-[130px] sm:max-w-[180px] overflow-hidden shrink-0 cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Customer'}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <UserIcon className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">
                {user.displayName?.split(' ')[0] || 'Account'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-9 sm:h-10 px-2.5 sm:px-3.5 inline-flex items-center gap-1.5 rounded-xl border border-[#e7c2bc] dark:border-[#461920] bg-[#fff8f6] dark:bg-[#1f090c] text-[#240a0d] dark:text-white hover:border-red-600 transition-colors text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <GoogleLogoSvg className="w-4 h-4 shrink-0" />
              <span>Sign In</span>
            </button>
          )}

          <motion.button
            ref={cartIconRef}
            key={cartBounceKey}
            initial={cartBounceKey > 0 ? { scale: 1 } : false}
            animate={
              cartBounceKey > 0
                ? {
                    scale: [1, 1.24, 0.92, 1.08, 1],
                    rotate: [0, -10, 10, -4, 0],
                  }
                : {}
            }
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open cart with ${cartCount} items`}
            className="h-9 sm:h-10 px-2.5 sm:px-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-950/25 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Cart</span>
            <span className="font-tabular inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-md bg-black/25 text-white text-xs font-bold">
              {cartCount}
            </span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
