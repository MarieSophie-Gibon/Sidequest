import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { AlertTriangle } from 'lucide-react';
import { ModalActions, ModalHeader } from './ModalControls';

export const DND_CONDITIONS = [
  { key: 'avantage', label: 'Avantage', icon: '🎯' },
  { key: 'desavantage', label: 'Désavantage', icon: '⬇️' },
  { key: 'inspi_bardique', label: 'Inspiration Bardique', icon: '🎶' },
  { key: 'aveugle', label: 'Aveuglé', icon: '🙈' },
  { key: 'charme', label: 'Charmé', icon: '💕' },
  { key: 'assourdi', label: 'Assourdi', icon: '🔇' },
  { key: 'effraye', label: 'Effrayé', icon: '😨' },
  { key: 'empoigne', label: 'Empoigné', icon: '🤜' },
  { key: 'incapable', label: 'Incapable', icon: '🚫' },
  { key: 'invisible', label: 'Invisible', icon: '👻' },
  { key: 'paralyse', label: 'Paralysé', icon: '⚡' },
  { key: 'petrifie', label: 'Pétrifié', icon: '🪨' },
  { key: 'empoisonne', label: 'Empoisonné', icon: '🤢' },
  { key: 'a_terre', label: 'À terre', icon: '🛌' },
  { key: 'entrave', label: 'Entravé', icon: '⛓️' },
  { key: 'etourdi', label: 'Étourdi', icon: '💫' },
  { key: 'inconscient', label: 'Inconscient', icon: '💀' },
  { key: 'epuise', label: 'Épuisé', icon: '😩' },
];

interface Props {
  activeConditions: string[];
  setActiveConditions: (conditions: string[]) => void;
  onClose: () => void;
}

export function EditConditionsModal({ activeConditions, setActiveConditions, onClose }: Props) {
  const t = useThemeClasses();

  const toggleCondition = (key: string) => {
    if (activeConditions.includes(key)) {
      setActiveConditions(activeConditions.filter(c => c !== key));
    } else {
      setActiveConditions([...activeConditions, key]);
    }
  };

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[80vh] flex flex-col`}>
        <div className="shrink-0">
          <ModalHeader title={<span className="flex items-center gap-1.5"><AlertTriangle size={16} /> États</span>} onClose={onClose} />
        </div>

        <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
          {DND_CONDITIONS.map(cond => {
            const isActive = activeConditions.includes(cond.key);
            return (
              <button
                key={cond.key}
                type="button"
                onClick={() => toggleCondition(cond.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all active:scale-95 ${
                  isActive
                    ? 'bg-rose-500/20 border-rose-500/40 shadow-sm'
                    : `${t.inputBg} ${t.cardBorder} hover:${t.accentBorder}`
                }`}
              >
                <span className="text-base">{cond.icon}</span>
                <span className={`text-xs font-bold ${isActive ? 'text-rose-400' : t.textPrimary}`}>{cond.label}</span>
                {isActive && <span className="ml-auto text-[9px] font-bold text-rose-400 uppercase">Actif</span>}
              </button>
            );
          })}
        </div>

        <div className="shrink-0">
          <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
        </div>
      </div>
    </div>
  );
}
