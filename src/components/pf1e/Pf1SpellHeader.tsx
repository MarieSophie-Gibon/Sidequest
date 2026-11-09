import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Pencil } from 'lucide-react';
import type { Pf1Sheet } from '../../systems/pf1e/types';
import { defensiveCastingDc, signed, STAT_SHORT } from '../../systems/pf1e/rules';
import { Pf1Collapsible } from './ui';

/** Encart « Incantation » Pathfinder 1e : DD par niveau et concentration. */
export function Pf1SpellHeader({ sheet, onEdit }: { sheet: Pf1Sheet; onEdit: () => void }) {
  const t = useThemeClasses();
  const sc = sheet.spellcasting;
  const editBtn = (
    <button onClick={onEdit} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md hover:brightness-110 active:scale-90 transition-all`} aria-label="Modifier l’incantation">
      <Pencil size={13} />
    </button>
  );

  if (!sc) {
    return (
      <Pf1Collapsible title="Incantation" aside={editBtn}>
        <p className={`text-[11px] ${t.textMuted}`}>Pas de caractéristique d’incantation. Touche le crayon pour en choisir une.</p>
      </Pf1Collapsible>
    );
  }

  const levels = sc.perDay.map((v, lvl) => ({ lvl, v })).filter(x => x.v !== null);

  return (
    <Pf1Collapsible
      title={`Incantation · ${STAT_SHORT[sc.stat]}`}
      aside={<>
        <span className={`text-[11px] ${t.textMuted} font-semibold`}>NLS <span className={`font-mono font-bold ${t.textPrimary}`}>{sc.casterLevel}</span></span>
        <span className={`text-[11px] ${t.textMuted} font-semibold`}>Conc. <span className="font-mono font-bold text-emerald-500">{signed(sc.concentration.total)}</span></span>
        {editBtn}
      </>}
    >
      <div className="space-y-1.5">
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
    </Pf1Collapsible>
  );
}
