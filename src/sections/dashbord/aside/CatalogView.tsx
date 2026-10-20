import useLocales from '@/locales/use-locales';
import React, { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { DropshipProduct, ScraperChannelStats, MarkupRule } from '../types';
import { ScraperTicker } from './ScraperTicker';
import { CatalogHeader, AddProductMode } from './CatalogHeader';
import { CatalogSummary } from './CatalogSummary';
import { CatalogFilterBar, FilterTab, ViewMode } from './CatalogFilterBar';
import { BulkActionsBar } from './BulkActionsBar';
import { ProductTable } from './ProductTable';
import { ProductGrid } from './ProductGrid';
import { ScraperThroughputCards } from './ScraperThroughputCards';
import { AddProductModal } from '../modals/add-product';
import { SyncScrapersModal } from '../modals/SyncScrapersModal';
import { ManageCategoriesModal } from '../modals/ManageCategoriesModal';
import { ManageProxiesModal } from '../modals/ManageProxiesModal';
import { EditProductModal } from '../modals/edit-product';
import { EditPriceModal } from '../modals/EditPriceModal';
import { PriceUpdatedModal } from '../modals/PriceUpdatedModal';
import { ApplyMarginModal } from '../modals/ApplyMarginModal';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGetProductSummary, GET_SUMMARY_QUERY_KEY } from '@/api/product/get-summary';
import useGetAllProducts, { GetAllProductsFilters } from '@/api/product/get-all-products';
import useUpdatePrice, { updatePrice as updatePriceRequest } from '@/api/product/update-price';
import { useBulkRelistToStore } from '@/api/product/bulk-relist-to-store';
import { Product } from '@/types/product';

