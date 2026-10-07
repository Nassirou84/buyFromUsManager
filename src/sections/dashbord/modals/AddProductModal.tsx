import useLocales from '@/locales/use-locales';
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/lucide-icon';
import { DropshipProduct, Marketplace } from '../../types';

export type AddProductModalMode = 'scrape' | 'manual';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: DropshipProduct) => void;
  initialMode?: AddProductModalMode;
}

const LUXURY_IMAGE_PRESETS = [
  {
    labelKey: 'preset_trench_coat',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQIdo7_fsxyOgL8_4sJYHyvFvOhYfLDe4FON1xCqtIO0TleI3YaTpclfeaaYdzIyFIrp1-LVOfkkgOM5SSDyLrI1wzpnzSJ1cLEyeP_sRZWBJZXbE5d2vBo3vlxI_yf-NxV5q1ncMp6Ene4ohIwToj1r6IVpWiTEz3VjQotwL49AlQU5FBoWPcUvb1_6qQnmNtVh0b7oM9X2IEgXLvKZUszpxhW3f1nJJsu42mA6FeFLUp0RxFnOA_',
  },
  {
    labelKey: 'preset_cashmere_knit',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjJzp4TmtmolkazRi8at6n73JKin-ho0tzdiH_5Nu0VdBkA049g48wR5JK-2JBj-DL7mq4fMvHaVmuiPq7Jo4t2SFuRI2g4zv8rbaHKvknUx0sKdN68aoWln31QkmFogYC-WwPVekrx6n-YvyjFV-Z5LC6xG6tFwtCEtbWiDmpq1IoMBjHwpTcjuLsztQdZm1zWdxz6CRNvp7mQNTEY9IiES_ltCR6uofcU5cFbi9lH3YE_WWPts4C',
  },
  {
    labelKey: 'preset_leather_goods',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDojhRc_74rt8LEpQk7wa13rjsvoiVZ8balIxM8l2TZGwCA2YFWfVjQyLnFSRng3NlovfHRAT_E_GfCOSfCuYp2hU0TuWjdZmIy9aM0fHDg8LXf1DNKm36xTjLd4vPb-s095PnfG9KwU_jErMWjo4uIiu0XhrIHhhl2pIw29UBtyx2KU1YqEed2DRMjPd2kfrn9tEcR98le2Ipts5cRkrPke7aAo50sfxp2BeuDQwWmzMymr483Dnth',
  },
  {
    labelKey: 'preset_structured_blazer',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80',
  },
  {
    labelKey: 'preset_silk_scarf',
    url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=300&q=80',
  },
  {
    labelKey: 'preset_wool_overcoat',
    url: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=300&q=80',
  }
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  initialMode = 'scrape',
}) => {
  const { t } = useLocales();
  const [activeTab, setActiveTab] = useState<AddProductModalMode>(initialMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync tab whenever initialMode changes
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  // --- UNIVERSAL MANUAL PRODUCT IMAGE STATE ---
  // Any scraped image is explicitly ignored, and this manual image is used across both modes!
  const [manualProductImage, setManualProductImage] = useState<string>(
    LUXURY_IMAGE_PRESETS[0].url
  );
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>('');

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setManualProductImage(reader.result);
          setCustomImageUrlInput('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customImageUrlInput.trim()) {
      setManualProductImage(customImageUrlInput.trim());
    }
  };

  // --- SCRAPING STATE ---
  const [sourceUrl, setSourceUrl] = useState('https://www.amazon.com/dp/B08X49KL2P');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    subtitle: string;
    source: Marketplace;
    sourceId: string;
    supplier: string;
    sourceCost: number;
  } | null>(null);

  const [scrapeCategory, setScrapeCategory] = useState('Apparel');
  const [scrapeSubCategory, setScrapeSubCategory] = useState('Outerwear');
  const [scrapeMarkupPercent, setScrapeMarkupPercent] = useState<number>(115);
  const [scrapeCustomPrice, setScrapeCustomPrice] = useState<number>(0);

  // --- MANUAL ENTRY STATE ---
  const [manualTitle, setManualTitle] = useState('');
  const [manualSku, setManualSku] = useState('');
  const [manualCategory, setManualCategory] = useState('Apparel');
  const [manualSubCategory, setManualSubCategory] = useState('Trench Coats');
  const [manualMarketplace, setManualMarketplace] = useState<Marketplace>('direct');
  const [manualSupplierInfo, setManualSupplierInfo] = useState('Direct Atelier Workshop Firenze');
  const [manualCost, setManualCost] = useState<number>(110);
  const [manualRetailPrice, setManualRetailPrice] = useState<number>(245);
  const [manualDescription, setManualDescription] = useState('');
  const [manualInStock, setManualInStock] = useState(true);

  if (!isOpen) return null;

  // Auto-generate a SKU for manual entry
  const generateSku = () => {
    const prefix = manualMarketplace.toUpperCase().slice(0, 3);
    const code = Math.floor(1000 + Math.random() * 9000);
    setManualSku(`FB-${prefix}-${code}-LUX`);
  };

  // Automated Scraper Simulation (ignoring upstream image)
  const handleScrape = () => {
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      const isEbay = sourceUrl.includes('ebay');
      const isAli = sourceUrl.includes('aliexpress');

      if (isEbay) {
        setScrapedData({
          title: 'Virgin Wool Peacoat Double Breasted',
          subtitle: 'eBay: "Authentic Tailored Luxury Winter Peacoat Navy..."',
          source: 'ebay',
          sourceId: '#409218201',
          supplier: 'Savile Row Vintage Outlet',
          sourceCost: 195.0,
        });
        setScrapeCustomPrice(Math.round(195.0 * (1 + scrapeMarkupPercent / 100)));
      } else if (isAli) {
        setScrapedData({
          title: 'Silk Touch Satin Pajama Set',
          subtitle: 'AliExpress: "100% Mulberry Silk Blend Luxury Sleepwear..."',
          source: 'aliexpress',
          sourceId: '#100500982',
          supplier: 'Suzhou Silk Crafts Co.',
          sourceCost: 42.0,
        });
        setScrapeCustomPrice(Math.round(42.0 * (1 + scrapeMarkupPercent / 100)));
      } else {
        setScrapedData({
          title: 'Italian Merino Wool Turtleneck Sweater',
          subtitle: 'Amazon: "Fine Gauge Pure Wool Knit Slim Fit Pullover..."',
          source: 'amazon',
          sourceId: 'B08X49KL2P',
          supplier: 'Milano Knitwear Ltd',
          sourceCost: 75.0,
        });
        setScrapeCustomPrice(Math.round(75.0 * (1 + scrapeMarkupPercent / 100)));
      }
    }, 800);
  };

  // Submit Scraped Product with MANUALLY ADDED IMAGE (Ignoring any scraping images)
  const handleSaveScraped = () => {
    if (!scrapedData) return;
    const cost = scrapedData.sourceCost;
    const retail = scrapeCustomPrice || cost * (1 + scrapeMarkupPercent / 100);
    const markup = ((retail - cost) / cost) * 100;
    const margin = ((retail - cost) / retail) * 100;

    const newProd: DropshipProduct = {
      id: `prod-${Date.now()}`,
      sku: `FB-${scrapedData.source.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}-SYNC`,
      title: scrapedData.title,
      scrapedSubtitle: scrapedData.subtitle,
      sourceMarketplace: scrapedData.source,
      sourceLabel:
        scrapedData.source === 'amazon'
          ? 'AMAZON US'
          : scrapedData.source === 'ebay'
          ? 'EBAY LUX'
          : 'ALI DIRECT',
      sourceId: scrapedData.sourceId,
      sourceUrl: sourceUrl,
      supplierInfo: scrapedData.supplier,
      category: scrapeCategory,
      subCategory: scrapeSubCategory,
      sourceCost: cost,
      retailPrice: Math.round(retail),
      markupPercent: Math.round(markup * 10) / 10,
      marginPercent: Math.round(margin * 10) / 10,
      syncStatus: 'synced',
      inStock: true,
      // Manually added image is used exclusively; scraping images are ignored!
      image: manualProductImage,
      imageAlt: scrapedData.title,
      lastSyncTime: t('just_now'),
    };

    onAddProduct(newProd);
    onClose();
  };

  // Submit Manual Product
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const sku = manualSku.trim() || `FB-DIR-${Math.floor(1000 + Math.random() * 9000)}-MAN`;
    const cost = Number(manualCost) || 50;
    const retail = Number(manualRetailPrice) || cost * 2;
    const markup = ((retail - cost) / cost) * 100;
    const margin = ((retail - cost) / retail) * 100;

    const getLabel = () => {
      switch (manualMarketplace) {
        case 'amazon':
          return 'AMAZON US';
        case 'ebay':
          return 'EBAY LUX';
        case 'aliexpress':
          return 'ALI DIRECT';
        default:
          return 'DIRECT ATELIER';
      }
    };

    const newProd: DropshipProduct = {
      id: `prod-${Date.now()}`,
      sku: sku,
      title: manualTitle.trim(),
      scrapedSubtitle: manualDescription.trim() || t('custom_luxury', { title: manualTitle.trim() }),
      sourceMarketplace: manualMarketplace,
      sourceLabel: getLabel(),
      sourceId: `#MAN-${Math.floor(100000 + Math.random() * 900000)}`,
      sourceUrl: '#',
      supplierInfo: manualSupplierInfo.trim() || t('direct_atelier_partner'),
      category: manualCategory,
      subCategory: manualSubCategory,
      sourceCost: cost,
      retailPrice: Math.round(retail),
      markupPercent: Math.round(markup * 10) / 10,
      marginPercent: Math.round(margin * 10) / 10,
      syncStatus: 'synced',
      inStock: manualInStock,
      // Manually added image is used!
      image: manualProductImage,
      imageAlt: manualTitle.trim(),
      lastSyncTime: t('just_now'),
    };

    onAddProduct(newProd);
    onClose();
  };

  // Calculations for manual entry live margin
  const manualMarkupCalc = manualCost > 0 ? ((manualRetailPrice - manualCost) / manualCost) * 100 : 0;
  const manualMarginCalc = manualRetailPrice > 0 ? ((manualRetailPrice - manualCost) / manualRetailPrice) * 100 : 0;

  // Reusable Manual Image Picker Component
  const renderManualImagePicker = () => (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-[#dce9ff] dark:border-slate-700 flex flex-col gap-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon name="photo_camera" className="text-[19px] text-[#004ac6] dark:text-blue-400"/>
          <span className="text-[12.5px] font-bold text-[#0b1c30] dark:text-white">
            {t('product_photography_manual')}
          </span>
        </div>
        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold rounded flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {t('scraped_imagery_ignored')}
        </span>
      </div>

      <p className="text-[11.5px] text-[#565e74] dark:text-slate-400">
        {t('product_imagery_desc')}
      </p>

      {/* Main Preview & Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-[#f8f9ff] dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative group flex-shrink-0">
          <img
            src={manualProductImage}
            alt={t('manual_photo_preview_alt')}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-white shadow-sm border border-slate-200 dark:border-slate-600 ring-2 ring-[#004ac6]/30"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#004ac6] text-white p-1 rounded-full shadow-xs">
            <Icon name="check" className="text-[13px] block"/>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12px] font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Icon name="upload_file" className="text-[16px]"/>
              <span>{t('upload_from_device')}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <span className="text-[11px] text-[#565e74] dark:text-slate-400">
              {t('supports_formats')}
            </span>
          </div>

          {/* Direct URL input */}
          <div className="flex gap-1.5 mt-0.5">
            <input
              type="text"
              value={customImageUrlInput}
              onChange={(e) => setCustomImageUrlInput(e.target.value)}
              placeholder={t('paste_image_url')}
              className="flex-1 h-8 px-2.5 bg-white dark:bg-slate-900 text-[#0b1c30] dark:text-white text-[12px] rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#004ac6]"
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="px-3 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#0b1c30] dark:text-white text-[11.5px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {t('apply')}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Luxury Studio Photography Options */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-[#565e74] dark:text-slate-400">
          {t('select_studio_presets')}
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {LUXURY_IMAGE_PRESETS.map((preset, idx) => {
            const isSelected = manualProductImage === preset.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setManualProductImage(preset.url);
                  setCustomImageUrlInput('');
                }}
                className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                  isSelected
                    ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={preset.url}
                  alt={t(preset.labelKey)}
                  className="w-full h-14 object-cover"
                />
                <div className="p-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-[#0b1c30] dark:text-white block truncate text-center">
                    {t(preset.labelKey)}
                  </span>
                </div>
                {isSelected && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#004ac6] text-white rounded-full flex items-center justify-center text-[10px] shadow-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6">
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-4xl lg:max-w-5xl w-full p-5 sm:p-7 shadow-2xl border border-[#dce9ff] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#f0f4ff] dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 flex items-center justify-center font-bold shadow-2xs">
              <Icon name={activeTab === 'scrape' ? 'travel_explore' : 'edit_note'} className="text-[24px]"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#0b1c30] dark:text-white tracking-tight">
                  {t('add_product_to_catalog')}
                </h3>
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] rounded-full border border-emerald-200 dark:border-emerald-800">
                  {t('manual_image_engine')}
                </span>
              </div>
              <p className="text-[12.5px] text-[#565e74] dark:text-slate-400 mt-0.5">
                {t('catalog_photography_note')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Icon name="close" className="text-[22px]"/>
          </button>
        </div>

        {/* Mode Segmented Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#eff4ff] dark:bg-slate-800 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('scrape')}
            className={`py-2 px-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'scrape'
                ? 'bg-white dark:bg-[#131b2e] text-[#004ac6] dark:text-blue-300 shadow-xs'
                : 'text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white'
            }`}
          >
            <Icon name="travel_explore" className="text-[18px]"/>
            <span>{t('scrape_from_supplier')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              if (!manualSku) generateSku();
            }}
            className={`py-2 px-3 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-[#131b2e] text-[#004ac6] dark:text-blue-300 shadow-xs'
                : 'text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white'
            }`}
          >
            <Icon name="edit_note" className="text-[18px]"/>
            <span>{t('manual_product_entry')}</span>
          </button>
        </div>

        {/* TAB 1: SCRAPING FLOW (With Manual Image) */}
        {activeTab === 'scrape' && (
          <div className="flex flex-col gap-4">
            {/* Input URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#0b1c30] dark:text-slate-300">
                {t('source_listing_url')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder={t('source_url_placeholder')}
                  className="flex-1 h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={isScraping || !sourceUrl.trim()}
                  className="px-4 h-10 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Icon name={isScraping ? 'sync' : 'bolt'} className="text-[17px]"/>
                  <span>{isScraping ? t('extracting') : t('scrape_listing')}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('try_sample')}</span>
                <button
                  type="button"
                  onClick={() => setSourceUrl('https://www.amazon.com/dp/B08X49KL2P')}
                  className="text-[11px] text-[#004ac6] dark:text-blue-400 hover:underline"
                >
                  {t('amazon_asin')}
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setSourceUrl('https://www.ebay.com/itm/409218201')}
                  className="text-[11px] text-[#004ac6] dark:text-blue-400 hover:underline"
                >
                  {t('ebay_luxury')}
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setSourceUrl('https://www.aliexpress.com/item/100500982.html')}
                  className="text-[11px] text-[#004ac6] dark:text-blue-400 hover:underline"
                >
                  {t('aliexpress_direct')}
                </button>
              </div>
            </div>

            {/* Scraped Result Preview */}
            {scrapedData ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 flex flex-col gap-3.5">
                  <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-xl border border-[#dce9ff] dark:border-slate-700 flex flex-col gap-3">
                    <div className="flex items-center gap-3.5">
                      {/* Shows the MANUALLY ADDED IMAGE, not the scraped image! */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={manualProductImage}
                          alt={t('manual_photo_alt')}
                          className="w-16 h-16 rounded-xl object-cover bg-white dark:bg-slate-800 shadow-2xs border-2 border-[#004ac6]"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1 bg-[#004ac6] text-white text-[9px] font-bold rounded">
                          {t('manual')}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#dbe1ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 rounded uppercase">
                            {t('source_extracted', { source: scrapedData.source.toUpperCase() })}
                          </span>
                          <span className="text-[10.5px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900">
                            {t('supplier_photo_ignored')}
                          </span>
                        </div>
                        <h4 className="font-bold text-[14px] text-[#0b1c30] dark:text-white truncate mt-1">
                          {scrapedData.title}
                        </h4>
                        <p className="text-[11.5px] text-[#565e74] dark:text-slate-400 truncate">
                          {scrapedData.subtitle}
                        </p>
                        <span className="text-[11.5px] font-mono text-[#004ac6] dark:text-blue-400 font-semibold">
                          {t('source_cost', { value: scrapedData.sourceCost.toFixed(2) })}
                        </span>
                      </div>
                    </div>

                    {/* Repricing & Category Config */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#dce9ff] dark:border-slate-700">
                      <div>
                        <label className="text-[11px] font-bold text-[#565e74] dark:text-slate-400 block mb-1">
                          {t('target_category')}
                        </label>
                        <select
                          value={scrapeCategory}
                          onChange={(e) => setScrapeCategory(e.target.value)}
                          className="w-full h-9 px-2.5 bg-white dark:bg-slate-900 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <option value="Apparel">{t('apparel')}</option>
                          <option value="Leather Goods">{t('leather_goods')}</option>
                          <option value="Jewelry & Acc">{t('jewelry_acc')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#565e74] dark:text-slate-400 block mb-1">
                          {t('retail_price_dollar')}
                        </label>
                        <input
                          type="number"
                          value={scrapeCustomPrice}
                          onChange={(e) => setScrapeCustomPrice(Number(e.target.value))}
                          className="w-full h-9 px-2.5 bg-white dark:bg-slate-900 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-slate-200 dark:border-slate-700 font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11.5px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#e5eeff] dark:border-slate-800">
                      <span className="text-[#565e74] dark:text-slate-400">{t('calculated_gross_margin')}</span>
                      <span className="font-bold text-[#004ac6] dark:text-blue-400 font-mono">
                        {scrapeCustomPrice > scrapedData.sourceCost
                          ? t('margin_pct', { value: Math.round(((scrapeCustomPrice - scrapedData.sourceCost) / scrapeCustomPrice) * 100) })
                          : t('margin_pct', { value: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MANUAL IMAGE SELECTION SECTION FOR SCRAPED LISTING */}
                <div className="lg:col-span-5">
                  {renderManualImagePicker()}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6 p-8 border-2 border-dashed border-[#dce9ff] dark:border-slate-700 rounded-xl text-center flex flex-col items-center justify-center text-[#565e74] dark:text-slate-400 min-h-[220px]">
                  <Icon name="travel_explore" className="text-[36px] text-[#004ac6] dark:text-blue-400 mb-2"/>
                  <span className="font-bold text-[14px] text-[#0b1c30] dark:text-white">
                    {t('step1_scrape')}
                  </span>
                  <p className="text-[12px] max-w-sm mt-1">
                    {t('step1_desc')}
                  </p>
                </div>

                {/* Pre-set manual image even before scraping */}
                <div className="lg:col-span-6">
                  {renderManualImagePicker()}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4ff] dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={!scrapedData}
                onClick={handleSaveScraped}
                className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg disabled:opacity-40 cursor-pointer shadow-sm transition-all"
              >
                {t('add_to_dropship_catalog')}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL PRODUCT CREATION */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSaveManual} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Product Specifications & Pricing */}
              <div className="lg:col-span-7 flex flex-col gap-3.5">
                {/* Title & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[11.5px] font-bold text-[#0b1c30] dark:text-slate-200">
                      {t('product_title_req')}
                    </label>
                    <input
                      type="text"
                      required
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder={t('product_title_placeholder')}
                      className="h-9.5 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11.5px] font-bold text-[#0b1c30] dark:text-slate-200">
                        {t('sku_code')}
                      </label>
                      <button
                        type="button"
                        onClick={generateSku}
                        className="text-[10.5px] text-[#004ac6] dark:text-blue-400 hover:underline font-semibold"
                      >
                        {t('generate')}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={manualSku}
                      onChange={(e) => setManualSku(e.target.value)}
                      placeholder="FB-AMZ-8821"
                      className="h-9.5 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white font-mono text-[12px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Marketplace */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-300">
                      {t('category')}
                    </label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="h-9.5 px-2.5 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                    >
                      <option value="Apparel">{t('apparel')}</option>
                      <option value="Leather Goods">{t('leather_goods')}</option>
                      <option value="Jewelry & Acc">{t('jewelry_acc')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-300">
                      {t('subcategory')}
                    </label>
                    <input
                      type="text"
                      value={manualSubCategory}
                      onChange={(e) => setManualSubCategory(e.target.value)}
                      placeholder={t('subcategory_placeholder')}
                      className="h-9.5 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-300">
                      {t('source_channel')}
                    </label>
                    <select
                      value={manualMarketplace}
                      onChange={(e) => setManualMarketplace(e.target.value as Marketplace)}
                      className="h-9.5 px-2.5 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                    >
                      <option value="direct">{t('direct_atelier_wholesale')}</option>
                      <option value="amazon">{t('amazon_us_prime_slash')}</option>
                      <option value="ebay">{t('ebay_luxury')}</option>
                      <option value="aliexpress">{t('aliexpress_vip')}</option>
                    </select>
                  </div>
                </div>

                {/* Supplier / Seller Info */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-300">
                    {t('supplier_seller_credentials')}
                  </label>
                  <input
                    type="text"
                    value={manualSupplierInfo}
                    onChange={(e) => setManualSupplierInfo(e.target.value)}
                    placeholder={t('supplier_placeholder')}
                    className="h-9.5 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                  />
                </div>

                {/* Pricing, Cost & Markup Calculator */}
                <div className="p-3.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-xl border border-[#dce9ff] dark:border-slate-700 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#004ac6] dark:text-blue-400">
                    {t('pricing_margins')}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-300">
                        {t('source_cost_usd')}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={manualCost}
                        onChange={(e) => setManualCost(Number(e.target.value))}
                        className="h-9 px-3 bg-white dark:bg-slate-900 text-[#0b1c30] dark:text-white font-mono text-[13px] rounded-lg border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-300">
                        {t('target_retail_price_usd')}
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={manualRetailPrice}
                        onChange={(e) => setManualRetailPrice(Number(e.target.value))}
                        className="h-9 px-3 bg-white dark:bg-slate-900 text-[#0b1c30] dark:text-white font-mono text-[13px] rounded-lg border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                  </div>

                  {/* Dynamic Markup / Margin Bar */}
                  <div className="flex items-center justify-between text-[12px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#e5eeff] dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[#565e74] dark:text-slate-400">{t('markup_colon')}</span>
                      <span className="font-bold text-[#004ac6] dark:text-blue-400 font-mono">
                        +{manualMarkupCalc.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#565e74] dark:text-slate-400">{t('gross_margin_colon')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {manualMarginCalc.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock status toggle */}
                <div className="flex items-center justify-between p-2.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-xl border border-[#dce9ff] dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-[#0b1c30] dark:text-white">
                      {t('storefront_stock_status')}
                    </span>
                    <span className="text-[11px] text-[#565e74] dark:text-slate-400">
                      {t('enable_purchasing_desc')}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualInStock}
                      onChange={(e) => setManualInStock(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004ac6]"></div>
                  </label>
                </div>
              </div>

              {/* Right Column: Dedicated Photography Studio */}
              <div className="lg:col-span-5 flex flex-col gap-3.5">
                {renderManualImagePicker()}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4ff] dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={!manualTitle.trim()}
                className="px-5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg disabled:opacity-40 cursor-pointer shadow-sm transition-all"
              >
                {t('save_publish_to_catalog')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
