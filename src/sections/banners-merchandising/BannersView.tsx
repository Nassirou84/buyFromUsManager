import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/lucide-icon';
import { Banner, BannerPayload } from '@/types/marketing';
import useGetBanners, { GET_BANNERS_QUERY_KEY } from '@/api/banner/get-banners';
import usePostBanner from '@/api/banner/post-banner';
import usePatchBanner from '@/api/banner/patch-banner';
import useDeleteBanner from '@/api/banner/delete-banner';
import { UploadBannerModal } from './modals/UploadBannerModal';

export const BannersView: React.FC = () => {
  const { t } = useLocales();
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading, isError, refetch } = useGetBanners();
  const { mutate: postBanner, isPending: isCreating } = usePostBanner();
  const { mutate: patchBanner, isPending: isUpdating } = usePatchBanner();
  const { mutate: deleteBanner } = useDeleteBanner();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: GET_BANNERS_QUERY_KEY });

  const handleToggleLive = (banner: Banner) => {
    patchBanner(
      { id: banner.id, data: { isActive: !banner.isActive } },
      {
        onSuccess: () => {
          refresh();
          toast.success(t(banner.isActive ? 'banner_paused_toast' : 'banner_activated', { title: banner.title }));
        },
        onError: () => toast.error(t('banner_update_failed')),
      }
    );
  };

  const handleDelete = (banner: Banner) => {
    deleteBanner(banner.id, {
      onSuccess: () => {
        refresh();
        toast.success(t('banner_removed', { title: banner.title }));
      },
      onError: () => toast.error(t('banner_delete_failed')),
    });
  };

  const handleSaveBanner = (data: BannerPayload) => {
    if (editingBanner) {
      patchBanner(
        { id: editingBanner.id, data },
        {
          onSuccess: () => {
            refresh();
            toast.success(t('banner_updated'));
            setModalOpen(false);
            setEditingBanner(null);
          },
          onError: () => toast.error(t('banner_update_failed')),
        }
      );
      return;
    }
    postBanner(data, {
      onSuccess: () => {
        refresh();
        toast.success(t('banner_added'));
        setModalOpen(false);
      },
      onError: () => toast.error(t('banner_create_failed')),
    });
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

      {isLoading && (
        <div className="p-6 text-sm text-[#565e74] dark:text-slate-400">{t('banners_loading')}</div>
      )}

      {isError && (
        <div className="p-6 bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-gray-800 flex items-center justify-between gap-4">
          <span className="text-sm text-red-600">{t('banners_load_failed')}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-[#004ac6] dark:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {t('banners_retry')}
          </button>
        </div>
      )}

      {!isLoading && !isError && banners.length === 0 && (
        <div className="p-6 text-sm text-[#565e74] dark:text-slate-400">{t('banners_empty')}</div>
      )}

      {/* Banner Cards List */}
      <div className="flex flex-col gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`p-6 bg-white dark:bg-[#131b2e] rounded-xl shadow-xs border border-[#e5eeff] dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:shadow-md transition-shadow duration-200 ${
              !banner.isActive ? 'opacity-80' : ''
            }`}
          >
            {/* Left: Image, Name & Title */}
            <div className="flex items-center gap-4">
              {/* Thumbnail Image */}
              <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative flex-shrink-0 group-hover:scale-[1.02] transition-transform">
                {banner.imageUrl && (
                  <img
                    src={banner.imageUrl}
                    alt={t('banner_alt', { title: banner.title })}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] bg-[#eff4ff] dark:bg-gray-800 px-2 py-0.5 text-[#004ac6] dark:text-blue-400 font-semibold rounded font-mono">
                    {banner.name}
                  </span>
                </div>
                <h3 className="text-base text-[#0b1c30] dark:text-white font-semibold">
                  {banner.title}
                </h3>
                {banner.content && (
                  <p className="text-xs text-[#565e74] dark:text-slate-400 mt-1 line-clamp-2 max-w-xl">
                    {banner.content}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Live Display Toggle, Actions */}
            <div className="flex flex-wrap items-center gap-8 pl-12 lg:pl-0">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${
                    banner.isActive ? 'text-[#004ac6] dark:text-blue-400' : 'text-gray-400'
                  }`}
                >
                  {banner.isActive ? t('banner_live_display') : t('banner_paused')}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={banner.isActive}
                    onChange={() => handleToggleLive(banner)}
                    disabled={isUpdating}
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
                  onClick={() => handleDelete(banner)}
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
          isSaving={isCreating || isUpdating}
        />
      )}
    </div>
  );
};
