import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { rollTotal, setValue, signed, statModifier, statValue, type HomebrewData } from '../../systems/homebrew/sheet';
import { HbBreakdownText, MiniNum } from './ui';

interface Props {
  data: HomebrewData;
  onChange: (next: HomebrewData) => void;
}

/** Onglet Compétences d'une fiche homebrew : valeurs des caractéristiques, puis compétences. */
export function HomebrewSkillsTab({ data, onChange }: Props) {
  const t = useThemeClasses();
  const { structure, values } = data;
  const card = `${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`;
  const title = `text-xs font-semibold ${t.textPrimary} uppercase tracking-wider mb-3`;

  if (structure.stats.length === 0 && structure.skills.length === 0) {
    return <p className={`text-xs ${t.textMuted} italic text-center py-6`}>Ce système n’a ni caractéristiques ni compétences.</p>;
  }

  return (
    <div className="space-y-2 tab-grid">
      {structure.stats.length > 0 && (
        <div className={card}>
          <h4 className={title}>Caractéristiques</h4>
          <div className="grid grid-cols-3 gap-2">
            {structure.stats.map(s => {
              const value = statValue(data, s.id);
              return (
                <div key={s.id} className={`${t.inputBg} border ${t.cardBorder} rounded-xl p-2 text-center space-y-1`}>
                  <span className={`block text-[10px] font-bold ${t.textMuted} uppercase truncate`}>{s.name}</span>
                  <MiniNum label={s.name} value={value} onChange={v => onChange(setValue(data, 'stats', s.id, v))} className="w-full" />
                  {structure.modifierRule === 'libre' ? (
                    <label className={`flex items-center justify-center gap-1 text-[9px] ${t.textMuted}`}>
                      Mod.
                      <MiniNum label={`Modificateur ${s.name}`} value={values.statMods[s.id] ?? 0} onChange={v => onChange(setValue(data, 'statMods', s.id, v))} className="w-11" />
                    </label>
                  ) : s.showMod && <span className="block text-xs font-bold font-mono text-emerald-500">{signed(statModifier(data, s.id))}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {structure.skills.length > 0 && (
        <div className={`${card} tab-full`}>
          <h4 className={title}>Compétences</h4>
          {structure.proficiency && <p className={`text-[10px] ${t.textMuted} -mt-2 mb-2.5`}>Coche une compétence maîtrisée : le bonus de maîtrise s’ajoute.</p>}
          <div className="space-y-1.5 tablet:space-y-0 tablet:grid tablet:grid-cols-2 tablet:gap-1.5">
            {structure.skills.map(sk => {
              const v = values.skills[sk.id] ?? { bonus: 0, prof: false };
              const bd = rollTotal(data, sk, 'skills');
              const stat = structure.stats.find(s => s.id === sk.statId);
              return (
                <div key={sk.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${v.prof ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`}`}>
                  {structure.proficiency && (
                    <input type="checkbox" aria-label={`Maîtrise ${sk.name}`} checked={v.prof} onChange={e => onChange(setValue(data, 'skills', sk.id, { ...v, prof: e.target.checked }))} />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className={`text-xs font-bold ${v.prof ? t.accent : t.textPrimary} truncate`}>{sk.name}</span>
                    {stat && <span className={`ml-1.5 text-[9px] font-mono ${t.textMuted}`}>{stat.short || stat.name}</span>}
                    <span className="block"><HbBreakdownText breakdown={bd} /></span>
                  </span>
                  <MiniNum label={`Divers ${sk.name}`} value={v.bonus} onChange={b => onChange(setValue(data, 'skills', sk.id, { ...v, bonus: b }))} className="w-12" />
                  <span className="w-8 text-right text-xs font-bold font-mono text-emerald-500">{signed(bd.total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
