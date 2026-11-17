import IMG_HERO_PIZZA from '../assets/images/hero_shahi_pizza_feast_1794584957378.webp';
import IMG_HERO_BBQ from '../assets/images/hero_charcoal_bbq_grill_1794584958159.webp';
import IMG_HERO_COMBO from '../assets/images/hero_zinger_rolls_combo_1794584959259.webp';

import IMG_PIZZA_TIKKA from '../assets/images/dish_pizza_tikka_1794584958533.webp';
import IMG_PIZZA_MALAI from '../assets/images/dish_pizza_malai_creamy_1794584959202.webp';
import IMG_PIZZA_CLASSIC from '../assets/images/dish_pizza_classic_veggie_1794584959277.webp';
import IMG_ZINGER from '../assets/images/dish_zinger_burger_1794584959675.webp';
import IMG_CLUB from '../assets/images/dish_club_sandwich_1794584959974.webp';
import IMG_BBQ from '../assets/images/dish_bbq_tikka_platter_1794584962058.webp';
import IMG_ROLLS from '../assets/images/dish_paratha_rolls_1794584967319.webp';

export type MenuCategory =
  | 'Pizza Deals'
  | 'Special Pizzas'
  | 'Classic Pizzas'
  | 'Zinger Deals'
  | 'BBQ Tikka Deals'
  | 'Roll Deals'
  | 'Club & Combos'
  | 'Family Feast';

export type PizzaSize = 'Small' | 'Regular' | 'Large';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  image: string;
  price: number;
  hasSizes?: boolean;
  sizes?: Record<PizzaSize, number>;
  tag?: string;
  canonicalId?: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  targetCategory: MenuCategory;
}

export const LOGO_IMAGE = '/assets/aistudio/Shahi_Pizza_Logo_05ab8ccd.jpg';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: 'Shahi Pizza — Fast Food & Bar B Q · North Karachi',
    title: 'Handcrafted Pizzas & Hot Pizza Deals',
    subtitle:
      '16 signature pizza flavours starting from Rs. 300 and loaded Pizza Deals starting from Rs. 600, freshly baked to order.',
    image: IMG_HERO_PIZZA,
    ctaLabel: 'Explore Pizza Deals',
    targetCategory: 'Pizza Deals',
  },
  {
    id: 'slide-2',
    eyebrow: 'Live Charcoal Grill · Sector 5-A/1, Madiha Road',
    title: 'Charcoal BBQ Tikka & Family Feast Deals',
    subtitle:
      'Smoky Chicken Tikka Leg, Tikka Chest, Bihari Tikka, flaky parathas, and complete Family Deal 10 feasts.',
    image: IMG_HERO_BBQ,
    ctaLabel: 'Explore BBQ Tikka Deals',
    targetCategory: 'BBQ Tikka Deals',
  },
  {
    id: 'slide-3',
    eyebrow: 'Zinger Burgers · Club Sandwiches · Paratha Rolls',
    title: 'Crispy Zinger Deals & Stuffed Paratha Rolls',
    subtitle:
      'Jumbo Zinger combos, toasted Club Sandwiches, and crispy Kabab, Malai & Beef rolls available for Dine-In, Takeaway & Delivery.',
    image: IMG_HERO_COMBO,
    ctaLabel: 'Explore Zinger Deals',
    targetCategory: 'Zinger Deals',
  },
];

export const MENU_CATEGORIES: MenuCategory[] = [
  'Pizza Deals',
  'Special Pizzas',
  'Classic Pizzas',
  'Zinger Deals',
  'BBQ Tikka Deals',
  'Roll Deals',
  'Club & Combos',
  'Family Feast',
];

const PIZZA_SIZES: Record<PizzaSize, number> = {
  Small: 300,
  Regular: 450,
  Large: 700,
};

