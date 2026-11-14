import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  MessageCircle,
  PackageCheck,
  Pencil,
  Truck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESTAURANT_LOCATION } from '../data/karachiAreas';
import { formatPKR } from '../data/menuData';
import type { OrderRecord, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onEditOrder?: (order: OrderRecord) => void;
}

const STEPS: {
  key: OrderStatus;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'Confirmed',
    label: 'Order Confirmed',
    desc: 'Received by Shahi Pizza kitchen (editing allowed)',
    Icon: CheckCircle2,
  },
  {
    key: 'Preparing',
    label: 'Baking & Grilling',
    desc: 'Freshly prepared to order (editing locked)',
    Icon: Flame,
  },
  {
    key: 'Out for Delivery',
    label: 'Rider Dispatched / Ready',
    desc: 'On the way or ready at counter',
    Icon: Truck,
  },
  {
    key: 'Completed',
    label: 'Delivered / Picked Up',
    desc: 'Enjoy your meal!',
    Icon: PackageCheck,
  },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onEditOrder,
}) => {
  const { orders, activeOrder, advanceOrderStatus } = useApp();

  const liveOrder = useMemo(() => {
    if (!order) return null;
    return (
      orders.find((o) => o.orderId === order.orderId) ||
      (activeOrder?.orderId === order.orderId ? activeOrder : order)
    );
  }, [order, orders, activeOrder]);

  if (!liveOrder) return null;

  const currentIdx = Math.max(
    0,
    STEPS.findIndex((s) => s.key === liveOrder.status),
  );
  const canEditOrder = liveOrder.status === 'Confirmed';

  const whatsappText = encodeURIComponent(
    `Hello Shahi Pizza! Regarding my Order #${liveOrder.orderNumber} (${liveOrder.orderType}, Total: ${formatPKR(liveOrder.total)}).`,
  );

  const nextStageOption: { status: OrderStatus; label: string } | null =
    liveOrder.status === 'Confirmed'
      ? { status: 'Preparing', label: 'Start Preparing in Kitchen' }
      : liveOrder.status === 'Preparing'
        ? { status: 'Out for Delivery', label: 'Mark Out for Delivery / Ready' }
        : liveOrder.status === 'Out for Delivery'
          ? { status: 'Completed', label: 'Mark Delivered / Completed' }
          : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-tracking-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fffaf9] dark:bg-[#14090b] text-[#1f0e10] dark:text-[#fbf3f2] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8f1218] via-[#b91c1c] to-[#7c1015] px-5 py-4 text-white flex items-center justify-between">
            <div>
              <p className="text-xs text-red-100/90">
                Live Order Status · {liveOrder.status}
              </p>
              <h2
                id="order-tracking-title"
                className="font-display text-xl font-bold font-tabular"
              >
                Order #{liveOrder.orderNumber}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order tracking"
              className="p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Summary Strip */}
            <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fdf1ee] dark:bg-[#1d0c0f] p-3.5 text-xs sm:text-sm space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">
                  {liveOrder.orderType} · {liveOrder.paymentMethod}
                </span>
                <span className="font-tabular font-display font-extrabold text-red-700 dark:text-red-400">
                  {formatPKR(liveOrder.total)}
                </span>
              </div>
              <p className="text-[#684347] dark:text-red-200/75">
                {liveOrder.orderType === 'Delivery'
                  ? `${liveOrder.streetAddress}, ${liveOrder.areaName}`
                  : RESTAURANT_LOCATION.address}
              </p>
              {liveOrder.notes && (
                <p className="text-xs text-[#684347] dark:text-red-200/70">
                  Note: {liveOrder.notes}
                </p>
              )}
            </div>

            {/* Edit Order vs Locked Notice */}
            {canEditOrder ? (
              onEditOrder && (
                <div className="rounded-xl border border-emerald-600/35 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">
                      Order Editable Before Preparation
                    </p>
                    <p className="text-emerald-700/90 dark:text-emerald-200/75 mt-0.5">
                      You can change items, quantities, or address until the kitchen starts Preparing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditOrder(liveOrder)}
                    className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Order</span>
                  </button>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-amber-500/35 bg-amber-50 dark:bg-amber-950/35 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                <div>
                  <p className="font-bold">
                    {liveOrder.status === 'Completed'
                      ? 'Order Completed'
                      : 'Preparation Started — Order Editing Locked'}
                  </p>
                  <p className="mt-0.5 opacity-90">
                    {liveOrder.status === 'Completed'
                      ? 'This order has been completed. Use Reorder in your dashboard to order again.'
                      : 'Once your order enters Preparing, items and delivery details can no longer be modified.'}
                  </p>
                </div>
              </div>
            )}

            {/* 4-Step Progress Timeline */}
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                const StepIcon = step.Icon;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                        done
                          ? 'bg-red-700 border-red-700 text-white'
                          : 'bg-white dark:bg-[#1c0d10] border-[#e7cbc6] dark:border-[#3a1c20] text-[#9b7175] dark:text-red-200/40'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-bold ${
                            done
                              ? 'text-[#1f0e10] dark:text-white'
                              : 'text-[#8e6367] dark:text-red-200/45'
                          }`}
                        >
                          {step.label}
                        </p>
                        {active && (
                          <span className="text-xs font-semibold text-red-700 dark:text-red-400 inline-flex items-center gap-1 whitespace-nowrap">
                            <Clock className="w-3 h-3" /> Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#684347] dark:text-red-200/65">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {liveOrder.status !== 'Completed' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nextStageOption && nextStageOption.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() =>
                      void advanceOrderStatus(
                        liveOrder.orderId,
                        nextStageOption.status,
                      )
                    }
                    className="py-2.5 px-3 rounded-xl border border-red-700/40 bg-[#fae4e0] dark:bg-[#240b0e] text-red-800 dark:text-red-200 hover:bg-red-700 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {nextStageOption.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    void advanceOrderStatus(liveOrder.orderId, 'Completed')
                  }
                  className={`${
                    nextStageOption && nextStageOption.status !== 'Completed'
                      ? ''
                      : 'sm:col-span-2'
                  } py-2.5 px-3 rounded-xl border border-[#e7cbc6] dark:border-[#3c1d21] bg-white dark:bg-[#1c0d10] hover:border-red-600 text-xs font-semibold transition-colors cursor-pointer`}
                >
                  Mark Order as Received / Completed
                </button>
              </div>
            )}

            {/* Itemized Receipt */}
            <div className="rounded-xl border border-[#ebd3ce] dark:border-[#34181c] bg-white dark:bg-[#190b0d] p-4 space-y-2">
              <h3 className="text-xs font-bold text-[#5f3b3f] dark:text-red-200/80">
                Order Receipt
              </h3>
              <div className="divide-y divide-[#f3e1de] dark:divide-[#2e1518]">
                {liveOrder.items.map((item, idx) => (
                  <div
                    key={`${item.itemId}-${idx}`}
                    className="py-2 flex items-start justify-between text-xs sm:text-sm gap-3"
                  >
                    <span className="leading-snug">
                      {item.quantity}x {item.name}
                      {item.size ? ` (${item.size})` : ''}
                    </span>
                    <span className="font-tabular font-semibold shrink-0">
                      {formatPKR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#ebd3ce] dark:border-[#34181c] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-tabular">
                    {formatPKR(liveOrder.subtotal)}
                  </span>
                </div>
                {liveOrder.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Charges ({liveOrder.distanceKm} km)</span>
                    <span className="font-tabular">
                      {formatPKR(liveOrder.deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Total</span>
                  <span className="font-tabular text-red-700 dark:text-red-400">
                    {formatPKR(liveOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Support */}
            <a
              href={`https://wa.me/${RESTAURANT_LOCATION.whatsappDigits}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp ({RESTAURANT_LOCATION.phoneDisplay})</span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
