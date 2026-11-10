import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Shield } from 'lucide-react';
import type { Pf1Data, Pf1SaveKey, Pf1Sheet } from '../../systems/pf1e/types';
import { signed } from '../../systems/pf1e/rules';

interface Props {
  data: Pf1Data;
  sheet: Pf1Sheet;
  onOpenDefense: () => void;
}

const SAVE_LABELS: Record<Pf1SaveKey, string> = { fort: 'Vigueur', ref: 'Réflexes', will: 'Volonté' };

/**
 * Encart « Défense » compact du tableau de bord Pathfinder : CA, DMD et jets de sauvegarde.
 * Tout l'encart ouvre la fenêtre Défense (qui règle aussi les sauvegardes).
 * Le BMO, offensif, est dans l'en-tête et la carte Manœuvres.
 */
export function Pf1DefenseSection({ data, sheet, onOpenDefense }: Props) {
  const t = useThemeClasses();

  const cell = (label: string, value: string, color: string) => (
    <div className={`rounded-lg border ${t.inputBg} ${t.cardBorder} py-1 text-center min-w-0`}>
      <span className={`text-[8px] ${t.textMuted} font-extrabold block uppercase leading-none truncate`}>{label}</span>
      <span className={`text-xs font-extrabold font-mono ${color} block mt-0.5 leading-none`}>{value}</span>
    </div>
  );

  // Rien d'affiché sans armure ni bouclier.
  const armorLine = [
    data.armor ? data.armor.name || 'Armure' : null,
    data.shield ? data.shield.name || 'Bouclier' : null,
  ].filter(Boolean).join(' + ');

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onOpenDefense}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDefense(); } }}
      aria-label="Modifier la défense et les jets de sauvegarde"
      className={`${t.cardBg} border border-sky-400/22 bg-sky-500/4 rounded-2xl px-3 py-2 shadow-sm ${t.cardShadow} cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h4 className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${t.textPrimary}`}><Shield size={12} /> Défense</h4>
        {armorLine && (
          <span className={`text-[9px] ${t.textMuted} truncate`}>
            {armorLine}
            {sheet.armorCheckPenalty < 0 && <> · malus <span className="font-mono">{sheet.armorCheckPenalty}</span></>}
            {sheet.spellFailure > 0 && <> · échec <span className="font-mono">{sheet.spellFailure}%</span></>}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {cell('CA', String(sheet.ac.total), t.accent)}
        {cell('Contact', String(sheet.touchAc.total), t.accent)}
        {cell('Dépourvu', String(sheet.flatFootedAc.total), t.accent)}
        {cell('DMD', String(sheet.cmd.total), t.accent)}
      </div>
      <div className="grid grid-cols-3 gap-1 mt-1">
        {(['fort', 'ref', 'will'] as Pf1SaveKey[]).map(k => (
          <div key={k} className="contents">{cell(SAVE_LABELS[k], signed(sheet.saves[k].total), 'text-emerald-500')}</div>
        ))}
      </div>
    </section>
  );
}
