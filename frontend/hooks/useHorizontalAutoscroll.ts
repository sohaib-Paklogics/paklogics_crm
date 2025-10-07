import { useCallback, useEffect, useRef, useState } from "react";

export function useHorizontalAutoscroll() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const hoverDirRef = useRef<-1 | 0 | 1>(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const hoverVelocityRef = useRef(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const HOVER_MAX_SPEED = 1200;
  const HOVER_ACCEL = 4000;
  const DRAG_MAX_SPEED = 900;
  const EDGE_PX = 96;

  const updateArrowState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft);
  }, []);

  const handleUserScroll = useCallback(() => {
    updateArrowState();
  }, [updateArrowState]);

  const ensureRaf = useCallback(() => {
    if (rafRef.current == null) {
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(function loop(ts: number) {
        rafRef.current = requestAnimationFrame(loop);
        const el = scrollRef.current;
        if (!el) return;

        const lastTs = lastTsRef.current ?? ts;
        const dt = Math.max(0, (ts - lastTs) / 1000);
        lastTsRef.current = ts;

        updateArrowState();

        // hover accel
        if (hoverDirRef.current !== 0) {
          const targetSpeed = HOVER_MAX_SPEED * hoverDirRef.current;
          const current = hoverVelocityRef.current;
          const next =
            current +
            Math.sign(targetSpeed - current) *
              Math.min(HOVER_ACCEL * dt, Math.abs(targetSpeed - current));
          hoverVelocityRef.current = next;
          el.scrollLeft += next * dt;
          return;
        } else if (hoverVelocityRef.current !== 0) {
          const friction = HOVER_ACCEL * 1.25;
          const current = hoverVelocityRef.current;
          const decel = Math.min(friction * dt, Math.abs(current));
          const next = current - Math.sign(current) * decel;
          hoverVelocityRef.current = Math.abs(next) < 1 ? 0 : next;
          el.scrollLeft += next * dt;
          if (hoverVelocityRef.current !== 0) return;
        }

        // drag-edge
        if (isDraggingRef.current && lastPointer.current) {
          const rect = el.getBoundingClientRect();
          const x = lastPointer.current.x;

          let speed = 0;
          if (x - rect.left < EDGE_PX) {
            const t = Math.min(1, (EDGE_PX - (x - rect.left)) / EDGE_PX);
            speed = -DRAG_MAX_SPEED * t;
          } else if (rect.right - x < EDGE_PX) {
            const t = Math.min(1, (EDGE_PX - (rect.right - x)) / EDGE_PX);
            speed = DRAG_MAX_SPEED * t;
          }

          if (speed !== 0) {
            el.scrollLeft += speed * dt;
            return;
          }
        }

        cancelAnimationFrame(rafRef.current!);
        rafRef.current = null;
        lastTsRef.current = null;
      });
    }
  }, [DRAG_MAX_SPEED, EDGE_PX, HOVER_ACCEL, HOVER_MAX_SPEED, updateArrowState]);

  const startHoverScroll = useCallback(
    (dir: -1 | 1) => {
      hoverDirRef.current = dir;
      ensureRaf();
    },
    [ensureRaf]
  );

  const stopHoverScroll = useCallback(() => {
    hoverDirRef.current = 0;
    ensureRaf();
  }, [ensureRaf]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const startAutoScroll = useCallback(() => {
    isDraggingRef.current = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    ensureRaf();
  }, [onPointerMove, ensureRaf]);

  const stopAutoScroll = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener("pointermove", onPointerMove);
  }, [onPointerMove]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrowState();

    const ro = new ResizeObserver(() => updateArrowState());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild as Element);

    const onResize = () => updateArrowState();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [updateArrowState]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      hoverVelocityRef.current = 0;
      hoverDirRef.current = 0;
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    startHoverScroll,
    stopHoverScroll,
    handleUserScroll,
    startAutoScroll,
    stopAutoScroll,
  };
}
