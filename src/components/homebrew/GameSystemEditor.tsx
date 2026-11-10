import { useState, type ReactNode } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { GameSystemRecord, HbAttackType, HbItemCategory, HbRest, HbRestGain, HbCategoryKey, HbModifierRule, HbSections, HbSpecial, HomebrewStructure } from '../../systems/homebrew/types';
import { CATEGORY_KEYS, categoriesOf, newId, removeSpecial, removeStat, SPECIAL_CATALOG, toggleCategory, prefillDnd, setBaseBonus, BASE_BONUS_FREE, identityFieldsOf, setIdentityFields, DEFAULT_IDENTITY_FIELDS, featureTypesOf, resourcesEnabled, restsOf, restsEnabled, SPELL_FIELD_KEYS, SPELL_FIELD_LABELS, spellFieldsOf, spellModeOf, itemCategoriesOf } from '../../systems/homebrew/presets';
import { Pf1Collapsible } from '../pf1e/ui';
import { ListEditor } from './ListEditor';

interface Props {
  system: GameSystemRecord;
  onSave: (fields: { name: string; description: string | null; structure: HomebrewStructure }) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onClose: () => void;
  /** Création d'un héros en cours : nom du héros et création une fois le modèle configuré. */
  heroName?: string;
  onCreateHero?: (structure: HomebrewStructure) => Promise<void>;
}

const CATEGORY_LABELS: Record<HbCategoryKey, string> = {
  stats: 'Caractéristiques',
  skills: 'Compétences',
  saves: 'Sauvegardes',
  gauges: 'Jauges (Mana…)',
  combat: 'Défense et combat',
  specials: 'Valeurs spéciales',
  attacks: 'Attaques',
  currencies: 'Bourse',
};

/** Choix spécial du menu « Bonus de base au toucher ». */
const ADD_SPECIAL = '__add_special__';

const ATTACK_TYPES: { id: HbAttackType; label: string }[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'distance', label: 'Distance' },
  { id: 'sort', label: 'Sort' },
];

const SECTION_LABELS: Record<keyof HbSections, string> = {
  features: 'Capacités',
  resources: 'Ressources',
  rests: 'Repos',
  spells: 'Sorts (onglet à part)',
  inventory: 'Inventaire',
  familiars: 'Familiers',
  biography: 'Biographie',
  notes: 'Notes',
};

