import { useState, type ReactNode } from 'react';
import { Check, ChevronDown, Eye, Folder, FolderInput, FolderPlus, Pencil, Trash2, User, X } from 'lucide-react';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import type { Campaign, SharedCharacter } from '../hooks/useCharacterData';
import { GAME_SYSTEM_LABELS, type GameSystem } from '../types/rpg.types';

const SYSTEM_BADGE: Record<GameSystem, string> = {
  dnd5e: 'text-rose-300 bg-rose-500/12 border-rose-400/35',
  pf1e: 'text-amber-300 bg-amber-500/12 border-amber-400/35',
  homebrew: 'text-emerald-300 bg-emerald-500/12 border-emerald-400/35',
};

interface Props {
  sharedCharacters: SharedCharacter[];
  campaigns: Campaign[];
  onLoadCharacter: (characterId: string) => void;
  onLeaveShare: (characterId: string) => void;
  onCreateCampaign: (name: string) => Promise<Campaign | null>;
  onRenameCampaign: (id: string, name: string) => void;
  onDeleteCampaign: (id: string) => void;
  onAssignCampaign: (characterId: string, campaignId: string | null) => void;
}

/** Accueil du MJ : fiches partagées avec lui, rangées par campagne (dossiers privés). */
export function SharedCharactersSection({
  sharedCharacters, campaigns, onLoadCharacter, onLeaveShare, onCreateCampaign, onRenameCampaign, onDeleteCampaign, onAssignCampaign,
}: Props) {
  const t = useThemeClasses();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [filing, setFiling] = useState<SharedCharacter | null>(null);

  if (sharedCharacters.length === 0 && campaigns.length === 0) return null;

  const input = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2.5 py-1.5 text-xs flex-1 min-w-0 focus:outline-none`;
  const iconBtn = `shrink-0 p-1 rounded-md ${t.textMuted} transition-colors`;

  const submitNew = async () => {
    if (!newName.trim()) return;
    await onCreateCampaign(newName);
    setNewName('');
    setCreating(false);
  };

  const card = (shared: SharedCharacter) => {
    const char = shared.character;
    return (
      <div
        key={char.id}
        onClick={() => onLoadCharacter(char.id)}
        className={`${t.cardBg} border border-sky-300/30 rounded-2xl flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-sm ${t.cardShadow}`}
      >
        <div className={`w-10 h-10 shrink-0 rounded-xl overflow-hidden ${t.inputBg} flex items-center justify-center`}>
          {char.avatar_url
            ? <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover object-top" />
            : <User size={18} className={t.textMuted} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{char.name}</span>
            <span className={`shrink-0 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${SYSTEM_BADGE[char.system ?? 'dnd5e']}`}>
              {GAME_SYSTEM_LABELS[char.system ?? 'dnd5e']}
            </span>
          </div>
          <p className={`text-[10px] ${t.textMuted} truncate`}>Fiche de {shared.ownerName} · Niv. {char.level} · PV {char.hp_current}/{char.hp_max}</p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setFiling(shared); }}
          className={`${iconBtn} hover:text-sky-300`}
          aria-label={`Ranger ${char.name} dans une campagne`}
          title="Ranger dans une campagne"
        >
          <FolderInput size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onLeaveShare(char.id); }}
          className={`${iconBtn} hover:text-rose-300`}
          aria-label={`Ne plus suivre la fiche de ${char.name}`}
          title="Ne plus suivre cette fiche"
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  const groupHeader = (key: string, label: ReactNode, count: number, actions?: ReactNode, editing = false) => (
    <div className="tablet:col-span-2 flex items-center gap-1.5 pt-1">
      {editing ? (
        // Champ de renommage : hors du bouton de repli (pas d'élément interactif imbriqué).
        <div className="flex items-center gap-1.5 min-w-0 flex-1">{label}</div>
      ) : (
        <button type="button" onClick={() => setCollapsed(c => ({ ...c, [key]: !c[key] }))} className="flex items-center gap-1.5 min-w-0 flex-1 text-left">
          <ChevronDown size={12} className={`${t.textMuted} shrink-0 transition-transform ${collapsed[key] ? '-rotate-90' : ''}`} />
          <span className={`text-[11px] font-bold ${t.textSecondary} truncate`}>{label}</span>
          <span className={`text-[10px] font-mono ${t.textMuted} shrink-0`}>{count}</span>
        </button>
      )}
      {actions}
    </div>
  );

  const unfiled = sharedCharacters.filter(s => !s.campaignId || !campaigns.some(c => c.id === s.campaignId));

  return (
    <>
      <div className="tablet:col-span-2 flex items-center justify-between pt-3">
        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted} flex items-center gap-1.5`}>
          <Eye size={12} /> Partagées avec moi
        </h3>
        <button
          type="button"
          onClick={() => setCreating(c => !c)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all active:scale-95 ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textSecondary}`}
        >
          <FolderPlus size={12} /> Campagne
        </button>
      </div>

      {creating && (
        <div className="tablet:col-span-2 flex items-center gap-2">
          <input
            autoFocus
            value={newName}
            maxLength={80}
            placeholder="Nom de la campagne"
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitNew(); if (e.key === 'Escape') setCreating(false); }}
            className={input}
          />
          <button type="button" onClick={submitNew} disabled={!newName.trim()} className={`${iconBtn} text-emerald-400 disabled:opacity-40`} aria-label="Créer la campagne"><Check size={16} /></button>
          <button type="button" onClick={() => setCreating(false)} className={iconBtn} aria-label="Annuler"><X size={16} /></button>
        </div>
      )}

      {campaigns.map(campaign => {
        const members = sharedCharacters.filter(s => s.campaignId === campaign.id);
        const isEditing = editingId === campaign.id;
        const label = isEditing ? (
          <span className="flex items-center gap-2 w-full">
            <input
              autoFocus
              value={editName}
              maxLength={80}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onRenameCampaign(campaign.id, editName); setEditingId(null); }
                if (e.key === 'Escape') setEditingId(null);
              }}
              className={input}
            />
          </span>
        ) : <span className="flex items-center gap-1.5 min-w-0"><Folder size={12} className="text-sky-300 shrink-0" /><span className="truncate">{campaign.name}</span></span>;

        const actions = isEditing ? (
          <>
            <button type="button" onClick={() => { onRenameCampaign(campaign.id, editName); setEditingId(null); }} className={`${iconBtn} text-emerald-400`} aria-label="Valider le nom"><Check size={14} /></button>
            <button type="button" onClick={() => setEditingId(null)} className={iconBtn} aria-label="Annuler"><X size={14} /></button>
          </>
        ) : confirmDeleteId === campaign.id ? (
          <span className="flex items-center gap-2 text-[10px] shrink-0">
            <button type="button" onClick={() => setConfirmDeleteId(null)} className={t.textMuted}>Garder</button>
            <button type="button" onClick={() => { onDeleteCampaign(campaign.id); setConfirmDeleteId(null); }} className="text-rose-400 font-bold">Supprimer</button>
          </span>
        ) : (
          <>
            <button type="button" onClick={() => { setEditingId(campaign.id); setEditName(campaign.name); }} className={`${iconBtn} hover:text-sky-300`} aria-label={`Renommer ${campaign.name}`}><Pencil size={12} /></button>
            <button type="button" onClick={() => setConfirmDeleteId(campaign.id)} className={`${iconBtn} hover:text-rose-300`} aria-label={`Supprimer ${campaign.name}`}><Trash2 size={12} /></button>
          </>
        );

        return (
          <div key={campaign.id} className="contents">
            {groupHeader(campaign.id, label, members.length, actions, isEditing)}
            {!collapsed[campaign.id] && (members.length > 0
              ? members.map(card)
              : <p className={`tablet:col-span-2 text-[10px] ${t.textMuted} italic pl-5`}>Aucune fiche. Utilise <FolderInput size={10} className="inline" /> sur une fiche pour la ranger ici.</p>)}
          </div>
        );
      })}

      {unfiled.length > 0 && (
        <>
          {campaigns.length > 0 && groupHeader('__none__', 'Sans campagne', unfiled.length)}
          {!collapsed.__none__ && unfiled.map(card)}
        </>
      )}

      {filing && (
        <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`} onClick={() => setFiling(null)}>
          <div className={`${t.modalBg} border rounded-2xl p-4 w-full max-w-xs shadow-2xl space-y-3 animate-scaleUp`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${t.textPrimary} truncate`}>Ranger « {filing.character.name} »</h3>
              <button type="button" onClick={() => setFiling(null)} className={iconBtn} aria-label="Fermer"><X size={16} /></button>
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {[{ id: null as string | null, name: 'Sans campagne' }, ...campaigns].map(option => {
                const active = (filing.campaignId ?? null) === option.id;
                return (
                  <button
                    key={option.id ?? 'none'}
                    type="button"
                    onClick={() => { onAssignCampaign(filing.character.id, option.id); setFiling(null); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-left transition-all active:scale-[0.98] ${active ? `${t.accentBg} ${t.accentBorder} ${t.accent} font-semibold` : `${t.inputBg} ${t.cardBorder} ${t.textPrimary}`}`}
                  >
                    {option.id ? <Folder size={13} className="text-sky-300 shrink-0" /> : <X size={13} className={`${t.textMuted} shrink-0`} />}
                    <span className="truncate flex-1">{option.name}</span>
                    {active && <Check size={13} />}
                  </button>
                );
              })}
            </div>
            {campaigns.length === 0 && <p className={`text-[10px] ${t.textMuted}`}>Crée d’abord une campagne avec le bouton « Campagne ».</p>}
          </div>
        </div>
      )}
    </>
  );
}
