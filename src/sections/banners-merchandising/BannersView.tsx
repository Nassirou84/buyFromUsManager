import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { BannerItem } from '@/types/marketing';
import { INITIAL_BANNERS } from './data/mockBanners';
import { UploadBannerModal } from './modals/UploadBannerModal';

export const BannersView: React.FC = () => {
  const { t } = useLocales();

  const [banners, setBanners] = useState<BannerItem[]>(INITIAL_BANNERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  const handleToggleLive = (id: string) => {
    const target = banners.find((b) => b.id === id);
    if (!target) return;
    setBanners(banners.map((b) => (b.id === id ? { ...b, isLive: !b.isLive } : b)));
    toast.success(t(target.isLive ? 'banner_paused_toast' : 'banner_activated', { title: target.title }));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const list = [...banners];
    const moved = list[index];
    list[index] = list[newIndex];
    list[newIndex] = moved;

    setBanners(list.map((item, idx) => ({ ...item, priority: idx + 1 })));
    toast.success(t('banner_reordered', { title: moved.title, n: newIndex + 1 }));
  };

  const handleDelete = (id: string) => {
    const target = banners.find((b) => b.id === id);
    setBanners(banners.filter((b) => b.id !== id).map((item, idx) => ({ ...item, priority: idx + 1 })));
    toast.success(t('banner_removed', { title: target?.title ?? '' }));
  };

  const handleSaveBanner = (banner: BannerItem) => {
    setBanners(editingBanner ? banners.map((b) => (b.id === banner.id ? banner : b)) : [...banners, banner]);
    setEditingBanner(null);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
            {t('marketing_merchandising')}
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
            {t('banners_merchandising_title')}
          </h1>
          <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
            {t('banners_subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBanner(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors duration-150"
        >
          <Icon name="cloud_upload" className="text-[18px]" />
          <span>{t('banner_upload_new')}</span>
        </button>
      </div>

      {/* Banner Cards List */}
      <div className="flex flex-col gap-4">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`p-6 bg-white dark:bg-[#131b2e] rounded-xl shadow-xs border border-[#e5eeff] dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:shadow-md transition-shadow duration-200 ${
              !banner.isLive ? 'opacity-80' : ''
            }`}
          >
            {/* Left: Reorder Controls, Priority, Image & Title */}
            <div className="flex items-center gap-4">
              {/* Reorder Buttons */}
              <div className="flex flex-col items-center gap-0.5 text-gray-400">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:text-[#004ac6] disabled:opacity-20 disabled:hover:text-gray-400 transition-colors"
                  title={t('banner_move_up')}
                >
                  <Icon name="arrow_upward" className="text-[18px]" />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === banners.length - 1}
                  className="p-1 hover:text-[#004ac6] disabled:opacity-20 disabled:hover:text-gray-400 transition-colors"
                  title={t('banner_move_down')}
                >
                  <Icon name="arrow_downward" className="text-[18px]" />
                </button>
              </div>

              {/* Priority Badge */}
              <span className="w-7 h-7 rounded-full bg-[#dae2fd] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                #{banner.priority}
              </span>

              {/* Thumbnail Image */}
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative flex-shrink-0 group-hover:scale-[1.02] transition-transform">
                <img
                  src={banner.imageUrl}
                  alt={banner.altText}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] bg-[#eff4ff] dark:bg-gray-800 px-2 py-0.5 text-[#004ac6] dark:text-blue-400 font-semibold rounded">
                    {banner.deviceTarget === 'desktop_mobile'
                      ? t('banner_desktop_mobile')
                      : banner.deviceTarget === 'desktop'
                      ? t('banner_desktop_only')
                      : t('banner_mobile_only')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {t('banner_priority_tier', { n: banner.priority })}
                  </span>
                </div>
                <h3 className="text-base text-[#0b1c30] dark:text-white font-semibold">
                  {banner.title}
                </h3>
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-mono">
                  <Icon name="link" className="text-[14px]" />
                  <span>{banner.targetUrl}</span>
                </span>
              </div>
            </div>

            {/* Right: Schedule, Live Display Toggle, Actions */}
            <div className="flex flex-wrap items-center gap-8 pl-12 lg:pl-0">
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                  {t('banner_schedule')}
                </span>
                <span className="text-xs font-medium text-[#0b1c30] dark:text-white">
                  {banner.scheduleLabel}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${
                    banner.isLive ? 'text-[#004ac6] dark:text-blue-400' : 'text-gray-400'
                  }`}
                >
                  {banner.isLive ? t('banner_live_display') : t('banner_paused')}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={banner.isLive}
                    onChange={() => handleToggleLive(banner.id)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ac6]"></div>
                </label>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-[#004ac6] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={t('banner_edit')}
                >
                  <Icon name="edit" className="text-[20px]" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title={t('banner_remove')}
                >
                  <Icon name="delete" className="text-[20px]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <UploadBannerModal
          key={editingBanner?.id ?? 'new'}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingBanner(null);
          }}
          onSave={handleSaveBanner}
          initialData={editingBanner}
          nextPriority={banners.length + 1}
        />
      )}
    </div>
  );
};
