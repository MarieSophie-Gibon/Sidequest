import { useThemeClasses } from '../contexts/AppSettingsContext';
import type { Resource } from '../types/rpg.types';

interface Props {
  resource: Resource;
  /** Compteur −/+ (ressources D&D / Pathfinder). */
  onDelta: (id: string, delta: number) => void;
  /** Puces simples : nouvelle valeur restante. */
  onSetCurrent: (id: string, current: number) => void;
  /** Puces avec valeur : bascule utilisée / disponible. */
  onToggleBullet: (id: string, index: number) => void;
}

/**
 * Affichage d'une ressource selon son type :
 * compteur −/+ (par défaut), puces cochées quand elles sont utilisées, ou puces portant chacune une valeur.
 */
export function ResourceTracker({ resource: res, onDelta, onSetCurrent, onToggleBullet }: Props) {
  const t = useThemeClasses();
  const stepBtn = `w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`;
  const bulletBase = 'flex items-center justify-center rounded-full border transition-all active:scale-90';

  if (res.display === 'valued' && res.bullets && res.bullets.length > 0) {
    return (
      <div className="flex flex-wrap justify-end gap-1">
        {res.bullets.map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onToggleBullet(res.id, i)}
            aria-label={`${b.value || 'Puce'} ${b.used ? 'utilisée' : 'disponible'}`}
            className={`${bulletBase} min-w-7 h-7 px-1 text-[10px] font-mono font-bold ${b.used ? `${t.inputBg} ${t.inputBorder} ${t.textMuted} line-through opacity-60` : `${t.accentBg} ${t.accentBorder} ${t.accent}`}`}
          >
            {b.value || '•'}
          </button>
        ))}
      </div>
    );
  }

  if (res.display === 'bullets') {
    const used = Math.max(0, res.max - res.current);
    return (
      <div className="flex flex-wrap justify-end gap-1">
        {Array.from({ length: res.max }).map((_, i) => {
          const isUsed = i < used;
          return (
            <button
              key={i}
              type="button"
              // Cocher une puce = utiliser jusqu'à elle ; cliquer une puce cochée la rend (ainsi que les suivantes).
              onClick={() => onSetCurrent(res.id, res.max - (isUsed ? i : i + 1))}
              aria-label={`Utilisation ${i + 1} ${isUsed ? 'utilisée' : 'disponible'}`}
              className={`${bulletBase} w-4 h-4 ${isUsed ? `${t.accent} bg-current border-current` : `bg-transparent ${t.inputBorder}`}`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onDelta(res.id, -1)} className={stepBtn}>−</button>
      <span className={`text-xs font-mono font-bold ${t.textPrimary} min-w-8 text-center`}>{res.current}<span className={`${t.textMuted} font-normal`}>/{res.max}</span></span>
      <button type="button" onClick={() => onDelta(res.id, +1)} className={stepBtn}>+</button>
    </div>
  );
}
