import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { UtensilsCrossed } from 'lucide-react';
import { LOGO_IMAGE } from '../data/menuData';

interface SplashScreenProps {
  visible: boolean;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  visible,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [phase, setPhase] = useState<'growing' | 'fading'>('growing');
  const [logoError, setLogoError] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!visible) return;
    setPhase('growing');

    if (prefersReducedMotion) {
      const fadeTimer = window.setTimeout(() => setPhase('fading'), 350);
      const doneTimer = window.setTimeout(() => onCompleteRef.current(), 650);
      return () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(doneTimer);
      };
    }

    const fadeTimer = window.setTimeout(() => {
      setPhase('fading');
    }, 1250);

    const doneTimer = window.setTimeout(() => {
      onCompleteRef.current();
    }, 1720);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [visible, prefersReducedMotion]);

  useEffect(() => {
    if (!visible || prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const colors = [
      '#EF4444',
      '#F59E0B',
      '#FCA5A5',
      '#FBBF24',
      '#FFFFFF',
      '#DC2626',
    ];
    const particles: Particle[] = [];

    const spawnBurst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const speed = 2.2 + Math.random() * 5.6;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 2.8,
          decay: 0.015 + Math.random() * 0.014,
        });
      }
    };

    const w = window.innerWidth;
    const h = window.innerHeight;
    spawnBurst(w * 0.5, h * 0.44, 48);
    const t1 = window.setTimeout(
      () => spawnBurst(w * 0.28, h * 0.32, 34),
      240,
    );
    const t2 = window.setTimeout(
      () => spawnBurst(w * 0.72, h * 0.34, 34),
      420,
    );
    const t3 = window.setTimeout(() => spawnBurst(w * 0.5, h * 0.25, 30), 650);

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.09;
        p.vx *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [visible, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="shahi-splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'fading' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#230609] via-[#0d0506] to-[#1a0709] text-white px-6 overflow-hidden"
          aria-label="Loading Shahi Pizza"
        >
          <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 w-full h-full"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: prefersReducedMotion ? 1 : 0.65, opacity: 1 }}
              animate={
                prefersReducedMotion
                  ? { scale: 1, opacity: phase === 'fading' ? 0 : 1 }
                  : phase === 'growing'
                    ? { scale: 2.15, opacity: 1 }
                    : { scale: 2.95, opacity: 0 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.3 }
                  : phase === 'growing'
                    ? { duration: 1.25, ease: [0.22, 0.61, 0.36, 1] }
                    : { duration: 0.46, ease: 'easeOut' }
              }
              className="will-change-transform relative p-1.5 rounded-full bg-gradient-to-tr from-red-600 via-amber-400 to-red-700 shadow-2xl shadow-red-900/60"
            >
              {!logoError ? (
                <img
                  src={LOGO_IMAGE}
                  alt="Shahi Pizza Logo"
                  loading="eager"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover bg-black block"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1a0709] flex items-center justify-center">
                  <UtensilsCrossed className="w-10 h-10 text-amber-300" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={
                prefersReducedMotion
                  ? { opacity: phase === 'fading' ? 0 : 1, y: 0 }
                  : phase === 'growing'
                    ? { opacity: 1, y: 24 }
                    : { opacity: 0, y: 40 }
              }
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Shahi Pizza
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-red-200/90 tracking-wide">
                Fast Food &amp; Bar B Q · North Karachi
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
