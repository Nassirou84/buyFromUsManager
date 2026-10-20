import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';
import { SelectInput } from '@/components/ui/select-input';
import { Setting } from '@/types/setting';
import { SETTING_DEFINITIONS, findSettingDefinition } from '../setting-definitions';

export const SETTING_SCOPE_LABEL_KEYS: Record<Setting['scope'], string> = {
  global: 'setting_scope_global',
  front_end: 'setting_scope_front_end',
  user: 'setting_scope_user',
  admin: 'setting_scope_admin',
};

const CUSTOM_SETTING = '__custom__';

export type NewSettingPayload = Omit<Setting, 'id'>;

interface AddSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  // When set, the modal edits this setting's value instead of creating one.
  setting?: Setting;
  onSubmit?: (payload: NewSettingPayload) => void;
  isSubmitting?: boolean;
  errorMsg?: string;
}

export const AddSettingModal: React.FC<AddSettingModalProps> = ({
  isOpen,
  onClose,
  initialName = '',
  setting,
  onSubmit,
  isSubmitting = false,
  errorMsg: externalError = '',
}) => {
  const { t } = useLocales();
  const isEdit = !!setting;
  const [name, setName] = useState(setting?.name ?? initialName);
  const [value, setValue] = useState(setting ? String(setting.value) : '');
  const [customName, setCustomName] = useState('');
  const [customScope, setCustomScope] = useState<Setting['scope']>('global');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isCustom = name === CUSTOM_SETTING;
  const definition = findSettingDefinition(name);
  const resolvedName = isEdit ? setting.name : isCustom ? customName.trim() : definition?.name ?? '';
  const resolvedScope = isEdit ? setting.scope : isCustom ? customScope : definition?.scope;
  const canSubmit = !!resolvedName && !!resolvedScope && !!value.trim();

  const handleClose = () => {
    setName(initialName);
    setValue('');
    setCustomName('');
    setCustomScope('global');
    setErrorMsg('');
    onClose();
  };

  const handleNameChange = (next: string) => {
    setName(next);
    setValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resolvedName || !resolvedScope) {
      setErrorMsg(t('setting_err_name'));
      return;
    }
    if (!value.trim()) {
      setErrorMsg(t('setting_err_value'));
      return;
    }

    onSubmit?.({
      name: resolvedName,
      value: value.trim(),
      scope: resolvedScope,
    });
  };

  const displayedError = errorMsg || externalError;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }} className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#dce9ff] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f4ff] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 flex items-center justify-center font-bold shadow-2xs">
              <Icon name="tune" className="text-[22px]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
                {isEdit ? t('edit_setting_title') : t('add_setting_title')}
              </h3>
              <p className="text-[12px] text-[#565e74] dark:text-slate-400">
                {isEdit ? t('edit_setting_subtitle') : t('add_setting_subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {displayedError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-[12px] flex items-center gap-2">
            <Icon name="error" className="text-[18px]" />
            <span>{displayedError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isEdit ? (
            <Input
              id="add-setting-name"
              label={t('setting_name')}
              value={setting.name}
              disabled
              helperText={definition ? t(definition.descriptionKey) : undefined}
              containerClassName="mb-0"
            />
          ) : (
            <SelectInput
              id="add-setting-name"
              label={t('setting_name')}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t('setting_name_placeholder')}
              options={[
                ...SETTING_DEFINITIONS.map((d) => ({ value: d.name, label: t(d.labelKey) })),
                { value: CUSTOM_SETTING, label: t('setting_custom_option') },
              ]}
              helperText={definition ? t(definition.descriptionKey) : undefined}
              containerClassName="mb-0"
            />
          )}

          {isCustom && (
            <>
              <Input
                id="add-setting-custom-name"
                label={t('setting_custom_name')}
                required
                value={customName}
                placeholder={t('setting_custom_name_placeholder')}
                onChange={(e) => setCustomName(e.target.value)}
                containerClassName="mb-0"
              />
              <SelectInput
                id="add-setting-custom-scope"
                label={t('setting_scope')}
                value={customScope}
                onChange={(e) => setCustomScope(e.target.value as Setting['scope'])}
                options={(Object.keys(SETTING_SCOPE_LABEL_KEYS) as Setting['scope'][]).map((scope) => ({
                  value: scope,
                  label: t(SETTING_SCOPE_LABEL_KEYS[scope]),
                }))}
                containerClassName="mb-0"
              />
            </>
          )}

          {definition?.acceptedValues ? (
            <SelectInput
              id="add-setting-value"
              label={t('setting_value')}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('setting_value_placeholder')}
              options={[...new Set([...(value ? [value] : []), ...definition.acceptedValues])].map((v) => ({ value: v, label: v }))}
              containerClassName="mb-0"
            />
          ) : (
            <Input
              id="add-setting-value"
              label={t('setting_value')}
              required
              value={value}
              disabled={!definition && !isCustom && !isEdit}
              onChange={(e) => setValue(e.target.value)}
              containerClassName="mb-0"
            />
          )}

          {resolvedScope && !isCustom && (
            <p className="text-[11px] text-[#565e74] dark:text-slate-400 px-1">
              {t('setting_scope')}: {t(SETTING_SCOPE_LABEL_KEYS[resolvedScope])}
            </p>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4ff] dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg disabled:opacity-40 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
            >
              <Icon name={isSubmitting ? 'sync' : 'check'} className="text-[17px]" />
              <span>{isEdit
                ? (isSubmitting ? t('saving_setting') : t('save_setting'))
                : (isSubmitting ? t('creating_setting') : t('create_setting'))}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
