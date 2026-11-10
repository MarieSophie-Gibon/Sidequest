import { useRef } from 'react';

const TABS = ['home', 'spells', 'features', 'attributes', 'inventory', 'biography', 'notes', 'settings'] as const;
type TabKey = typeof TABS[number];

const MIN_SWIPE_X = 55;

export function useSwipeNav(activeTab: TabKey, setActiveTab: (tab: TabKey) => void, hiddenTabs?: Set<string>) {
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

    // Onglets visibles seulement (une fiche homebrew peut en masquer).
    const visible = TABS.filter(tab => !hiddenTabs?.has(tab));
    const idx = visible.indexOf(activeTab);
    if (dx < 0 && idx < visible.length - 1) setActiveTab(visible[idx + 1]);
    else if (dx > 0 && idx > 0) setActiveTab(visible[idx - 1]);
  };

  return { onTouchStart, onTouchEnd };
}

