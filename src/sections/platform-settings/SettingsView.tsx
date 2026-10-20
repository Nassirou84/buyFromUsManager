import useLocales from '@/locales/use-locales';
import React from 'react';
import { toast } from 'sonner';
import { useIsSuperAdmin } from '@/auth/hooks';
import { useQueryClient } from '@tanstack/react-query';
import usePostSetting from '@/api/setting/post-setting';
import usePatchSetting from '@/api/setting/patch-setting';
import useGetSettings, { GET_SETTINGS_QUERY_KEY } from '@/api/setting/get-settings';
import { Setting } from '@/types/setting';
import { AddSettingModal, NewSettingPayload, SETTING_SCOPE_LABEL_KEYS } from './modals/AddSettingModal';
import { SETTING_DEFINITIONS, SettingDefinition } from './setting-definitions';

export const SettingsView: React.FC = () => {
  const { t } = useLocales();
  const queryClient = useQueryClient();
  const { mutate: postSetting, isPending: isCreatingSetting } = usePostSetting();
  const { mutate: patchSetting, isPending: isUpdatingSetting } = usePatchSetting();
  const { data: settings = [], isLoading, isError, refetch } = useGetSettings();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedSettingName, setSelectedSettingName] = React.useState('');
  const [editingSetting, setEditingSetting] = React.useState<Setting | undefined>();

  const openAddModal = (name = '') => {
    setEditingSetting(undefined);
    setSelectedSettingName(name);
    setIsAddModalOpen(true);
  };

  // Admins can view the settings, only super admins can edit them.
  const isSuperAdmin = useIsSuperAdmin();

  const openEditModal = (setting: Setting) => {
    setEditingSetting(setting);
    setIsAddModalOpen(true);
  };

  const handleSubmitSetting = (data: NewSettingPayload) => {
    if (editingSetting) {
      patchSetting({ id: editingSetting.id, data: { value: data.value } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: GET_SETTINGS_QUERY_KEY });
          toast.success(t('setting_updated_successfully'));
          setIsAddModalOpen(false);
          setEditingSetting(undefined);
        },
        onError: () => {
          toast.error(t('setting_update_failed'));
        },
      });
      return;
    }
    postSetting(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: GET_SETTINGS_QUERY_KEY });
        toast.success(t('setting_created_successfully'));
        setIsAddModalOpen(false);
      },
      onError: (error: unknown) => {
        const message = (error as { error?: string })?.error ?? 'setting_creation_failed';
        toast.error(t(message));
      },
    });
  };

  // Known definitions come first (set or not), followed by settings the API
  // returns that have no definition.
  const rows: { name: string; definition?: SettingDefinition; setting?: Setting }[] = [
    ...SETTING_DEFINITIONS.map((definition) => ({
      name: definition.name,
      definition,
      setting: settings.find((s) => s.name === definition.name),
    })),
    ...settings
      .filter((s) => !SETTING_DEFINITIONS.some((d) => d.name === s.name))
      .map((setting) => ({ name: setting.name, setting })),
  ];

  return (
    <div className="flex flex-col gap-5">
      {isSuperAdmin && isAddModalOpen && (
        <AddSettingModal
          isOpen={isAddModalOpen}
          initialName={selectedSettingName}
          setting={editingSetting}
          onSubmit={handleSubmitSetting}
          isSubmitting={isCreatingSetting || isUpdatingSetting}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
            {t('admin_configuration')}
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
            {t('platform_settings_title')}
          </h1>
          <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
            {t('settings_subtitle')}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => openAddModal()}
            className="px-3 py-1.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg shrink-0"
          >
            {t('add_setting')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-[13px] text-[#565e74] dark:text-slate-400">{t('settings_loading')}</div>
      ) : isError ? (
        <div className="flex items-center gap-3 text-[13px] text-red-600 dark:text-red-400">
          {t('settings_load_failed')}
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-[#eff4ff] dark:bg-slate-800 text-[#004ac6] dark:text-blue-300 text-xs font-semibold rounded-lg cursor-pointer"
          >
            {t('settings_retry')}
          </button>
        </div>
      ) : (
      <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs divide-y divide-[#f0f4ff] dark:divide-slate-800 max-w-2xl">
        {rows.map(({ name, definition, setting }) => (
          <div key={name} className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
                  {definition ? t(definition.labelKey) : name}
                </span>
                {(definition?.scope ?? setting?.scope) && (
                  <span className="px-1.5 py-0.5 bg-[#dae2fd] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 text-[10px] font-semibold rounded uppercase tracking-wider">
                    {t(SETTING_SCOPE_LABEL_KEYS[(definition?.scope ?? setting?.scope) as Setting['scope']])}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-[#565e74] dark:text-slate-400 mt-0.5">
                {name}
              </div>
              {definition && (
                <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1">
                  {t(definition.descriptionKey)}
                </p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[11px] font-semibold text-[#434655] dark:text-slate-300">
                  {t('setting_current_value')}:
                </span>
                {setting ? (
                  <span className="px-2 py-0.5 bg-[#dbe1ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 text-[11px] font-semibold rounded">
                    {String(setting.value)}
                  </span>
                ) : (
                  <span className="text-[11px] italic text-[#565e74] dark:text-slate-400">
                    {t('setting_not_set')}
                  </span>
                )}
              </div>
              {definition && (
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[11px] font-semibold text-[#434655] dark:text-slate-300">
                    {t('setting_accepted_values')}:
                  </span>
                  {definition.acceptedValues ? (
                    definition.acceptedValues.map((v) => (
                      <span key={v} className="px-2 py-0.5 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-slate-200 text-[11px] font-semibold rounded">
                        {v}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#565e74] dark:text-slate-400">
                      {t('setting_free_text')}
                    </span>
                  )}
                </div>
              )}
            </div>
            {isSuperAdmin && (setting || definition) && (
              <button
                onClick={() => (setting ? openEditModal(setting) : openAddModal(name))}
                className="px-3 py-1.5 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dbe1ff] dark:hover:bg-slate-700 text-[#004ac6] dark:text-blue-300 text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-colors"
              >
                {t('setting_configure')}
              </button>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
