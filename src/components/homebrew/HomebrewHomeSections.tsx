import { useState } from 'react';
import { Coins, IdCard, Shield, ShieldHalf, Star } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { combatTotal, rollTotal, setValue, signed, type HomebrewData } from '../../systems/homebrew/sheet';
import { HbBreakdownText, MiniNum } from './ui';

interface Props {
  data: HomebrewData;
  onChange: (next: HomebrewData) => void;
}

/** Accueil d'une fiche homebrew : défense et combat, valeurs spéciales, sauvegardes, bourse. */
export function HomebrewHomeSections({ data, onChange }: Props) {
  const t = useThemeClasses();
  const [openCombat, setOpenCombat] = useState<string | null>(null);
  const { structure, values } = data;
  const card = `${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`;
  const heading = `flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${t.textPrimary} mb-2.5`;
  const numberSpecials = structure.specials.filter(sp => sp.type === 'number');
  const checkSpecials = structure.specials.filter(sp => sp.type === 'checkbox').slice(1); // la 1re est dans l'en-tête

  const identityFields = (structure.identity.extra ?? []).filter(f => (values.identity[f.id] ?? '').trim());

  return (
    <>
      {identityFields.length > 0 && (
        <section className={card}>
          <h4 className={heading}><IdCard size={12} /> Identité</h4>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {identityFields.map(f => (
              <div key={f.id} className="min-w-0">
                <dt className={`text-[9px] ${t.textMuted} uppercase font-bold truncate`}>{f.name}</dt>
                <dd className={`text-xs ${t.textPrimary} truncate`}>{values.identity[f.id]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {structure.combat.length > 0 && (
        <section className={`${card} border-sky-400/22 bg-sky-500/4`}>
          <h4 className={heading}><Shield size={12} /> Défense et combat</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {structure.combat.map(c => {
              const bd = combatTotal(data, c);
              const open = openCombat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setOpenCombat(open ? null : c.id)}
                  className={`rounded-xl border py-1.5 text-center transition-all ${open ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`}`}
                >
                  <span className={`text-[9px] ${t.textMuted} font-extrabold block uppercase leading-none truncate px-1`}>{c.name}</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-500 block mt-1 leading-none">{bd.total}</span>
                </button>
              );
            })}
          </div>
          {openCombat && (() => {
            const c = structure.combat.find(x => x.id === openCombat);
            if (!c) return null;
            return (
              <div className="mt-2 flex items-center justify-between gap-2">
                <HbBreakdownText breakdown={combatTotal(data, c)} />
                <label className={`flex items-center gap-1.5 text-[10px] ${t.textMuted} shrink-0`}>
                  Base
                  <MiniNum label={`Base ${c.name}`} value={values.combat[c.id] ?? 0} onChange={v => onChange(setValue(data, 'combat', c.id, v))} />
                </label>
              </div>
            );
          })()}
        </section>
      )}

      {(numberSpecials.length > 0 || checkSpecials.length > 0) && (
        <section className={`${card} border-amber-400/22 bg-amber-500/4`}>
          <h4 className={heading}><Star size={12} /> Valeurs spéciales</h4>
          <div className="space-y-1.5">
            {numberSpecials.map(sp => (
              <div key={sp.id} className={`flex items-center justify-between gap-2 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5`}>
                <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{sp.name}</span>
                <MiniNum label={sp.name} value={Number(values.specials[sp.id] ?? 0)} onChange={v => onChange(setValue(data, 'specials', sp.id, v))} />
              </div>
            ))}
            {checkSpecials.map(sp => (
              <label key={sp.id} className={`flex items-center justify-between gap-2 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5 cursor-pointer`}>
                <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{sp.name}</span>
                <input type="checkbox" checked={!!values.specials[sp.id]} onChange={e => onChange(setValue(data, 'specials', sp.id, e.target.checked))} />
              </label>
            ))}
          </div>
        </section>
      )}

      {structure.saves.length > 0 && (
        <section className={`${card} border-emerald-400/22 bg-emerald-500/4`}>
          <h4 className={heading}><ShieldHalf size={12} /> Sauvegardes</h4>
          <div className="space-y-1.5">
            {structure.saves.map(sv => {
              const v = values.saves[sv.id] ?? { bonus: 0, prof: false };
              const bd = rollTotal(data, sv, 'saves');
              return (
                <div key={sv.id} className={`flex items-center gap-2 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5`}>
                  {structure.proficiency && (
                    <input type="checkbox" aria-label={`Maîtrise ${sv.name}`} checked={v.prof} onChange={e => onChange(setValue(data, 'saves', sv.id, { ...v, prof: e.target.checked }))} />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className={`block text-xs font-bold ${t.textPrimary} truncate`}>{sv.name}</span>
                    <HbBreakdownText breakdown={bd} />
                  </span>
                  <MiniNum label={`Divers ${sv.name}`} value={v.bonus} onChange={b => onChange(setValue(data, 'saves', sv.id, { ...v, bonus: b }))} className="w-12" />
                  <span className="w-8 text-right text-xs font-bold font-mono text-emerald-500">{signed(bd.total)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {structure.currencies.length > 0 && (
        <section className={`${card} border-yellow-400/22 bg-yellow-500/4`}>
          <h4 className={heading}><Coins size={12} /> Bourse</h4>
          <div className="flex flex-wrap gap-2">
            {structure.currencies.map(cur => (
              <label key={cur.id} className={`flex items-center gap-1.5 ${t.inputBg} border ${t.cardBorder} rounded-xl px-2.5 py-1.5`}>
                <MiniNum label={cur.name} min={0} value={values.currencies[cur.id] ?? 0} onChange={v => onChange(setValue(data, 'currencies', cur.id, v))} className="w-16" />
                <span className={`text-xs font-bold ${t.textSecondary}`}>{cur.name}</span>
              </label>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