interface CatalogViewProps {
  channels: ScraperChannelStats[];
  markupRules: MarkupRule[];
  onUpdateRules: (updated: MarkupRule[]) => void;
  globalSearch: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  channels,
  markupRules,
  onUpdateRules,
}) => {
  const { t } = useLocales();

  const ITEMS_PER_PAGE = 9;

  const { data: summary } = useGetProductSummary();
  const queryClient = useQueryClient();
  const { mutate: updatePrice } = useUpdatePrice();
  const { mutate: relistToStore } = useBulkRelistToStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [isApplyingMargin, setIsApplyingMargin] = useState(false);
  const [priceUpdated, setPriceUpdated] = useState<{ title?: string; price: number } | null>(null);

  // Only hit the API once the user pauses typing; a new search starts from page 1
  const [debouncedSearch] = useDebounce(localSearch, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const tabFilters = useMemo<GetAllProductsFilters>(() => {
    switch (activeTab) {
      case 'amazon':
        return { seller: 'amazon' };
      case 'ebay':
        return { seller: 'ebay' };
      case 'delisted':
        return { isAvailable: false };
      case 'alerts':
        return { updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() };
      default:
        return {};
    }
  }, [activeTab]);

  const { data: allProducts, isLoading } = useGetAllProducts(currentPage, {
    keyword: debouncedSearch,
    subCategory: selectedCategory === 'all' ? undefined : selectedCategory,
    category: undefined,
    seller: selectedMarketplace === 'all' ? undefined : selectedMarketplace,
    ...tabFilters,
    order: '[createdAt]=desc'
  });

  // Selection only makes sense for the current filter set; drop it when filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [debouncedSearch, activeTab, selectedMarketplace, selectedCategory]);

  // Counts for tabs
  const counts = useMemo(() => ({
    all: (summary?.product?.count ?? 0) - (summary?.product?.other ?? 0),
    amazon: summary?.product?.amazon ?? 0,
    ebay: summary?.product?.ebay ?? 0,
    alerts: summary?.product?.recently_updated ?? 0,
    delisted: summary?.product?.unavailable ?? 0,
  }), [summary]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const pageIds = (allProducts?.products ?? []).map((p) => p.uid ?? String(p.id));
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleUpdatePrice = (uid: string, newPrice: number) => {
    updatePrice({ uid, newPrice }, {
      onSuccess: () => {
        queryClient.setQueriesData<{ products: Product[]; totalItems: number }>(
          { queryKey: ['GET_ALL_PRODUCTS'] },
          (old) => old && {
            ...old,
            products: old.products.map((p) => (p.uid === uid ? { ...p, fullPrice: newPrice } : p)),
          }
        );
        setPriceUpdated({ title: editingProduct?.title, price: newPrice });
        setEditingProduct(null);
      },
      onError: () => {
        toast.error(t('price_update_failed'));
      },
    });
  };

  // Bulk actions
  const handleForceRescrape = () => {
    console.log('force rescrape', selectedIds);
  };

  const handleApplyMargin = async (marginPercent: number) => {
    const targets = (allProducts?.products ?? []).filter(
      (p) => p.uid && selectedIds.includes(p.uid) && p.usdPrice
    );
    if (targets.length === 0) return;

    setIsApplyingMargin(true);
    const results = await Promise.allSettled(
      targets.map((p) => {
        const newPrice = Math.round((p.usdPrice! * (1 + marginPercent / 100)) * 100) / 100;
        return updatePriceRequest(p.uid!, newPrice).then(() => ({ uid: p.uid!, newPrice }));
      })
    );
    setIsApplyingMargin(false);

    const updated = new Map<string, number>();
    results.forEach((r) => {
      if (r.status === 'fulfilled') updated.set(r.value.uid, r.value.newPrice);
    });

    if (updated.size > 0) {
      queryClient.setQueriesData<{ products: Product[]; totalItems: number }>(
        { queryKey: ['GET_ALL_PRODUCTS'] },
        (old) => old && {
          ...old,
          products: old.products.map((p) =>
            p.uid && updated.has(p.uid) ? { ...p, fullPrice: updated.get(p.uid) } : p
          ),
        }
      );
      toast.success(t('margin_applied', { count: updated.size }));
    }
    if (updated.size < targets.length) toast.error(t('margin_apply_failed'));

    setIsMarginModalOpen(false);
  };

  const handleDelist = () => {
    console.log('delist', selectedIds);
  };

  const handleRelist = () => {
    const uids = selectedIds;
    if (uids.length === 0) return;

    relistToStore(uids, {
      onSuccess: () => {
        // Reflect the change in the cached listing without waiting for a refetch
        queryClient.setQueriesData<{ products: Product[]; totalItems: number }>(
          { queryKey: ['GET_ALL_PRODUCTS'] },
          (old) => old && {
            ...old,
            products: old.products.map((p) =>
              p.uid && uids.includes(p.uid) ? { ...p, isAvailable: true } : p
            ),
          }
        );
        queryClient.invalidateQueries({ queryKey: ['GET_ALL_PRODUCTS'] });
        queryClient.invalidateQueries({ queryKey: GET_SUMMARY_QUERY_KEY });
        setSelectedIds([]);
        toast.success(t('relist_success', { count: uids.length }));
      },
      onError: () => {
        toast.error(t('relist_failed'));
      },
    });
  };

  const handleEditProduct = () => {
    const product = allProducts?.products.find((p) => (p.uid ?? String(p.id)) === selectedIds[0]);
    if (product) setProductToEdit(product);
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
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        selectedMarketplace={selectedMarketplace}
        onMarketplaceChange={(m) => {
          setSelectedMarketplace(m);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(c) => {
          setSelectedCategory(c);
          setCurrentPage(1);
        }}
        counts={counts}
      />

      {/* 5. Bulk Actions Bar (Conditional or visible when items selected) */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onForceRescrape={handleForceRescrape}
        onApplyMargin={() => setIsMarginModalOpen(true)}
        onDelist={handleDelist}
        onRelist={handleRelist}
        onEditProduct={handleEditProduct}
      />

      {/* 6. Products Table or Grid */}
      {viewMode === 'table' ? (
        <ProductTable
          products={allProducts?.products || []}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onQuickEditPrice={(prod) => setEditingProduct(prod)}
          onRescrapeProduct={(prod) => {
            // Force rescrape logic here
          }}
          currentPage={currentPage}
          totalPages={Math.ceil((allProducts?.totalItems || 0) / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
          totalCount={allProducts?.totalItems || 0}
          itemsPerPage={ITEMS_PER_PAGE}
          isLoading={isLoading}
        />
      ) : (
        <ProductGrid
          products={allProducts?.products || []}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          isLoading={isLoading}
          skeletonCount={ITEMS_PER_PAGE}
          onQuickEditPrice={(prod) => setEditingProduct(prod)}
          onRescrapeProduct={(prod) => {
          }}
        />
      )}

      {/* 7. Bottom Cards: Scraper Throughput & Pricing Markup Logic */}

      <div className="">
        <ScraperThroughputCards
          channels={channels}
          onManageProxies={() => setIsProxiesModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialMode={addModalMode}
      />

      {/* <SyncScrapersModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => {
          const refreshed = allProducts?.products.map((p) => ({
            ...p,
            lastSyncTime: t('just_now'),
          }));
          onUpdateProducts(refreshed);
        }}
      /> */}

      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      <ManageProxiesModal
        isOpen={isProxiesModalOpen}
        onClose={() => setIsProxiesModalOpen(false)}
      />

      <EditPriceModal
        key={editingProduct?.id}
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleUpdatePrice}
      />

      <ApplyMarginModal
        isOpen={isMarginModalOpen}
        selectedCount={selectedIds.length}
        isLoading={isApplyingMargin}
        onClose={() => setIsMarginModalOpen(false)}
        onApply={handleApplyMargin}
      />

      {productToEdit && (
        <EditProductModal
          key={productToEdit.id}
          product={productToEdit}
          onClose={() => setProductToEdit(null)}
        />
      )}

      <PriceUpdatedModal
        isOpen={!!priceUpdated}
        onClose={() => setPriceUpdated(null)}
        productTitle={priceUpdated?.title}
        newPrice={priceUpdated?.price}
      />
    </div>
  );
};
