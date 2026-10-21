import useLocales from '@/locales/use-locales';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { Banner, BannerPayload } from '@/types/marketing';
import { uploadBannerImage } from '@/api/banner/upload-banner-image';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface UploadBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: BannerPayload) => void;
  initialData?: Banner | null;
  isSaving?: boolean;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const UploadBannerModal: React.FC<UploadBannerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const { t } = useLocales();
  const [title, setTitle] = useState(initialData?.title || '');
  const [name, setName] = useState(initialData?.name || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLive, setIsLive] = useState(initialData?.isActive ?? true);

  // Release the temporary object URL of a picked file when it is replaced or the modal closes.
  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('banner_image_invalid_type'));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t('banner_image_too_large'));
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t('banner_title_required'));
      return;
    }

    // A new file is uploaded first; its URL then becomes the banner's image.
    let imageUrl = initialData?.imageUrl ?? null;
    if (imageFile) {
      setIsUploading(true);
      try {
        imageUrl = await uploadBannerImage(imageFile);
      } catch {
        toast.error(t('banner_image_upload_failed'));
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // The name is the unique key the storefront looks banners up by, so it is fixed once created.
    onSave({
      title: title.trim(),
      name: initialData ? initialData.name : name.trim() || slugify(title),
      content: content.trim() || null,
      imageUrl,
      isActive: isLive,
    });
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
              {t('banner_field_name')}
            </label>
            <input
              value={initialData ? initialData.name : name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!initialData}
              className="w-full h-10 px-3.5 text-xs font-mono text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6] disabled:opacity-60"
              placeholder={slugify(title) || 'hero_banner'}
              type="text"
            />
            <p className="text-[11px] text-gray-500">{t('banner_field_name_hint')}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
              {t('banner_field_content')}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-20 px-3.5 py-2.5 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
              placeholder={t('banner_field_content_placeholder')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
              {t('banner_field_image')}
            </label>
            <input
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              type="file"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-32 rounded-lg overflow-hidden bg-[#eff4ff] dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 hover:border-[#004ac6] transition-colors flex items-center justify-center group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt={t('banner_image_preview')} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                    <Icon name="cloud_upload" className="text-[18px]" />
                    {t('banner_image_replace')}
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-1 text-xs font-semibold text-[#565e74] dark:text-gray-400">
                  <Icon name="cloud_upload" className="text-[24px]" />
                  {t('banner_image_choose')}
                  <span className="text-[11px] font-normal">{t('banner_image_hint')}</span>
                </span>
              )}
            </button>
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
              disabled={isSaving || isUploading}
              className="px-5 py-2.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#2563eb] transition-colors disabled:opacity-60"
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
