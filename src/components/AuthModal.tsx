import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LOGO_IMAGE } from '../data/menuData';
import { GoogleLogoSvg } from './Navbar';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithGoogle, setIsDashboardOpen } =
    useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const signedIn = await loginWithGoogle();
      if (signedIn) {
        setIsDashboardOpen(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Google sign-in was cancelled or blocked. Please allow popups and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-2xl border border-[#ebd3ce] dark:border-[#34181c] bg-[#fffaf9] dark:bg-[#14090b] text-[#1f0e10] dark:text-[#fbf3f2] shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#8f1218] via-[#b91c1c] to-[#7c1015] px-5 pt-6 pb-7 text-white text-center relative">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                aria-label="Close sign in dialog"
                className="absolute top-3 right-3 p-2 rounded-lg text-white/85 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-16 h-16 rounded-full p-0.5 bg-white shadow-lg overflow-hidden">
                <img
                  src={LOGO_IMAGE}
                  alt="Shahi Pizza"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h2
                id="auth-modal-title"
                className="mt-3 font-display text-xl font-bold"
              >
                Sign In to Shahi Pizza
              </h2>
              <p className="mt-1 text-xs text-red-100/90">
                Access your Customer Dashboard, saved Karachi addresses &amp; order history
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl border border-[#e3c7c2] dark:border-[#3c1d21] bg-white dark:bg-[#1d0d10] hover:border-red-600 text-[#1f0e10] dark:text-white font-semibold text-sm inline-flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                <GoogleLogoSvg className="w-5 h-5 shrink-0" />
                <span>
                  {loading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
              </button>

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-[#684347] dark:text-red-200/70 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Secured by Google &amp; Firebase Authentication</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
