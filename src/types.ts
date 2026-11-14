import type { PizzaSize } from './data/menuData';

export type OrderType = 'Delivery' | 'Takeaway' | 'Dine-In';
export type OrderStatus = 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Completed';
export type PaymentMethod = 'Cash on Delivery' | 'Pay at Counter';

export interface CartItem {
  key: string;
  itemId: string;
  name: string;
  size?: PizzaSize;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface LocationSelection {
  orderType: OrderType;
  areaId: string;
  areaName: string;
  lat: number;
  lng: number;
  distanceKm: number;
  streetAddress: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  whatsappPhone?: string;
  defaultArea?: string;
  defaultAddress?: string;
  deliveryInstructions?: string;
  preferredOrderType?: OrderType;
  preferredTheme?: 'dark' | 'light';
}

export interface OrderItemPayload {
  itemId: string;
  name: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderRecord {
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  areaName: string;
  streetAddress: string;
  distanceKm: number;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItemPayload[];
  notes?: string;
  createdAtMs: number;
}

export interface FlyingAnimationPayload {
  id: string;
  image: string;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  endX: number;
  endY: number;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  status: OrderStatus;
  previousStatus?: OrderStatus;
  orderId: string;
  orderNumber: string;
  createdAtMs: number;
}
