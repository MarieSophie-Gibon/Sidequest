import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { AlertTriangle } from 'lucide-react';
import type { Breakdown, Pf1Data, Pf1ManeuverSettings, Pf1Sheet } from '../../systems/pf1e/types';
import { signed } from '../../systems/pf1e/rules';
import { BreakdownText, Pf1Collapsible } from './ui';

/** Manœuvres de combat PF1 : d20 + BMO contre le DMD de la cible. */
const MANEUVERS: { id: string; name: string; improvedFeat: string; effect: string }[] = [
  { id: 'bull-rush', name: 'Bousculade', improvedFeat: 'Science de la bousculade', effect: 'Repousse la cible de 1,50 m, +1,50 m par tranche de 5 au-dessus du DMD.' },
  { id: 'trip', name: 'Croc-en-jambe', improvedFeat: 'Science du croc-en-jambe', effect: 'La cible tombe à terre. Échec de 10 ou plus : c’est vous qui tombez.' },
  { id: 'disarm', name: 'Désarmement', improvedFeat: 'Science du désarmement', effect: 'La cible lâche un objet tenu. Échec de 10 ou plus : vous lâchez votre arme.' },
  { id: 'grapple', name: 'Lutte', improvedFeat: 'Science de la lutte', effect: 'Les deux sont agrippés. Maintenir la lutte chaque round (+5) pour déplacer, blesser ou immobiliser.' },
  { id: 'overrun', name: 'Renversement', improvedFeat: 'Science du renversement', effect: 'Traverse la case de la cible pendant un déplacement ; réussite de 5 ou plus : elle tombe à terre.' },
  { id: 'sunder', name: 'Destruction', improvedFeat: 'Science de la destruction', effect: 'Inflige les dégâts de l’arme à un objet tenu ou porté par la cible.' },
  { id: 'dirty-trick', name: 'Sale coup', improvedFeat: 'Science du sale coup', effect: 'Aveuglé, ébloui, assourdi, enchevêtré, secoué ou nauséeux pendant 1 round, +1 par tranche de 5.' },
  { id: 'reposition', name: 'Repositionnement', improvedFeat: 'Science du repositionnement', effect: 'Déplace la cible de 1,50 m dans votre allonge, +1,50 m par tranche de 5.' },
  { id: 'steal', name: 'Subtilisation', improvedFeat: 'Science de la subtilisation', effect: 'Prend à la cible un objet qu’elle porte sans le tenir en main (pas une armure portée). Elle s’en rend compte aussitôt.' },
];

const DEFAULT_SETTINGS: Pf1ManeuverSettings = { improved: false, misc: 0 };

export function Pf1ManeuversCard({ data, sheet, onChange }: { data: Pf1Data; sheet: Pf1Sheet; onChange: (next: Pf1Data) => void }) {
  const t = useThemeClasses();
  const [open, setOpen] = useState<string | null>(null);
  const stepBtn = `w-5 h-5 flex items-center justify-center rounded-md ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-xs font-bold hover:brightness-90 active:scale-90 transition-all`;

  const settingsOf = (id: string) => ({ ...DEFAULT_SETTINGS, ...(data.maneuvers[id] ?? {}) });
  const update = (id: string, patch: Partial<Pf1ManeuverSettings>) => {
    const next = { ...settingsOf(id), ...patch };
    const maneuvers = { ...data.maneuvers };
    if (!next.improved && next.misc === 0) delete maneuvers[id]; else maneuvers[id] = next;
    onChange({ ...data, maneuvers });
  };

  const offense = (s: Pf1ManeuverSettings): Breakdown => {
    const parts: Breakdown['parts'] = [...sheet.cmb.parts];
    if (s.improved) parts.push(['Science', 2]);
    if (s.misc) parts.push(['Divers', s.misc]);
    return { total: sheet.cmb.total + (s.improved ? 2 : 0) + s.misc, parts };
  };

  return (
    <Pf1Collapsible
      title="Manœuvres"
      aside={<>
        <span className={`text-[11px] ${t.textMuted} font-semibold`}>BMO <span className="font-mono font-bold text-emerald-500">{signed(sheet.cmb.total)}</span></span>
        <span className={`text-[11px] ${t.textMuted} font-semibold`}>DMD <span className={`font-mono font-bold ${t.textPrimary}`}>{sheet.cmd.total}</span></span>
      </>}
    >
      <p className={`text-[10px] ${t.textMuted} mb-2.5`}>d20 + BMO contre le DMD de la cible. <AlertTriangle size={9} className="inline -mt-0.5 text-amber-400" /> = provoque une attaque d’opportunité.</p>

      <div className="space-y-1.5">
        {MANEUVERS.map(m => {
          const s = settingsOf(m.id);
          const bd = offense(s);
          const isOpen = open === m.id;
          return (
            <div key={m.id} className={`rounded-xl border transition-all ${isOpen ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : m.id)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{m.name}</span>
                  {s.improved
                    ? <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded border ${t.accentBorder} ${t.accent} leading-none`}>Science</span>
                    : <AlertTriangle size={10} className="text-amber-400 shrink-0" aria-label="Provoque une attaque d’opportunité" />}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-500 shrink-0">{signed(bd.total)}</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-2 space-y-2">
                  <p className={`text-[10px] ${t.textSecondary}`}>{m.effect}</p>
                  <BreakdownText breakdown={bd} />
                  <p className={`text-[10px] ${t.textMuted}`}>DMD contre cette manœuvre : <span className={`font-mono font-bold ${t.textPrimary}`}>{sheet.cmd.total + (s.improved ? 2 : 0)}</span></p>
                  <div className="flex items-center justify-between gap-2">
                    <label className={`flex items-center gap-1.5 text-[10px] ${t.textSecondary} cursor-pointer`}>
                      <input type="checkbox" checked={s.improved} onChange={(e) => update(m.id, { improved: e.target.checked })} />
                      {m.improvedFeat}
                    </label>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[9px] ${t.textMuted} uppercase mr-1`}>Divers</span>
                      <button type="button" className={stepBtn} onClick={() => update(m.id, { misc: s.misc - 1 })}>−</button>
                      <span className={`text-[10px] font-mono font-bold ${t.textSecondary} w-5 text-center`}>{signed(s.misc)}</span>
                      <button type="button" className={stepBtn} onClick={() => update(m.id, { misc: s.misc + 1 })}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Pf1Collapsible>
  );
}