/** Éditeur d'un système homebrew (lot 1) : général + structure de la fiche. */
export function GameSystemEditor({ system, onSave, onDelete, onClose, heroName, onCreateHero }: Props) {
  const t = useThemeClasses();
  const [name, setName] = useState(system.name);
  const [description, setDescription] = useState(system.description ?? '');
  const [s, setS] = useState<HomebrewStructure>(system.structure);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const input = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2.5 py-1.5 text-xs w-full focus:outline-none`;
  const select = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2 py-1 text-[11px] focus:outline-none`;
  const label = `text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`;
  const hint = `text-[10px] ${t.textMuted}`;

  const edit = (next: HomebrewStructure) => { setS(next); setDirty(true); };
  const set = <K extends keyof HomebrewStructure>(key: K, value: HomebrewStructure[K]) => edit({ ...s, [key]: value });
  const cat = categoriesOf(s);
  const rests = restsOf(s);

  /** Ligne « PV : + [n] × niveau » d'un repos non automatique. */
  const gainRow = (labelText: string, gain: HbRestGain | undefined, onChange: (g: HbRestGain) => void, key: string) => (
    <div key={key} className={`flex items-center gap-2 text-[10px] ${t.textMuted}`}>
      <span className="w-20 truncate">{labelText}</span>
      <span>+</span>
      <input
        type="number"
        min={0}
        value={gain?.amount ?? 0}
        onChange={e => onChange({ amount: Math.max(0, Math.trunc(Number(e.target.value) || 0)), perLevel: gain?.perLevel ?? false })}
        className={`${select} w-14 font-mono`}
      />
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={gain?.perLevel ?? false} onChange={e => onChange({ amount: gain?.amount ?? 0, perLevel: e.target.checked })} />
        × niveau
      </label>
    </div>
  );
  const [specialsSignal, setSpecialsSignal] = useState(0);

  /** Bonus de base au toucher ; « Ajouter une valeur spéciale… » coche la catégorie et y fait défiler la page. */
  const chooseBaseBonus = (value: string) => {
    if (value === ADD_SPECIAL) {
      if (!cat.specials) edit(toggleCategory(s, 'specials', true));
      setSpecialsSignal(n => n + 1);
      window.setTimeout(() => document.getElementById('hb-specials')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return;
    }
    edit(setBaseBonus(s, value || null));
  };
  const identityFields = identityFieldsOf(s);
  const missingIdentity = DEFAULT_IDENTITY_FIELDS.filter(d => !identityFields.some(f => f.column === d.column));
  const setCat = (key: HbCategoryKey, on: boolean) => edit(toggleCategory(s, key, on));

  /** Création d'un héros : enregistre le modèle, puis crée la fiche avec cette structure. */
  const createHero = async () => {
    if (!onCreateHero || !name.trim()) return;
    setSaving(true);
    const ok = dirty ? await onSave({ name, description: description || null, structure: s }) : true;
    if (ok) { setDirty(false); await onCreateHero(s); }
    setSaving(false);
  };

  const statSelect = (value: string | null, onChange: (v: string | null) => void) => (
    <label className={`flex items-center gap-1.5 text-[10px] ${t.textMuted}`}>
      Reliée à
      <select value={value ?? ''} onChange={e => onChange(e.target.value || null)} className={select}>
        <option value="">Aucune</option>
        {s.stats.map(st => <option key={st.id} value={st.id}>{st.short || st.name}</option>)}
      </select>
    </label>
  );

  const check = (checked: boolean, onChange: (v: boolean) => void, text: ReactNode, key?: string) => (
    <label key={key} className={`flex items-center gap-2 text-[11px] ${t.textSecondary} cursor-pointer`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      {text}
    </label>
  );

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const ok = await onSave({ name, description: description || null, structure: s });
    setSaving(false);
    if (ok) setDirty(false);
  };

  const leave = () => (dirty ? setConfirmLeave(true) : onClose());

  const numberSpecials = s.specials.filter(sp => sp.type === 'number');
  const toggleCatalog = (kind: (typeof SPECIAL_CATALOG)[number]['kind'], on: boolean) => {
    if (on) {
      const def = SPECIAL_CATALOG.find(c => c.kind === kind)!;
      edit({ ...s, specials: [...s.specials, { id: kind, kind, name: def.name, type: def.type }] });
    } else {
      edit(removeSpecial(s, kind));
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Barre du haut */}
      <div className="flex items-center gap-2 pb-2 shrink-0">
        <button type="button" onClick={leave} className={`p-2 rounded-xl border ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textSecondary}`} aria-label="Retour aux systèmes">
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className={`text-sm font-bold ${t.textPrimary} truncate`}>{name || 'Système sans nom'}</h2>
          {dirty && <p className={hint}>Modifications non enregistrées</p>}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving || !name.trim()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder}`}
        >
          <Save size={13} /> {saving ? '…' : 'Enregistrer'}
        </button>
      </div>

      {onCreateHero && (
        <div className={`mb-2 rounded-xl border ${t.accentBorder} ${t.accentBg} px-3 py-2.5 space-y-2 shrink-0`}>
          <p className={`text-[11px] ${t.textPrimary}`}>
            <span className={`font-bold ${t.accent}`}>Étape 2 / 2</span> · Configure le modèle de « {heroName} » : coche les éléments de ton jeu, puis crée le héros.
          </p>
          <button
            type="button"
            onClick={createHero}
            disabled={saving || !name.trim()}
            className={`w-full py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder}`}
          >
            {saving ? 'Création…' : `Créer le héros avec ce modèle`}
          </button>
        </div>
      )}

      {confirmLeave && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-[11px] text-amber-100 shrink-0">
          <span>Quitter sans enregistrer ?</span>
          <span className="flex gap-3 font-semibold">
            <button type="button" onClick={() => setConfirmLeave(false)}>Rester</button>
            <button type="button" onClick={onClose} className="text-rose-300">Quitter</button>
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-6 tab-grid">
        <Pf1Collapsible title="Général" defaultOpen>
          <div className="space-y-2">
            <div><span className={label}>Nom</span><input value={name} maxLength={80} onChange={e => { setName(e.target.value); setDirty(true); }} className={input} /></div>
            <div>
              <span className={label}>Description</span>
              <textarea value={description} maxLength={2000} onChange={e => { setDescription(e.target.value); setDirty(true); }} className={`${input} h-20 resize-none`} placeholder="Univers, ton, inspirations…" />
            </div>
          </div>
        </Pf1Collapsible>

        <Pf1Collapsible title={`Identité (${identityFields.length})`}>
          <div className="space-y-2">
            <p className={hint}>Par défaut Race et Classe (style D&D) : renomme-les, supprime-les (jeu sans races…) ou ajoute tes propres champs.</p>
            <ListEditor
              items={identityFields}
              onChange={v => edit(setIdentityFields(s, v))}
              createItem={() => ({ id: newId(), name: '' })}
              addLabel="Ajouter un champ d’identité"
              placeholder="Divinité, Âge, Faction…"
              emptyText="Aucun champ d’identité : seul le nom du personnage est affiché."
            />
            {missingIdentity.length > 0 && (
              <button
                type="button"
                onClick={() => edit(setIdentityFields(s, [...missingIdentity, ...identityFields]))}
                className={`w-full py-1.5 rounded-xl border border-dashed ${t.cardBorder} text-[11px] font-semibold ${t.textSecondary}`}
              >
                Remettre {missingIdentity.map(f => f.name).join(' et ')} (style D&D)
              </button>
            )}
            {check(s.identity.showLevel, v => set('identity', { ...s.identity, showLevel: v }), 'Afficher le niveau')}
          </div>
        </Pf1Collapsible>

        <Pf1Collapsible title="Éléments de la fiche" defaultOpen>
          <div className="space-y-3">
            <p className={hint}>Coche ce qui existe dans ton jeu. Une catégorie décochée disparaît de la fiche (son contenu est gardé si tu la recoches).</p>
            <div>
              <span className={label}>Valeurs et règles</span>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORY_KEYS.map(key => check(cat[key], v => setCat(key, v), CATEGORY_LABELS[key], key))}
              </div>
            </div>
            <div>
              <span className={label}>Onglets et repos</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(SECTION_LABELS) as (keyof HbSections)[]).map(key => check(
                  key === 'resources' ? resourcesEnabled(s) : key === 'rests' ? restsEnabled(s) : !!s.sections[key],
                  v => set('sections', { ...s.sections, [key]: v }), SECTION_LABELS[key], key,
                ))}
              </div>
              {s.sections.familiars && (
                <div className="pt-1.5">
                  {check(!!s.familiarAbilities, v => set('familiarAbilities', v), 'Familiers : capacités / attaque (en plus de nom, description, image, PV)')}
                </div>
              )}
              {s.sections.spells && (
                <div className="pt-2 space-y-2">
                  <div>
                    <span className={label}>Gestion des sorts</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([['slots', 'Emplacements', 'style D&D'], ['prepared', 'Préparés', 'style Pathfinder'], ['free', 'Libre', 'liste simple']] as const).map(([mode, title, sub]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => edit({ ...s, spellMode: mode, spellSlots: mode !== 'free' })}
                          className={`py-1.5 px-1 rounded-lg border text-[10px] font-semibold leading-tight transition-all ${spellModeOf(s) === mode ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
                        >
                          {title}<span className="block text-[8px] font-normal opacity-80">{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className={label}>Champs d’un sort</span>
                    <p className={`${hint} mb-1`}>Nom, niveau, portée et description sont toujours présents.</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SPELL_FIELD_KEYS.map(f => check(
                        spellFieldsOf(s).includes(f),
                        v => set('spellFields', v ? [...spellFieldsOf(s), f] : spellFieldsOf(s).filter(x => x !== f)),
                        SPELL_FIELD_LABELS[f],
                        f,
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Pf1Collapsible>

        {s.sections.inventory && <Pf1Collapsible title={`Catégories d’inventaire (${itemCategoriesOf(s).length})`}>
          <div className="space-y-2">
            <p className={hint}>Chaque objet a toujours nom, description, quantité et « équipé ». Coche les champs en plus pour chaque catégorie.</p>
            <ListEditor
              items={itemCategoriesOf(s)}
              onChange={v => set('itemCategories', v)}
              createItem={(): HbItemCategory => ({ id: newId(), name: '', fields: [] })}
              addLabel="Ajouter une catégorie"
              emptyText="Aucune catégorie."
              renderExtra={(item, update) => (
                <div className="flex gap-3">
                  {([['bonus', 'Bonus'], ['dm', 'DM (dégâts)']] as const).map(([f, l]) => check(
                    item.fields.includes(f),
                    v => update({ fields: v ? [...item.fields, f] : item.fields.filter(x => x !== f) }),
                    l,
                    f,
                  ))}
                </div>
              )}
            />
          </div>
        </Pf1Collapsible>}

        {s.sections.features && <Pf1Collapsible title={`Types de capacités (${featureTypesOf(s).length})`}>
          <div className="space-y-2">
            <p className={hint}>Chaque type devient un groupe de l’onglet Capacités (capacités de classe, de race, dons…). Le joueur y ajoute ses capacités.</p>
            <ListEditor
              items={featureTypesOf(s)}
              onChange={v => set('featureTypes', v)}
              createItem={() => ({ id: newId(), name: '' })}
              addLabel="Ajouter un type de capacité"
              emptyText="Aucun type : l’onglet Capacités n’aura pas de groupe."
            />
          </div>
        </Pf1Collapsible>}

        {restsEnabled(s) && <Pf1Collapsible title={`Repos (${rests.length})`}>
          <div className="space-y-2">
            <p className={hint}>Un bouton par repos sur la fiche. « Recharge automatique » : PV et jauges reviennent au maximum. Sinon, indique ce que le repos rend (ex. 1 PV × niveau).</p>
            <ListEditor
              items={rests}
              onChange={v => set('rests', v)}
              createItem={(): HbRest => ({ id: newId(), name: '', auto: true })}
              addLabel="Ajouter un repos"
              emptyText="Aucun repos : décoche « Repos » dans les éléments de la fiche."
              renderExtra={(item, update) => (
                <div className="space-y-1.5">
                  {check(item.auto, v => update({ auto: v }), 'Recharge automatique (PV et jauges au max)')}
                  {!item.auto && (
                    <div className="space-y-1">
                      {gainRow('PV', item.hp, g => update({ hp: g }), 'hp')}
                      {s.gauges.map(gauge => gainRow(
                        gauge.name || 'Jauge',
                        item.gauges?.[gauge.id],
                        g => update({ gauges: { ...(item.gauges ?? {}), [gauge.id]: g } }),
                        gauge.id,
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </Pf1Collapsible>}

        {resourcesEnabled(s) && <Pf1Collapsible title={`Ressources (${(s.resources ?? []).length})`}>
          <div className="space-y-2">
            <p className={hint}>Ressources présentes d’office sur chaque nouvelle fiche (Ki, Rage…). Le joueur coche une puce quand il l’utilise, et peut ajouter ses propres ressources.</p>
            <ListEditor
              items={s.resources ?? []}
              onChange={v => set('resources', v)}
              createItem={() => ({ id: newId(), name: '', defaultMax: 3, display: 'bullets' as const, restId: rests[0]?.id ?? null })}
              addLabel="Ajouter une ressource"
              emptyText="Aucune ressource prévue."
              renderExtra={(item, update) => {
                const display = item.display ?? 'bullets';
                const rest = rests.find(r => r.id === item.restId);
                return (
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <select value={display} onChange={e => update({ display: e.target.value as 'bullets' | 'valued' })} className={select} aria-label="Affichage">
                        <option value="bullets">Puces</option>
                        <option value="valued">Puces avec valeur</option>
                      </select>
                      {display === 'bullets' && (
                        <label className={`flex items-center gap-1.5 text-[10px] ${t.textMuted}`}>
                          Nombre
                          <input type="number" min={1} max={30} value={item.defaultMax} onChange={e => update({ defaultMax: Math.max(1, Math.min(30, Math.trunc(Number(e.target.value) || 1))) })} className={`${select} w-14 font-mono`} />
                        </label>
                      )}
                    </div>
                    {display === 'valued' && (
                      <label className={`block text-[10px] ${t.textMuted}`}>
                        Valeur de chaque puce, séparées par des virgules
                        <input
                          type="text"
                          value={(item.values ?? []).join(', ')}
                          placeholder="d8, d8, d10"
                          onChange={e => {
                            const values = e.target.value.split(',').map(v => v.trim());
                            update({ values, defaultMax: values.filter(Boolean).length });
                          }}
                          className={`${input} mt-0.5 font-mono`}
                        />
                      </label>
                    )}
                    {restsEnabled(s) && (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className={`flex items-center gap-1.5 text-[10px] ${t.textMuted}`}>
                          Rechargée par
                          <select value={item.restId ?? ''} onChange={e => update({ restId: e.target.value || null })} className={select}>
                            <option value="">Aucun repos</option>
                            {rests.map(r => <option key={r.id} value={r.id}>{r.name || 'Repos'}</option>)}
                          </select>
                        </label>
                        {rest && !rest.auto && (
                          <label className={`flex items-center gap-1.5 text-[10px] ${t.textMuted}`}>
                            Récupère
                            <input
                              type="number"
                              min={0}
                              value={item.restAmount ?? ''}
                              placeholder="tout"
                              onChange={e => update({ restAmount: e.target.value === '' ? null : Math.max(0, Math.trunc(Number(e.target.value))) })}
                              className={`${select} w-14 font-mono`}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </Pf1Collapsible>}

        {cat.stats && <Pf1Collapsible title={`Caractéristiques (${s.stats.length})`}>
          <div className="space-y-2.5">
          <label className={`flex items-center justify-between gap-2 text-[11px] ${t.textSecondary}`}>
            Modificateurs
            <select value={s.modifierRule ?? 'dnd'} onChange={e => set('modifierRule', e.target.value as HbModifierRule)} className={select}>
              <option value="dnd">D&D (10 = 0, 12 = +1, 8 = −1…)</option>
              <option value="libre">Libre (saisi par le joueur)</option>
            </select>
          </label>
          {s.stats.length === 0 && (
            <button type="button" onClick={() => edit(prefillDnd(s, 'stats'))} className={`w-full py-2 rounded-xl border ${t.accentBorder} ${t.accentBg} ${t.accent} text-[11px] font-bold`}>
              Ajouter les caractéristiques de D&D (FOR, DEX, CON, INT, SAG, CHA)
            </button>
          )}
          <ListEditor
            items={s.stats}
            onChange={v => set('stats', v)}
            onRemove={item => edit(removeStat(s, item.id))}
            createItem={() => ({ id: newId(), name: '', short: '', showMod: true })}
            addLabel="Ajouter une caractéristique"
            renderExtra={(item, update) => (
              <>
                <input value={item.short} maxLength={4} placeholder="ABR" onChange={e => update({ short: e.target.value.toUpperCase() })} className={`${select} w-16 font-mono`} aria-label="Abréviation" />
                {check(item.showMod, v => update({ showMod: v }), 'Afficher le modificateur')}
              </>
            )}
          />
          </div>
        </Pf1Collapsible>}

        {cat.skills && <Pf1Collapsible title={`Compétences (${s.skills.length})`}>
          <div className="space-y-2">
            {check(s.proficiency, v => set('proficiency', v), 'Case de maîtrise sur les compétences et sauvegardes')}
            {s.skills.length === 0 && (
              <button type="button" onClick={() => edit(prefillDnd(s, 'skills'))} className={`w-full py-2 rounded-xl border ${t.accentBorder} ${t.accentBg} ${t.accent} text-[11px] font-bold`}>
                Ajouter les 18 compétences de D&D
              </button>
            )}
            <ListEditor
              items={s.skills}
              onChange={v => set('skills', v)}
              createItem={() => ({ id: newId(), name: '', statId: null })}
              addLabel="Ajouter une compétence"
              renderExtra={(item, update) => statSelect(item.statId, v => update({ statId: v }))}
            />
          </div>
        </Pf1Collapsible>}

        {cat.saves && <Pf1Collapsible title={`Sauvegardes (${s.saves.length})`}>
          <div className="space-y-2">
          {s.saves.length === 0 && (
            <button type="button" onClick={() => edit(prefillDnd(s, 'saves'))} className={`w-full py-2 rounded-xl border ${t.accentBorder} ${t.accentBg} ${t.accent} text-[11px] font-bold`}>
              Ajouter une sauvegarde par caractéristique
            </button>
          )}
          <ListEditor
            items={s.saves}
            onChange={v => set('saves', v)}
            createItem={() => ({ id: newId(), name: '', statId: null })}
            addLabel="Ajouter une sauvegarde"
            renderExtra={(item, update) => statSelect(item.statId, v => update({ statId: v }))}
          />
          </div>
        </Pf1Collapsible>}

        {cat.gauges && <Pf1Collapsible title={`Jauges (${s.gauges.length + 1})`}>
          <div className="space-y-2">
            <p className={hint}>Les PV sont toujours présents. Ajoute ici les autres jauges (Mana, Stress…).</p>
            <ListEditor
              items={s.gauges}
              onChange={v => set('gauges', v)}
              createItem={() => ({ id: newId(), name: '', defaultMax: 10 })}
              addLabel="Ajouter une jauge"
              renderExtra={(item, update) => (
                <label className={`flex items-center gap-1.5 text-[10px] ${t.textMuted}`}>
                  Max par défaut
                  <input type="number" min={0} value={item.defaultMax} onChange={e => update({ defaultMax: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })} className={`${select} w-16 font-mono`} />
                </label>
              )}
            />
          </div>
        </Pf1Collapsible>}

        {cat.combat && <Pf1Collapsible title={`Défense et combat (${s.combat.length})`}>
          <div className="space-y-2">
            <p className={hint}>Reliée à une caractéristique : la fiche affiche base + modificateur (ex. CA = 10 + mod. DEX).</p>
            <ListEditor
              items={s.combat}
              onChange={v => set('combat', v)}
              createItem={() => ({ id: newId(), name: '', statId: null })}
              addLabel="Ajouter une valeur"
              renderExtra={(item, update) => statSelect(item.statId, v => update({ statId: v }))}
            />
          </div>
        </Pf1Collapsible>}

        {cat.specials && <Pf1Collapsible id="hb-specials" openSignal={specialsSignal} title={`Valeurs spéciales (${s.specials.length})`}>
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 gap-1.5">
              {SPECIAL_CATALOG.map(c => check(
                s.specials.some(sp => sp.kind === c.kind),
                v => toggleCatalog(c.kind, v),
                <span>{c.name} <span className={hint}>({c.type === 'checkbox' ? 'case à cocher' : 'nombre'})</span></span>,
                c.kind,
              ))}
            </div>
            <span className={label}>Valeurs personnalisées</span>
            <ListEditor<HbSpecial>
              items={s.specials.filter(sp => sp.kind === 'custom')}
              onChange={custom => set('specials', [...s.specials.filter(sp => sp.kind !== 'custom'), ...custom])}
              onRemove={item => edit(removeSpecial(s, item.id))}
              createItem={() => ({ id: newId(), kind: 'custom', name: '', type: 'number' })}
              addLabel="Ajouter une valeur personnalisée"
              emptyText="Aucune valeur personnalisée."
              renderExtra={(item, update) => (
                <select value={item.type} onChange={e => update({ type: e.target.value as HbSpecial['type'] })} className={select}>
                  <option value="number">Nombre</option>
                  <option value="checkbox">Case à cocher</option>
                </select>
              )}
            />
          </div>
        </Pf1Collapsible>}

        {cat.attacks && <Pf1Collapsible title="Attaques">
          <div className="space-y-2.5">


                <div className="flex flex-wrap gap-3">
                  {ATTACK_TYPES.map(at => check(
                    s.attacks.types.includes(at.id),
                    v => set('attacks', { ...s.attacks, types: v ? [...s.attacks.types, at.id] : s.attacks.types.filter(x => x !== at.id) }),
                    at.label,
                    at.id,
                  ))}
                </div>
                {s.sections.spells && s.attacks.types.includes('sort') && (
                  <p className={hint}>La section Sorts est activée : les attaques de sort seront dans l’onglet Sorts, pas dans les capacités.</p>
                )}
                <label className={`flex items-center gap-1.5 text-[11px] ${t.textSecondary}`}>
                  Bonus de base au toucher
                  <select value={s.attacks.baseBonusId ?? ''} onChange={e => chooseBaseBonus(e.target.value)} className={`${select} max-w-[60%]`}>
                    <option value="">Aucun</option>
                    <option value={BASE_BONUS_FREE}>Libre (saisi par le joueur)</option>
                    {cat.specials && numberSpecials.length > 0
                      ? <optgroup label="Valeurs spéciales">{numberSpecials.map(sp => <option key={sp.id} value={sp.id}>{sp.name || 'Sans nom'}</option>)}</optgroup>
                      : <option value={ADD_SPECIAL}>Ajouter une valeur spéciale…</option>}
                  </select>
                </label>
                <p className={hint}>
                  {s.attacks.baseBonusId === BASE_BONUS_FREE
                    ? 'Le joueur saisit lui-même son bonus de base sur sa fiche.'
                    : 'Une valeur spéciale (nombre) dont le joueur saisit la valeur sur sa fiche ; elle s’ajoute au toucher des attaques cochées « bonus de base ».'}
                </p>
                <p className={hint}>Chaque attaque a aussi ses DM (dés + caractéristique + divers).</p>


          </div>
        </Pf1Collapsible>}

        {cat.currencies && <Pf1Collapsible title={`Bourse (${s.currencies.length})`}>
          <ListEditor
            items={s.currencies}
            onChange={v => set('currencies', v)}
            createItem={() => ({ id: newId(), name: '' })}
            addLabel="Ajouter une monnaie"
            placeholder="po, crédits…"
            emptyText="Pas de bourse sur la fiche."
          />
        </Pf1Collapsible>}

        <div className="tab-full pt-2">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-400/45 bg-rose-500/15 px-3 py-2 text-[11px] text-rose-100">
              <span>Supprimer définitivement « {system.name} » ?</span>
              <span className="flex gap-3 font-semibold">
                <button type="button" onClick={() => setConfirmDelete(false)}>Annuler</button>
                <button type="button" onClick={async () => { if (await onDelete()) onClose(); }} className="text-rose-300">Supprimer</button>
              </span>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-300 text-[11px] font-semibold">
              <Trash2 size={12} /> Supprimer ce système
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
