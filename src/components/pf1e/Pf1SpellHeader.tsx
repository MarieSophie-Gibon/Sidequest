import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Sparkles } from 'lucide-react';
import type { Pf1Sheet } from '../../systems/pf1e/types';
import { signed, STAT_SHORT } from '../../systems/pf1e/rules';

/**
 * Encart « Incantation » Pathfinder 1e, sur une ligne : caractéristique utilisée, NLS et concentration.
 * Tout l'encart ouvre l'édition. Les formules de DD sont dans l'aide (onglet Magie).
 */
export function Pf1SpellHeader({ sheet, onEdit }: { sheet: Pf1Sheet; onEdit: () => void }) {
  const t = useThemeClasses();
  const sc = sheet.spellcasting;

  const pill = (label: string, value: string, color: string) => (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${t.inputBg} ${t.cardBorder} ${t.textMuted} whitespace-nowrap`}>
      {label} <span className={`font-mono font-bold ${color}`}>{value}</span>
    </span>
  );

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(); } }}
      aria-label="Modifier l’incantation"
      className={`${t.cardBg} border ${t.cardBorder} rounded-2xl px-3 py-2 shadow-sm ${t.cardShadow} cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all`}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${t.textPrimary} shrink-0`}>
          <Sparkles size={12} /> Incantation
        </h4>
        {sc ? (
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {pill(STAT_SHORT[sc.stat], signed(sc.mod), t.accent)}
            {pill('NLS', String(sc.casterLevel), t.textPrimary)}
            {pill('Conc.', signed(sc.concentration.total), 'text-emerald-500')}
          </div>
        ) : (
          <span className={`text-[10px] ${t.textMuted} italic truncate`}>Aucune caractéristique · touche pour en choisir une</span>
        )}
      </div>
    </section>
  );
}
