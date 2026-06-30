import { useMemo, useState } from "react";
import { Coins, Hand, Package } from "lucide-react";
import type { Item } from "../../types/rpg.types";
import { useThemeClasses } from "../../contexts/AppSettingsContext";
import { ModalHeader } from "./ModalControls";

interface Props {
  item: Item;
  onUse: (itemId: string) => Promise<boolean | void>;
  onSell: (
    itemId: string,
    saleValue: number,
    currency: "gold" | "silver" | "copper",
  ) => Promise<boolean | void>;
  onClose: () => void;
}

export function ItemActionModal({ item, onUse, onSell, onClose }: Props) {
  const t = useThemeClasses();
  const [mode, setMode] = useState<"choice" | "sell">("choice");
  const [saleValueInput, setSaleValueInput] = useState("");
  const [currency, setCurrency] = useState<"gold" | "silver" | "copper" | "">(
    "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedSaleValue = useMemo(
    () => Math.max(0, Math.floor(Number(saleValueInput) || 0)),
    [saleValueInput],
  );
  const canSubmitSale = normalizedSaleValue > 0 && currency !== "";

  // On vérifie si l'objet est une arme ou une armure
  const isEquipment = item.category === "arme" || item.category === "armure";

  return (
    <div
      className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}
    >
      <div
        className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}
      >
        <ModalHeader title="Action objet" onClose={onClose} />

        <div
          className={`${t.inputBg} border ${t.inputBorder} rounded-xl p-2.5`}
        >
          <p className={`text-[10px] ${t.textMuted} uppercase`}>
            Objet selectionne
          </p>
          <p className={`text-sm font-bold ${t.textPrimary} mt-1`}>
            {item.name}
          </p>
          <p className={`text-[10px] ${t.textMuted} mt-0.5`}>
            Quantite disponible : {item.quantity}
          </p>
        </div>

        {mode === "choice" ? (
          // Grille dynamique : 1 colonne si c'est un équipement, 2 sinon
          <div
            className={`grid ${isEquipment ? "grid-cols-1" : "grid-cols-2"} gap-2`}
          >
            {/* Le bouton Utiliser n'apparaît QUE si l'objet n'est pas un équipement */}
            {!isEquipment && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  const ok = await onUse(item.id);
                  setIsSubmitting(false);
                  if (ok !== false) onClose();
                }}
                className={`bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} border ${t.btnPrimaryBorder} rounded-xl py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50`}
              >
                <Hand size={14} />
                Utiliser
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setMode("sell")}
              className={`${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.btnSecondaryBorder} rounded-xl py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50`}
            >
              <Coins size={14} />
              Vendre
            </button>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              // On vérifie tout de manière explicite pour que TypeScript comprenne
              // que currency a été filtré de sa valeur string vide ("")
              if (isSubmitting || currency === "" || normalizedSaleValue <= 0)
                return;

              setIsSubmitting(true);
              const ok = await onSell(item.id, normalizedSaleValue, currency);
              setIsSubmitting(false);
              if (ok !== false) onClose();
            }}
            className="space-y-3"
          >
            <div>
              <label
                className={`text-[10px] ${t.textMuted} uppercase block mb-1`}
              >
                Montant recupere
              </label>
              <input
                type="number"
                min="1"
                value={saleValueInput}
                onChange={(e) => setSaleValueInput(e.target.value)}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
                placeholder="Ex: 12"
                required
              />
            </div>

            <div>
              <label
                className={`text-[10px] ${t.textMuted} uppercase block mb-1`}
              >
                Type de piece
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: "gold" as const, label: "PO" },
                  { value: "silver" as const, label: "PA" },
                  { value: "copper" as const, label: "PC" },
                ].map((option) => {
                  const active = currency === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCurrency(option.value)}
                      className={`rounded-lg border py-2 text-[10px] font-bold uppercase transition-all ${
                        active
                          ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                          : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`text-[10px] ${t.textMuted} flex items-center gap-1.5`}
            >
              <Package size={12} />
              La vente retire 1 unite de l'objet et credite automatiquement
              votre bourse.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode("choice")}
                className={`${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.btnSecondaryBorder} rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide transition-all hover:brightness-105 active:scale-95`}
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={!canSubmitSale || isSubmitting}
                className={`bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} border ${t.btnPrimaryBorder} rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide transition-all hover:brightness-110 active:scale-95 disabled:opacity-50`}
              >
                Confirmer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
