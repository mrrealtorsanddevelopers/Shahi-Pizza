import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export const FlyingCartOverlay: React.FC = () => {
  const { flyingAnimations } = useApp();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {flyingAnimations.map((item) => {
          const targetSize = 26;
          const dx = item.endX - item.startX - item.startW / 2;
          const dy = item.endY - item.startY - item.startH / 2;

          return (
            <motion.div
              key={item.id}
              initial={{
                position: 'fixed',
                left: item.startX,
                top: item.startY,
                width: item.startW,
                height: item.startH,
                scale: 1,
                opacity: 0.96,
                borderRadius: '14px',
              }}
              animate={{
                x: [0, dx * 0.42, dx],
                y: [0, Math.min(-45, dy * 0.35 - 55), dy],
                scale: [1, 0.72, targetSize / Math.max(item.startW, 1)],
                opacity: [0.98, 0.95, 0.25],
                borderRadius: ['14px', '28px', '9999px'],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.74,
                times: [0, 0.45, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
              className="overflow-hidden shadow-2xl ring-2 ring-red-500/80 bg-black"
            >
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
