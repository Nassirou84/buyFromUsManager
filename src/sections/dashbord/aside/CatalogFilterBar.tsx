import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { useGetCategories } from '@/api/categories/get-all-categories';
import { Input } from '@/components/ui/input';
import { SelectInput } from '@/components/ui/select-input';

export type FilterTab = 'all' | 'amazon' | 'ebay' | 'alerts' | 'delisted';
export type ViewMode = 'table' | 'grid';

interface CatalogFilterBarProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedMarketplace: string;
  onMarketplaceChange: (m: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  counts: {
    all: number;
    amazon: number;
    ebay: number;
    alerts: number;
    delisted: number;
  };
}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  selectedMarketplace,
  onMarketplaceChange,
  selectedCategory,
  onCategoryChange,
  counts,
}) => {
  const { t } = useLocales();
  const { data: categories } = useGetCategories();

  const categoryOptions = [
    { value: 'all', label: t('all_categories_subcategories') },
    ...(categories ?? []).flatMap((category) =>
      (category.subcategories ?? []).map((sub) => ({
        value: sub.title,
        label: t('subcategory_in_category', { subcategory: sub.title, category: category.title }),
      }))
    ),
  ];
  return (
    <div className="flex flex-col gap-3.5">
      {/* Tab Ribbon + View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5eeff] dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onTabChange('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-700 border border-[#e5eeff] dark:border-slate-700'
            }`}
          >
            <span>{t('all')}</span>
            <span className={`px-1.5 py-0.5 text-[11px] rounded-full font-bold ${
              activeTab === 'all' ? 'bg-blue-400/30 text-white' : 'bg-[#eff4ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300'
            }`}>
              {counts.all.toLocaleString()}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('alerts')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-700 border border-[#e5eeff] dark:border-slate-700'
            }`}
          >
            <span>{t('price_stock_changed')}</span>
            <span className="px-1.5 py-0.5 text-[11px] rounded-full font-bold bg-[#ffdbcd] text-[#943700]">
              {counts.alerts}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('delisted')}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'delisted'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-700 border border-[#e5eeff] dark:border-slate-700'
            }`}
          >
            {t('delisted_count', { count: counts.delisted })}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 p-1 rounded-lg self-end sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title={t('list_view')}
            className={`p-1.5 rounded transition-all ${
              viewMode === 'table'
                ? 'bg-[#eff4ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300 font-bold'
                : 'text-[#565e74] hover:text-[#0b1c30] dark:text-slate-400'
            }`}
          >
            <Icon name="view_list" className="text-[19px]"/>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title={t('grid_view')}
            className={`p-1.5 rounded transition-all ${
              viewMode === 'grid'
                ? 'bg-[#eff4ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300 font-bold'
                : 'text-[#565e74] hover:text-[#0b1c30] dark:text-slate-400'
            }`}
          >
            <Icon name="grid_view" className="text-[19px]"/>
          </button>
        </div>
      </div>

      {/* Search and Secondary Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('catalog_search_placeholder')}
          leftIcon={<Icon name="search" className="text-[18px]" />}
          containerClassName="md:col-span-6 mb-0"
        />

        <SelectInput
          value={selectedMarketplace}
          onChange={(e) => onMarketplaceChange(e.target.value)}
          leftIcon={<Icon name="store" className="text-[18px]" />}
          containerClassName="md:col-span-3 mb-0"
          options={[
            { value: 'all', label: t('all_source_marketplaces') },
            { value: 'amazon', label: 'Amazon' },
            { value: 'walmart', label: 'Walmart' },
            { value: 'bestbuy', label: 'BestBuy' },
            { value: 'other', label: t('seller_other') },
          ]}
        />

        <SelectInput
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          leftIcon={<Icon name="category" className="text-[18px]" />}
          containerClassName="md:col-span-3 mb-0"
          options={categoryOptions}
        />
      </div>
    </div>
  );
};
