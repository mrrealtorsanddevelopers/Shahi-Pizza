import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, type AnimationPlaybackControls } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Minus,
  Pizza,
  Plus,
  Sandwich,
  Scroll,
  Search,
  ShoppingBag,
  Tag,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatPKR,
  MENU_CATEGORIES,
  MENU_ITEMS,
  type MenuCategory,
  type MenuItem,
  type PizzaSize,
} from '../data/menuData';

const CATEGORY_ICONS: Record<
  MenuCategory,
  React.ComponentType<{ className?: string }>
> = {
  'Pizza Deals': Tag,
  'Special Pizzas': Crown,
  'Classic Pizzas': Pizza,
  'Zinger Deals': Sandwich,
  'BBQ Tikka Deals': Flame,
  'Roll Deals': Scroll,
  'Club & Combos': UtensilsCrossed,
  'Family Feast': Users,
};

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, index }) => {
  const { addToCart, updateCartQty, getCartQtyForItem } = useApp();
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('Regular');
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const activePrice =
    item.hasSizes && item.sizes ? item.sizes[selectedSize] : item.price;

  const baseId = item.canonicalId || item.id;
  const currentQty = getCartQtyForItem(
    baseId,
    item.hasSizes ? selectedSize : undefined,
  );
  const cartKey = item.hasSizes ? `${baseId}__${selectedSize}` : baseId;

  const handleAdd = () => {
    addToCart(item, item.hasSizes ? selectedSize : undefined, imgRef.current);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.55,
        delay: Math.min((index % 4) * 0.05, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group min-w-0 flex flex-col rounded-2xl border border-[#ebcac4] dark:border-[#3d151a] bg-[#fff8f6] dark:bg-[#170709] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-red-950/10 dark:hover:shadow-black/60 transition-all duration-300"
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#fae4e0] dark:bg-[#240b0e]">
        {!imgError ? (
          <img
            ref={imgRef}
            src={item.image}
            alt={item.name}
            loading={index < 6 ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-red-900/20 to-red-700/10">
            <UtensilsCrossed className="w-7 h-7 text-red-700 dark:text-red-400 mb-1.5" />
            <span className="text-xs font-medium text-[#5e2a30] dark:text-red-200">
              {item.name}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs text-[#7a454b] dark:text-red-200/70">
          <span>{item.category}</span>
          {item.tag && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-red-700 dark:text-red-400">
                {item.tag}
              </span>
            </>
          )}
        </div>

        <h3 className="mt-1 font-display text-sm sm:text-base font-bold text-[#240a0d] dark:text-[#fdf4f3] leading-snug">
          {item.name}
        </h3>

        <p className="mt-1 text-[11px] sm:text-xs text-[#613338] dark:text-red-100/75 leading-relaxed">
          {item.description}
        </p>

        {/* Smooth Sliding Pizza Size Selector */}
        {item.hasSizes && item.sizes && (
          <div className="mt-3 grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#fae4e0] dark:bg-[#250b0e] border border-[#ebcac4] dark:border-[#461920]">
            {(['Small', 'Regular', 'Large'] as PizzaSize[]).map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`relative min-w-0 overflow-hidden py-1.5 px-0.5 rounded-lg text-[10px] sm:text-xs font-semibold leading-tight text-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'text-[#5e2a30] dark:text-red-100/80 hover:text-red-700 dark:hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId={`pizza-size-pill-${item.id}`}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-lg bg-red-700 shadow-xs"
                    />
                  )}
                  <span className="relative z-10 block max-w-full truncate">
                    {sz === 'Small' ? 'Small' : sz === 'Regular' ? 'Reg' : 'Large'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Price + Action Footer */}
        <div className="mt-auto pt-3 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <motion.span
              key={`${item.id}-${selectedSize}`}
              initial={{ opacity: 0.5, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-tabular font-display text-sm sm:text-base font-extrabold text-red-700 dark:text-red-400"
            >
              {formatPKR(activePrice)}
            </motion.span>
            {item.hasSizes && (
              <span className="text-[11px] text-[#7a454b] dark:text-red-200/65">
                {selectedSize}
              </span>
            )}
          </div>

          {currentQty === 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleAdd}
              className="w-full min-w-0 overflow-hidden py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-[11px] sm:text-sm font-semibold inline-flex items-center justify-center gap-1 sm:gap-1.5 leading-tight text-center shadow-sm transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Add to Cart</span>
            </motion.button>
          ) : (
            <div className="w-full min-w-0 overflow-hidden flex items-center justify-between gap-1 rounded-xl border border-emerald-600/60 dark:border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/60 p-1">
              <button
                type="button"
                onClick={() => updateCartQty(cartKey, -1)}
                aria-label={`Decrease quantity of ${item.name}`}
                className="w-6 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-[#0d1f16] text-emerald-700 dark:text-emerald-300 border border-emerald-600/25 hover:bg-emerald-600 hover:text-white inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              <span className="min-w-0 flex-1 inline-flex items-center justify-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-tight px-0.5 overflow-hidden">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Added ({currentQty})</span>
              </span>

              <button
                type="button"
                onClick={handleAdd}
                aria-label={`Increase quantity of ${item.name}`}
                className="w-6 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

interface MenuSectionProps {
  selectedCategory: MenuCategory;
  onSelectCategory: (cat: MenuCategory) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const hasMountedRef = useRef(false);
  const selectedCategoryRef = useRef<MenuCategory>(selectedCategory);
  selectedCategoryRef.current = selectedCategory;

  const activeIndex = Math.max(0, MENU_CATEGORIES.indexOf(selectedCategory));

  // Center the active category inside the scrollable container with natural spring physics
  const centerCategoryButton = useCallback(
    (category: MenuCategory, immediate = false) => {
      const vp = viewportRef.current;
      const btn = buttonRefs.current[category];
      if (!vp || !btn) return;

      const vpRect = vp.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const maxScrollLeft = Math.max(0, vp.scrollWidth - vp.clientWidth);
      const btnCenterInTrack =
        btnRect.left - vpRect.left + vp.scrollLeft + btnRect.width / 2;
      const targetScroll = Math.max(
        0,
        Math.min(maxScrollLeft, btnCenterInTrack - vp.clientWidth / 2),
      );

      scrollAnimRef.current?.stop();

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (immediate || prefersReduced || Math.abs(vp.scrollLeft - targetScroll) < 1) {
        vp.scrollLeft = targetScroll;
        return;
      }

      scrollAnimRef.current = animate(vp.scrollLeft, targetScroll, {
        type: 'spring',
        stiffness: 210,
        damping: 24,
        mass: 0.9,
        onUpdate: (latest) => {
          vp.scrollLeft = latest;
        },
      });
    },
    [],
  );

  // Animate to center when active category changes (instant on initial mount)
  useEffect(() => {
    const isFirst = !hasMountedRef.current;
    hasMountedRef.current = true;
    centerCategoryButton(selectedCategory, isFirst);
  }, [selectedCategory, centerCategoryButton]);

  // Keep selected button centered on viewport resize and initial webfont load
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    let lastWidth = vp.clientWidth;
    const handleSnap = () => centerCategoryButton(selectedCategoryRef.current, true);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        const nextWidth = entries[0]?.contentRect.width ?? vp.clientWidth;
        if (Math.abs(nextWidth - lastWidth) > 0.5) {
          lastWidth = nextWidth;
          handleSnap();
        }
      });
      observer.observe(vp);
    }

    window.addEventListener('resize', handleSnap);
    document.fonts?.ready.then(handleSnap).catch(() => {});

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', handleSnap);
      scrollAnimRef.current?.stop();
    };
  }, [centerCategoryButton]);

  const handleStep = (delta: 1 | -1) => {
    if (searchQuery) setSearchQuery('');
    const total = MENU_CATEGORIES.length;
    const nextIdx = (activeIndex + delta + total) % total;
    const nextCat = MENU_CATEGORIES[nextIdx];
    onSelectCategory(nextCat);
    centerCategoryButton(nextCat, false);
  };

  const { selectedItems, otherCategoryGroups, searchResults } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const seen = new Set<string>();
      const matches = MENU_ITEMS.filter((item) => {
        const key = item.canonicalId || item.id;
        if (seen.has(key)) return false;
        const isMatch =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        if (isMatch) {
          seen.add(key);
          return true;
        }
        return false;
      });
      return {
        selectedItems: [] as MenuItem[],
        otherCategoryGroups: [] as { category: MenuCategory; items: MenuItem[] }[],
        searchResults: matches,
      };
    }

    const currentCategoryItems = MENU_ITEMS.filter(
      (item) => item.category === selectedCategory,
    );
    const seenKeys = new Set(
      currentCategoryItems.map((item) => item.canonicalId || item.id),
    );

    const groups: { category: MenuCategory; items: MenuItem[] }[] = [];
    for (const cat of MENU_CATEGORIES) {
      if (cat === selectedCategory) continue;
      const catItems: MenuItem[] = [];
      for (const item of MENU_ITEMS) {
        if (item.category !== cat) continue;
        const key = item.canonicalId || item.id;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        catItems.push(item);
      }
      if (catItems.length > 0) {
        groups.push({ category: cat, items: catItems });
      }
    }

    return {
      selectedItems: currentCategoryItems,
      otherCategoryGroups: groups,
      searchResults: [] as MenuItem[],
    };
  }, [selectedCategory, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;
  const topCount = isSearching ? searchResults.length : selectedItems.length;

  return (
    <section
      id="menu-section"
      className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-10 sm:pt-5 sm:pb-12"
    >
      {/* Top Row: Search Bar + Active Category Heading & Item Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#854e54] dark:text-red-200/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pizza flavours, deals, zinger, tikka..."
            aria-label="Search menu items"
            className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm rounded-xl border border-[#ebcac4] dark:border-[#461920] bg-[#fff8f6] dark:bg-[#170709] text-[#240a0d] dark:text-white placeholder:text-[#966167] dark:placeholder:text-red-200/45 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a454b] dark:text-red-200/60 hover:text-red-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-baseline justify-between sm:justify-end gap-2">
          <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#240a0d] dark:text-[#fdf4f3]">
            {isSearching
              ? `Results for "${searchQuery.trim()}"`
              : selectedCategory}
          </h2>
          <span className="font-tabular text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 whitespace-nowrap">
            ({topCount})
          </span>
        </div>
      </div>

      {/* Spring-Animated Scroll-Centering Category Carousel (Mobile & Desktop Responsive) */}
      <div className="mt-3 rounded-2xl border border-[#ebcac4] dark:border-[#3d151a] bg-[#fff8f6] dark:bg-[#170709] p-1.5 sm:p-2 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label="Previous menu category"
            className="w-8 h-9 sm:w-9 sm:h-10 rounded-xl border border-[#ebcac4] dark:border-[#461920] bg-[#fae4e0] dark:bg-[#240b0e] text-[#3d1216] dark:text-red-100 hover:bg-red-700 hover:text-white hover:border-red-700 inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={viewportRef}
            role="tablist"
            aria-label="Menu categories"
            onPointerDown={() => scrollAnimRef.current?.stop()}
            onWheel={() => scrollAnimRef.current?.stop()}
            className="relative flex-1 min-w-0 overflow-x-auto no-scrollbar px-1 py-1"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 w-max">
              {MENU_CATEGORIES.map((category) => {
                const isActive = !isSearching && selectedCategory === category;
                const CategoryIcon = CATEGORY_ICONS[category];
                return (
                  <motion.button
                    key={category}
                    ref={(el) => {
                      buttonRefs.current[category] = el;
                    }}
                    whileTap={{ scale: 0.96 }}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => {
                      if (searchQuery) setSearchQuery('');
                      onSelectCategory(category);
                      centerCategoryButton(category, false);
                    }}
                    className={`relative px-3.5 sm:px-5 lg:px-6 lg:min-w-[172px] h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'bg-[#fae4e0] dark:bg-[#240b0e] text-[#471b20] dark:text-red-100/85 border border-[#ebcac4] dark:border-[#461920] hover:border-red-600 hover:text-red-700 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeCategoryHighlight"
                        transition={{
                          type: 'spring',
                          stiffness: 320,
                          damping: 26,
                        }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-700 to-red-600 shadow-md shadow-red-950/25"
                      />
                    )}
                    <CategoryIcon
                      className={`relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                        isActive
                          ? 'text-amber-200'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    />
                    <span className="relative z-10">{category}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label="Next menu category"
            className="w-8 h-9 sm:w-9 sm:h-10 rounded-xl border border-[#ebcac4] dark:border-[#461920] bg-[#fae4e0] dark:bg-[#240b0e] text-[#3d1216] dark:text-red-100 hover:bg-red-700 hover:text-white hover:border-red-700 inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Section: Search Results OR Selected Category Items + Remaining Categories */}
      {isSearching ? (
        searchResults.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {searchResults.map((item, idx) => (
              <MenuCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#ebcac4] dark:border-[#3d151a] bg-[#fff8f6] dark:bg-[#170709] p-8 text-center">
            <p className="font-display text-lg font-bold text-[#240a0d] dark:text-white">
              No items match &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-1 text-sm text-[#613338] dark:text-red-100/70">
              Clear your search or browse our categories above.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('Pizza Deals');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
            >
              Back to Pizza Deals
            </button>
          </div>
        )
      ) : (
        <>
          {/* Subtle animated sweep divider under category selector */}
          <div className="mt-4 sm:mt-5 relative h-px w-full overflow-hidden bg-[#ebcac4]/60 dark:bg-[#3d151a]/70">
            <motion.div
              key={`active-divider-${selectedCategory}`}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left center' }}
              className="h-full w-full bg-gradient-to-r from-red-700/80 via-red-500/45 to-transparent dark:from-red-500/85 dark:via-red-400/40 dark:to-transparent"
            />
          </div>

          <div className="mt-4 sm:mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {selectedItems.map((item, idx) => (
              <MenuCard key={item.id} item={item} index={idx} />
            ))}
          </div>

          {/* Remaining Menu Categories Separated by Subtle Horizontal Animated Dividers */}
          {otherCategoryGroups.map((group) => (
            <div key={group.category} className="mt-8 sm:mt-10">
              {/* Mobile-Responsive Horizontal Animated Category Divider */}
              <div
                aria-hidden="true"
                className="flex items-center gap-2.5 sm:gap-4"
              >
                <div className="relative h-px flex-1 overflow-hidden bg-[#ebcac4]/50 dark:bg-[#3d151a]/60">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: 'right center' }}
                    className="h-full w-full bg-gradient-to-l from-red-700/75 via-red-600/35 to-transparent dark:from-red-500/80 dark:via-red-400/35 dark:to-transparent"
                  />
                </div>

                <motion.span
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="h-1 w-8 sm:w-12 rounded-full bg-gradient-to-r from-red-700 to-red-500 dark:from-red-500 dark:to-red-400 shrink-0"
                />

                <div className="relative h-px flex-1 overflow-hidden bg-[#ebcac4]/50 dark:bg-[#3d151a]/60">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: 'left center' }}
                    className="h-full w-full bg-gradient-to-r from-red-700/75 via-red-600/35 to-transparent dark:from-red-500/80 dark:via-red-400/35 dark:to-transparent"
                  />
                </div>
              </div>

              {/* Category Section Heading */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 sm:mt-5 mb-3.5 sm:mb-4 flex items-baseline justify-between gap-2"
              >
                <h3 className="font-display text-base sm:text-xl font-extrabold tracking-tight text-[#240a0d] dark:text-[#fdf4f3] min-w-0">
                  {group.category}
                </h3>
                <span className="font-tabular text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 whitespace-nowrap shrink-0">
                  ({group.items.length})
                </span>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {group.items.map((item, idx) => (
                  <MenuCard key={item.id} item={item} index={idx} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
};
