import type {
  Feature,
  Item,
  Resource,
  Skill,
  Character,
  Familiar,
} from "../types/rpg.types";
import {
  useAppSettings,
  useThemeClasses,
} from "../contexts/AppSettingsContext";
import {
  Moon,
  Sun,
  Sword,
  Shield,
  Zap,
  Sparkles,
  GraduationCap,
  Backpack,
  PawPrint,
  Heart,
} from "lucide-react";

interface DnDAttributesProps {
  features: Feature[];
  items: Item[];
  resources: Resource[];
  skills: Skill[];
  familiars: Familiar[];
  activeChar: Character;
  getModValue: (score: number) => number;
  onToggleFeatureUse: (featureId: string, index: number) => void;
  onShortRest: () => void;
  onLongRest: () => void;
  onUpdateResourceCurrent: (id: string, delta: number) => void;
  onUpdateFamiliarHp: (id: string, delta: number) => void;
}

export function DnDAttributes({
  features,
  items,
  resources,
  skills,
  familiars,
  activeChar,
  getModValue,
  onToggleFeatureUse,
  onShortRest,
  onLongRest,
  onUpdateResourceCurrent,
  onUpdateFamiliarHp,
}: DnDAttributesProps) {
  const t = useThemeClasses();
  const { dashboardVisibility } = useAppSettings();

  const presentFamiliars = familiars.filter(f => f.status === 'present');

  const equippedWeapons = items.filter(
    (i) => i.category === "arme" && i.equipped,
  );
  const equippedArmors = items.filter(
    (i) => i.category === "armure" && i.equipped,
  );

  const displayedClassFeatures = features.filter(
    (f) =>
      f.type === "classe" &&
      (f.category !== "passive" || (!!f.resource_id && !!f.resource_cost)),
  );

  const classResourceIds = Array.from(
    new Set(
      displayedClassFeatures
        .filter((f) => !!f.resource_id && !!f.resource_cost)
        .map((f) => f.resource_id as string),
    ),
  );
  const classResources = classResourceIds
    .map((id) => resources.find((r) => r.id === id))
    .filter((r): r is Resource => !!r);

  const speciesFeatures = features.filter(
    (f) => f.type === "espece" && f.category !== "passive",
  );
  const gifts = features.filter(
    (f) => f.type === "don" && f.category !== "passive",
  );
  const proficientSkills = skills.filter((s) => s.proficient);

  const sectionStyles = {
    rest: "border-sky-300/35 bg-gradient-to-r from-sky-500/14 to-cyan-500/8 ring-1 ring-sky-300/20",
    resources: "border-violet-400/22 bg-violet-500/4",
    equipment: "border-rose-400/22 bg-rose-500/4",
    class: "border-amber-400/22 bg-amber-500/4",
    species: "border-emerald-400/22 bg-emerald-500/4",
    skills: "border-cyan-400/22 bg-cyan-500/4",
  };

  return (
    <div className="space-y-2">
      <div
        className={`sticky top-0 z-10 ${t.cardBg} ${sectionStyles.rest} border ${t.cardBorder} rounded-2xl px-3 py-2 shadow-sm ${t.cardShadow} flex items-center justify-between backdrop-blur-xl`}
      >
        <span
          className={`text-[10px] font-semibold ${t.textMuted} uppercase tracking-wider`}
        >
          Repos
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onShortRest}
            className={`flex items-center gap-1.5 ${t.inputBg} bg-linear-to-b from-sky-500/18 to-sky-500/6 border border-sky-300/30 ${t.textSecondary} hover:brightness-90 active:scale-90 transition-all rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider`}
          >
            <Sun size={11} /> Court
          </button>
          <button
            onClick={onLongRest}
            className={`flex items-center gap-1.5 ${t.inputBg} bg-linear-to-b from-cyan-500/16 to-cyan-500/6 border border-cyan-300/30 ${t.textSecondary} hover:brightness-90 active:scale-90 transition-all rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider`}
          >
            <Moon size={11} /> Long
          </button>
        </div>
      </div>

      {dashboardVisibility.showProficientSkills &&
        proficientSkills.length > 0 && (
          <section
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow} ${sectionStyles.skills}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <h4
                className={`text-[10px] font-bold uppercase tracking-wider ${t.textPrimary} flex items-center gap-1.5`}
              >
                <GraduationCap size={12} /> Maîtrises
              </h4>
              <span className={`text-[9px] ${t.textMuted} uppercase`}>
                {proficientSkills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {proficientSkills.map((skill) => {
                const bonus =
                  getModValue(activeChar[skill.attr] || 10) +
                  (activeChar.proficiency_bonus || 2);
                const sign = bonus >= 0 ? `+${bonus}` : `${bonus}`;
                return (
                  <span
                    key={skill.name}
                    className={`flex items-center gap-1 ${t.accentBg} border ${t.accentBorder} ${t.accent} rounded-full px-2.5 py-0.5 text-[10px] font-bold`}
                  >
                    {skill.name}{" "}
                    <span className="font-mono opacity-80">{sign}</span>
                  </span>
                );
              })}
            </div>
          </section>
        )}

      {dashboardVisibility.showEquipment &&
        (equippedWeapons.length > 0 || equippedArmors.length > 0) && (
          <section
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow} ${sectionStyles.equipment}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <h4
                className={`text-[10px] font-bold uppercase tracking-wider ${t.textPrimary} flex items-center gap-1.5`}
              >
                <Backpack size={12} /> Équipement porté
              </h4>
              <span className={`text-[9px] ${t.textMuted} uppercase`}>
                {equippedWeapons.length + equippedArmors.length}
              </span>
            </div>

            <div className="space-y-2">
              {equippedWeapons.map((item) => (
                <div
                  key={item.id}
                  className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center gap-3`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-lg ${t.accentBg} border ${t.accentBorder} shrink-0`}
                  >
                    <Sword size={12} className={t.accent} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs font-bold ${t.textPrimary} block truncate`}
                    >
                      {item.name}
                    </span>
                    {item.range && (
                      <span className={`text-[9px] ${t.textMuted}`}>
                        {item.range}
                      </span>
                    )}
                  </div>
                  {item.damage && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-mono font-bold shrink-0">
                      ⚔ {item.damage}
                    </span>
                  )}
                </div>
              ))}

              {equippedArmors.map((item) => (
                <div
                  key={item.id}
                  className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center gap-3`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-lg ${t.accentBg} border ${t.accentBorder} shrink-0`}
                  >
                    <Shield size={12} className={t.accent} />
                  </div>
                  <span
                    className={`text-xs font-bold ${t.textPrimary} flex-1 truncate`}
                  >
                    {item.name}
                  </span>
                  {item.defense_bonus !== undefined &&
                    item.defense_bonus > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[11px] font-mono font-bold shrink-0">
                        🛡 +{item.defense_bonus} CA
                      </span>
                    )}
                </div>
              ))}
            </div>
          </section>
        )}

      {presentFamiliars.length > 0 && (
        <section
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow} border-emerald-400/22 bg-emerald-500/4`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <h4 className={`text-[10px] font-bold uppercase tracking-wider ${t.textPrimary} flex items-center gap-1.5`}>
              <PawPrint size={12} /> Familiers présents
            </h4>
          </div>
          <div className="space-y-2">
            {presentFamiliars.map(fam => {
              const hpPct = fam.hp_max > 0 ? Math.round((fam.hp_current / fam.hp_max) * 100) : 0;
              const hpColor = hpPct > 60 ? 'bg-emerald-500' : hpPct > 30 ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <div key={fam.id} className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center gap-3`}>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 shrink-0`}>
                    <PawPrint size={12} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 max-w-max justify-between w-full`}>
                      <div className={`flex items-center gap-1.5 max-w-max`}>
                        <span className={`text-xs font-bold ${t.textPrimary} block truncate`}>{fam.name}</span>
                        {fam.species && <span className={`text-[9px] ${t.textMuted}`}>{fam.species}</span>}
                      </div>
                      {fam.ac && (
                        <span className={`text-[9px] font-mono font-bold ${t.textMuted} flex items-center gap-0.5`}>CA {fam.ac}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => onUpdateFamiliarHp(fam.id, -1)} className={`w-5 h-5 flex items-center justify-center rounded-md ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-xs font-bold hover:brightness-90 active:scale-90 transition-all`}>−</button>
                        <span className={`text-[10px] font-mono font-bold ${t.textPrimary} min-w-8 text-center`}>{fam.hp_current}<span className={`${t.textMuted} font-normal`}>/{fam.hp_max}</span></span>
                        <button type="button" onClick={() => onUpdateFamiliarHp(fam.id, +1)} className={`w-5 h-5 flex items-center justify-center rounded-md ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-xs font-bold hover:brightness-90 active:scale-90 transition-all`}>+</button>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${hpColor}`} style={{ width: `${hpPct}%` }} />
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {dashboardVisibility.showClassFeatures &&
        displayedClassFeatures.length > 0 && (
          <section
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow} ${sectionStyles.class}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <h4
                className={`text-[10px] font-bold uppercase tracking-wider ${t.textPrimary} flex items-center gap-1.5`}
              >
                <Sword size={12} /> Capacités de classe
              </h4>
              <span className={`text-[9px] ${t.textMuted} uppercase`}>
                {displayedClassFeatures.length}
              </span>
            </div>

            {classResources.length > 0 && (
              <div
                className={`${t.inputBg} ${sectionStyles.resources} border rounded-xl p-2.5 mb-2.5`}
              >
                <div className="space-y-1.5">
                  {classResources.map((res) => (
                    <div
                      key={res.id}
                      className={`rounded-lg px-2.5 py-2 border ${t.cardBorder} bg-black/10 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Zap size={11} className="text-violet-400" />
                        <span className={`text-xs font-bold ${t.textPrimary}`}>
                          {res.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateResourceCurrent(res.id, -1)}
                          className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}
                        >
                          −
                        </button>
                        <span
                          className={`text-xs font-mono font-bold ${t.textPrimary} min-w-8 text-center`}
                        >
                          {res.current}
                          <span className={`${t.textMuted} font-normal`}>
                            /{res.max}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateResourceCurrent(res.id, +1)}
                          className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {displayedClassFeatures.map((feat) => {
                const linkedResource = feat.resource_id
                  ? resources.find((r) => r.id === feat.resource_id)
                  : null;
                const canUse =
                  linkedResource && feat.resource_cost
                    ? linkedResource.current >= feat.resource_cost
                    : true;

                if (linkedResource && feat.resource_cost)
                  return (
                    <div key={feat.id} className="space-y-1.5">
                      <button
                        type="button"
                        disabled={!canUse}
                        onClick={() =>
                          onUpdateResourceCurrent(
                            feat.resource_id!,
                            -feat.resource_cost!,
                          )
                        }
                        className={`w-full ${t.inputBg} rounded-xl p-3 border ${canUse ? t.cardBorder : "border-transparent opacity-50"} text-left active:scale-[0.97] hover:brightness-95 transition-all disabled:cursor-not-allowed`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span
                            className={`text-xs font-bold ${t.textPrimary}`}
                          >
                            {feat.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-violet-100 bg-violet-500/45 px-1.5 py-0.5 rounded-md border border-violet-200/70 shadow-[0_0_12px_rgba(167,139,250,0.35)] flex items-center gap-0.5 shrink-0">
                            <Zap size={10} className="inline" />
                            {feat.resource_cost}
                          </span>
                        </div>
                      </button>
                    </div>
                  );

                return (
                  <div
                    key={feat.id}
                    className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold ${t.textPrimary}`}>
                        {feat.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: feat.max }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFeatureUse(feat.id, i);
                            }}
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${i < feat.current ? `${t.accentBg} ${t.accentBorder}` : `${t.cardBg} ${t.cardBorder}`}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${i < feat.current ? `bg-current ${t.accent}` : "bg-transparent"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      {dashboardVisibility.showTraits &&
        (speciesFeatures.length > 0 || gifts.length > 0) && (
          <section
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow} ${sectionStyles.species}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <h4
                className={`text-[10px] font-bold uppercase tracking-wider ${t.textPrimary} flex items-center gap-1.5`}
              >
                <Sparkles size={12} /> Espèce & dons
              </h4>
              <span className={`text-[9px] ${t.textMuted} uppercase`}>
                {speciesFeatures.length + gifts.length}
              </span>
            </div>

            <div className="space-y-2">
              {speciesFeatures.map((feat) => (
                <div
                  key={feat.id}
                  className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder}`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold ${t.textPrimary} block`}
                    >
                      {feat.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: feat.max }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFeatureUse(feat.id, i);
                          }}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${i < feat.current ? `${t.accentBg} ${t.accentBorder} shadow-sm` : `${t.cardBg} ${t.cardBorder}`}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${i < feat.current ? `bg-current ${t.accent}` : "bg-transparent"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {gifts.map((feat) => (
                <div
                  key={feat.id}
                  className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder}`}
                >
                  <div className="flex justify-between items-center ">
                    <span className={`text-xs font-bold ${t.textPrimary}`}>
                      {feat.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: feat.max }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFeatureUse(feat.id, i);
                          }}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${i < feat.current ? `${t.accentBg} ${t.accentBorder} shadow-sm` : `${t.cardBg} ${t.cardBorder}`}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${i < feat.current ? `bg-current ${t.accent}` : "bg-transparent"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
