import React from 'react';
import useLocales from '@/locales/use-locales';
import { IconBadge } from '@/sections/dashbord/components/common/IconBadge';
import { IconButton } from '@/sections/dashbord/components/common/IconButton';
import { StatPill } from '@/sections/dashbord/components/common/StatPill';

interface CategoriesModalHeaderProps {
  categoryCount?: number;
  subcategoryCount?: number;
  skuCount?: number;
  onClose: () => void;
}

export const CategoriesModalHeader: React.FC<CategoriesModalHeaderProps> = ({
  categoryCount,
  subcategoryCount,
  skuCount,
  onClose,
}) => {
  const { t } = useLocales();

  return (
  <div className="p-4 sm:p-5 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
    <div className="flex items-center gap-3">
      <IconBadge
        icon="material-symbols:account-tree"
        iconClassName="text-[24px]"
        className="w-10 h-10 rounded-xl bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 shadow-2xs"
      />
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] dark:text-white tracking-tight">
            {t('categoryTaxonomyManager')}
          </h2>
          <span className="px-2 py-0.5 bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 font-semibold text-[11px] rounded-full">
            {t('liveHierarchy')}
          </span>
        </div>
        <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-0.5">
          {t('categoryManagerSubtitle')}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="hidden lg:flex items-center gap-2 text-[12px]">
        <StatPill accent>{t('categoriesCount', { count: categoryCount ?? 0 })}</StatPill>
        <StatPill>{t('subcategoriesCount', { count: subcategoryCount ?? 0 })}</StatPill>
        <StatPill>{t('skusCount', { count: skuCount ?? 0 })}</StatPill>
      </div>
      <IconButton icon="material-symbols:close" iconClassName="text-[22px]" onClick={onClose} className="p-1.5 rounded-lg" />
    </div>
  </div>
  );
};
