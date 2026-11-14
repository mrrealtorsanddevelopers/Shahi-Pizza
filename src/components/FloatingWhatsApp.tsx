import React from 'react';
import { RESTAURANT_LOCATION } from '../data/karachiAreas';

export const FloatingWhatsApp: React.FC = () => {
  const message = encodeURIComponent(
    'Hello Shahi Pizza! I would like to place an order.',
  );

  return (
    <a
      href={`https://wa.me/${RESTAURANT_LOCATION.whatsappDigits}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp with Shahi Pizza"
      title={`WhatsApp: ${RESTAURANT_LOCATION.phoneDisplay}`}
      className="fixed bottom-4 left-3 sm:left-4 z-30 inline-flex items-center gap-2 h-11 px-3.5 sm:px-4 rounded-full bg-[#25D366] hover:bg-[#1fb858] text-white shadow-xl shadow-black/35 hover:scale-105 active:scale-95 transition-all duration-200"
    >
      <svg
        viewBox="0 0 32 32"
        className="w-5 h-5 fill-current shrink-0"
        aria-hidden="true"
      >
        <path d="M16.01 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.1 29l6.78-1.78a12.75 12.75 0 0 0 6.13 1.56h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.64-3.75-9.05A12.72 12.72 0 0 0 16.01 3.2Zm7.46 18.21c-.31.88-1.82 1.68-2.51 1.78-.64.1-1.46.14-2.36-.15-.55-.18-1.26-.41-2.16-.8-3.8-1.64-6.28-5.49-6.47-5.74-.19-.25-1.54-2.05-1.54-3.91s.98-2.78 1.32-3.16c.35-.38.76-.48 1.01-.48.25 0 .51.01.73.02.23.01.55-.09.86.66.31.76 1.07 2.62 1.16 2.81.1.19.16.41.03.66-.13.25-.19.41-.38.63-.19.22-.4.49-.57.66-.19.19-.39.4-.17.78.22.38.98 1.61 2.1 2.61 1.44 1.29 2.66 1.69 3.04 1.88.38.19.6.16.82-.1.22-.25.95-1.11 1.21-1.49.25-.38.51-.32.85-.19.35.13 2.21 1.04 2.59 1.23.38.19.63.28.73.44.09.16.09.91-.22 1.79Z" />
      </svg>
      <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
        WhatsApp
      </span>
    </a>
  );
};
