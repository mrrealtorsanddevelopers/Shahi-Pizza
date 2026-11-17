import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutUser,
} from '../lib/firebase';
import {
  calculateDeliveryQuoteLocal,
  KARACHI_AREAS,
} from '../data/karachiAreas';
import type { MenuItem, PizzaSize } from '../data/menuData';
import type {
  CartItem,
  FlyingAnimationPayload,
  LocationSelection,
  OrderItemPayload,
  OrderRecord,
  OrderStatus,
  OrderType,
  ToastNotification,
  UserProfile,
} from '../types';

export interface ProfilePreferenceUpdates {
  displayName?: string;
  phone?: string;
  whatsappPhone?: string;
  defaultArea?: string;
  defaultAddress?: string;
  deliveryInstructions?: string;
  preferredOrderType?: OrderType;
  preferredTheme?: 'dark' | 'light';
}

export interface OrderEditUpdates {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  areaName: string;
  streetAddress: string;
  distanceKm: number;
  deliveryFee: number;
  items: OrderItemPayload[];
  notes: string;
}

interface AppContextValue {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  user: User | null;
  authReady: boolean;
  userProfile: UserProfile | null;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfilePreferences: (updates: ProfilePreferenceUpdates) => Promise<void>;
  orders: OrderRecord[];
  activeOrder: OrderRecord | null;
  setActiveOrder: (order: OrderRecord | null) => void;
  advanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  updateOrderDetails: (orderId: string, updates: OrderEditUpdates) => Promise<OrderRecord>;
  toasts: ToastNotification[];
  dismissToast: (toastId: string) => void;
  locationState: LocationSelection;
  hasConfirmedLocation: boolean;
  showLocationModal: boolean;
  setShowLocationModal: (open: boolean) => void;
  confirmLocation: (next: LocationSelection) => void;
  deliveryQuote: { distanceKm: number; deliveryFee: number };
  cart: CartItem[];
  addToCart: (
    item: MenuItem,
    size?: PizzaSize,
    sourceEl?: HTMLElement | null,
  ) => void;
  reorderItemsToCart: (items: CartItem[]) => void;
  updateCartQty: (key: string, delta: number) => void;
  removeCartItem: (key: string) => void;
  clearCart: () => void;
  getCartQtyForItem: (itemId: string, size?: PizzaSize) => number;
  cartSubtotal: number;
  cartCount: number;
  cartIconRef: React.RefObject<HTMLButtonElement | null>;
  cartBounceKey: number;
  flyingAnimations: FlyingAnimationPayload[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  createOrder: (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    streetAddress: string;
    notes?: string;
  }) => Promise<OrderRecord>;
}

const DEFAULT_AREA = KARACHI_AREAS[0];

