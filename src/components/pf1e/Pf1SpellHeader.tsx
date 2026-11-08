import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Pf1Sheet } from '../../systems/pf1e/types';
import { defensiveCastingDc, signed, STAT_SHORT } from '../../systems/pf1e/rules';

/** En-tête de l'onglet Sorts pour Pathfinder 1e : DD par niveau et concentration. */
export function Pf1SpellHeader({ sheet, onEdit }: { sheet: Pf1Sheet; onEdit: () => void }) {
  const t = useThemeClasses();
  const sc = sheet.spellcasting;

  if (!sc) {
    return (
      <div onClick={onEdit} className={`${t.cardBg} border ${t.cardBorder} rounded-2xl px-3 py-2 shadow-sm ${t.cardShadow} cursor-pointer hover:brightness-95 active:scale-[0.98] transition-all`}>
        <h4 className={`text-[10px] font-semibold ${t.textPrimary} uppercase tracking-wider`}>Incantation</h4>
        <p className={`text-[11px] ${t.textMuted} mt-1`}>Pas de caractéristique d’incantation. Touche ici pour en choisir une.</p>
      </div>
    );
  }

  const levels = sc.perDay.map((v, lvl) => ({ lvl, v })).filter(x => x.v !== null);

  return (
    <div onClick={onEdit} className={`${t.cardBg} border ${t.cardBorder} rounded-2xl px-3 py-2 shadow-sm ${t.cardShadow} cursor-pointer hover:brightness-95 active:scale-[0.98] transition-all space-y-1.5`}>
      <div className="flex items-center justify-between">
        <h4 className={`text-[10px] font-semibold ${t.textPrimary} uppercase tracking-wider`}>Incantation · {STAT_SHORT[sc.stat]}</h4>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] ${t.textMuted} font-semibold`}>NLS <span className={`font-mono font-bold ${t.textPrimary}`}>{sc.casterLevel}</span></span>
          <span className={`text-[11px] ${t.textMuted} font-semibold`}>Conc. <span className="font-mono font-bold text-emerald-500">{signed(sc.concentration.total)}</span></span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {levels.map(({ lvl }) => (
          <span key={lvl} className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${t.inputBg} ${t.cardBorder} ${t.textSecondary}`}>
            DD niv.{lvl} <span className={`font-bold ${t.accent}`}>{sc.dcByLevel[lvl]}</span>
          </span>
        ))}
      </div>
      {levels.some(x => x.lvl > 0) && (
        <p className={`text-[10px] ${t.textMuted}`}>
          Sur la défensive : <span className="font-mono font-bold text-emerald-500">{signed(sc.defensiveConcentration.total)}</span> contre DD{' '}
          {levels.filter(x => x.lvl > 0).map(x => `${defensiveCastingDc(x.lvl)} (niv.${x.lvl})`).join(', ')}
        </p>
      )}
    </div>
  );
}