export const MENU_ITEMS: MenuItem[] = [
  // ================= PIZZA DEALS (1–6 from uploaded menu cards) =================
  {
    id: 'deal-pizza-1',
    name: 'Pizza Deal 1',
    category: 'Pizza Deals',
    description: '2 Large Pizzas of your choice baked fresh with rich mozzarella cheese.',
    image: IMG_HERO_PIZZA,
    price: 1200,
    tag: 'Best Seller',
  },
  {
    id: 'deal-pizza-2',
    name: 'Pizza Deal 2',
    category: 'Pizza Deals',
    description: '2 Small Pizzas + 1 Cold Drink (300ml).',
    image: IMG_PIZZA_TIKKA,
    price: 600,
  },
  {
    id: 'deal-pizza-3',
    name: 'Pizza Deal 3',
    category: 'Pizza Deals',
    description: '1 Large Pizza + 1 Regular Pizza + 1 Cold Drink (300ml).',
    image: IMG_PIZZA_MALAI,
    price: 1000,
    tag: 'Popular',
  },
  {
    id: 'deal-pizza-4',
    name: 'Pizza Deal 4',
    category: 'Pizza Deals',
    description: '3 Large Pizzas + 1 Liter Cold Drink.',
    image: IMG_HERO_PIZZA,
    price: 1850,
    tag: 'Party Pack',
  },
  {
    id: 'deal-pizza-5',
    name: 'Pizza Deal 5',
    category: 'Pizza Deals',
    description: '4 Small Pizzas freshly baked across our flavour menu.',
    image: IMG_PIZZA_CLASSIC,
    price: 1050,
  },
  {
    id: 'deal-pizza-6',
    name: 'Pizza Deal 6',
    category: 'Pizza Deals',
    description: '2 Regular Pizzas + 1 Small Pizza + 1 Cold Drink (300ml).',
    image: IMG_PIZZA_TIKKA,
    price: 1100,
  },

  // ================= SPECIAL PIZZAS (from Pizza Flavours Menu card) =================
  {
    id: 'pizza-special-shahi',
    name: 'Special Shahi Pizza',
    category: 'Special Pizzas',
    description: 'Signature house recipe loaded with spiced chicken, olives, peppers & mozzarella.',
    image: IMG_PIZZA_TIKKA,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
    tag: 'Signature',
  },
  {
    id: 'pizza-malai-boti',
    name: 'Malai Boti',
    category: 'Special Pizzas',
    description: 'Tender cream-marinated chicken malai boti over smooth white sauce & melted cheese.',
    image: IMG_PIZZA_MALAI,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
    tag: 'Best Seller',
  },
  {
    id: 'pizza-afghani-first',
    name: 'Afghani First',
    category: 'Special Pizzas',
    description: 'Aromatic Afghani-spiced chicken chunks with creamy garlic sauce & cheddar-mozzarella.',
    image: IMG_PIZZA_MALAI,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-tikka-creamy',
    name: 'Tikka Creamy',
    category: 'Special Pizzas',
    description: 'Charcoal-spiced chicken tikka balanced with rich herb cream sauce.',
    image: IMG_PIZZA_MALAI,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-bbq-tikka',
    name: 'BBQ Tikka',
    category: 'Special Pizzas',
    description: 'Smoky barbecue glazed chicken tikka chunks, red onions & charred peppers.',
    image: IMG_PIZZA_TIKKA,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-chicken-tikka-special',
    name: 'Chicken Tikka Special',
    category: 'Special Pizzas',
    description: 'Extra-loaded chicken tikka, black olives, jalapenos & bubbling golden mozzarella.',
    image: IMG_PIZZA_TIKKA,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-cheesy-lover',
    name: 'Cheesy Lover',
    category: 'Special Pizzas',
    description: 'Rich mozzarella & cheddar cheese blend baked to a golden stretch.',
    image: IMG_PIZZA_MALAI,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-creamy-cheesy',
    name: 'Creamy Cheesy',
    category: 'Special Pizzas',
    description: 'Velvety garlic cream base topped with extra melted mozzarella and herbs.',
    image: IMG_PIZZA_MALAI,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },

  // ================= CLASSIC PIZZAS (from Pizza Flavours Menu card) =================
  {
    id: 'pizza-chicken-tikka',
    name: 'Chicken Tikka',
    category: 'Classic Pizzas',
    description: 'Classic spiced chicken tikka, sliced onions & signature tomato pizza sauce.',
    image: IMG_PIZZA_TIKKA,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-fajita',
    name: 'Fajita',
    category: 'Classic Pizzas',
    description: 'Fajita-seasoned chicken strips with crisp capsicum, onions & oregano.',
    image: IMG_PIZZA_TIKKA,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-fajita-sicilian',
    name: 'Fajita Sicilian',
    category: 'Classic Pizzas',
    description: 'Zesty Sicilian-style fajita chicken with green chilies, olives & herb sauce.',
    image: IMG_PIZZA_CLASSIC,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-fajita-mushroom',
    name: 'Fajita Mushroom',
    category: 'Classic Pizzas',
    description: 'Fajita chicken paired with roasted mushrooms, sweet peppers & mozzarella.',
    image: IMG_PIZZA_CLASSIC,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-vegetable',
    name: 'Vegetable',
    category: 'Classic Pizzas',
    description: 'Fresh bell peppers, tomatoes, mushrooms, sweet corn, olives & cheese.',
    image: IMG_PIZZA_CLASSIC,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-chicken-o-garlic',
    name: 'Chicken o Garlic',
    category: 'Classic Pizzas',
    description: 'Roasted garlic sauce with tender grilled chicken and mozzarella.',
    image: IMG_PIZZA_MALAI,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },
  {
    id: 'pizza-peri-peri',
    name: 'Peri Peri',
    category: 'Classic Pizzas',
    description: 'Fiery peri peri marinated chicken, jalapenos & tangy tomato base.',
    image: IMG_PIZZA_CLASSIC,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
    tag: 'Spicy',
  },
  {
    id: 'pizza-chicken-classic',
    name: 'Chicken Classic',
    category: 'Classic Pizzas',
    description: 'Timeless grilled chicken, signature pizza sauce & golden mozzarella.',
    image: IMG_PIZZA_CLASSIC,
    price: PIZZA_SIZES.Regular,
    hasSizes: true,
    sizes: PIZZA_SIZES,
  },

  // ================= ZINGER DEALS (from uploaded Deal 1, Deal 2, Deal 5 cards) =================
  {
    id: 'deal-zinger-1',
    name: 'Deal 1 — Zinger & Tikka Combo',
    category: 'Zinger Deals',
    description: '1 Zinger Burger + 1 Tikka Leg + 1 Chicken Roll + 1 Drink (300ml).',
    image: IMG_HERO_COMBO,
    price: 750,
    tag: 'Popular',
  },
  {
    id: 'deal-zinger-2',
    name: 'Deal 2 — Jumbo Zinger Combo',
    category: 'Zinger Deals',
    description: '1 Jumbo Zinger Burger + 1 Tikka Leg + 1 Kabab Roll + 1 Drink (300ml).',
    image: IMG_ZINGER,
    price: 850,
    tag: 'Top Combo',
  },
  {
    id: 'deal-zinger-5',
    name: 'Deal 5 — Double Zinger & Club',
    category: 'Zinger Deals',
    description: '2 Zinger Burgers + 1 Club Sandwich + 1 Cold Drink (300ml).',
    image: IMG_ZINGER,
    price: 900,
  },

  // ================= BBQ TIKKA DEALS (from uploaded Deal 3, Deal 4, Deal 9 cards) =================
  {
    id: 'deal-bbq-4',
    name: 'Deal 4 — 3 Tikka Legs',
    category: 'BBQ Tikka Deals',
    description: '3 Charcoal-Grilled Chicken Tikka Legs served hot with lemon & onions.',
    image: IMG_BBQ,
    price: 600,
    tag: 'BBQ Hit',
  },
  {
    id: 'deal-bbq-9',
    name: 'Deal 9 — Tikka Chest & Leg Meal',
    category: 'BBQ Tikka Deals',
    description: '1 Tikka Chest + 1 Tikka Leg + 2 Parathas + 1 Cold Drink (300ml).',
    image: IMG_HERO_BBQ,
    price: 799,
    tag: 'Full BBQ Meal',
  },
  {
    id: 'deal-bbq-3',
    name: 'Deal 3 — Bihari Tikka & Club Combo',
    category: 'BBQ Tikka Deals',
    description: '1 Club Sandwich + 1 Bihari Tikka + 1 Beef Roll + 1 Drink (300ml).',
    image: IMG_BBQ,
    price: 950,
  },

  // ================= ROLL DEALS (from uploaded Deal 6, Deal 7, Deal 8 cards) =================
  {
    id: 'deal-roll-7',
    name: 'Deal 7 — Jumbo Zinger Roll',
    category: 'Roll Deals',
    description: '1 Zinger Roll Jumbo + 1 Cold Drink (300ml).',
    image: IMG_ROLLS,
    price: 300,
    tag: 'Quick Bite',
  },
  {
    id: 'deal-roll-6',
    name: 'Deal 6 — Triple Roll Platter',
    category: 'Roll Deals',
    description: '1 Kabab Roll + 1 Malai Roll + 1 Beef Roll + 1 Cold Drink (500ml).',
    image: IMG_ROLLS,
    price: 600,
    tag: 'Best Value',
  },
  {
    id: 'deal-roll-8',
    name: 'Deal 8 — 4 Zinger Rolls Pack',
    category: 'Roll Deals',
    description: '4 Crispy Zinger Rolls + 1 Cold Drink (500ml).',
    image: IMG_ROLLS,
    price: 699,
  },

  // ================= CLUB & COMBOS (from uploaded Deal 3, Deal 5, Deal 1 cards) =================
  {
    id: 'combo-club-3',
    canonicalId: 'deal-bbq-3',
    name: 'Deal 3 — Club & Bihari Feast',
    category: 'Club & Combos',
    description: '1 Club Sandwich + 1 Bihari Tikka + 1 Beef Roll + 1 Drink (300ml).',
    image: IMG_CLUB,
    price: 950,
    tag: 'Chef Choice',
  },
  {
    id: 'combo-club-5',
    canonicalId: 'deal-zinger-5',
    name: 'Deal 5 — Club & 2 Zingers',
    category: 'Club & Combos',
    description: '2 Zinger Burgers + 1 Club Sandwich + 1 Cold Drink (300ml).',
    image: IMG_HERO_COMBO,
    price: 900,
  },
  {
    id: 'combo-club-1',
    canonicalId: 'deal-zinger-1',
    name: 'Deal 1 — All-in-One Combo',
    category: 'Club & Combos',
    description: '1 Zinger Burger + 1 Tikka Leg + 1 Chicken Roll + 1 Drink (300ml).',
    image: IMG_HERO_COMBO,
    price: 750,
  },

  // ================= FAMILY FEAST (from uploaded Family Deal 10 & Pizza Deal 4 cards) =================
  {
    id: 'family-deal-10',
    name: 'Family Deal 10 — Full Family Feast',
    category: 'Family Feast',
    description:
      '1 Tikka Chest (Chicken Tikka) + 1 Malai Roll + 1 Zinger Roll + 2 Parathas (Small) + 1 Zinger Burger + 1 Club Sandwich + 1 Raita Salad + 1 Liter Cold Drink.',
    image: IMG_BBQ,
    price: 1550,
    tag: 'Full Family Feast',
  },
  {
    id: 'family-pizza-4',
    canonicalId: 'deal-pizza-4',
    name: 'Pizza Deal 4 — Family Pizza Pack',
    category: 'Family Feast',
    description: '3 Large Pizzas + 1 Liter Cold Drink.',
    image: IMG_HERO_PIZZA,
    price: 1850,
    tag: 'Family Pack',
  },
  {
    id: 'family-pizza-6',
    canonicalId: 'deal-pizza-6',
    name: 'Pizza Deal 6 — Triple Pizza Pack',
    category: 'Family Feast',
    description: '2 Regular Pizzas + 1 Small Pizza + 1 Cold Drink (300ml).',
    image: IMG_PIZZA_TIKKA,
    price: 1100,
  },
];

export function formatPKR(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}
