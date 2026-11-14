import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, MapPin, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESTAURANT_LOCATION } from '../data/karachiAreas';
import { HERO_SLIDES, type MenuCategory } from '../data/menuData';

interface HeroSliderProps {
  onSelectCategory: (category: MenuCategory) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectCategory }) => {
  const { locationState, setShowLocationModal } = useApp();
  const [index, setIndex] = useState(0);

  // Continuous 3-second infinite auto-sliding loop
  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const current = HERO_SLIDES[index];

  const handleCtaClick = () => {
    onSelectCategory(current.targetCategory);
    const menuEl = document.getElementById('menu-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="top" className="w-full">
      <div className="relative w-full h-[360px] sm:h-[430px] lg:h-[500px] overflow-hidden bg-[#fdf0ee] dark:bg-[#130507] transition-colors duration-300">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={current.image}
              alt={current.title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            {/* Light Mode: Bright 20% Creamy-Red Left/Bottom Scrim | Dark Mode: Rich 70% Crimson-Black Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#fdf0ee] via-[#fdf0ee]/55 to-[#fdf0ee]/15 dark:from-[#0b0304]/92 dark:via-[#140507]/55 dark:to-black/25 transition-colors duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fdf0ee]/95 via-[#fdf0ee]/78 to-transparent dark:from-[#0b0304]/85 dark:via-[#140507]/45 dark:to-transparent transition-colors duration-300" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 flex flex-col justify-end pb-7 sm:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300 tracking-wide">
                {current.eyebrow}
              </p>
              <h1 className="mt-1.5 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#240a0d] dark:text-white leading-[1.1] text-balance">
                {current.title}
              </h1>
              <p className="mt-2.5 text-xs sm:text-base text-[#4d1d22] dark:text-stone-200/95 leading-relaxed max-w-xl font-medium">
                {current.subtitle}
              </p>

              <p className="mt-2.5 text-xs sm:text-sm font-semibold text-red-800 dark:text-amber-200/90">
                Dine-In · Takeaway · Home Delivery · Online Ordering
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleCtaClick}
                  className="max-w-full overflow-hidden px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-xs sm:text-sm font-semibold leading-tight text-center shadow-lg shadow-red-950/25 transition-all cursor-pointer"
                >
                  {current.ctaLabel}
                </button>

                <a
                  href={RESTAURANT_LOCATION.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-full overflow-hidden px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#fff8f6]/90 hover:bg-white dark:bg-white/15 dark:hover:bg-white/25 backdrop-blur-md border border-[#ebcac4] dark:border-white/25 text-[#240a0d] dark:text-white text-xs sm:text-sm font-semibold leading-tight inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-xs"
                >
                  <Navigation className="w-4 h-4 text-red-700 dark:text-red-300 shrink-0" />
                  <span>Find on Google Maps</span>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Dots + Arrows */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === index
                      ? 'w-8 bg-red-600 dark:bg-red-500'
                      : 'w-2.5 bg-[#9e5c63]/40 dark:bg-white/40 hover:bg-red-600/70 dark:hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setIndex(
                    (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
                  )
                }
                aria-label="Previous slide"
                className="p-2 rounded-lg bg-[#fff8f6]/90 hover:bg-white dark:bg-black/45 dark:hover:bg-black/70 border border-[#ebcac4] dark:border-white/20 text-[#240a0d] dark:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                aria-label="Next slide"
                className="p-2 rounded-lg bg-[#fff8f6]/90 hover:bg-white dark:bg-black/45 dark:hover:bg-black/70 border border-[#ebcac4] dark:border-white/20 text-[#240a0d] dark:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Active Area & Service Bar Directly Below Hero */}
      <div className="border-b border-[#ebcac4] dark:border-[#3d151a] bg-[#fae4e0] dark:bg-[#19080a] transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
            <div className="text-xs sm:text-sm leading-snug">
              <span className="font-semibold text-[#240a0d] dark:text-white">
                {locationState.orderType}
              </span>
              <span className="mx-1.5 text-[#8a5d62] dark:text-red-200/50">·</span>
              <span className="text-[#5e2a30] dark:text-red-100/85">
                {locationState.orderType === 'Delivery'
                  ? locationState.areaName
                  : 'Sector 5-A/1, Madiha Road, North Karachi'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Change Area / Mode
          </button>
        </div>
      </div>
    </section>
  );
};
