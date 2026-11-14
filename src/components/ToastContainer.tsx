import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Flame,
  PackageCheck,
  Truck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { OrderRecord, OrderStatus } from '../types';

interface ToastContainerProps {
  onViewOrder: (order: OrderRecord) => void;
}

const STATUS_ICON_MAP: Record<
  OrderStatus,
  {
    Icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
  }
> = {
  Confirmed: {
    Icon: CheckCircle2,
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-600/30',
  },
  Preparing: {
    Icon: Flame,
    badgeClass:
      'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-600/30',
  },
  'Out for Delivery': {
    Icon: Truck,
    badgeClass:
      'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-600/30',
  },
  Completed: {
    Icon: PackageCheck,
    badgeClass:
      'bg-[#fae4e0] dark:bg-[#2a1215] text-red-700 dark:text-red-300 border-red-600/30',
  },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  onViewOrder,
}) => {
  const { toasts, dismissToast, orders, activeOrder } = useApp();

  const handleOpenOrder = (orderId: string, toastId: string) => {
    const found =
      orders.find((o) => o.orderId === orderId) ||
      (activeOrder?.orderId === orderId ? activeOrder : null);
    if (found) {
      onViewOrder(found);
    }
    dismissToast(toastId);
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-16 sm:top-20 right-3 left-3 sm:left-auto sm:right-5 sm:w-[370px] z-[60] pointer-events-none flex flex-col gap-2.5"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const meta = STATUS_ICON_MAP[toast.status];
          const StatusIcon = meta.Icon;
          const matchingOrder =
            orders.find((o) => o.orderId === toast.orderId) ||
            (activeOrder?.orderId === toast.orderId ? activeOrder : null);

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="status"
              className="pointer-events-auto rounded-2xl border border-[#e3c7c2] dark:border-[#4b1f25] bg-[#fffaf9]/98 dark:bg-[#19090c]/98 text-[#240a0d] dark:text-[#fdf4f3] shadow-2xl shadow-red-950/20 backdrop-blur-md p-3.5 sm:p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.badgeClass}`}
                >
                  <StatusIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-xs sm:text-sm font-bold leading-snug text-[#240a0d] dark:text-white">
                      {toast.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => dismissToast(toast.id)}
                      aria-label="Dismiss notification"
                      className="p-1 -m-1 rounded-lg text-[#7b5257] dark:text-red-200/60 hover:text-red-700 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {toast.previousStatus && (
                    <p className="mt-0.5 text-[11px] font-semibold text-red-700 dark:text-red-400 font-tabular">
                      #{toast.orderNumber} · {toast.previousStatus} → {toast.status}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-[#613338] dark:text-red-100/80 leading-relaxed">
                    {toast.message}
                  </p>

                  {matchingOrder && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenOrder(toast.orderId, toast.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold transition-colors leading-tight cursor-pointer"
                      >
                        Track Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
