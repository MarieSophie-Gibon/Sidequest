import { NotebookPen, CirclePlus, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useThemeClasses } from "../contexts/AppSettingsContext";
import type { Note } from "../types/rpg.types";

interface Props {
  notes: Note[];
  onOpenAddNote: () => void;
  onOpenEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

function NoteCard({
  note,
  onOpenEditNote,
  onDeleteNote,
  t,
}: {
  note: Note;
  onOpenEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  t: ReturnType<typeof useThemeClasses>;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = !!note.content;

  return (
    <div
      onClick={() => onOpenEditNote(note)}
      className={`${t.inputBg} rounded-xl border ${t.cardBorder} cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all`}
    >
      <div className={`flex justify-between gap-2 px-3.5 py-2.5 ${expanded ? 'items-start' : 'items-center'}`}>
        <span className={`text-xs font-bold ${t.textPrimary} flex-1 min-w-0 truncate`}>
          {note.title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasContent && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.cardBg} border ${t.cardBorder} ${t.textMuted} active:scale-90 transition-all`}
              aria-label={expanded ? "Réduire" : "Voir tout"}
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-rose-900/30 border border-rose-800/50 text-rose-400 active:scale-90 transition-all"
            aria-label="Supprimer"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className={`px-3.5 pb-3 border-t ${t.cardBorder} pt-2 space-y-1.5`}>
          {hasContent && (
            <p className={`text-xs ${t.textSecondary} whitespace-pre-wrap leading-relaxed`}>
              {note.content}
            </p>
          )}
          {note.updated_at && (
            <p className={`text-[10px] ${t.textMuted} opacity-60`}>
              {new Date(note.updated_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function DnDNotes({
  notes,
  onOpenAddNote,
  onOpenEditNote,
  onDeleteNote,
}: Props) {
  const t = useThemeClasses();

  return (
    <div className="space-y-3 pt-2">
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}>
            <NotebookPen size={14} /> Notes
          </h4>
          <button
            onClick={onOpenAddNote}
            className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}
          >
            <CirclePlus size={16} />
          </button>
        </div>

        {notes.length === 0 ? (
          <p className={`text-[10px] ${t.textMuted} italic text-center py-2`}>
            Aucune note pour l'instant.
          </p>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpenEditNote={onOpenEditNote}
                onDeleteNote={onDeleteNote}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
