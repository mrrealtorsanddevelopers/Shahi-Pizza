import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Tag, X } from 'lucide-react';
import type { MenuCategory } from '../data/menuData';

interface PromoItem {
  id: string;
  shortText: string;
  fullText: string;
  ctaLabel: string;
  targetCategory: MenuCategory;
}

const RUNNING_PROMOS: PromoItem[] = [
  {
    id: 'promo-pizza-2',
    shortText: 'Pizza Deal 2 · 2 Small Pizzas + Drink Rs. 600',
    fullText: 'Running Deal · Pizza Deal 2: 2 Small Pizzas + 300ml Drink for Rs. 600',
    ctaLabel: 'Order Deal',
    targetCategory: 'Pizza Deals',
  },
  {
    id: 'promo-pizza-1',
    shortText: 'Pizza Deal 1 · 2 Large Pizzas Rs. 1,200',
    fullText: 'Best Seller · Pizza Deal 1: 2 Large Pizzas of your choice for Rs. 1,200',
    ctaLabel: 'View Pizza Deals',
    targetCategory: 'Pizza Deals',
  },
  {
    id: 'promo-roll-7',
    shortText: 'Deal 7 · Jumbo Zinger Roll + Drink Rs. 300',
    fullText: 'Quick Value · Deal 7: Jumbo Zinger Roll + 300ml Cold Drink for Rs. 300',
    ctaLabel: 'Explore Rolls',
    targetCategory: 'Roll Deals',
  },
  {
    id: 'promo-family-10',
    shortText: 'Family Deal 10 · Complete Feast Rs. 1,550',
    fullText: 'Family Feast · Deal 10: Tikka, 2 Rolls, Zinger, Club & 1L Drink for Rs. 1,550',
    ctaLabel: 'Explore Feast',
    targetCategory: 'Family Feast',
  },
];

const DISMISS_STORAGE_KEY = 'shahi_promo_banner_dismissed';

interface PromoBannerProps {
  onSelectCategory: (category: MenuCategory) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  onSelectCategory,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    if (dismissed) return;
    const timer = window.setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % RUNNING_PROMOS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const current = RUNNING_PROMOS[promoIndex];

  const handleExplore = () => {
    onSelectCategory(current.targetCategory);
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.div
          key="shahi-promo-banner"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-b border-red-950/30 dark:border-red-900/50 bg-gradient-to-r from-[#8f1218] via-[#b91c1c] to-[#7c1015] text-white"
          role="region"
          aria-label="Current running deals"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-[38px] py-1.5 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-center justify-start sm:justify-center gap-2 overflow-hidden">
              <Tag className="w-3.5 h-3.5 text-amber-300 shrink-0" />

              <div className="min-w-0 flex-1 sm:flex-initial overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={current.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="text-[11px] sm:text-xs font-medium tracking-tight truncate"
                  >
                    <span className="sm:hidden">{current.shortText}</span>
                    <span className="hidden sm:inline">{current.fullText}</span>
                  </motion.p>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={handleExplore}
                className="shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-200 hover:text-white underline underline-offset-2 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>{current.ctaLabel}</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss promotional banner"
              title="Dismiss banner"
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
