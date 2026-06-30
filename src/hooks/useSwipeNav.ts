import { useRef } from 'react';

const TABS = ['home', 'spells', 'features', 'attributes', 'inventory', 'biography', 'notes', 'settings'] as const;
type TabKey = typeof TABS[number];

const MIN_SWIPE_X = 55;

export function useSwipeNav(activeTab: TabKey, setActiveTab: (tab: TabKey) => void) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    startX.current = null;
    startY.current = null;

    if (Math.abs(dx) < MIN_SWIPE_X || Math.abs(dy) > Math.abs(dx) * 1.2) return;

    const idx = TABS.indexOf(activeTab);
    if (dx < 0 && idx < TABS.length - 1) setActiveTab(TABS[idx + 1]);
    else if (dx > 0 && idx > 0) setActiveTab(TABS[idx - 1]);
  };

  return { onTouchStart, onTouchEnd };
}

