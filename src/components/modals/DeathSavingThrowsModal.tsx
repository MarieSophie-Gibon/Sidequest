import { useState } from 'react';
import { Heart, Skull, Shield } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';

interface DeathSavingThrowsModalProps {
  characterName: string;
  onStabilize: () => void;
  onClose: () => void;
}

export function DeathSavingThrowsModal({ characterName, onStabilize, onClose }: DeathSavingThrowsModalProps) {
  const t = useThemeClasses();
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);
  const [resolved, setResolved] = useState<'stable' | 'dead' | null>(null);

  function handleSuccessClick(i: number) {
    if (resolved) return;
    const newVal = i < successes ? i : i + 1;
    setSuccesses(newVal);
    if (newVal >= 3) {
      setResolved('stable');
      setTimeout(() => onStabilize(), 1200);
    }
  }

  function handleFailureClick(i: number) {
    if (resolved) return;
    const newVal = i < failures ? i : i + 1;
    setFailures(Math.min(3, newVal));
    if (Math.min(3, newVal) >= 3) setResolved('dead');
  }

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border ${t.cardBorder} rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>

        {/* Header */}
        <div className="text-center">
          <div className="text-3xl mb-1">💀</div>
          <h2 className={`text-base font-extrabold ${t.textPrimary}`}>Jets contre la Mort</h2>
          <p className={`text-[11px] ${t.textMuted} mt-0.5`}>{characterName} est à 0 PV</p>
        </div>

        {/* Resolved banners */}
        {resolved === 'stable' && (
          <div className="text-center py-2.5 bg-emerald-500/15 border border-emerald-500/35 rounded-xl space-y-0.5">
            <p className="text-emerald-400 font-extrabold text-sm">🫀 Stabilisé — 1 PV</p>
            <p className={`text-[10px] ${t.textMuted}`}>En péril · conscient mais affaibli</p>
          </div>
        )}
        {resolved === 'dead' && (
          <div className="text-center py-2.5 bg-rose-500/15 border border-rose-500/35 rounded-xl space-y-0.5">
            <p className="text-rose-400 font-extrabold text-sm">☠️ Mort</p>
            <p className={`text-[10px] ${t.textMuted}`}>Nécessite un sort de résurrection</p>
          </div>
        )}

        {/* Slots */}
        <div className="space-y-3">
          {/* Successes */}
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${t.textMuted} uppercase tracking-wide flex items-center gap-1.5`}>
              <Heart size={11} className="text-emerald-400" /> Succès
              <span className={`text-[9px] font-normal ${t.textMuted}`}>(≥ 10)</span>
            </span>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuccessClick(i)}
                  disabled={!!resolved}
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                    i < successes
                      ? 'bg-emerald-500/25 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]'
                      : `${t.inputBg} border-slate-600/40 hover:border-emerald-500/40`
                  } disabled:cursor-default`}
                >
                  {i < successes && <Heart size={15} className="text-emerald-400" fill="currentColor" />}
                </button>
              ))}
            </div>
          </div>

          {/* Failures */}
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${t.textMuted} uppercase tracking-wide flex items-center gap-1.5`}>
              <Skull size={11} className="text-rose-400" /> Échecs
              <span className={`text-[9px] font-normal ${t.textMuted}`}>(≤ 9)</span>
            </span>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleFailureClick(i)}
                  disabled={!!resolved}
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                    i < failures
                      ? 'bg-rose-500/25 border-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.35)]'
                      : `${t.inputBg} border-slate-600/40 hover:border-rose-500/40`
                  } disabled:cursor-default`}
                >
                  {i < failures && <Skull size={15} className="text-rose-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ally stabilize */}
        {!resolved && (
          <button
            type="button"
            onClick={() => { setResolved('stable'); onStabilize(); }}
            className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`}
          >
            <Shield size={13} />
            Un allié stabilise → 1 PV (en péril)
          </button>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2 rounded-xl text-xs font-semibold ${t.textMuted} hover:${t.textPrimary} transition-all border ${t.cardBorder} ${t.inputBg}`}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
