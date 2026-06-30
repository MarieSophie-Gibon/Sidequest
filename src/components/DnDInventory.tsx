import { useState } from "react";
import type { Character, Item } from "../types/rpg.types";
import { useThemeClasses } from "../contexts/AppSettingsContext";
import {
  CirclePlus,
  Sword,
  Shield,
  Package,
  Coins,
  FlaskConical,
  ScrollText,
  WandSparkles,
  Funnel,
  Leaf,
  Hammer,
  Clock3,
} from "lucide-react";

interface Props {
  activeChar: Character;
  items: Item[];
  onToggleItemEquip: (itemId: string) => void;
  onOpenAddItem: () => void;
  onOpenCrafting: () => void;
  onOpenEditItem: (item: Item) => void;
  onOpenItemAction: (item: Item) => void;
  onUpdateCurrency: <T extends keyof Character>(
    field: T,
    value: Character[T],
  ) => void;
}

export function DnDInventory({
  activeChar,
  items,
  onToggleItemEquip,
  onOpenAddItem,
  onOpenCrafting,
  onOpenEditItem,
  onOpenItemAction,
  onUpdateCurrency,
}: Props) {
  const t = useThemeClasses();
  const [showTypeFilters, setShowTypeFilters] = useState(false);

  // État de sauvegarde pour détecter les changements de la BDD (remplace le useEffect)
  const [prevCharData, setPrevCharData] = useState({
    id: activeChar.id,
    gold: activeChar.gold,
    silver: activeChar.silver,
    copper: activeChar.copper,
  });

  const [currencyInputs, setCurrencyInputs] = useState({
    charId: activeChar.id,
    gold: String(activeChar.gold),
    silver: String(activeChar.silver),
    copper: String(activeChar.copper),
  });

  // Synchronisation "Derived State" (Méthode officielle React pour remplacer useEffect)
  if (
    activeChar.id !== prevCharData.id ||
    activeChar.gold !== prevCharData.gold ||
    activeChar.silver !== prevCharData.silver ||
    activeChar.copper !== prevCharData.copper
  ) {
    setPrevCharData({
      id: activeChar.id,
      gold: activeChar.gold,
      silver: activeChar.silver,
      copper: activeChar.copper,
    });

    setCurrencyInputs((prev) => {
      // Si on est sur le même personnage, on met à jour les valeurs depuis la BDD.
      // On ne l'écrase pas si le champ est vide (en cours de frappe).
      if (prev.charId === activeChar.id) {
        return {
          charId: activeChar.id,
          gold: prev.gold === "" ? "" : String(activeChar.gold),
          silver: prev.silver === "" ? "" : String(activeChar.silver),
          copper: prev.copper === "" ? "" : String(activeChar.copper),
        };
      }
      
      // Si on a changé de personnage
      return {
        charId: activeChar.id,
        gold: String(activeChar.gold),
        silver: String(activeChar.silver),
        copper: String(activeChar.copper),
      };
    });
  }

  const [objectFilter, setObjectFilter] = useState<
    "all" | "objet" | "potion" | "parchemin" | "objet_magique" | "composant"
  >("all");

  const isEditingCurrentCharacter = currencyInputs.charId === activeChar.id;

  const objectTypeOptions: Array<{
    key:
      | "all"
      | "objet"
      | "potion"
      | "parchemin"
      | "objet_magique"
      | "composant";
    label: string;
  }> = [
    { key: "all", label: "Tout" },
    { key: "objet", label: "Objet" },
    { key: "potion", label: "Potion" },
    { key: "parchemin", label: "Parchemin" },
    { key: "objet_magique", label: "Magique" },
    { key: "composant", label: "Composant" },
  ];

  const getObjectIcon = (category?: Item["category"]) => {
    if (category === "potion") return FlaskConical;
    if (category === "parchemin") return ScrollText;
    if (category === "objet_magique") return WandSparkles;
    if (category === "composant") return Leaf;
    return Package;
  };

  const getObjectTone = (category?: Item["category"]) => {
    if (category === "potion") {
      return {
        cardTint: "bg-emerald-500/6 border-emerald-400/25",
        iconTint: "bg-emerald-500/16 border-emerald-400/35 text-emerald-300",
      };
    }
    if (category === "parchemin") {
      return {
        cardTint: "bg-amber-500/6 border-amber-400/25",
        iconTint: "bg-amber-500/16 border-amber-400/35 text-amber-300",
      };
    }
    if (category === "objet_magique") {
      return {
        cardTint: "bg-fuchsia-500/7 border-fuchsia-400/28",
        iconTint: "bg-fuchsia-500/18 border-fuchsia-400/40 text-fuchsia-300",
      };
    }
    if (category === "composant") {
      return {
        cardTint: "bg-lime-500/6 border-lime-400/25",
        iconTint: "bg-lime-500/16 border-lime-400/35 text-lime-300",
      };
    }
    return {
      cardTint: "bg-sky-500/5 border-sky-400/22",
      iconTint: "bg-sky-500/14 border-sky-400/30 text-sky-300",
    };
  };

  const weapons = items.filter((i) => i.category === "arme");
  const armors = items.filter((i) => i.category === "armure");
  const objects = items.filter(
    (i) =>
      !i.category ||
      i.category === "objet" ||
      i.category === "potion" ||
      i.category === "parchemin" ||
      i.category === "objet_magique" ||
      i.category === "composant",
  );

  const filteredObjects = objects.filter((item) => {
    if (objectFilter === "all") return true;
    const normalizedCategory = item.category || "objet";
    return normalizedCategory === objectFilter;
  });

  const formatCraftingDuration = (hours?: number | string | null) => {
    if (hours === null || hours === undefined || hours === "") return null;
    const numericHours = Number(hours);
    if (!Number.isFinite(numericHours) || numericHours <= 0) return null;
    const roundedHours = Number(numericHours.toFixed(1));
    const days = Number((numericHours / 8).toFixed(1));
    return `${roundedHours}h (${days}j)`;
  };

  const renderCraftingDurationPill = (hours?: number | string | null) => {
    const label = formatCraftingDuration(hours);
    if (!label) return null;

    return (
      <span
        className={`inline-flex items-center leading-none gap-1 rounded-full border ${t.accentBorder} ${t.accentBg} ${t.accent} font-semibold h-5 px-1.5 text-[9px]`}
      >
        <Clock3 size={10} />
        {label}
      </span>
    );
  };

  const renderQuantityPill = (quantity: number) => {
    return (
      <span
        className={`inline-flex items-center leading-none gap-1 rounded-full border ${t.inputBorder} ${t.inputBg} ${t.textPrimary} font-semibold h-5 px-1.5 text-[9px]`}
      >
        <span className="sr-only">Quantité</span>X {quantity}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {/* Purse section */}
      <div
        className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-2.5 shadow-sm ${t.cardShadow}`}
      >
        <div className="flex items-center gap-2.5">
          <Coins size={18} className={t.accent} />

          <div className="grid grid-cols-3 gap-1.5 flex-1">
            <div
              className={`${t.inputBg} border ${t.inputBorder} rounded-lg px-1.5 py-1`}
            >
              <label
                className={`text-[10px] uppercase font-semibold ${t.textMuted} block leading-none mb-1`}
              >
                PO
              </label>
              <input
                type="number"
                min="0"
                value={
                  isEditingCurrentCharacter
                    ? currencyInputs.gold
                    : String(activeChar.gold)
                }
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setCurrencyInputs({
                    charId: activeChar.id,
                    gold: nextValue,
                    silver: isEditingCurrentCharacter
                      ? currencyInputs.silver
                      : String(activeChar.silver),
                    copper: isEditingCurrentCharacter
                      ? currencyInputs.copper
                      : String(activeChar.copper),
                  });
                  if (nextValue === "") return;
                  onUpdateCurrency("gold", Math.max(0, Number(nextValue)));
                }}
                onBlur={() => {
                  if (isEditingCurrentCharacter && currencyInputs.gold === "") {
                    setCurrencyInputs((prev) => ({
                      ...prev,
                      gold: String(activeChar.gold),
                    }));
                  }
                }}
                className={`${t.inputText} bg-transparent w-full font-mono text-[20px] leading-none focus:outline-none text-end`}
              />
            </div>

            <div
              className={`${t.inputBg} border ${t.inputBorder} rounded-lg px-1.5 py-1`}
            >
              <label
                className={`text-[10px] uppercase font-semibold ${t.textMuted} block leading-none mb-1`}
              >
                PA
              </label>
              <input
                type="number"
                min="0"
                value={
                  isEditingCurrentCharacter
                    ? currencyInputs.silver
                    : String(activeChar.silver)
                }
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setCurrencyInputs({
                    charId: activeChar.id,
                    gold: isEditingCurrentCharacter
                      ? currencyInputs.gold
                      : String(activeChar.gold),
                    silver: nextValue,
                    copper: isEditingCurrentCharacter
                      ? currencyInputs.copper
                      : String(activeChar.copper),
                  });
                  if (nextValue === "") return;
                  onUpdateCurrency("silver", Math.max(0, Number(nextValue)));
                }}
                onBlur={() => {
                  if (
                    isEditingCurrentCharacter &&
                    currencyInputs.silver === ""
                  ) {
                    setCurrencyInputs((prev) => ({
                      ...prev,
                      silver: String(activeChar.silver),
                    }));
                  }
                }}
                className={`${t.inputText} bg-transparent w-full font-mono text-[20px] leading-none focus:outline-none text-end`}
              />
            </div>

            <div
              className={`${t.inputBg} border ${t.inputBorder} rounded-lg px-1.5 py-1`}
            >
              <label
                className={`text-[10px] uppercase font-semibold ${t.textMuted} block leading-none mb-1`}
              >
                PC
              </label>
              <input
                type="number"
                min="0"
                value={
                  isEditingCurrentCharacter
                    ? currencyInputs.copper
                    : String(activeChar.copper)
                }
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setCurrencyInputs({
                    charId: activeChar.id,
                    gold: isEditingCurrentCharacter
                      ? currencyInputs.gold
                      : String(activeChar.gold),
                    silver: isEditingCurrentCharacter
                      ? currencyInputs.silver
                      : String(activeChar.silver),
                    copper: nextValue,
                  });
                  if (nextValue === "") return;
                  onUpdateCurrency("copper", Math.max(0, Number(nextValue)));
                }}
                onBlur={() => {
                  if (
                    isEditingCurrentCharacter &&
                    currencyInputs.copper === ""
                  ) {
                    setCurrencyInputs((prev) => ({
                      ...prev,
                      copper: String(activeChar.copper),
                    }));
                  }
                }}
                className={`${t.inputText} bg-transparent w-full font-mono text-[20px] leading-none focus:outline-none text-end`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equipment section */}
      {(weapons.length > 0 || armors.length > 0) && (
        <div
          className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}
        >
          <h4
            className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider mb-3 flex items-center gap-1.5`}
          >
            <Sword size={14} /> Équipement
          </h4>
          <div className="space-y-2">
            {weapons.map((item) =>
              (() => {
                const craftingDurationLabel = formatCraftingDuration(
                  item.crafting_duration_hours,
                );
                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenEditItem(item)}
                    className={`${t.inputBg} rounded-xl p-2 border ${t.cardBorder} flex items-center gap-3 cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenItemAction(item);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border shrink-0 ${t.accentBg} ${t.accentBorder} ${t.accent} shadow-[0_0_4px_currentColor] opacity-90 transition-all duration-200 active:scale-90 active:shadow-[0_0_15px_currentColor] active:opacity-100 active:brightness-150`}
                      aria-label={`Actions pour ${item.name}`}
                    >
                      <Sword size={14} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-bold ${t.textPrimary} block truncate`}
                      >
                        {item.name}
                      </span>
                      {item.description && (
                        <p
                          className={`text-[10px] ${t.textSecondary} mt-0.5 leading-snug wrap-break-word`}
                        >
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.damage && (
                          <span className={`text-[9px] font-mono ${t.accent}`}>
                            {item.damage}
                          </span>
                        )}
                        {item.range && (
                          <span className={`text-[9px] ${t.textMuted}`}>
                            • {item.range}
                          </span>
                        )}
                        {craftingDurationLabel &&
                          renderCraftingDurationPill(
                            item.crafting_duration_hours,
                          )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleItemEquip(item.id);
                      }}
                      className={`text-[9px] font-bold px-2 h-5 rounded-xl border transition-all shrink-0 ${
                        item.equipped
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
                      }`}
                    >
                      {item.equipped ? "Équipé" : "Sac"}
                    </button>
                  </div>
                );
              })(),
            )}
            {armors.map((item) =>
              (() => {
                const craftingDurationLabel = formatCraftingDuration(
                  item.crafting_duration_hours,
                );
                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenEditItem(item)}
                    className={`${t.inputBg} rounded-xl p-2 border ${t.cardBorder} flex items-center gap-3 cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenItemAction(item);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border shrink-0 ${t.accentBg} ${t.accentBorder} ${t.accent} shadow-[0_0_4px_currentColor] opacity-90 transition-all duration-200 active:scale-90 active:shadow-[0_0_15px_currentColor] active:opacity-100 active:brightness-150`}
                      aria-label={`Actions pour ${item.name}`}
                    >
                      <Shield size={14} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-bold ${t.textPrimary} block truncate`}
                      >
                        {item.name}
                      </span>
                      {item.description && (
                        <p
                          className={`text-[10px] ${t.textSecondary} mt-0.5 leading-snug wrap-break-word`}
                        >
                          {item.description}
                        </p>
                      )}
                      {item.defense_bonus !== undefined &&
                        item.defense_bonus > 0 && (
                          <span
                            className={`text-[9px] font-mono ${t.accent} mt-0.5 block`}
                          >
                            +{item.defense_bonus} CA
                          </span>
                        )}
                      {craftingDurationLabel && (
                        <div className="mt-1">
                          {renderCraftingDurationPill(
                            item.crafting_duration_hours,
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleItemEquip(item.id);
                      }}
                      className={`text-[9px] font-bold px-2 h-5 rounded-xl border transition-all shrink-0 ${
                        item.equipped
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
                      }`}
                    >
                      {item.equipped ? "Équipé" : "Sac"}
                    </button>
                  </div>
                );
              })(),
            )}
          </div>
        </div>
      )}

      {/* Objects/Inventory section */}
      <div
        className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}
      >
        <div className="flex justify-between items-center mb-3">
          <h4
            className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}
          >
            <Package size={14} /> Inventaire
          </h4>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenCrafting}
              className={`w-6 h-6 flex items-center justify-center rounded-xl border transition-all ${t.cardBg} ${t.cardBorder} ${t.accent} hover:brightness-110 active:scale-90`}
              aria-label="Ouvrir l'artisanat"
            >
              <Hammer size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowTypeFilters((prev) => !prev)}
              className={`w-6 h-6 flex items-center justify-center rounded-xl border transition-all ${
                showTypeFilters || objectFilter !== "all"
                  ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                  : `${t.cardBg} ${t.cardBorder} ${t.textMuted}`
              } hover:brightness-110 active:scale-90`}
              aria-label="Filtrer par type"
            >
              <Funnel size={14} />
            </button>
            <button
              onClick={onOpenAddItem}
              className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}
            >
              <CirclePlus size={16} />
            </button>
          </div>
        </div>

        {(showTypeFilters || objectFilter !== "all") && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {objectTypeOptions.map((option) => {
              const isActive = objectFilter === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setObjectFilter(option.key)}
                  className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border transition-all ${
                    isActive
                      ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                      : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          {filteredObjects.length > 0 ? (
            filteredObjects.map((item) => {
              const Icon = getObjectIcon(item.category);
              const tone = getObjectTone(item.category);
              const craftingDurationLabel = formatCraftingDuration(
                item.crafting_duration_hours,
              );

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenEditItem(item)}
                  className={`${t.inputBg} ${tone.cardTint} p-2 rounded-xl border ${t.cardBorder} cursor-pointer transition-all hover:brightness-105 active:scale-[0.99]`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenItemAction(item);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border shrink-0 ${tone.iconTint} shadow-[0_0_4px_currentColor] opacity-90 transition-all duration-200 active:scale-90 active:shadow-[0_0_15px_currentColor] active:opacity-100 active:brightness-150`}
                      aria-label={`Actions pour ${item.name}`}
                    >
                      <Icon size={14} />
                    </button>

                    <div className="w-full min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className={`h-6 inline-flex items-center min-w-0 flex-1 text-xs font-bold ${t.textPrimary} truncate leading-none`}
                          >
                            {item.name}
                          </span>
                          {craftingDurationLabel && (
                            <div className="shrink-0">
                              {renderCraftingDurationPill(
                                item.crafting_duration_hours,
                              )}
                            </div>
                          )}
                          <div className="shrink-0">
                            {renderQuantityPill(item.quantity)}
                          </div>
                        </div>
                      </div>
                      {item.description && (
                        <p
                          className={`text-[10px] ${t.textSecondary} mt-1 leading-snug wrap-break-word`}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className={`text-xs ${t.textMuted} italic text-center p-4`}>
              {objectFilter === "all"
                ? "Votre inventaire est vide."
                : "Aucun objet dans ce type."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}