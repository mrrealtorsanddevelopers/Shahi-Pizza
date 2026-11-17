import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../data/menuData';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartCount,
    updateCartQty,
    removeCartItem,
    clearCart,
  } = useApp();

  const handleProceed = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart"
        >
          <div
            className="flex-1"
            onClick={() => setIsCartOpen(false)}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md h-full bg-[#fffaf9] dark:bg-[#14090b] text-[#1f0e10] dark:text-[#fbf3f2] border-l border-[#ebd3ce] dark:border-[#34181c] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-4 sm:px-5 py-4 border-b border-[#ebd3ce] dark:border-[#34181c] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-red-700 dark:text-red-400" />
                <h2 className="font-display text-lg font-bold">
                  Your Order ({cartCount})
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close cart"
                  className="p-2 rounded-lg hover:bg-[#f7e3df] dark:hover:bg-[#261114] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[#f7e3df] dark:bg-[#261114] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-red-700 dark:text-red-400" />
                  </div>
                  <h3 className="font-display text-lg font-bold">
                    Your cart is empty
                  </h3>
                  <p className="mt-1 text-sm text-[#684347] dark:text-red-100/70 max-w-xs">
                    Add pizzas, charcoal BBQ, zinger burgers, or value deals from our menu to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3 p-3 rounded-xl border border-[#ebcac4] dark:border-[#3d151a] bg-[#fff8f6] dark:bg-[#1a080b]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-[#fae4e0] dark:bg-[#240b0e]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-display text-sm font-bold leading-snug">
                            {item.name}
                          </h4>
                          {item.size && (
                            <p className="text-xs text-[#7a454b] dark:text-red-200/70">
                              Size: {item.size}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.key)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1 text-[#8a5d62] hover:text-red-700 dark:text-red-200/60 dark:hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-[#ebd3ce] dark:border-[#3d1e22] bg-[#fdf3f0] dark:bg-[#13080a] p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.key, -1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-tabular px-2 text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.key, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-tabular font-display text-sm font-extrabold text-red-700 dark:text-red-400">
                          {formatPKR(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#ebd3ce] dark:border-[#34181c] bg-[#fdf1ee] dark:bg-[#1a0b0d] space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5f3b3f] dark:text-red-100/75 font-medium">
                    Items Subtotal
                  </span>
                  <span className="font-tabular font-display text-lg font-extrabold text-[#1f0e10] dark:text-white">
                    {formatPKR(cartSubtotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-red-900/25 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
