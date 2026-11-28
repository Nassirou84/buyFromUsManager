import React, { useState } from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { SECTION_LABEL } from '../../shared';

interface ReturnInspectorNoteProps {
  /** The saved note ('' when none has been saved yet). */
  note: string;
  isSaving?: boolean;
  /** Persist the trimmed note; `onSaved` runs only once the save succeeded. */
  onSave: (note: string, onSaved: () => void) => void;
}

// The inspector's note on the return. The backend keeps a single note per return, so
// this shows the saved note with an edit action, or a composer when there is none.
export const ReturnInspectorNote: React.FC<ReturnInspectorNoteProps> = ({ note, isSaving = false, onSave }) => {
  const { t } = useLocales();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const showComposer = note === '' || isEditing;
  const canSubmit = draft.trim() !== '' && draft.trim() !== note && !isSaving;

  const startEditing = (): void => {
    setDraft(note);
    setIsEditing(true);
  };

  const submit = (): void => {
    if (!canSubmit) return;
    onSave(draft.trim(), () => {
      setIsEditing(false);
      setDraft('');
    });
  };

  return (
    <div className="flex flex-col gap-1.5 pt-0.5">
      <span className={SECTION_LABEL}>{t('rma_inspector_note_title')}</span>

      {showComposer ? (
        <div className="relative">
          <textarea
            className="w-full min-h-[76px] py-2 px-3 pb-10 bg-[#eff4ff] dark:bg-slate-800 text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors resize-y disabled:opacity-60"
            placeholder={t('rma_note_placeholder')}
            rows={3}
            value={draft}
            disabled={isSaving}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter adds a new line; Cmd/Ctrl+Enter saves.
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-2.5 py-1 text-[#565e74] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white text-[11px] rounded font-medium disabled:opacity-60"
                type="button"
              >
                {t('rma_note_cancel')}
              </button>
            )}
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#dae2fd] hover:bg-[#c3d0f7] dark:bg-slate-700 dark:hover:bg-slate-600 text-[#0b1c30] dark:text-white text-[11px] rounded font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
            >
              {isSaving && <Icon name="progress_activity" className="text-[12px] animate-spin" />}
              {t('rma_save_note')}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#eff4ff]/60 dark:bg-slate-800/60 p-2.5 rounded-lg flex items-start justify-between gap-2.5">
          <p className="text-[12px] text-[#0b1c30] dark:text-slate-200 whitespace-pre-line">{note}</p>
          <button
            onClick={startEditing}
            className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
            type="button"
          >
            <Icon name="edit" className="text-[13px]" />
            {t('rma_note_edit')}
          </button>
        </div>
      )}
    </div>
  );
};
