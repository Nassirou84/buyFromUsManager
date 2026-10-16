import React, { useRef } from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import type { ProductImage } from './use-product-form';

interface ImagePickerProps {
  images: ProductImage[];
  altPrefix: string;
  onChange: (images: ProductImage[]) => void;
}

// The first image is the cover; scraped images land here too and can be removed.
export const ImagePicker: React.FC<ImagePickerProps> = ({ images, altPrefix, onChange }) => {
  const { t } = useLocales();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    onChange([...images, ...files.map((file) => ({ url: URL.createObjectURL(file), file }))]);
  };

  const removeImage = (index: number) => {
    const removed = images[index];
    if (removed.file) URL.revokeObjectURL(removed.url);
    onChange(images.filter((_, i) => i !== index));
  };
  const makeCover = (index: number) => onChange([images[index], ...images.filter((_, i) => i !== index)]);

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-[#dce9ff] dark:border-slate-700 flex flex-col gap-3 shadow-2xs">
      <div className="flex items-center gap-1.5">
        <Icon name="photo_camera" className="text-[19px] text-[#004ac6] dark:text-blue-400" />
        <span className="text-[12.5px] font-bold text-[#0b1c30] dark:text-white">
          {t('product_photography')}
        </span>
      </div>

      <p className="text-[11.5px] text-[#565e74] dark:text-slate-400">{t('product_imagery_desc')}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12px] font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Icon name="upload_file" className="text-[16px]" />
          <span>{t('upload_from_device')}</span>
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('supports_formats')}</span>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map(({ url }, idx) => (
            <div
              key={`${idx}-${url.slice(-24)}`}
              className={`relative rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30' : 'border-slate-200 dark:border-slate-700'
                }`}
            >
              <img
                src={url}
                alt={`${altPrefix || t('manual_photo_preview_alt')} ${idx + 1}`}
                className="w-full h-24 object-cover bg-white"
              />
              {idx === 0 ? (
                <span className="absolute bottom-1 left-1 px-1.5 bg-[#004ac6] text-white text-[10px] font-bold rounded">
                  {t('cover_image')}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(idx)}
                  className="absolute bottom-1 left-1 px-1.5 bg-white/90 text-[#004ac6] text-[10px] font-bold rounded cursor-pointer"
                >
                  {t('set_as_cover')}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                aria-label={t('remove_image')}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center cursor-pointer"
              >
                <Icon name="close" className="text-[13px]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 border-2 border-dashed border-[#dce9ff] dark:border-slate-700 rounded-xl text-center text-[12px] text-[#565e74] dark:text-slate-400">
          {t('no_images_yet')}
        </div>
      )}
    </div>
  );
};
