import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

interface TabUnderlineProps {
  containerRef: RefObject<HTMLDivElement | null>;
  activeKey: string;
  /**
   * Provide how to find a tab element by key. Defaults to querying
   * within container: [data-tab-key="<key>"]
   */
  getTabEl?: (key: string, container: HTMLElement) => HTMLElement | null;
  offsetLeft?: number; // visual padding compensation
  offsetRight?: number; // visual padding compensation
  bottom?: number; // px from bottom
  height?: number; // underline thickness
  transitionMs?: number;
}

export default function TabUnderline({
  containerRef,
  activeKey,
  getTabEl,
  offsetLeft = 12,
  offsetRight = 12,
  bottom = 0,
  height = 2,
  transitionMs = 300,
}: TabUnderlineProps) {
  const [pos, setPos] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const tabEl = getTabEl
      ? getTabEl(activeKey, container)
      : (container.querySelector(`[data-tab-key="${activeKey}"]`) as HTMLElement | null);
    if (!tabEl) return;
    const cRect = container.getBoundingClientRect();
    const r = tabEl.getBoundingClientRect();
    const left = r.left - cRect.left + offsetLeft;
    const width = Math.max(0, r.width - (offsetLeft + offsetRight));
    setPos({ left, width });
  }, [activeKey, containerRef, getTabEl, offsetLeft, offsetRight]);

  useLayoutEffect(() => { measure(); }, [measure]);
  useEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    const handler = () => measure();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [measure]);

  return (
    <div
      className="absolute rounded bg-underline-gradient"
      style={{
        bottom,
        height,
        transform: `translateX(${pos.left}px)`,
        width: pos.width,
        transition: `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1), width ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: 'transform, width',
      }}
    />
  );
}


