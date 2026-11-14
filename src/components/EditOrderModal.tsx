import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  Store,
  Trash2,
  Truck,
  Utensils,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateDeliveryQuoteLocal,
  calculateDistanceKm,
  KARACHI_AREAS,
  RESTAURANT_LOCATION,
} from '../data/karachiAreas';
import { formatPKR, MENU_ITEMS } from '../data/menuData';
import type { OrderItemPayload, OrderRecord, OrderType } from '../types';

interface EditOrderModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onSaved?: (updated: OrderRecord) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  onClose,
  onSaved,
}) => {
  const { orders, activeOrder, updateOrderDetails } = useApp();

  const liveOrder = useMemo(() => {
    if (!order) return null;
    return (
      orders.find((o) => o.orderId === order.orderId) ||
      (activeOrder?.orderId === order.orderId ? activeOrder : order)
    );
  }, [order, orders, activeOrder]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('Delivery');
  const [areaName, setAreaName] = useState(KARACHI_AREAS[0].name);
  const [streetAddress, setStreetAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemPayload[]>([]);
  const [selectedAddItemId, setSelectedAddItemId] = useState(MENU_ITEMS[0].id);
  const [quote, setQuote] = useState<{ distanceKm: number; deliveryFee: number }>({
    distanceKm: 0,
    deliveryFee: 0,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!liveOrder) return;
    setCustomerName(liveOrder.customerName);
    setCustomerPhone(liveOrder.customerPhone);
    setOrderType(liveOrder.orderType);
    setAreaName(liveOrder.areaName || KARACHI_AREAS[0].name);
    setStreetAddress(liveOrder.streetAddress);
    setNotes(liveOrder.notes || '');
    setItems(liveOrder.items.map((i) => ({ ...i })));
    setQuote({
      distanceKm: liveOrder.distanceKm,
      deliveryFee: liveOrder.deliveryFee,
    });
    setErrorMsg(null);
  }, [liveOrder?.orderId]);

  useEffect(() => {
    if (!liveOrder) return;
    if (orderType !== 'Delivery') {
      setQuote({ distanceKm: 0, deliveryFee: 0 });
      return;
    }

    const areaObj =
      KARACHI_AREAS.find((a) => a.name === areaName) || KARACHI_AREAS[0];
    const dist = calculateDistanceKm(
      RESTAURANT_LOCATION.lat,
      RESTAURANT_LOCATION.lng,
      areaObj.lat,
      areaObj.lng,
    );
    const localQuote = calculateDeliveryQuoteLocal(dist, 'Delivery');
    setQuote(localQuote);

    let cancelled = false;
    const params = new URLSearchParams({
      orderType: 'Delivery',
      lat: String(areaObj.lat),
      lng: String(areaObj.lng),
      distanceKm: String(dist),
    });
    fetch(`/api/delivery-quote?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (
          !cancelled &&
          data &&
          typeof data.deliveryFee === 'number' &&
          typeof data.distanceKm === 'number'
        ) {
          setQuote({
            distanceKm: data.distanceKm,
            deliveryFee: data.deliveryFee,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [orderType, areaName, liveOrder]);

  if (!liveOrder) return null;

  const isLocked = liveOrder.status !== 'Confirmed';
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const deliveryFee = orderType === 'Delivery' ? quote.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handleQtyChange = (index: number, delta: number) => {
    if (isLocked) return;
    setItems((prev) =>
      prev
        .map((it, idx) => {
          if (idx !== index) return it;
          const nextQty = it.quantity + delta;
          if (nextQty <= 0 && prev.length === 1) return it;
          return {
            ...it,
            quantity: nextQty,
            lineTotal: it.unitPrice * nextQty,
          };
        })
        .filter((it) => it.quantity > 0),
    );
  };

  const handleRemoveItem = (index: number) => {
    if (isLocked || items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddMenuItem = () => {
    if (isLocked) return;
    const found = MENU_ITEMS.find((m) => m.id === selectedAddItemId);
    if (!found) return;
    const baseId = found.canonicalId || found.id;
    const unitPrice = found.hasSizes && found.sizes ? found.sizes.Regular : found.price;
    const size = found.hasSizes ? 'Regular' : undefined;

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.itemId === baseId && (it.size || undefined) === size,
      );
      if (existingIdx >= 0) {
        return prev.map((it, idx) =>
          idx === existingIdx
            ? {
                ...it,
                quantity: it.quantity + 1,
                lineTotal: it.unitPrice * (it.quantity + 1),
              }
            : it,
        );
      }
      return [
        ...prev,
        {
          itemId: baseId,
          name: found.name,
          ...(size ? { size } : {}),
          unitPrice,
          quantity: 1,
          lineTotal: unitPrice,
        },
      ];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (!customerName.trim() || customerPhone.trim().length < 7) {
      setErrorMsg('Please enter a valid customer name and phone number.');
      return;
    }

    if (orderType === 'Delivery' && !streetAddress.trim()) {
      setErrorMsg('Please enter a complete street address for Home Delivery.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const updated = await updateOrderDetails(liveOrder.orderId, {
        customerName,
        customerPhone,
        orderType,
        areaName: orderType === 'Delivery' ? areaName : RESTAURANT_LOCATION.name,
        streetAddress:
          orderType === 'Delivery' ? streetAddress : RESTAURANT_LOCATION.address,
        distanceKm: quote.distanceKm,
        deliveryFee,
        items,
        notes,
      });
      onSaved?.(updated);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to update order. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-order-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="w-full max-w-2xl rounded-2xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fffaf9] dark:bg-[#14090b] text-[#1f0e10] dark:text-[#fbf3f2] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8f1218] via-[#b91c1c] to-[#7c1015] px-4 sm:px-6 py-4 text-white flex items-center justify-between">
            <div>
              <p className="text-xs text-red-100/90">
                Modify Order · Status: {liveOrder.status}
              </p>
              <h2
                id="edit-order-title"
                className="font-display text-lg sm:text-xl font-bold font-tabular"
              >
                Edit Order #{liveOrder.orderNumber}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close edit order modal"
              className="p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
          >
            {isLocked && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                <div>
                  <p className="font-bold">
                    Order Editing Locked ({liveOrder.status})
                  </p>
                  <p className="mt-0.5 text-xs opacity-90">
                    The kitchen has already started preparing this order, so items, quantities, and delivery details can no longer be changed.
                  </p>
                </div>
              </div>
            )}

            {/* Items Editor */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#5f3b3f] dark:text-red-200/80">
                  Order Items ({items.length})
                </h3>
                <span className="text-xs text-[#684347] dark:text-red-200/65">
                  Adjust quantities or add items
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={`${item.itemId}-${item.size || 'std'}-${idx}`}
                    className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#1a0b0d] p-3 flex items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs sm:text-sm font-bold leading-snug">
                        {item.name}
                        {item.size ? ` (${item.size})` : ''}
                      </p>
                      <p className="text-xs text-[#684347] dark:text-red-200/70 font-tabular">
                        {formatPKR(item.unitPrice)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center gap-1 rounded-lg border border-[#ebd3ce] dark:border-[#3d1e22] bg-[#fdf3f0] dark:bg-[#120709] p-0.5">
                        <button
                          type="button"
                          disabled={isLocked || (items.length === 1 && item.quantity <= 1)}
                          onClick={() => handleQtyChange(idx, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-red-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-tabular px-2 text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleQtyChange(idx, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-red-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-tabular font-bold text-xs sm:text-sm text-red-700 dark:text-red-400 min-w-[68px] text-right">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>

                      {items.length > 1 && (
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleRemoveItem(idx)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1.5 text-[#8a5d62] hover:text-red-700 dark:text-red-200/60 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!isLocked && (
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <select
                    value={selectedAddItemId}
                    onChange={(e) => setSelectedAddItemId(e.target.value)}
                    aria-label="Select menu item to add to order"
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#190b0d] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {MENU_ITEMS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {formatPKR(m.hasSizes && m.sizes ? m.sizes.Regular : m.price)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMenuItem}
                    className="px-4 py-2 rounded-xl border border-red-700/40 bg-[#fae4e0] dark:bg-[#240b0e] text-red-800 dark:text-red-200 hover:bg-red-700 hover:text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              )}
            </div>

            {/* Order Method */}
            <div>
              <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-2">
                Order Method
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(
                  [
                    { id: 'Delivery', label: 'Delivery', Icon: Truck },
                    { id: 'Takeaway', label: 'Takeaway', Icon: Store },
                    { id: 'Dine-In', label: 'Dine-In', Icon: Utensils },
                  ] as const
                ).map(({ id, label, Icon }) => {
                  const active = orderType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setOrderType(id)}
                      className={`relative min-w-0 overflow-hidden py-2.5 px-1.5 sm:px-3 rounded-xl border text-[11px] sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 leading-tight text-center transition-colors cursor-pointer disabled:opacity-60 ${
                        active
                          ? 'border-red-700 text-white'
                          : 'border-[#e7cbc6] dark:border-[#3c1d21] bg-white dark:bg-[#1b0b0e] hover:border-red-600'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="edit-order-method-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-xl bg-red-700 shadow-sm"
                        />
                      )}
                      <Icon className="relative z-10 w-4 h-4 shrink-0" />
                      <span className="relative z-10 max-w-full truncate">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Area & Address */}
            {orderType === 'Delivery' && (
              <div className="space-y-3 rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#190b0d] p-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1">
                    Karachi Area
                  </label>
                  <select
                    disabled={isLocked}
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-60"
                  >
                    {KARACHI_AREAS.map((area) => (
                      <option key={area.id} value={area.name}>
                        {area.name} ({area.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1">
                    Street / House / Flat Address *
                  </label>
                  <input
                    type="text"
                    disabled={isLocked}
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House / Flat #, Block, Sector, Landmark"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            {/* Contact & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#190b0d] focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  disabled={isLocked}
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#190b0d] focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1">
                Special Instructions / Notes
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Spice preference, landmark, delivery instructions..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#190b0d] focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-60"
              />
            </div>

            {/* Updated Summary */}
            <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fdf1ee] dark:bg-[#1b0b0e] p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5f3b3f] dark:text-red-100/75">
                  Updated Subtotal
                </span>
                <span className="font-tabular font-semibold">
                  {formatPKR(subtotal)}
                </span>
              </div>
              {orderType === 'Delivery' && (
                <div className="flex justify-between">
                  <span className="text-[#5f3b3f] dark:text-red-100/75">
                    Delivery Charges ({quote.distanceKm} km)
                  </span>
                  <span className="font-tabular font-semibold">
                    {formatPKR(deliveryFee)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#ebd3ce] dark:border-[#34181c] flex justify-between font-display font-bold">
                <span>Updated Total</span>
                <span className="font-tabular text-lg font-extrabold text-red-700 dark:text-red-400">
                  {formatPKR(total)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="sm:w-36 py-3 px-4 rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] hover:border-red-600 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLocked || saving || items.length === 0}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-red-900/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Order Locked ({liveOrder.status})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {saving ? 'Saving Changes...' : `Save Order Changes · ${formatPKR(total)}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