const DEFAULT_LOCATION: LocationSelection = {
  orderType: 'Delivery',
  areaId: DEFAULT_AREA.id,
  areaName: DEFAULT_AREA.name,
  lat: DEFAULT_AREA.lat,
  lng: DEFAULT_AREA.lng,
  distanceKm: 0.5,
  streetAddress: '',
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('shahi_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(() => {
    try {
      const raw = localStorage.getItem('shahi_active_order');
      return raw ? (JSON.parse(raw) as OrderRecord) : null;
    } catch {
      return null;
    }
  });

  const [hasConfirmedLocation, setHasConfirmedLocation] = useState<boolean>(() => {
    try {
      return localStorage.getItem('shahi_location_selected') === 'true';
    } catch {
      return false;
    }
  });

  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const [locationState, setLocationState] = useState<LocationSelection>(() => {
    try {
      const raw = localStorage.getItem('shahi_location_state');
      if (raw) return JSON.parse(raw) as LocationSelection;
    } catch {
      // ignore
    }
    return DEFAULT_LOCATION;
  });

  const [deliveryQuote, setDeliveryQuote] = useState<{
    distanceKm: number;
    deliveryFee: number;
  }>(() =>
    calculateDeliveryQuoteLocal(
      locationState.distanceKm,
      locationState.orderType,
    ),
  );

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('shahi_cart');
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [flyingAnimations, setFlyingAnimations] = useState<
    FlyingAnimationPayload[]
  >([]);
  const [cartBounceKey, setCartBounceKey] = useState(0);
  const cartIconRef = useRef<HTMLButtonElement | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const prevOrderStatusesRef = useRef<Record<string, OrderStatus>>({});
  const ordersLoadedUidRef = useRef<string | null>(null);
  const toastTimersRef = useRef<Record<string, number>>({});
  const activeOrderRef = useRef<OrderRecord | null>(activeOrder);
  activeOrderRef.current = activeOrder;
  const ordersRef = useRef<OrderRecord[]>(orders);
  ordersRef.current = orders;

  const dismissToast = useCallback((toastId: string) => {
    const timer = toastTimersRef.current[toastId];
    if (timer) {
      window.clearTimeout(timer);
      delete toastTimersRef.current[toastId];
    }
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const pushOrderStatusToast = useCallback(
    (order: OrderRecord, previousStatus?: OrderStatus) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const statusCopy: Record<
        OrderStatus,
        { title: string; message: string }
      > = {
        Confirmed: {
          title: `Order #${order.orderNumber} Confirmed`,
          message:
            'Received by Shahi Pizza kitchen. You can still edit items before preparation starts.',
        },
        Preparing: {
          title: `Order #${order.orderNumber} is Now Preparing`,
          message:
            'Our kitchen has started preparing your meal. Order editing is now locked.',
        },
        'Out for Delivery': {
          title:
            order.orderType === 'Delivery'
              ? `Order #${order.orderNumber} Out for Delivery`
              : `Order #${order.orderNumber} Ready for Pickup`,
          message:
            order.orderType === 'Delivery'
              ? `Rider is heading toward ${order.areaName || 'your area'}.`
              : 'Your order is freshly packed and ready at our North Karachi counter.',
        },
        Completed: {
          title: `Order #${order.orderNumber} Completed`,
          message: 'Enjoy your meal from Shahi Pizza! Thank you for ordering.',
        },
      };

      const copy = statusCopy[order.status];
      const nextToast: ToastNotification = {
        id,
        title: copy.title,
        message: copy.message,
        status: order.status,
        previousStatus,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        createdAtMs: Date.now(),
      };

      setToasts((prev) => [nextToast, ...prev].slice(0, 4));

      toastTimersRef.current[id] = window.setTimeout(() => {
        dismissToast(id);
      }, 6000);
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      Object.values(toastTimersRef.current).forEach((timerId) =>
        window.clearTimeout(timerId),
      );
    };
  }, []);

  // Sync theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('shahi_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setThemeMode = useCallback((mode: 'dark' | 'light') => {
    setTheme(mode);
  }, []);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('shahi_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Persist active guest/recent order
  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem('shahi_active_order', JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem('shahi_active_order');
      }
    } catch {
      // ignore
    }
  }, [activeOrder]);

  // Fetch delivery quote from backend petrol-indexed engine whenever locationState changes
  useEffect(() => {
    const localQuote = calculateDeliveryQuoteLocal(
      locationState.distanceKm,
      locationState.orderType,
    );
    setDeliveryQuote(localQuote);

    let cancelled = false;
    const params = new URLSearchParams({
      orderType: locationState.orderType,
      lat: String(locationState.lat),
      lng: String(locationState.lng),
      distanceKm: String(locationState.distanceKm),
    });

    fetch(`/api/delivery-quote?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          !cancelled &&
          data &&
          typeof data.deliveryFee === 'number' &&
          typeof data.distanceKm === 'number'
        ) {
          setDeliveryQuote({
            distanceKm: data.distanceKm,
            deliveryFee: data.deliveryFee,
          });
        }
      })
      .catch(() => {
        // fallback already set via localQuote
      });

    return () => {
      cancelled = true;
    };
  }, [locationState]);

  // Firebase Auth listener + User Profile sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (!firebaseUser) {
        setUserProfile(null);
        setOrders([]);
        prevOrderStatusesRef.current = {};
        ordersLoadedUidRef.current = null;
        return;
      }

      const userPath = `users/${firebaseUser.uid}`;
      const userDocRef = doc(db, 'users', firebaseUser.uid);

      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          const savedTheme =
            data.preferredTheme === 'light' || data.preferredTheme === 'dark'
              ? data.preferredTheme
              : undefined;
          const savedOrderType =
            data.preferredOrderType === 'Delivery' ||
            data.preferredOrderType === 'Takeaway' ||
            data.preferredOrderType === 'Dine-In'
              ? data.preferredOrderType
              : undefined;

          setUserProfile({
            uid: firebaseUser.uid,
            displayName: String(
              data.displayName || firebaseUser.displayName || 'Customer',
            ),
            email: String(data.email || firebaseUser.email || ''),
            photoURL: data.photoURL ? String(data.photoURL) : firebaseUser.photoURL || undefined,
            phone: data.phone ? String(data.phone) : undefined,
            whatsappPhone: data.whatsappPhone ? String(data.whatsappPhone) : undefined,
            defaultArea: data.defaultArea ? String(data.defaultArea) : undefined,
            defaultAddress: data.defaultAddress ? String(data.defaultAddress) : undefined,
            deliveryInstructions: data.deliveryInstructions
              ? String(data.deliveryInstructions)
              : undefined,
            preferredOrderType: savedOrderType,
            preferredTheme: savedTheme,
          });
          if (savedTheme) {
            setTheme(savedTheme);
          }
        } else {
          const newProfile = {
            uid: firebaseUser.uid,
            displayName: (firebaseUser.displayName || 'Customer').slice(0, 100),
            email: (firebaseUser.email || '').slice(0, 150),
            photoURL: (firebaseUser.photoURL || '').slice(0, 500),
            phone: '',
            whatsappPhone: '',
            defaultArea: locationState.areaName.slice(0, 120),
            defaultAddress: (locationState.streetAddress || '').slice(0, 300),
            deliveryInstructions: '',
            preferredOrderType: locationState.orderType,
            preferredTheme: theme,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile({
            uid: newProfile.uid,
            displayName: newProfile.displayName,
            email: newProfile.email,
            photoURL: newProfile.photoURL || undefined,
            phone: '',
            whatsappPhone: '',
            defaultArea: newProfile.defaultArea,
            defaultAddress: newProfile.defaultAddress,
            deliveryInstructions: '',
            preferredOrderType: newProfile.preferredOrderType,
            preferredTheme: newProfile.preferredTheme,
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userPath);
      }
    });

    return () => unsub();
  }, []);

  // Firestore real-time orders listener when signed in
  useEffect(() => {
    if (!authReady || !user) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
    );

    const unsub = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list: OrderRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt as Timestamp | undefined;
          const createdAtMs = ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now();
          return {
            orderId: String(data.orderId || d.id),
            orderNumber: String(data.orderNumber || ''),
            userId: String(data.userId || ''),
            customerName: String(data.customerName || ''),
            customerEmail: String(data.customerEmail || ''),
            customerPhone: String(data.customerPhone || ''),
            orderType: (data.orderType as OrderType) || 'Delivery',
            areaName: String(data.areaName || ''),
            streetAddress: String(data.streetAddress || ''),
            distanceKm: Number(data.distanceKm || 0),
            deliveryFee: Number(data.deliveryFee || 0),
            subtotal: Number(data.subtotal || 0),
            total: Number(data.total || 0),
            paymentMethod: data.paymentMethod || 'Cash on Delivery',
            status: (data.status as OrderStatus) || 'Confirmed',
            items: Array.isArray(data.items) ? data.items : [],
            notes: data.notes ? String(data.notes) : undefined,
            createdAtMs,
          };
        });
        list.sort((a, b) => b.createdAtMs - a.createdAtMs);

        // Detect live status transitions across snapshots without firing on initial sign-in load
        if (ordersLoadedUidRef.current !== user.uid) {
          const initialMap: Record<string, OrderStatus> = {};
          for (const ord of list) {
            initialMap[ord.orderId] = ord.status;
          }
          prevOrderStatusesRef.current = initialMap;
          ordersLoadedUidRef.current = user.uid;
        } else {
          for (const ord of list) {
            const prevStatus = prevOrderStatusesRef.current[ord.orderId];
            if (prevStatus && prevStatus !== ord.status) {
              pushOrderStatusToast(ord, prevStatus);
            }
            prevOrderStatusesRef.current[ord.orderId] = ord.status;
          }
        }

        setOrders(list);
        setActiveOrder((prev) => {
          if (prev) {
            const match = list.find((o) => o.orderId === prev.orderId);
            if (match) return match;
          }
          return list.find((o) => o.status !== 'Completed') || prev;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      },
    );

    return () => unsub();
  }, [authReady, user, pushOrderStatusToast]);

  const loginWithGoogle = useCallback(async () => {
    const loggedInUser = await signInWithGoogle();
    setIsAuthModalOpen(false);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setIsDashboardOpen(false);
  }, []);

  const updateProfilePreferences = useCallback(
    async (updates: ProfilePreferenceUpdates) => {
      if (updates.preferredTheme) {
        setTheme(updates.preferredTheme);
      }
      if (!user) return;

      const userPath = `users/${user.uid}`;
      const nextDisplayName = (
        updates.displayName ??
        userProfile?.displayName ??
        user.displayName ??
        'Customer'
      )
        .trim()
        .slice(0, 100) || 'Customer';
      const nextPhone = (updates.phone ?? userProfile?.phone ?? '').trim().slice(0, 24);
      const nextWhatsapp = (updates.whatsappPhone ?? userProfile?.whatsappPhone ?? '')
        .trim()
        .slice(0, 24);
      const nextArea = (updates.defaultArea ?? userProfile?.defaultArea ?? '')
        .trim()
        .slice(0, 120);
      const nextAddress = (updates.defaultAddress ?? userProfile?.defaultAddress ?? '')
        .trim()
        .slice(0, 300);
      const nextInstructions = (
        updates.deliveryInstructions ??
        userProfile?.deliveryInstructions ??
        ''
      )
        .trim()
        .slice(0, 300);
      const nextOrderType =
        updates.preferredOrderType ?? userProfile?.preferredOrderType ?? locationState.orderType;
      const nextTheme = updates.preferredTheme ?? userProfile?.preferredTheme ?? theme;

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: nextDisplayName,
          phone: nextPhone,
          whatsappPhone: nextWhatsapp,
          defaultArea: nextArea,
          defaultAddress: nextAddress,
          deliveryInstructions: nextInstructions,
          preferredOrderType: nextOrderType,
          preferredTheme: nextTheme,
          updatedAt: serverTimestamp(),
        });
        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                displayName: nextDisplayName,
                phone: nextPhone,
                whatsappPhone: nextWhatsapp,
                defaultArea: nextArea,
                defaultAddress: nextAddress,
                deliveryInstructions: nextInstructions,
                preferredOrderType: nextOrderType,
                preferredTheme: nextTheme,
              }
            : null,
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      }
    },
    [user, userProfile, locationState.orderType, theme],
  );

  const confirmLocation = useCallback((next: LocationSelection) => {
    setLocationState(next);
    setHasConfirmedLocation(true);
    setShowLocationModal(false);
    try {
      localStorage.setItem('shahi_location_selected', 'true');
      localStorage.setItem('shahi_location_state', JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const addToCart = useCallback(
    (item: MenuItem, size?: PizzaSize, sourceEl?: HTMLElement | null) => {
      const resolvedSize = item.hasSizes ? size || 'Regular' : undefined;
      const unitPrice =
        item.hasSizes && item.sizes && resolvedSize
          ? item.sizes[resolvedSize]
          : item.price;
      const baseId = item.canonicalId || item.id;
      const key = resolvedSize ? `${baseId}__${resolvedSize}` : baseId;

      setCart((prev) => {
        const existing = prev.find((c) => c.key === key);
        if (existing) {
          return prev.map((c) =>
            c.key === key ? { ...c, quantity: c.quantity + 1 } : c,
          );
        }
        return [
          ...prev,
          {
            key,
            itemId: baseId,
            name: item.name,
            size: resolvedSize,
            unitPrice,
            quantity: 1,
            image: item.image,
          },
        ];
      });

      // Trigger flying image animation into navbar cart icon
      if (sourceEl && cartIconRef.current) {
        const startRect = sourceEl.getBoundingClientRect();
        const targetRect = cartIconRef.current.getBoundingClientRect();
        const animId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        setFlyingAnimations((prev) => [
          ...prev,
          {
            id: animId,
            image: item.image,
            startX: startRect.left,
            startY: startRect.top,
            startW: startRect.width,
            startH: startRect.height,
            endX: targetRect.left + targetRect.width / 2,
            endY: targetRect.top + targetRect.height / 2,
          },
        ]);

        setTimeout(() => {
          setCartBounceKey((k) => k + 1);
        }, 680);

        setTimeout(() => {
          setFlyingAnimations((prev) => prev.filter((a) => a.id !== animId));
        }, 820);
      } else {
        setCartBounceKey((k) => k + 1);
      }
    },
    [],
  );

  const reorderItemsToCart = useCallback((incomingItems: CartItem[]) => {
    if (!incomingItems || incomingItems.length === 0) return;

    setCart((prev) => {
      const next = [...prev];
      for (const item of incomingItems) {
        if (!item || item.quantity <= 0) continue;
        const resolvedKey =
          item.key || (item.size ? `${item.itemId}__${item.size}` : item.itemId);
        const existingIndex = next.findIndex((c) => c.key === resolvedKey);
        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + item.quantity,
          };
        } else {
          next.push({
            key: resolvedKey,
            itemId: item.itemId,
            name: item.name,
            ...(item.size ? { size: item.size } : {}),
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            image: item.image,
          });
        }
      }
      return next;
    });

    setCartBounceKey((k) => k + 1);
  }, []);

  const updateCartQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.key === key ? { ...c, quantity: c.quantity + delta } : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const removeCartItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartQtyForItem = useCallback(
    (itemId: string, size?: PizzaSize) => {
      const key = size ? `${itemId}__${size}` : itemId;
      return cart.find((c) => c.key === key)?.quantity ?? 0;
    },
    [cart],
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const createOrder = useCallback(
    async (payload: {
      customerName: string;
      customerPhone: string;
      customerEmail: string;
      streetAddress: string;
      notes?: string;
    }): Promise<OrderRecord> => {
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const orderNumber = `SP-${String(Math.floor(100000 + Math.random() * 900000))}`;
      const fee =
        locationState.orderType === 'Delivery' ? deliveryQuote.deliveryFee : 0;
      const dist =
        locationState.orderType === 'Delivery' ? deliveryQuote.distanceKm : 0;
      const subtotal = cartSubtotal;
      const total = subtotal + fee;
      const paymentMethod =
        locationState.orderType === 'Delivery'
          ? 'Cash on Delivery'
          : 'Pay at Counter';

      const items = cart.slice(0, 50).map((c) => ({
        itemId: c.itemId,
        name: c.name,
        ...(c.size ? { size: c.size } : {}),
        unitPrice: c.unitPrice,
        quantity: c.quantity,
        lineTotal: c.unitPrice * c.quantity,
      }));

      const orderRecord: OrderRecord = {
        orderId,
        orderNumber,
        userId: user ? user.uid : 'guest',
        customerName: payload.customerName.trim().slice(0, 100),
        customerEmail: payload.customerEmail.trim().slice(0, 150),
        customerPhone: payload.customerPhone.trim().slice(0, 24),
        orderType: locationState.orderType,
        areaName: locationState.areaName.slice(0, 120),
        streetAddress: payload.streetAddress.trim().slice(0, 300),
        distanceKm: dist,
        deliveryFee: fee,
        subtotal,
        total,
        paymentMethod,
        status: 'Confirmed',
        items,
        notes: payload.notes ? payload.notes.trim().slice(0, 400) : undefined,
        createdAtMs: Date.now(),
      };

      if (user) {
        const orderPath = `orders/${orderId}`;
        try {
          const firestoreDoc: Record<string, unknown> = {
            orderId: orderRecord.orderId,
            orderNumber: orderRecord.orderNumber,
            userId: user.uid,
            customerName: orderRecord.customerName,
            customerEmail: orderRecord.customerEmail || user.email || 'customer@shahipizza.pk',
            customerPhone: orderRecord.customerPhone,
            orderType: orderRecord.orderType,
            areaName: orderRecord.areaName,
            streetAddress: orderRecord.streetAddress,
            distanceKm: orderRecord.distanceKm,
            deliveryFee: orderRecord.deliveryFee,
            subtotal: orderRecord.subtotal,
            total: orderRecord.total,
            paymentMethod: orderRecord.paymentMethod,
            status: 'Confirmed',
            items: orderRecord.items,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (orderRecord.notes) {
            firestoreDoc.notes = orderRecord.notes;
          }
          await setDoc(doc(db, 'orders', orderId), firestoreDoc);

          // Save user's latest phone & address preferences
          await updateDoc(doc(db, 'users', user.uid), {
            phone: orderRecord.customerPhone.slice(0, 24),
            defaultArea: orderRecord.areaName.slice(0, 120),
            defaultAddress: orderRecord.streetAddress.slice(0, 300),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, orderPath);
        }
      }

      prevOrderStatusesRef.current[orderRecord.orderId] = orderRecord.status;
      setActiveOrder(orderRecord);
      setCart([]);
      return orderRecord;
    },
    [cart, cartSubtotal, deliveryQuote, locationState, user],
  );

  const advanceOrderStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      const existingOrder =
        ordersRef.current.find((o) => o.orderId === orderId) ||
        (activeOrderRef.current?.orderId === orderId
          ? activeOrderRef.current
          : null);
      const prevStatus = existingOrder?.status;

      if (existingOrder && prevStatus !== nextStatus) {
        prevOrderStatusesRef.current[orderId] = nextStatus;
        pushOrderStatusToast(
          { ...existingOrder, status: nextStatus },
          prevStatus,
        );
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: nextStatus } : o,
        ),
      );
      setActiveOrder((prev) =>
        prev && prev.orderId === orderId ? { ...prev, status: nextStatus } : prev,
      );
      if (user) {
        const orderPath = `orders/${orderId}`;
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            status: nextStatus,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, orderPath);
        }
      }
    },
    [user, pushOrderStatusToast],
  );

  const updateOrderDetails = useCallback(
    async (orderId: string, updates: OrderEditUpdates): Promise<OrderRecord> => {
      const targetOrder =
        orders.find((o) => o.orderId === orderId) ||
        (activeOrder?.orderId === orderId ? activeOrder : null);

      if (!targetOrder) {
        throw new Error('Order could not be found.');
      }

      if (targetOrder.status !== 'Confirmed') {
        throw new Error(
          'Your order is already being prepared and can no longer be edited.',
        );
      }

      const cleanItems = updates.items
        .filter((it) => it.quantity > 0)
        .slice(0, 50)
        .map((it) => ({
          itemId: it.itemId,
          name: it.name,
          ...(it.size ? { size: it.size } : {}),
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          lineTotal: it.unitPrice * it.quantity,
        }));

      if (cleanItems.length === 0) {
        throw new Error('At least one menu item is required in an order.');
      }

      const subtotal = cleanItems.reduce((sum, it) => sum + it.lineTotal, 0);
      const deliveryFee =
        updates.orderType === 'Delivery' ? Math.max(0, updates.deliveryFee) : 0;
      const distanceKm =
        updates.orderType === 'Delivery' ? Math.max(0, updates.distanceKm) : 0;
      const total = subtotal + deliveryFee;
      const paymentMethod =
        updates.orderType === 'Delivery' ? 'Cash on Delivery' : 'Pay at Counter';

      const cleanName = updates.customerName.trim().slice(0, 100);
      const cleanPhone = updates.customerPhone.trim().slice(0, 24);
      const cleanArea = updates.areaName.trim().slice(0, 120);
      const cleanAddress = updates.streetAddress.trim().slice(0, 300);
      const cleanNotes = updates.notes.trim().slice(0, 400);

      const updatedOrder: OrderRecord = {
        ...targetOrder,
        customerName: cleanName,
        customerPhone: cleanPhone,
        orderType: updates.orderType,
        areaName: cleanArea,
        streetAddress: cleanAddress,
        distanceKm,
        deliveryFee,
        subtotal,
        total,
        paymentMethod,
        items: cleanItems,
        notes: cleanNotes || undefined,
      };

      if (user) {
        const orderPath = `orders/${orderId}`;
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            customerName: cleanName,
            customerPhone: cleanPhone,
            orderType: updates.orderType,
            areaName: cleanArea,
            streetAddress: cleanAddress,
            distanceKm,
            deliveryFee,
            subtotal,
            total,
            paymentMethod,
            items: cleanItems,
            notes: cleanNotes,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, orderPath);
        }
      }

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? updatedOrder : o)),
      );
      setActiveOrder((prev) =>
        prev && prev.orderId === orderId ? updatedOrder : prev,
      );

      return updatedOrder;
    },
    [orders, activeOrder, user],
  );

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeMode,
        user,
        authReady,
        userProfile,
        loginWithGoogle,
        logout,
        updateProfilePreferences,
        orders,
        activeOrder,
        setActiveOrder,
        advanceOrderStatus,
        updateOrderDetails,
        toasts,
        dismissToast,
        locationState,
        hasConfirmedLocation,
        showLocationModal,
        setShowLocationModal,
        confirmLocation,
        deliveryQuote,
        cart,
        addToCart,
        reorderItemsToCart,
        updateCartQty,
        removeCartItem,
        clearCart,
        getCartQtyForItem,
        cartSubtotal,
        cartCount,
        cartIconRef,
        cartBounceKey,
        flyingAnimations,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isDashboardOpen,
        setIsDashboardOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        createOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
