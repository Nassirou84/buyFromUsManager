import useLocales from '@/locales/use-locales';
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/lucide-icon';

export type AddProductMode = 'scrape' | 'manual';

interface CatalogHeaderProps {
  onSyncAll: () => void;
  onManageCategories: () => void;
  onAddNewProduct: (mode: AddProductMode) => void;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  onSyncAll,
  onManageCategories,
  onAddNewProduct,
}) => {
  const { t } = useLocales();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMode = (mode: AddProductMode) => {
    setDropdownOpen(false);
    onAddNewProduct(mode);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col">
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('dropshipping_operations')} <span className="text-[#565e74] dark:text-slate-400">{t('product_scraping_sourcing')}</span>
        </div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#0b1c30] dark:text-white tracking-tight leading-tight">
          {t('dropship_catalog_scraper_sync')}
        </h1>
        <p className="text-[13.5px] text-[#565e74] dark:text-slate-400 mt-1 max-w-2xl">
          {t('catalog_header_subtitle')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto relative">
        <button
          type="button"
          onClick={onSyncAll}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-[#f8f9ff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-slate-200 text-[13px] font-semibold rounded-lg border border-[#c3c6d7] dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <Icon name="sync" className="text-[18px] text-[#004ac6] dark:text-blue-400"/>
          <span>{t('sync_all_scrapers')}</span>
        </button>

        <button
          type="button"
          onClick={onManageCategories}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-[#f8f9ff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-slate-200 text-[13px] font-semibold rounded-lg border border-[#c3c6d7] dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <Icon name="account_tree" className="text-[18px] text-[#565e74] dark:text-slate-400"/>
          <span>{t('manage_categories')}</span>
        </button>

        {/* Add New Product Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Icon name="add" className="text-[18px]"/>
            <span>+ {t('add_new_product')}</span>
            <Icon name="expand_more" className={`text-[18px] transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`} />
          </button>

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-76 sm:w-84 bg-white dark:bg-[#131b2e] rounded-xl shadow-xl border border-[#dce9ff] dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 p-1.5">
              <div className="px-3 py-2 border-b border-[#f0f4ff] dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                  {t('select_ingestion_method')}
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                {/* Option 1: Scrape from link */}
                <button
                  type="button"
                  onClick={() => handleSelectMode('scrape')}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon name="travel_explore" className="text-[19px]"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white flex items-center gap-1.5">
                      {t('scrape_supplier_link')}
                      <span className="px-1.5 py-0.2 bg-[#dce9ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 text-[10px] rounded font-semibold">
                        {t('auto')}
                      </span>
                    </span>
                    <span className="text-[11.5px] text-[#565e74] dark:text-slate-400 mt-0.5 leading-snug">
                      {t('auto_extract_desc')}
                    </span>
                  </div>
                </button>

                {/* Option 2: Add manually */}
                <button
                  type="button"
                  onClick={() => handleSelectMode('manual')}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon name="edit_note" className="text-[19px]"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white flex items-center gap-1.5">
                      {t('add_product_manually')}
                      <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] rounded font-semibold">
                        {t('custom')}
                      </span>
                    </span>
                    <span className="text-[11.5px] text-[#565e74] dark:text-slate-400 mt-0.5 leading-snug">
                      {t('manual_add_desc')}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
