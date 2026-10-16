import useLocales from '@/locales/use-locales';
import React, { useState, useMemo } from 'react';
import { DropshipProduct, ScraperChannelStats, MarkupRule } from '../types';
import { ScraperTicker } from './ScraperTicker';
import { CatalogHeader, AddProductMode } from './CatalogHeader';
import { CatalogSummary } from './CatalogSummary';
import { CatalogFilterBar, FilterTab, ViewMode } from './CatalogFilterBar';
import { BulkActionsBar } from './BulkActionsBar';
import { ProductTable } from './ProductTable';
import { ProductGrid } from './ProductGrid';
import { ScraperThroughputCards } from './ScraperThroughputCards';
import { PricingMarkupCard } from './PricingMarkupCard';
import { AddProductModal } from '../modals/add-product';
import { SyncScrapersModal } from '../modals/SyncScrapersModal';
import { ManageCategoriesModal } from '../modals/ManageCategoriesModal';
import { ConfigureMarkupModal } from '../modals/ConfigureMarkupModal';
import { ManageProxiesModal } from '../modals/ManageProxiesModal';
import { EditPriceModal } from '../modals/EditPriceModal';
import { useGetProductSummary } from '@/api/product/get-summary';

interface CatalogViewProps {
  products: DropshipProduct[];
  channels: ScraperChannelStats[];
  markupRules: MarkupRule[];
  onUpdateProducts: (updated: DropshipProduct[]) => void;
  onUpdateRules: (updated: MarkupRule[]) => void;
  globalSearch: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  channels,
  markupRules,
  onUpdateProducts,
  onUpdateRules,
  globalSearch,
}) => {
  const { t } = useLocales();

  const { data: summary } = useGetProductSummary();

  const [selectedIds, setSelectedIds] = useState<string[]>(['prod-1', 'prod-2']);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState<AddProductMode>('scrape');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isConfigureMarkupOpen, setIsConfigureMarkupOpen] = useState(false);
  const [isProxiesModalOpen, setIsProxiesModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DropshipProduct | null>(null);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: 1482,
      amazon: 840,
      ebay: 420,
      alerts: 14,
      drafts: 23,
    };
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Global search or local search
      const q = (globalSearch || localSearch).trim().toLowerCase();
      if (q) {
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchAsin = p.sourceId.toLowerCase().includes(q);
        const matchSupplier = p.supplierInfo.toLowerCase().includes(q);
        const matchSubtitle = p.scrapedSubtitle.toLowerCase().includes(q);
        if (!matchTitle && !matchSku && !matchAsin && !matchSupplier && !matchSubtitle) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === 'amazon' && p.sourceMarketplace !== 'amazon') return false;
      if (activeTab === 'ebay' && p.sourceMarketplace !== 'ebay') return false;
      if (activeTab === 'alerts' && p.syncStatus !== 'price_shifted' && p.inStock) return false;

      // Dropdown Marketplace
      if (selectedMarketplace !== 'all' && p.sourceMarketplace !== selectedMarketplace) {
        return false;
      }

      // Dropdown Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [products, globalSearch, localSearch, activeTab, selectedMarketplace, selectedCategory]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk actions
  const handleForceRescrape = () => {
    const updated = products.map((p) => {
      if (selectedIds.includes(p.id)) {
        return {
          ...p,
          lastSyncTime: t('just_now'),
          syncStatus: 'synced' as const,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
    alert(t('force_rescrape_alert', { count: selectedIds.length }));
  };

  const handleApplyMarkup = () => {
    const updated = products.map((p) => {
      if (selectedIds.includes(p.id)) {
        const newMarkup = p.markupPercent + 40;
        const newRetail = Math.round(p.sourceCost * (1 + newMarkup / 100));
        const newMargin = ((newRetail - p.sourceCost) / newRetail) * 100;
        return {
          ...p,
          retailPrice: newRetail,
          markupPercent: Math.round(newMarkup * 10) / 10,
          marginPercent: Math.round(newMargin * 10) / 10,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleChangeCategory = () => {
    const newCat = prompt(t('enter_new_category_name'), t('outerwear'));
    if (newCat) {
      const updated = products.map((p) =>
        selectedIds.includes(p.id) ? { ...p, subCategory: newCat } : p
      );
      onUpdateProducts(updated);
    }
  };

  const handleDelist = () => {
    const updated = products.map((p) =>
      selectedIds.includes(p.id) ? { ...p, isDelisted: true, inStock: false, statusLabel: t('delisted_from_storefront') } : p
    );
    onUpdateProducts(updated);
  };

  const handleAddNewProduct = (newProd: DropshipProduct) => {
    onUpdateProducts([newProd, ...products]);
  };

  const handleSavePriceEdit = (id: string, newRetailPrice: number) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const markup = ((newRetailPrice - p.sourceCost) / p.sourceCost) * 100;
        const margin = ((newRetailPrice - p.sourceCost) / newRetailPrice) * 100;
        return {
          ...p,
          retailPrice: newRetailPrice,
          markupPercent: Math.round(markup * 10) / 10,
          marginPercent: Math.round(margin * 10) / 10,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Active Scraping Engine Ticker */}
      <ScraperTicker />

      {/* 2. Header & Actions */}
      <CatalogHeader
        onSyncAll={() => setIsSyncModalOpen(true)}
        onManageCategories={() => setIsCategoriesModalOpen(true)}
        onAddNewProduct={(mode) => {
          setAddModalMode(mode);
          setIsAddModalOpen(true);
        }}
      />

      {/* 3. 4 KPI Cards */}
      <CatalogSummary
        productSummary={summary?.product ?? {
          count: 0,
          amazon: 0,
          ebay: 0,
          other: 0,
          unavailable: 0,
          recently_updated: 0,
        }}
        markupSummary={summary?.markup ?? {
          average: 0,
          lowest: 0,
          highest: 0
        }}
        onFilterAlerts={() => setActiveTab('alerts')}
        onFilterChannel={(chan) => {
          if (chan === 'all') setActiveTab('all');
          if (chan === 'amazon') setActiveTab('amazon');
          if (chan === 'ebay') setActiveTab('ebay');
        }}
      />

      {/* 4. Filter Ribbon and Secondary Search */}
      <CatalogFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        selectedMarketplace={selectedMarketplace}
        onMarketplaceChange={setSelectedMarketplace}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        counts={counts}
      />

      {/* 5. Bulk Actions Bar (Conditional or visible when items selected) */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onForceRescrape={handleForceRescrape}
        onApplyMarkup={handleApplyMarkup}
        onChangeCategory={handleChangeCategory}
        onDelist={handleDelist}
      />

      {/* 6. Products Table or Grid */}
      {viewMode === 'table' ? (
        <ProductTable
          products={filteredProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onQuickEditPrice={(prod) => setEditingProduct(prod)}
          onRescrapeProduct={(prod) => {
            const updated = products.map((p) =>
              p.id === prod.id ? { ...p, lastSyncTime: t('just_now') } : p
            );
            onUpdateProducts(updated);
            alert(t('listing_scraped_alert', { sku: prod.sku }));
          }}
          currentPage={currentPage}
          totalPages={149}
          onPageChange={setCurrentPage}
          totalCount={counts.all}
        />
      ) : (
        <ProductGrid
          products={filteredProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onQuickEditPrice={(prod) => setEditingProduct(prod)}
          onRescrapeProduct={(prod) => {
            const updated = products.map((p) =>
              p.id === prod.id ? { ...p, lastSyncTime: t('just_now') } : p
            );
            onUpdateProducts(updated);
          }}
        />
      )}

      {/* 7. Bottom Cards: Scraper Throughput & Pricing Markup Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-1">
        <div className="lg:col-span-8">
          <ScraperThroughputCards
            channels={channels}
            onManageProxies={() => setIsProxiesModalOpen(true)}
          />
        </div>
        <div className="lg:col-span-4">
          <PricingMarkupCard
            rules={markupRules}
            onConfigureRules={() => setIsConfigureMarkupOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddNewProduct}
        initialMode={addModalMode}
      />

      <SyncScrapersModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => {
          const refreshed = products.map((p) => ({
            ...p,
            lastSyncTime: t('just_now'),
          }));
          onUpdateProducts(refreshed);
        }}
      />

      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      <ConfigureMarkupModal
        isOpen={isConfigureMarkupOpen}
        onClose={() => setIsConfigureMarkupOpen(false)}
        rules={markupRules}
        onSaveRules={onUpdateRules}
      />

      <ManageProxiesModal
        isOpen={isProxiesModalOpen}
        onClose={() => setIsProxiesModalOpen(false)}
      />

      <EditPriceModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSavePriceEdit}
      />
    </div>
  );
};
