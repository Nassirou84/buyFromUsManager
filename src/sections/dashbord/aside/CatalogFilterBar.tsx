import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';

export type FilterTab = 'all' | 'amazon' | 'ebay' | 'alerts' | 'drafts';
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
    drafts: number;
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
  return (
    <div className="flex flex-col gap-3.5">
      {/* Tab Ribbon + View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5eeff] dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onTabChange('all')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-700 border border-[#e5eeff] dark:border-slate-700'
            }`}
          >
            {t('all_scraped_products', { total: counts.all.toLocaleString() })}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('amazon')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'amazon'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-700 border border-[#e5eeff] dark:border-slate-700'
            }`}
          >
            <span>{t('amazon_sync')}</span>
            <span className={`px-1.5 py-0.5 text-[11px] rounded-full font-bold ${
              activeTab === 'amazon' ? 'bg-blue-400/30 text-white' : 'bg-[#eff4ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300'
            }`}>
              {counts.amazon}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('ebay')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ebay'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-700 border border-[#e5eeff] dark:border-slate-700'
            }`}
          >
            <span>{t('ebay_sync')}</span>
            <span className={`px-1.5 py-0.5 text-[11px] rounded-full font-bold ${
              activeTab === 'ebay' ? 'bg-blue-400/30 text-white' : 'bg-[#eff4ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300'
            }`}>
              {counts.ebay}
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
            onClick={() => onTabChange('drafts')}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-700 border border-[#e5eeff] dark:border-slate-700'
            }`}
          >
            {t('drafts_count', { count: counts.drafts })}
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
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[18px]"/>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('catalog_search_placeholder')}
            className="w-full h-10.5 pl-9 pr-4 bg-white dark:bg-[#131b2e] border border-[#c3c6d7] dark:border-slate-700 text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] rounded-lg focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] shadow-2xs"
          />
        </div>

        {/* Source Marketplaces */}
        <div className="md:col-span-3 relative">
          <Icon name="store" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565e74] text-[18px] pointer-events-none"/>
          <select
            value={selectedMarketplace}
            onChange={(e) => onMarketplaceChange(e.target.value)}
            className="w-full h-10.5 pl-9 pr-8 bg-white dark:bg-[#131b2e] border border-[#c3c6d7] dark:border-slate-700 text-[13px] text-[#0b1c30] dark:text-white rounded-lg appearance-none focus:outline-none focus:border-[#004ac6] shadow-2xs cursor-pointer"
          >
            <option value="all">{t('all_source_marketplaces')}</option>
            <option value="amazon">{t('amazon_us_prime')}</option>
            <option value="ebay">{t('ebay_luxury')}</option>
            <option value="aliexpress">{t('aliexpress_direct')}</option>
          </select>
          <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none text-[18px]"/>
        </div>

        {/* Categories */}
        <div className="md:col-span-3 relative">
          <Icon name="category" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565e74] text-[18px] pointer-events-none"/>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-10.5 pl-9 pr-8 bg-white dark:bg-[#131b2e] border border-[#c3c6d7] dark:border-slate-700 text-[13px] text-[#0b1c30] dark:text-white rounded-lg appearance-none focus:outline-none focus:border-[#004ac6] shadow-2xs cursor-pointer"
          >
            <option value="all">{t('all_categories_subcategories')}</option>
            <option value="Apparel">{t('cat_apparel')}</option>
            <option value="Leather Goods">{t('cat_leather_goods')}</option>
            <option value="Jewelry & Acc">{t('cat_jewelry')}</option>
          </select>
          <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none text-[18px]"/>
        </div>
      </div>
    </div>
  );
};
