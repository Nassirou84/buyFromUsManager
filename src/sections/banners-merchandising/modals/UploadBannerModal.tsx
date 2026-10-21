import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { BannerDeviceTarget, BannerItem } from '@/types/marketing';

interface UploadBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: BannerItem) => void;
  initialData?: BannerItem | null;
  nextPriority: number;
}

export const UploadBannerModal: React.FC<UploadBannerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextPriority,
}) => {
  const { t } = useLocales();
  const [title, setTitle] = useState(initialData?.title || '');
  const [targetUrl, setTargetUrl] = useState(initialData?.targetUrl || '/collections/new-arrivals');
  const [deviceTarget, setDeviceTarget] = useState<BannerDeviceTarget>(
    initialData?.deviceTarget || 'desktop_mobile'
  );
  const scheduleLabel = initialData?.scheduleLabel || t('banner_schedule_immediate');
  const [imageUrl, setImageUrl] = useState(
    initialData?.imageUrl ||
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
  );
  const [isLive, setIsLive] = useState(initialData?.isLive ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t('banner_title_required'));
      return;
    }

    const item: BannerItem = {
      id: initialData?.id || `banner-${Date.now()}`,
      priority: initialData?.priority || nextPriority,
      title: title.trim(),
      targetUrl: targetUrl.trim(),
      deviceTarget,
      imageUrl,
      altText: t('banner_alt', { title }),
      scheduleLabel,
      isLive,
    };

    onSave(item);
    toast.success(t(initialData ? 'banner_updated' : 'banner_added'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#131b2e] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#e5eeff] dark:border-gray-700 animate-in zoom-in-95 duration-150">
        <div className="p-6 bg-[#eff4ff] dark:bg-gray-800/80 flex items-center justify-between border-b border-[#e5eeff] dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-xs">
              <Icon name={initialData ? 'edit' : 'cloud_upload'} className="text-[18px]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#0b1c30] dark:text-white leading-tight">
                {t(initialData ? 'banner_modal_edit_title' : 'banner_upload_new')}
              </h3>
              <span className="text-xs text-[#565e74] dark:text-gray-400">
                {t('banner_modal_subtitle')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#565e74] hover:text-[#0b1c30] dark:hover:text-white rounded-lg transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
              {t('banner_field_title')}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3.5 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
              placeholder={t('banner_field_title_placeholder')}
              required
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
                {t('banner_field_url')}
              </label>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full h-10 px-3.5 text-xs font-mono text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                placeholder="/collections/autumn-atelier"
                required
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
                {t('banner_field_device')}
              </label>
              <select
                value={deviceTarget}
                onChange={(e) => setDeviceTarget(e.target.value as BannerDeviceTarget)}
                className="h-10 px-3 text-xs text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
              >
                <option value="desktop_mobile">{t('banner_desktop_mobile')}</option>
                <option value="desktop">{t('banner_desktop_only')}</option>
                <option value="mobile">{t('banner_mobile_only')}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
              {t('banner_field_image')}
            </label>
            <div className="flex gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 h-10 px-3.5 text-xs text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                placeholder="https://..."
                required
                type="url"
              />
            </div>
            {imageUrl && (
              <div className="mt-2 w-full h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#eff4ff] dark:bg-gray-800/60 rounded-lg">
            <div>
              <span className="text-xs font-semibold text-[#0b1c30] dark:text-white">
                {t('banner_live_display')}
              </span>
              <p className="text-[11px] text-gray-500">{t('banner_live_hint')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="sr-only peer"
                type="checkbox"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ac6]"></div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
              type="button"
            >
              {t('cancel')}
            </button>
            <button
              className="px-5 py-2.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#2563eb] transition-colors"
              type="submit"
            >
              {t(initialData ? 'banner_update' : 'banner_deploy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
