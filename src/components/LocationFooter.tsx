import React from 'react';
import { Clock, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { RESTAURANT_LOCATION } from '../data/karachiAreas';
import { LOGO_IMAGE } from '../data/menuData';

export const LocationFooter: React.FC = () => {
  return (
    <footer
      id="location-footer"
      className="border-t border-[#ebcac4] dark:border-[#3d151a] bg-[#fae4e0] dark:bg-[#140507] text-[#240a0d] dark:text-[#fdf4f3] transition-colors pb-24 sm:pb-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Service Summary */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_IMAGE}
                alt="Shahi Pizza Logo"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-red-700/40 shrink-0"
              />
              <div>
                <h2 className="font-display text-xl font-bold">
                  {RESTAURANT_LOCATION.name}
                </h2>
                <p className="text-xs text-[#613338] dark:text-red-200/80">
                  Dine-In · Takeaway · Home Delivery · Online Ordering
                </p>
              </div>
            </div>

            <p className="text-sm text-[#5e2a30] dark:text-red-100/80 leading-relaxed max-w-md">
              Freshly baked pizzas, smoky charcoal BBQ, crispy zinger burgers, and golden paratha rolls crafted fresh every day in North Karachi.
            </p>
          </div>

          {/* Address & Hours */}
          <div className="md:col-span-4 space-y-3 text-sm">
            <h3 className="font-display font-bold text-base">
              Visit Our Kitchen
            </h3>
            <div className="flex items-start gap-2.5 text-[#5e2a30] dark:text-red-100/85">
              <MapPin className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-1" />
              <span>{RESTAURANT_LOCATION.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#5e2a30] dark:text-red-100/85">
              <Clock className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
              <span>Open Daily · 12:00 PM – 2:00 AM</span>
            </div>
          </div>

          {/* Direct Actions: Google Maps + Call + WhatsApp */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="font-display font-bold text-base">
              Direct Contact &amp; Map
            </h3>

            <a
              href={RESTAURANT_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Navigation className="w-4 h-4 shrink-0" />
              <span>Open in Google Maps</span>
            </a>

            <a
              href={`tel:${RESTAURANT_LOCATION.phoneDisplay.replace(/-/g, '')}`}
              className="w-full py-2.5 px-4 rounded-xl border border-[#e7c2bc] dark:border-[#461920] bg-[#fff8f6] dark:bg-[#1f090c] hover:border-red-600 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
              <span className="font-tabular">
                Call {RESTAURANT_LOCATION.phoneDisplay}
              </span>
            </a>

            <a
              href={`https://wa.me/${RESTAURANT_LOCATION.whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp Order Support</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-[#e7c2bc] dark:border-[#3d151a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6e3b41] dark:text-red-200/65">
          <p>
            &copy; {new Date().getFullYear()} {RESTAURANT_LOCATION.name}. All rights reserved.
          </p>
          <p>Sector 5-A/1, Madiha Road, Near 4K Chowrangi, North Karachi</p>
        </div>
      </div>
    </footer>
  );
};
