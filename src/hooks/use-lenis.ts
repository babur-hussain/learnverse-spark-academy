import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export function useLenis(enabled: boolean = true) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Disable Lenis on precise pointers (trackpads/mice) to avoid perceived input latency
    if (!isCoarsePointer || prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      // Shorter duration avoids the "slow then slingshot fast" feeling
      duration: 0.8,
      // Use a gentle ease that feels linear enough for consistent velocity
      easing: (t: number) => t,
      // Normalize wheel delta across devices/browsers
      normalizeWheel: true as any,
      smoothWheel: !prefersReducedMotion,
      smoothTouch: isCoarsePointer && !prefersReducedMotion,
      // Keep multipliers conservative to avoid sudden acceleration
      wheelMultiplier: 0.9 as any,
      touchMultiplier: 0.9 as any,
      gestureDirection: 'vertical' as any
    } as any);
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}


