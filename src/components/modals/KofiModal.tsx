import { useState } from 'react';
import { Coffee, ExternalLink } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { KOFI_EMBED_URL, KOFI_URL } from '../../config';
import { ModalHeader } from './ModalControls';

/** Widget de don Ko-fi dans une fenêtre, sans quitter l'app. */
export function KofiModal({ onClose }: { onClose: () => void }) {
  const t = useThemeClasses();
  const [loaded, setLoaded] = useState(false);
  if (!KOFI_EMBED_URL || !KOFI_URL) return null;

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`} onClick={onClose}>
      <div
        className={`${t.modalBg} border rounded-2xl p-4 w-full max-w-sm shadow-2xl space-y-3 animate-scaleUp max-h-[92dvh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title={<span className="flex items-center gap-1.5"><Coffee size={15} className="text-amber-300" /> Soutenir SideQuest</span>} onClose={onClose} />
        <div className="relative flex-1 min-h-0 overflow-y-auto rounded-xl bg-[#f9f9f9]">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">Chargement de Ko-fi…</div>
          )}
          <iframe
            id="kofiframe"
            src={KOFI_EMBED_URL}
            title="Soutenir SideQuest sur Ko-fi"
            height={712}
            onLoad={() => setLoaded(true)}
            className="block w-full border-0 p-1"
            style={{ background: '#f9f9f9' }}
          />
        </div>
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-1.5 text-[10px] ${t.textMuted} hover:text-amber-300 transition-colors`}
        >
          Le widget ne s’affiche pas ? Ouvrir sur Ko-fi <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
