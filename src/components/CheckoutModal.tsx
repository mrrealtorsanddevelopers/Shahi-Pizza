import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Banknote,
  CheckCircle2,
  Crosshair,
  MapPin,
  Store,
  Truck,
  Utensils,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateDistanceKm,
  findNearestKarachiArea,
  KARACHI_AREAS,
  RESTAURANT_LOCATION,
} from '../data/karachiAreas';
import { formatPKR } from '../data/menuData';
import type { OrderRecord, OrderType } from '../types';
import { GoogleLogoSvg } from './Navbar';

interface CheckoutModalProps {
  onOrderPlaced: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onOrderPlaced,
}) => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    user,
    userProfile,
    loginWithGoogle,
    locationState,
    confirmLocation,
    deliveryQuote,
    cart,
    cartSubtotal,
    createOrder,
  } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isCheckoutOpen) return;
    setCustomerName(
      (prev) => prev || userProfile?.displayName || user?.displayName || '',
    );
    setCustomerEmail(
      (prev) => prev || userProfile?.email || user?.email || '',
    );
    setCustomerPhone(
      (prev) => prev || userProfile?.phone || userProfile?.whatsappPhone || '',
    );
    setStreetAddress(
      (prev) =>
        prev || locationState.streetAddress || userProfile?.defaultAddress || '',
    );
    setNotes((prev) => prev || userProfile?.deliveryInstructions || '');
    setErrorMsg(null);
  }, [isCheckoutOpen, user, userProfile, locationState]);

  const handleOrderTypeSwitch = (nextType: OrderType) => {
    const area =
      KARACHI_AREAS.find((a) => a.id === locationState.areaId) ||
      KARACHI_AREAS[0];
    const dist =
      nextType === 'Delivery'
        ? calculateDistanceKm(
            RESTAURANT_LOCATION.lat,
            RESTAURANT_LOCATION.lng,
            locationState.lat || area.lat,
            locationState.lng || area.lng,
          )
        : 0;
    confirmLocation({
      ...locationState,
      orderType: nextType,
      distanceKm: dist,
    });
  };

  const handleAreaChange = (areaId: string) => {
    const area = KARACHI_AREAS.find((a) => a.id === areaId) || KARACHI_AREAS[0];
    const dist =
      locationState.orderType === 'Delivery'
        ? calculateDistanceKm(
            RESTAURANT_LOCATION.lat,
            RESTAURANT_LOCATION.lng,
            area.lat,
            area.lng,
          )
        : 0;
    confirmLocation({
      ...locationState,
      areaId: area.id,
      areaName: area.name,
      lat: area.lat,
      lng: area.lng,
      distanceKm: dist,
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is unavailable on this browser.');
      return;
    }
    setGpsLoading(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestKarachiArea(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        confirmLocation({
          ...locationState,
          orderType: 'Delivery',
          areaId: nearest.area.id,
          areaName: nearest.area.name,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          distanceKm: nearest.distanceKm,
        });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setErrorMsg('Unable to read GPS location. Please choose your area from the dropdown.');
      },
      { enableHighAccuracy: true, timeout: 9000 },
    );
  };

  const deliveryFee =
    locationState.orderType === 'Delivery' ? deliveryQuote.deliveryFee : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim() || customerPhone.trim().length < 7) {
      setErrorMsg('Please enter your full name and a valid phone number.');
      return;
    }

    if (locationState.orderType === 'Delivery' && !streetAddress.trim()) {
      setErrorMsg('Please enter your house, street, or flat address for delivery.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const order = await createOrder({
        customerName,
        customerPhone,
        customerEmail: customerEmail || 'guest@shahipizza.pk',
        streetAddress:
          locationState.orderType === 'Delivery'
            ? streetAddress
            : RESTAURANT_LOCATION.address,
        notes,
      });
      setIsCheckoutOpen(false);
      onOrderPlaced(order);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? 'Could not submit order. Please verify your details and try again.'
          : 'Failed to place order.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="w-full max-w-2xl rounded-2xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fffaf9] dark:bg-[#14090b] text-[#1f0e10] dark:text-[#fbf3f2] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-[#ebd3ce] dark:border-[#34181c] flex items-center justify-between bg-[#fdf1ee] dark:bg-[#1b0b0e]">
              <div>
                <h2
                  id="checkout-modal-title"
                  className="font-display text-lg sm:text-xl font-bold"
                >
                  Complete Your Order
                </h2>
                <p className="text-xs text-[#684347] dark:text-red-200/70">
                  Cash on Delivery &amp; Counter Pickup Ready
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                aria-label="Close checkout"
                className="p-2 rounded-lg hover:bg-[#f5dbd6] dark:hover:bg-[#2a1215] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
            >
              {/* Google Sign-In Optional Banner if signed out */}
              {!user && (
                <div className="rounded-xl border border-[#e7cbc6] dark:border-[#3c1d21] bg-[#fdeee9] dark:bg-[#210f12] p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm">
                    <p className="font-semibold">
                      Save orders to your Customer Dashboard
                    </p>
                    <p className="text-[#684347] dark:text-red-200/70 text-xs">
                      Sign in with Google for live cloud tracking &amp; quick reorders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loginWithGoogle()}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#14090b] border border-[#e3c7c2] dark:border-[#3c1d21] text-xs font-semibold inline-flex items-center gap-2 hover:border-red-600 transition-colors cursor-pointer shrink-0"
                  >
                    <GoogleLogoSvg className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}

              {/* Order Type Switcher */}
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
                    const active = locationState.orderType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleOrderTypeSwitch(id)}
                        className={`relative min-w-0 overflow-hidden py-2.5 px-1.5 sm:px-3 rounded-xl border text-[11px] sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 leading-tight text-center transition-colors cursor-pointer ${
                          active
                            ? 'border-red-700 text-white'
                            : 'border-[#e7cbc6] dark:border-[#3c1d21] bg-white dark:bg-[#1b0b0e] hover:border-red-600'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="checkout-order-method-pill"
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 32,
                            }}
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

              {/* Delivery Area & Distance-based Delivery Quote (Shown ONLY at Checkout!) */}
              {locationState.orderType === 'Delivery' ? (
                <div className="space-y-3 rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#190b0d] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80">
                      Delivery Area (Karachi)
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={gpsLoading}
                      className="text-xs font-semibold text-red-700 dark:text-red-400 inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <Crosshair
                        className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`}
                      />
                      <span>
                        {gpsLoading ? 'Detecting...' : 'Auto-Detect Location'}
                      </span>
                    </button>
                  </div>

                  <select
                    value={locationState.areaId}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {KARACHI_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name} ({area.zone})
                      </option>
                    ))}
                  </select>

                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                    >
                      Complete Street Address *
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House / Flat #, Block, Sector, Near Landmark"
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-[#fffaf9] dark:bg-[#120709] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#190b0d] p-4 flex items-start gap-2.5 text-xs sm:text-sm">
                  <MapPin className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      {locationState.orderType} at Shahi Pizza Branch
                    </p>
                    <p className="text-[#684347] dark:text-red-200/70 mt-0.5">
                      {RESTAURANT_LOCATION.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#190b0d] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#190b0d] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-notes"
                  className="block text-xs font-semibold text-[#5f3b3f] dark:text-red-200/80 mb-1"
                >
                  Special Instructions (Optional)
                </label>
                <input
                  id="checkout-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Extra spicy, less garlic sauce, ring doorbell..."
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#e3c7c2] dark:border-[#3d1f23] bg-white dark:bg-[#190b0d] text-[#1f0e10] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Bill Summary (Delivery Charges Shown Here During Checkout!) */}
              <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fdf1ee] dark:bg-[#1b0b0e] p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#5f3b3f] dark:text-red-100/75">
                    Items Subtotal
                  </span>
                  <span className="font-tabular font-semibold">
                    {formatPKR(cartSubtotal)}
                  </span>
                </div>

                {locationState.orderType === 'Delivery' && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5f3b3f] dark:text-red-100/75">
                      Delivery Charges ({deliveryQuote.distanceKm} km)
                    </span>
                    <span className="font-tabular font-semibold">
                      {formatPKR(deliveryFee)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#684347] dark:text-red-200/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Payment Method</span>
                  </span>
                  <span className="font-semibold text-[#1f0e10] dark:text-white">
                    {locationState.orderType === 'Delivery'
                      ? 'Cash on Delivery'
                      : 'Pay at Counter'}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#ebd3ce] dark:border-[#34181c] flex items-center justify-between">
                  <span className="font-display font-bold text-base">
                    Total Payable
                  </span>
                  <span className="font-tabular font-display text-xl font-extrabold text-red-700 dark:text-red-400">
                    {formatPKR(grandTotal)}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-red-900/25 transition-all cursor-pointer disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Confirming Order...'
                    : `Place Order · ${formatPKR(grandTotal)}`}
                </span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
