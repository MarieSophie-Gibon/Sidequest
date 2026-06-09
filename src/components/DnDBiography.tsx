import {
  Heart,
  Anchor,
  Zap,
  AlertTriangle,
  BookOpen,
  User,
  Sparkles,
} from "lucide-react";
import { useThemeClasses } from "../contexts/AppSettingsContext";
import type { Biography } from "../types/rpg.types";

interface Props {
  biography: Biography | null;
  onOpenEdit: () => void;
  onOpenPersonalityEdit: () => void;
  onOpenBackstoryEdit: () => void;
}

interface BioField {
  key: keyof Omit<Biography, "character_id" | "updated_at">;
  label: string;
  icon: typeof Heart;
  color: string;
  placeholder: string;
}

const BIO_FIELDS: BioField[] = [
  {
    key: "description_physique",
    label: "Description physique",
    icon: Heart,
    color: "text-fuchsia-400",
    placeholder: "Apparence, cicatrices, particularités…",
  },
  {
    key: "alignement",
    label: "Alignement",
    icon: Zap,
    color: "text-violet-400",
    placeholder: "Loyal Bon, Chaotique Neutre…",
  },
  {
    key: "ideaux",
    label: "Idéaux",
    icon: Sparkles,
    color: "text-amber-400",
    placeholder: "En quoi croyez-vous ?",
  },
  {
    key: "liens",
    label: "Liens",
    icon: Anchor,
    color: "text-emerald-400",
    placeholder: "Qu'est-ce qui vous retient ?",
  },
  {
    key: "traits_principaux",
    label: "Traits de personnalité",
    icon: User,
    color: "text-cyan-400",
    placeholder: "Comment vous comportez-vous ?",
  },
  {
    key: "defauts",
    label: "Défauts",
    icon: AlertTriangle,
    color: "text-rose-400",
    placeholder: "Quelle est votre faiblesse ?",
  },
];

export function DnDBiography({
  biography,
  onOpenEdit,
  onOpenPersonalityEdit,
  onOpenBackstoryEdit,
}: Props) {
  const t = useThemeClasses();

  const cardCls = `${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 ${t.cardShadow} cursor-pointer active:scale-[0.98] transition-transform`;

  return (
    <div className="space-y-3 pt-2">
      {/* Personality fields */}
      <div className="grid grid-cols-1 gap-2">
        {BIO_FIELDS.map(({ key, label, icon: Icon, color, placeholder }) => {
          const value = biography?.[key];
          const openModal = key === 'traits_principaux' || key === 'defauts'
            ? onOpenPersonalityEdit
            : onOpenEdit;
          return (
            <div key={key} className={cardCls} onClick={openModal}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${t.textMuted}`}
                >
                  {label}
                </span>
              </div>
              {value ? (
                <p className={`text-sm ${t.textSecondary} leading-relaxed`}>
                  {value}
                </p>
              ) : (
                <p className={`text-sm italic ${t.textMuted} opacity-50`}>
                  {placeholder}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Backstory */}
      <div className={cardCls} onClick={onOpenBackstoryEdit}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-indigo-400" />
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${t.textMuted}`}
          >
            Histoire personnelle
          </span>
        </div>
        {biography?.backstory ? (
          <p
            className={`text-sm ${t.textSecondary} leading-relaxed whitespace-pre-wrap`}
          >
            {biography.backstory}
          </p>
        ) : (
          <p className={`text-sm italic ${t.textMuted} opacity-50`}>
            Aucune histoire pour l'instant. Écrivez le passé de votre
            personnage…
          </p>
        )}
      </div>
    </div>
  );
}
