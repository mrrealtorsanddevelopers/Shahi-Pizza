import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Check,
  CheckCircle2,
  ClipboardList,
  Crosshair,
  Flame,
  History,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Moon,
  Package,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShoppingBag,
  Store,
  Sun,
  Trash2,
  TrendingUp,
  Truck,
  User as UserIcon,
  Utensils,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateDistanceKm,
  KARACHI_AREAS,
  RESTAURANT_LOCATION,
} from '../data/karachiAreas';
import { formatPKR, LOGO_IMAGE, MENU_ITEMS, type PizzaSize } from '../data/menuData';
import type {
  CartItem,
  OrderItemPayload,
  OrderRecord,
  OrderStatus,
  OrderType,
} from '../types';

function isValidPizzaSize(size?: string): size is PizzaSize {
  return size === 'Small' || size === 'Regular' || size === 'Large';
}

function orderItemToCartItem(oi: OrderItemPayload): CartItem {
  const matched = MENU_ITEMS.find(
    (m) => (m.canonicalId || m.id) === oi.itemId || m.id === oi.itemId,
  );
  const baseId = matched ? matched.canonicalId || matched.id : oi.itemId;
  const resolvedSize: PizzaSize | undefined = isValidPizzaSize(oi.size)
    ? oi.size
    : matched?.hasSizes
      ? 'Regular'
      : undefined;
  const unitPrice = matched
    ? matched.hasSizes && matched.sizes && resolvedSize
      ? matched.sizes[resolvedSize]
      : matched.price
    : oi.unitPrice;
  const key = resolvedSize ? `${baseId}__${resolvedSize}` : baseId;

  return {
    key,
    itemId: baseId,
    name: matched ? matched.name : oi.name,
    ...(resolvedSize ? { size: resolvedSize } : {}),
    unitPrice,
    quantity: Math.max(1, oi.quantity),
    image: matched?.image || LOGO_IMAGE,
  };
}

function orderToCartItems(order: OrderRecord): CartItem[] {
  return order.items.map(orderItemToCartItem);
}

interface CustomerDashboardModalProps {
  onTrackOrder: (order: OrderRecord) => void;
  onEditOrder: (order: OrderRecord) => void;
}

type DashboardTab = 'orders' | 'profile' | 'address' | 'settings';

interface SpendingChartPoint {
  label: string;
  orderNumber: string;
  dateLabel: string;
  total: number;
  orderType: OrderType;
  status: OrderStatus;
}

const STATUS_BADGE_MAP: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  Confirmed: {
    label: 'Confirmed · Editable',
    className:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-600/30',
  },
  Preparing: {
    label: 'Preparing · Locked',
    className:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-600/30',
  },
  'Out for Delivery': {
    label: 'Out for Delivery · Locked',
    className:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-600/30',
  },
  Completed: {
    label: 'Completed',
    className:
      'bg-[#fae4e0] dark:bg-[#2a1215] text-[#5f3b3f] dark:text-red-200/80 border-[#e3c7c2] dark:border-[#3d1f23]',
  },
};

const SpendingTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: SpendingChartPoint }>;
}> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#e3c7c2] dark:border-[#4b1f25] bg-[#fffaf9] dark:bg-[#19090c] px-3 py-2 shadow-lg text-xs text-[#240a0d] dark:text-[#fdf4f3]">
      <p className="font-display font-bold font-tabular">
        Order #{pt.orderNumber}
      </p>
      <p className="text-[11px] text-[#684347] dark:text-red-200/75">
        {pt.dateLabel} · {pt.orderType} · {pt.status}
      </p>
      <p className="mt-1 font-tabular font-display text-sm font-extrabold text-red-700 dark:text-red-400">
        {formatPKR(pt.total)}
      </p>
    </div>
  );
};

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  onTrackOrder,
  onEditOrder,
}) => {
  const {
    isDashboardOpen,
    setIsDashboardOpen,
    user,
    userProfile,
    orders,
    logout,
    updateProfilePreferences,
    confirmLocation,
    locationState,
    theme,
    reorderItemsToCart,
    cartCount,
    clearCart,
    setIsCartOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [recentAddedItemKey, setRecentAddedItemKey] = useState<string | null>(
    null,
  );

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  // Address fields
  const [defaultArea, setDefaultArea] = useState(KARACHI_AREAS[0].name);
  const [defaultAddress, setDefaultAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState<string | null>(null);

  // Settings fields
  const [preferredOrderType, setPreferredOrderType] =
    useState<OrderType>('Delivery');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isDashboardOpen || !user) return;
    setDisplayName(userProfile?.displayName || user.displayName || 'Customer');
    setPhone(userProfile?.phone || '');
    setWhatsappPhone(userProfile?.whatsappPhone || '');
    setDefaultArea(
      userProfile?.defaultArea || locationState.areaName || KARACHI_AREAS[0].name,
    );
    setDefaultAddress(
      userProfile?.defaultAddress || locationState.streetAddress || '',
    );
    setDeliveryInstructions(userProfile?.deliveryInstructions || '');
    setPreferredOrderType(
      userProfile?.preferredOrderType || locationState.orderType || 'Delivery',
    );
    setProfileFeedback(null);
    setAddressFeedback(null);
    setSettingsFeedback(null);
  }, [isDashboardOpen, user, userProfile, locationState]);

  const showTempFeedback = (
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    msg: string,
  ) => {
    setter(msg);
    window.setTimeout(() => setter(null), 2400);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim();
    if (!cleanName) {
      showTempFeedback(setProfileFeedback, 'Please enter your full name.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfilePreferences({
        displayName: cleanName,
        phone: phone.trim(),
        whatsappPhone: whatsappPhone.trim(),
      });
      showTempFeedback(setProfileFeedback, 'Profile & contact details saved');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await updateProfilePreferences({
        defaultArea,
        defaultAddress: defaultAddress.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
      });
      showTempFeedback(setAddressFeedback, 'Delivery address saved');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleApplyToStorefront = () => {
    const areaObj =
      KARACHI_AREAS.find((a) => a.name === defaultArea) || KARACHI_AREAS[0];
    const dist =
      locationState.orderType === 'Delivery'
        ? calculateDistanceKm(
            RESTAURANT_LOCATION.lat,
            RESTAURANT_LOCATION.lng,
            areaObj.lat,
            areaObj.lng,
          )
        : 0;

    confirmLocation({
      orderType: locationState.orderType,
      areaId: areaObj.id,
      areaName: areaObj.name,
      lat: areaObj.lat,
      lng: areaObj.lng,
      distanceKm: dist,
      streetAddress: defaultAddress.trim(),
    });
    showTempFeedback(
      setAddressFeedback,
      'Applied to active storefront location',
    );
  };

  const handleThemeSelect = async (nextTheme: 'dark' | 'light') => {
    setSavingSettings(true);
    try {
      await updateProfilePreferences({ preferredTheme: nextTheme });
      showTempFeedback(
        setSettingsFeedback,
        nextTheme === 'dark'
          ? 'Dark Crimson theme saved'
          : 'Creamy Light theme saved',
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOrderModeSelect = async (nextType: OrderType) => {
    setPreferredOrderType(nextType);
    const areaObj =
      KARACHI_AREAS.find(
        (a) => a.name === (userProfile?.defaultArea || locationState.areaName),
      ) || KARACHI_AREAS[0];
    const dist =
      nextType === 'Delivery'
        ? calculateDistanceKm(
            RESTAURANT_LOCATION.lat,
            RESTAURANT_LOCATION.lng,
            areaObj.lat,
            areaObj.lng,
          )
        : 0;
    confirmLocation({
      ...locationState,
      orderType: nextType,
      distanceKm: dist,
    });

    setSavingSettings(true);
    try {
      await updateProfilePreferences({ preferredOrderType: nextType });
      showTempFeedback(setSettingsFeedback, `Default mode set to ${nextType}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReorder = (order: OrderRecord) => {
    const cartPayload: CartItem[] = orderToCartItems(order);
    if (cartPayload.length === 0) return;
    reorderItemsToCart(cartPayload);
    setIsDashboardOpen(false);
    setIsCartOpen(true);
  };

  const handleQuickReorderItem = (cartItem: CartItem, uniqueBtnId: string) => {
    reorderItemsToCart([{ ...cartItem, quantity: 1 }]);
    setRecentAddedItemKey(uniqueBtnId);
    window.setTimeout(() => {
      setRecentAddedItemKey((curr) => (curr === uniqueBtnId ? null : curr));
    }, 1500);
  };

  const {
    totalSpent,
    activeOrdersCount,
    last10ChartData,
    last10Avg,
    recentOrdersWithCartItems,
  } = useMemo(() => {
    const totalAll = orders.reduce((sum, o) => sum + o.total, 0);
    const activeCount = orders.filter((o) => o.status !== 'Completed').length;

    const recentChronological = orders.slice(0, 10).reverse();
    const chartPoints: SpendingChartPoint[] = recentChronological.map((o) => ({
      label: `#${o.orderNumber.replace('SP-', '')}`,
      orderNumber: o.orderNumber,
      dateLabel: new Date(o.createdAtMs).toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
      }),
      total: o.total,
      orderType: o.orderType,
      status: o.status,
    }));

    const recentSum = recentChronological.reduce((s, o) => s + o.total, 0);
    const avg =
      recentChronological.length > 0
        ? Math.round(recentSum / recentChronological.length)
        : 0;

    const recentTop = orders.slice(0, 3).map((order) => {
      const cartItems = orderToCartItems(order);
      const totalItemQty = cartItems.reduce((sum, c) => sum + c.quantity, 0);
      return {
        order,
        cartItems,
        totalItemQty,
      };
    });

    return {
      totalSpent: totalAll,
      activeOrdersCount: activeCount,
      last10ChartData: chartPoints,
      last10Avg: avg,
      recentOrdersWithCartItems: recentTop,
    };
  }, [orders]);

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isDashboardOpen && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="w-full max-w-3xl rounded-2xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fffaf9] dark:bg-[#14090b] text-[#1f0e10] dark:text-[#fbf3f2] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8f1218] via-[#b91c1c] to-[#7c1015] px-4 sm:px-6 py-4 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={
                      userProfile?.displayName || user.displayName || 'Customer'
                    }
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white/50 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2
                    id="dashboard-title"
                    className="font-display text-base sm:text-lg font-bold truncate"
                  >
                    {userProfile?.displayName ||
                      user.displayName ||
                      'Customer Dashboard'}
                  </h2>
                  <p className="text-xs text-red-100/90 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors overflow-hidden cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDashboardOpen(false)}
                  aria-label="Close dashboard"
                  className="p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-3 sm:px-6 pt-3 pb-2 border-b border-[#ebd3ce] dark:border-[#34181c] bg-[#fdf1ee] dark:bg-[#190b0d]">
              <div
                role="tablist"
                aria-label="Customer dashboard sections"
                className="grid grid-cols-4 gap-1 sm:gap-2 p-1 rounded-xl bg-[#f7dcd7]/65 dark:bg-[#260e12] border border-[#ebd3ce] dark:border-[#3d1f23]"
              >
                {(
                  [
                    { id: 'orders', label: 'Orders', Icon: Package },
                    { id: 'profile', label: 'Profile', Icon: UserIcon },
                    { id: 'address', label: 'Address', Icon: MapPin },
                    { id: 'settings', label: 'Settings', Icon: Settings },
                  ] as const
                ).map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(id)}
                      className={`relative min-w-0 overflow-hidden py-2 px-1 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 leading-tight text-center transition-colors cursor-pointer ${
                        active
                          ? 'text-white'
                          : 'text-[#5f3b3f] dark:text-red-100/80 hover:text-red-700 dark:hover:text-white'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="dashboard-tab-pill"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-700 to-red-600 shadow-xs"
                        />
                      )}
                      <Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />
                      <span className="relative z-10 max-w-full truncate">
                        {label}
                        {id === 'orders' && activeOrdersCount > 0
                          ? ` (${activeOrdersCount})`
                          : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-3">
                  <p className="text-[11px] sm:text-xs text-[#684347] dark:text-red-200/70">
                    Total Orders
                  </p>
                  <p className="mt-1 font-tabular font-display text-xl sm:text-2xl font-extrabold">
                    {orders.length}
                  </p>
                </div>
                <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-3">
                  <p className="text-[11px] sm:text-xs text-[#684347] dark:text-red-200/70">
                    Active Orders
                  </p>
                  <p className="mt-1 font-tabular font-display text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {activeOrdersCount}
                  </p>
                </div>
                <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-3">
                  <p className="text-[11px] sm:text-xs text-[#684347] dark:text-red-200/70">
                    Total Ordered
                  </p>
                  <p className="mt-1 font-tabular font-display text-lg sm:text-xl font-extrabold text-red-700 dark:text-red-400">
                    {formatPKR(totalSpent)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-3">
                  <p className="text-[11px] sm:text-xs text-[#684347] dark:text-red-200/70">
                    Saved Area
                  </p>
                  <p className="mt-1 font-display text-xs sm:text-sm font-bold truncate">
                    {userProfile?.defaultArea || locationState.areaName}
                  </p>
                </div>
              </div>

              {/* TAB 1: RECENT ORDERS, SPENDING TRENDS CHART & LIVE STATUS */}
              {activeTab === 'orders' && (
                <div className="space-y-5">
                  {/* Recent Orders Quick Re-Order Section */}
                  <section
                    aria-labelledby="recent-orders-heading"
                    className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3
                          id="recent-orders-heading"
                          className="font-display text-sm sm:text-base font-bold flex items-center gap-2"
                        >
                          <History className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
                          <span>Recent Orders</span>
                        </h3>
                        <p className="text-[11px] sm:text-xs text-[#684347] dark:text-red-200/70">
                          One-click re-order of past favourites directly to your cart
                        </p>
                      </div>
                      {cartCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDashboardOpen(false);
                            setIsCartOpen(true);
                          }}
                          className="max-w-full overflow-hidden px-3 py-1.5 rounded-lg bg-[#fae4e0] dark:bg-[#2a1013] border border-red-700/35 text-red-800 dark:text-red-200 hover:bg-red-700 hover:text-white text-xs font-semibold leading-tight inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span>Open Cart ({cartCount})</span>
                        </button>
                      )}
                    </div>

                    {recentOrdersWithCartItems.length === 0 ? (
                      <div className="rounded-xl bg-[#fdf3f0] dark:bg-[#120709] border border-dashed border-[#e3c7c2] dark:border-[#3d1f23] px-4 py-5 text-center">
                        <p className="text-xs sm:text-sm font-semibold text-[#5f3b3f] dark:text-red-100/80">
                          No recent orders yet
                        </p>
                        <p className="mt-1 text-xs text-[#7b5257] dark:text-red-200/60">
                          Once you place an order, your past dishes will appear here for single-click re-ordering.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#ebd3ce] dark:divide-[#34181c]">
                        {recentOrdersWithCartItems.map(
                          ({ order, cartItems, totalItemQty }) => (
                            <div
                              key={`recent-${order.orderId}`}
                              className="py-3 first:pt-1 last:pb-0 space-y-2.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-display font-bold font-tabular truncate">
                                    Order #{order.orderNumber}
                                    <span className="font-sans font-normal text-[#684347] dark:text-red-200/70">
                                      {' '}
                                      ·{' '}
                                      {new Date(
                                        order.createdAtMs,
                                      ).toLocaleDateString('en-PK', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}{' '}
                                      · {order.orderType}
                                    </span>
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleReorder(order)}
                                  className="max-w-full overflow-hidden px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold leading-tight inline-flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    Re-order All ({totalItemQty})
                                  </span>
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {cartItems.map((ci) => {
                                  const btnId = `${order.orderId}__${ci.key}`;
                                  const isAdded = recentAddedItemKey === btnId;
                                  return (
                                    <button
                                      key={btnId}
                                      type="button"
                                      onClick={() =>
                                        handleQuickReorderItem(ci, btnId)
                                      }
                                      className={`max-w-full overflow-hidden pl-1.5 pr-2.5 py-1.5 rounded-lg border text-left text-xs leading-tight inline-flex items-center gap-2 transition-colors cursor-pointer ${
                                        isAdded
                                          ? 'border-emerald-600/60 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                                          : 'border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fdf5f3] dark:bg-[#240d10] hover:border-red-600 text-[#240a0d] dark:text-[#fdf4f3]'
                                      }`}
                                    >
                                      <img
                                        src={ci.image}
                                        alt=""
                                        className="w-7 h-7 rounded-md object-cover shrink-0"
                                      />
                                      <span className="min-w-0 truncate font-medium">
                                        {ci.name}
                                        {ci.size ? ` (${ci.size})` : ''}
                                      </span>
                                      <span className="font-tabular font-bold text-red-700 dark:text-red-400 shrink-0">
                                        {formatPKR(ci.unitPrice)}
                                      </span>
                                      {isAdded ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      ) : (
                                        <Plus className="w-3.5 h-3.5 text-red-700 dark:text-red-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </section>

                  {/* Spending Trends Chart (Last 10 Orders) */}
                  <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
                        <span>Spending Trends (Last 10 Orders)</span>
                      </h3>
                      {last10ChartData.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-[#684347] dark:text-red-200/75 font-tabular">
                          <span>Shown: {last10ChartData.length}</span>
                          <span aria-hidden="true">·</span>
                          <span>Avg: {formatPKR(last10Avg)}</span>
                        </div>
                      )}
                    </div>

                    {last10ChartData.length === 0 ? (
                      <div className="h-40 rounded-xl bg-[#fdf3f0] dark:bg-[#120709] border border-dashed border-[#e3c7c2] dark:border-[#3d1f23] flex flex-col items-center justify-center px-4 text-center">
                        <p className="text-xs sm:text-sm font-semibold text-[#5f3b3f] dark:text-red-100/80">
                          No spending history yet
                        </p>
                        <p className="mt-1 text-xs text-[#7b5257] dark:text-red-200/60">
                          Your order totals across your last 10 orders will appear here once you place your first order.
                        </p>
                      </div>
                    ) : (
                      <div className="h-52 sm:h-56 w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={last10ChartData}
                            margin={{ top: 8, right: 10, left: 0, bottom: 2 }}
                          >
                            <defs>
                              <linearGradient
                                id="shahiSpendGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#dc2626"
                                  stopOpacity={isDark ? 0.55 : 0.35}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#dc2626"
                                  stopOpacity={0.02}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke={isDark ? '#3d151a' : '#f1dad5'}
                            />
                            <XAxis
                              dataKey="label"
                              tick={{
                                fontSize: 11,
                                fill: isDark ? '#e5b8bd' : '#684347',
                              }}
                              axisLine={{
                                stroke: isDark ? '#461920' : '#ebd3ce',
                              }}
                              tickLine={false}
                            />
                            <YAxis
                              width={56}
                              tickFormatter={(val: number) =>
                                val >= 1000
                                  ? `Rs.${(val / 1000).toFixed(1)}k`
                                  : `Rs.${val}`
                              }
                              tick={{
                                fontSize: 11,
                                fill: isDark ? '#e5b8bd' : '#684347',
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<SpendingTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="total"
                              stroke={isDark ? '#f87171' : '#b91c1c'}
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#shahiSpendGradient)"
                              dot={{
                                r: 4,
                                strokeWidth: 2,
                                fill: isDark ? '#1a0b0d' : '#fffaf9',
                                stroke: isDark ? '#f87171' : '#b91c1c',
                              }}
                              activeDot={{
                                r: 6,
                                fill: '#dc2626',
                                stroke: '#ffffff',
                                strokeWidth: 2,
                              }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Order History List */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-red-700 dark:text-red-400" />
                        <span>Order History &amp; Live Status</span>
                      </h3>
                      <span className="text-[11px] sm:text-xs text-[#684347] dark:text-red-200/70">
                        Orders can be edited while status is Confirmed
                      </span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-6 text-center text-sm text-[#684347] dark:text-red-200/70">
                        You have not placed any orders yet. Pick your favourites from the menu to place your first order!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => {
                          const isEditable = order.status === 'Confirmed';
                          const badge = STATUS_BADGE_MAP[order.status];
                          return (
                            <div
                              key={order.orderId}
                              className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 space-y-2.5"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-display font-bold text-sm font-tabular">
                                      Order #{order.orderNumber}
                                    </p>
                                    <span
                                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 max-w-full ${badge.className}`}
                                    >
                                      {order.status === 'Confirmed' ? (
                                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                                      ) : order.status === 'Preparing' ? (
                                        <Flame className="w-3 h-3 shrink-0" />
                                      ) : order.status === 'Out for Delivery' ? (
                                        <Truck className="w-3 h-3 shrink-0" />
                                      ) : (
                                        <PackageCheck className="w-3 h-3 shrink-0" />
                                      )}
                                      <span>{badge.label}</span>
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-xs text-[#684347] dark:text-red-200/70">
                                    {new Date(order.createdAtMs).toLocaleString(
                                      'en-PK',
                                      {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                      },
                                    )}{' '}
                                    · {order.orderType} · {order.paymentMethod}
                                  </p>
                                </div>

                                <span className="font-tabular font-display text-base font-extrabold text-red-700 dark:text-red-400 shrink-0">
                                  {formatPKR(order.total)}
                                </span>
                              </div>

                              <p className="text-xs text-[#5f3b3f] dark:text-red-100/85 leading-relaxed">
                                {order.items
                                  .map(
                                    (i) =>
                                      `${i.quantity}x ${i.name}${i.size ? ` (${i.size})` : ''}`,
                                  )
                                  .join(', ')}
                              </p>

                              <p className="text-[11px] text-[#684347] dark:text-red-200/65">
                                {order.orderType === 'Delivery'
                                  ? `${order.streetAddress}, ${order.areaName}`
                                  : RESTAURANT_LOCATION.address}
                                {order.notes ? ` · Note: ${order.notes}` : ''}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsDashboardOpen(false);
                                    onTrackOrder(order);
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold transition-colors max-w-full overflow-hidden leading-tight cursor-pointer"
                                >
                                  Track Order
                                </button>

                                {isEditable ? (
                                  <button
                                    type="button"
                                    onClick={() => onEditOrder(order)}
                                    className="px-3.5 py-1.5 rounded-lg border border-red-700/45 bg-[#fae4e0] dark:bg-[#240b0e] text-red-800 dark:text-red-200 hover:bg-red-700 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors max-w-full overflow-hidden leading-tight cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5 shrink-0" />
                                    <span>Edit Order</span>
                                  </button>
                                ) : (
                                  <span
                                    className="px-3 py-1.5 rounded-lg border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fdf1ee] dark:bg-[#190b0d] text-[11px] font-medium text-[#7b5257] dark:text-red-200/60 inline-flex items-center gap-1 max-w-full"
                                    title="Orders cannot be edited once preparation begins"
                                  >
                                    <Lock className="w-3 h-3 shrink-0" />
                                    <span>
                                      {order.status === 'Completed'
                                        ? 'Order Completed'
                                        : 'Locked (Preparing+)'}
                                    </span>
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleReorder(order)}
                                  className="px-3.5 py-1.5 rounded-lg border border-[#e3c7c2] dark:border-[#3d1f23] hover:border-red-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors max-w-full overflow-hidden leading-tight cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                  <span>Reorder</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE & CONTACT (NAME, MOBILE, WHATSAPP) */}
              {activeTab === 'profile' && (
                <form
                  onSubmit={handleSaveProfile}
                  className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-red-700 dark:text-red-400" />
                      <span>Personal Profile &amp; Contact Numbers</span>
                    </h3>
                    {profileFeedback && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {profileFeedback}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="dash-display-name"
                        className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                      >
                        Full Name *
                      </label>
                      <input
                        id="dash-display-name"
                        type="text"
                        required
                        maxLength={100}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1">
                        Google Account Email
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={user.email || ''}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#ebd3ce] dark:border-[#2e1518] bg-[#fdf3f0] dark:bg-[#0f0607] text-[#684347] dark:text-red-200/60 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dash-mobile-phone"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                        <span>Mobile Number</span>
                      </label>
                      <input
                        id="dash-mobile-phone"
                        type="tel"
                        maxLength={24}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label
                          htmlFor="dash-whatsapp-phone"
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>WhatsApp Number</span>
                        </label>
                        {phone.trim() &&
                          whatsappPhone.trim() !== phone.trim() && (
                            <button
                              type="button"
                              onClick={() => setWhatsappPhone(phone.trim())}
                              className="text-[11px] font-semibold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                            >
                              Same as Mobile
                            </button>
                          )}
                      </div>
                      <input
                        id="dash-whatsapp-phone"
                        type="tel"
                        maxLength={24}
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        placeholder="03XX-XXXXXXX (for WhatsApp updates)"
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-[#684347] dark:text-red-200/65">
                      Used to prefill checkout &amp; coordinate rider updates.
                    </p>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Save className="w-3.5 h-3.5 shrink-0" />
                      <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: SAVED DELIVERY ADDRESS */}
              {activeTab === 'address' && (
                <form
                  onSubmit={handleSaveAddress}
                  className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-700 dark:text-red-400" />
                      <span>Saved Karachi Delivery Address</span>
                    </h3>
                    {addressFeedback && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {addressFeedback}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label
                        htmlFor="dash-default-area"
                        className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                      >
                        Preferred Karachi Area
                      </label>
                      <select
                        id="dash-default-area"
                        value={defaultArea}
                        onChange={(e) => setDefaultArea(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        {KARACHI_AREAS.map((area) => (
                          <option key={area.id} value={area.name}>
                            {area.name} ({area.zone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="dash-street-address"
                        className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                      >
                        Street / House / Flat Address
                      </label>
                      <input
                        id="dash-street-address"
                        type="text"
                        maxLength={300}
                        value={defaultAddress}
                        onChange={(e) => setDefaultAddress(e.target.value)}
                        placeholder="House / Flat #, Block, Sector, Street"
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dash-delivery-notes"
                        className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                      >
                        Delivery Landmark &amp; Default Instructions
                      </label>
                      <input
                        id="dash-delivery-notes"
                        type="text"
                        maxLength={300}
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="Near mosque/park, gate code, call upon arrival..."
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Save className="w-3.5 h-3.5 shrink-0" />
                      <span>{savingAddress ? 'Saving...' : 'Save Address'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyToStorefront}
                      className="px-4 py-2.5 rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] hover:border-red-600 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-red-700 dark:text-red-400 shrink-0" />
                      <span>Use for Current Session</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: ACCOUNT & SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  {/* Appearance Theme */}
                  <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 sm:p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-sm sm:text-base font-bold">
                        Display Theme Preference
                      </h3>
                      {settingsFeedback && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> {settingsFeedback}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        disabled={savingSettings}
                        onClick={() => void handleThemeSelect('dark')}
                        className={`min-w-0 overflow-hidden py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 leading-tight text-center transition-colors cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-red-700 border-red-700 text-white'
                            : 'border-[#e3c7c2] dark:border-[#3d1f23] hover:border-red-600'
                        }`}
                      >
                        <Moon className="w-4 h-4 shrink-0" />
                        <span>Dark Mode</span>
                      </button>

                      <button
                        type="button"
                        disabled={savingSettings}
                        onClick={() => void handleThemeSelect('light')}
                        className={`min-w-0 overflow-hidden py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 leading-tight text-center transition-colors cursor-pointer ${
                          theme === 'light'
                            ? 'bg-red-700 border-red-700 text-white'
                            : 'border-[#e3c7c2] dark:border-[#3d1f23] hover:border-red-600'
                        }`}
                      >
                        <Sun className="w-4 h-4 shrink-0" />
                        <span>Light Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Default Order Method */}
                  <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 sm:p-5 space-y-3">
                    <h3 className="font-display text-sm sm:text-base font-bold">
                      Default Order Method
                    </h3>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {(
                        [
                          { id: 'Delivery', label: 'Delivery', Icon: Truck },
                          { id: 'Takeaway', label: 'Takeaway', Icon: Store },
                          { id: 'Dine-In', label: 'Dine-In', Icon: Utensils },
                        ] as const
                      ).map(({ id, label, Icon }) => {
                        const active = preferredOrderType === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={savingSettings}
                            onClick={() => void handleOrderModeSelect(id)}
                            className={`min-w-0 overflow-hidden py-2.5 px-1.5 sm:px-3 rounded-xl border text-[11px] sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 leading-tight text-center transition-colors cursor-pointer ${
                              active
                                ? 'bg-red-700 border-red-700 text-white'
                                : 'border-[#e3c7c2] dark:border-[#3d1f23] hover:border-red-600'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="max-w-full truncate">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Session & Cart Actions */}
                  <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
                        <span>Active Shopping Cart ({cartCount} items)</span>
                      </p>
                      <p className="text-xs text-[#684347] dark:text-red-200/65 mt-0.5">
                        Clear temporary items or sign out cleanly from this device.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {cartCount > 0 && (
                        <button
                          type="button"
                          onClick={clearCart}
                          className="px-3.5 py-2 rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] hover:border-red-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Clear Cart</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void logout()}
                        className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
