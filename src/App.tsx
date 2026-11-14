import React, { useState } from 'react';
import { Lock, PackageCheck, Pencil } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboardModal } from './components/CustomerDashboardModal';
import { EditOrderModal } from './components/EditOrderModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { FlyingCartOverlay } from './components/FlyingCartOverlay';
import { HeroSlider } from './components/HeroSlider';
import { LocationFooter } from './components/LocationFooter';
import { LocationModal } from './components/LocationModal';
import { MenuSection } from './components/MenuSection';
import { Navbar } from './components/Navbar';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { PromoBanner } from './components/PromoBanner';
import { SplashScreen } from './components/SplashScreen';
import { ToastContainer } from './components/ToastContainer';
import type { MenuCategory } from './data/menuData';
import type { OrderRecord } from './types';

const ShahiPizzaApp: React.FC = () => {
  const { activeOrder } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Pizza Deals');
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-[#fdf0ee] dark:bg-[#0b0304] text-[#240a0d] dark:text-[#fdf4f3] transition-colors duration-300">
      <SplashScreen
        visible={showSplash}
        onComplete={() => setShowSplash(false)}
      />

      <Navbar onSelectCategory={setSelectedCategory} />

      <main className="flex-1 pt-14 md:pt-16">
        <PromoBanner onSelectCategory={setSelectedCategory} />
        <HeroSlider onSelectCategory={setSelectedCategory} />

        {/* Post-Order Quick Tracking Bar (Appears ONLY AFTER an order has been placed!) */}
        {activeOrder && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
            <div className="rounded-xl border border-red-700/30 dark:border-red-500/30 bg-[#fae4e0] dark:bg-[#1e0a0d] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm min-w-0">
                <PackageCheck className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
                <span>
                  Active Order <strong className="font-tabular">#{activeOrder.orderNumber}</strong> ·{' '}
                  {activeOrder.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activeOrder.status === 'Confirmed' ? (
                  <button
                    type="button"
                    onClick={() => setEditingOrder(activeOrder)}
                    className="max-w-full overflow-hidden px-3 py-1.5 rounded-lg border border-red-700/45 bg-white dark:bg-[#2a1013] text-red-800 dark:text-red-200 hover:bg-red-700 hover:text-white text-xs font-semibold leading-tight inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 shrink-0" />
                    <span>Edit Order</span>
                  </button>
                ) : (
                  <span className="max-w-full overflow-hidden px-2.5 py-1.5 rounded-lg bg-white/60 dark:bg-black/25 text-[11px] font-medium text-[#684347] dark:text-red-200/70 inline-flex items-center gap-1">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span>
                      {activeOrder.status === 'Completed'
                        ? 'Completed'
                        : 'Editing Locked'}
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setTrackingOrder(activeOrder)}
                  className="max-w-full overflow-hidden px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold leading-tight transition-colors cursor-pointer"
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>
        )}

        <MenuSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      <LocationFooter />

      <FloatingWhatsApp />
      <FlyingCartOverlay />
      <ToastContainer onViewOrder={(order) => setTrackingOrder(order)} />

      {!showSplash && <LocationModal />}
      <CartDrawer />
      <CheckoutModal onOrderPlaced={(order) => setTrackingOrder(order)} />
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onEditOrder={(order) => setEditingOrder(order)}
      />
      <EditOrderModal
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSaved={(updated) => {
          if (trackingOrder?.orderId === updated.orderId) {
            setTrackingOrder(updated);
          }
        }}
      />
      <AuthModal />
      <CustomerDashboardModal
        onTrackOrder={(order) => setTrackingOrder(order)}
        onEditOrder={(order) => setEditingOrder(order)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ShahiPizzaApp />
    </AppProvider>
  );
}
