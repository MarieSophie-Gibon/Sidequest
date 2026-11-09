import { useState } from 'react';
import { Bug, Lightbulb, Send } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { ModalHeader } from './ModalControls';

const MAX_LENGTH = 5000;

interface Props {
  /** Contexte joint au message pour aider à reproduire un bug (personnage affiché…). */
  context?: string;
  onSent: () => void;
  onClose: () => void;
}

/** Envoie un signalement de bug ou une suggestion à l'administratrice (Edge Function contact-admin → Resend). */
export function ContactAdminModal({ context, onSent, onClose }: Props) {
  const t = useThemeClasses();
  const [type, setType] = useState<'bug' | 'suggestion'>('bug');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    const fullContext = [context, `Appareil : ${navigator.userAgent}`].filter(Boolean).join(' · ');
    const { data, error: invokeError } = await supabase.functions.invoke('contact-admin', {
      body: { type, message: message.trim(), context: fullContext },
    });
    setSending(false);
    if (invokeError || !data?.ok) {
      // L'Edge Function renvoie un message lisible dans { error } ; sinon message générique.
      let detail = 'L’envoi a échoué. Vérifie ta connexion et réessaie.';
      try {
        const body = await (invokeError as { context?: Response } | null)?.context?.json();
        if (body?.error) detail = body.error;
      } catch { /* réponse non JSON */ }
      setError(detail);
      return;
    }
    onSent();
  };

  const typeBtn = (key: 'bug' | 'suggestion', label: string, Icon: typeof Bug) => (
    <button
      type="button"
      onClick={() => setType(key)}
      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
        type === key ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textMuted}`
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title="Contacter l’équipe" onClose={onClose} />
        <div className="grid grid-cols-2 gap-2">
          {typeBtn('bug', 'Un bug', Bug)}
          {typeBtn('suggestion', 'Une idée', Lightbulb)}
        </div>
        <div>
          <textarea
            value={message}
            maxLength={MAX_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={type === 'bug'
              ? 'Que s’est-il passé ? Qu’attendais-tu ? Sur quel écran ?'
              : 'Quelle idée aimerais-tu voir dans SideQuest ?'}
            className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-36 resize-none focus:outline-none`}
          />
          <div className={`flex justify-between text-[10px] ${t.textMuted} mt-1`}>
            <span>Ton adresse e-mail est jointe pour que je puisse te répondre.</span>
            <span className="font-mono shrink-0 ml-2">{message.length}/{MAX_LENGTH}</span>
          </div>
        </div>
        {error && <p className="text-[11px] text-rose-400">{error}</p>}
        <button
          type="button"
          disabled={!message.trim() || sending}
          onClick={send}
          className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 disabled:opacity-40 bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder}`}
        >
          <Send size={13} /> {sending ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
