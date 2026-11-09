import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye, Link2, Share2, X } from 'lucide-react';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import type { CharacterViewer } from '../hooks/useCharacterData';

interface Props {
  characterId: string;
  createShareLink: (characterId: string) => Promise<string | null>;
  fetchCharacterViewers: (characterId: string) => Promise<CharacterViewer[]>;
  removeCharacterViewer: (characterId: string, viewerId: string) => Promise<boolean>;
}

/** Réglages : partager la fiche en lecture seule avec son MJ et gérer les accès. */
export function CharacterShareCard({ characterId, createShareLink, fetchCharacterViewers, removeCharacterViewer }: Props) {
  const t = useThemeClasses();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewers, setViewers] = useState<CharacterViewer[]>([]);

  // La fonction du hook change d'identité à chaque rendu : on garde la dernière dans une ref
  // pour ne recharger la liste qu'au changement de fiche.
  const fetchRef = useRef(fetchCharacterViewers);
  useEffect(() => { fetchRef.current = fetchCharacterViewers; });

  const refresh = async () => setViewers(await fetchRef.current(characterId));

  useEffect(() => {
    let cancelled = false;
    fetchRef.current(characterId).then(v => { if (!cancelled) setViewers(v); });
    return () => { cancelled = true; };
  }, [characterId]);

  const generate = async () => {
    setBusy(true);
    const url = await createShareLink(characterId);
    setBusy(false);
    if (!url) return;
    setLink(url);
    setCopied(false);
    // Partage natif sur mobile, sinon copie dans le presse-papiers.
    if (navigator.share) {
      try { await navigator.share({ title: 'Ma fiche SideQuest', url }); return; } catch { /* partage annulé */ }
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); } catch { /* copie manuelle */ }
  };

  const copy = async () => {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { /* copie manuelle */ }
  };

  const btn = `flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all active:scale-95`;

  return (
    <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow} space-y-2.5`}>
      <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider flex items-center gap-1.5`}><Share2 size={13} /> Partager avec mon MJ</h4>
      <p className={`text-[10px] ${t.textMuted}`}>
        Ton MJ voit ta fiche en lecture seule et en direct (sauf tes notes). Il doit ouvrir le lien en étant connecté à SideQuest. Lien valable 7 jours.
      </p>

      <button type="button" onClick={generate} disabled={busy} className={`${btn} w-full ${t.accentBg} ${t.accentBorder} ${t.accent} disabled:opacity-50`}>
        <Link2 size={13} /> {busy ? 'Création…' : 'Créer un lien de partage'}
      </button>

      {link && (
        <div className="flex gap-2 items-center">
          <input readOnly value={link} onFocus={(e) => e.target.select()} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl px-2.5 py-2 text-[10px] font-mono flex-1 min-w-0 focus:outline-none`} />
          <button type="button" onClick={copy} className={`${btn} ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textSecondary}`} aria-label="Copier le lien">
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <span className={`text-[10px] font-semibold ${t.textMuted} uppercase tracking-wider flex items-center gap-1`}><Eye size={11} /> Accès en cours</span>
        {viewers.length === 0 ? (
          <p className={`text-[10px] ${t.textMuted} italic`}>Personne n’a accès à cette fiche.</p>
        ) : viewers.map(v => (
          <div key={v.viewer_id} className={`flex items-center justify-between gap-2 ${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-1.5`}>
            <span className={`text-xs ${t.textPrimary} truncate`}>{v.viewer_name || 'MJ'}</span>
            <button
              type="button"
              onClick={async () => { if (await removeCharacterViewer(characterId, v.viewer_id)) refresh(); }}
              className="flex items-center gap-1 text-[10px] font-semibold text-rose-300 hover:text-rose-200 shrink-0"
            >
              <X size={11} /> Retirer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
