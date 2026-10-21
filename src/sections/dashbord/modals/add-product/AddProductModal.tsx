import React, { use, useEffect, useState } from 'react';
import useLocales from '@/locales/use-locales';
import scrapeProductUrl from '@/api/product/scrape-product-url';
import { DropshipProduct, Marketplace, ProductCondition } from '../../types';
import { MARKETPLACE_LABELS, STEP_ORDER, Step } from './constants';
import { ExtrasStep } from './ExtrasStep';
import { ModalHeader } from './ModalHeader';
import { ReviewStep } from './ReviewStep';
import { SourceStep } from './SourceStep';
import { Stepper } from './Stepper';
import { buildProductFormData, useProductForm } from './use-product-form';
import usePostProduct from '@/api/product/post-product';
import { toast } from 'sonner';
import generateProductContent from '@/api/product/generate-product-content';
import generateProductFromTitle from '@/api/product/generate-product-from-title';

const MARKETPLACES = Object.keys(MARKETPLACE_LABELS) as Marketplace[];
const toMarketplace = (seller?: string): Marketplace =>
  MARKETPLACES.find((m) => m === seller?.toLowerCase()) ?? 'other';
const toCondition = (condition?: string): ProductCondition =>
  (['new', 'used', 'reconditioned'] as const).find((c) => c === condition?.toLowerCase()) ?? 'new';

// 'scrape' opens on the link step, 'manual' jumps straight to an empty form.
export type AddProductModalMode = 'scrape' | 'manual';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AddProductModalMode;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'scrape',
}) => {
  const { t } = useLocales();
  const { values, setField, patch, reset } = useProductForm();
  const { mutateAsync: postProduct } = usePostProduct();

  const [step, setStep] = useState<Step>(initialMode === 'manual' ? 'review' : 'source');
  const [isScraping, setIsScraping] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [scrapeError, setScrapeError] = useState(false);
  const [scrapedFrom, setScrapedFrom] = useState<{ url: string; sourceId: string } | null>(null);
  const [dataFromScrape, setDataFromScrape] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Sync step whenever initialMode changes
  useEffect(() => {
    setStep(initialMode === 'manual' ? 'review' : 'source');
  }, [initialMode]);

  if (!isOpen) return null;

  const handleScrape = async () => {
    setScrapeError(false);
    setIsScraping(true);
    try {
      const url = sourceUrl.trim();
      const data = await scrapeProductUrl(url);

      patch({
        title: data.title ?? '',
        brand: data.brand ?? '',
        description: data.description ?? '',
        seller: toMarketplace(data.seller),
        scrappingUrl: data.scrappingUrl ?? url,
        supplierInfo: toMarketplace(data.seller),
        productCondition: toCondition(data.productCondition),
        usdPrice: Math.ceil(data.usdPrice ?? 0),
        available: data.isAvailable ?? true,
        acceptReturn: data.acceptReturn ?? false,
        sellerChoice: data.sellerChoice ?? false,
        primeDelivery: data.primeDelivery ?? false,
        returnPolicy: data.returnPolicy ?? '',
        customerSays: data.customerSays ?? '',
        overallRating: data.overallRating ?? 0,
        overallRatingsCounts: data.overallRatingsCounts ?? 0,
        images: (data.photos ?? [])
          .filter((p) => typeof p.url === 'string')
          .map((p) => ({ url: p.url })),
        details: (data.details ?? []).map((d: { type?: string; value?: string }) => ({ name: String(d.type ?? ''), value: String(d.value ?? '') })),
        features: data.features ?? [],
        variants: (data.variants ?? []).map((v, i) => ({
          id: `variant-${Date.now()}-${i}`,
          title: String(v.title ?? v.name ?? ''),
          price: Number(v.price ?? data.usdPrice ?? 0),
          image: '',
        })),
      });
      setDataFromScrape(data);
      setScrapedFrom({ url, sourceId: data.uid ?? String(data.id ?? '') });
      setStep('review');
    } catch {
      setScrapeError(true);
    } finally {
      setIsScraping(false);
    }
  };

  const handleManualStart = () => {
    setScrapedFrom(null);
    setField('images', []);
    setField('details', []);
    setField('features', []);
    setField('variants', []);
    setStep('review');
  };

  const goBack = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) setStep(STEP_ORDER[i - 1]);
  };

  const handleSave = async () => {
    const formData = buildProductFormData(values);
    try {
      await postProduct(formData);
      toast.success(t('productAdded'));
      reset();
      setSourceUrl('');
      setScrapedFrom(null);
      setScrapeError(false);
      setStep(initialMode === 'manual' ? 'review' : 'source');
    } catch {
      toast.error(t('productAddFailed'));
    }
  };

  const handleGenerateWithAi = () => {
    if (!dataFromScrape) {
      if (!values.title) {
        toast.error(t('titleRequiredToGenerateContent'));
        return;
      }
      setAiLoading(true);
      generateProductFromTitle({ title: values.title })
        .then((data) => {
          patch({
            title: data.title ?? '',
            brand: data.brand ?? '',
            description: data.description ?? '',
            seller: toMarketplace(data.seller),
            scrappingUrl: '',
            supplierInfo: toMarketplace(data.seller),
            productCondition: toCondition(data.productCondition),
            customerSays: data.customerSays ?? '',
            overallRating: data.overallRating ?? 0,
            overallRatingsCounts: data.overallRatingsCounts ?? 0,
            details: (data.details ?? []).map((d: { type?: string; value?: string }) => ({ name: String(d.type ?? ''), value: String(d.value ?? '') })),
            features: data.features ?? [],
            variants: (data.variants ?? []).map((v: { title?: string; name?: string; price?: number }, i: number) => ({
              id: `variant-${Date.now()}-${i}`,
              title: String(v.title ?? v.name ?? ''),
              price: Number(v.price ?? data.usdPrice ?? 0),
              image: '',
            })),
          });

          toast.success(t('productContentGeneratedSuccessfully'));
        }).catch((error) => {
          toast.error(t('productContentGenerationFailed'));
        })
        .finally(() => setAiLoading(false));
    } else {
      setAiLoading(true);
      const url = sourceUrl.trim();
      generateProductContent(dataFromScrape)
        .then((data) => {

          patch({
            title: data.title ?? '',
            description: data.description ?? '',
            supplierInfo: toMarketplace(data.seller),
            returnPolicy: data.returnPolicy ?? '',
            customerSays: data.customerSays ?? '',
            details: (data.details ?? []).map((d: { type?: string; value?: string }) => ({ name: String(d.type ?? ''), value: String(d.value ?? '') })),
            features: data.features ?? [],
            variants: (data.variants ?? []).map((v: { title?: string; name?: string; price?: number }, i: number) => ({
              id: `variant-${Date.now()}-${i}`,
              title: String(v.title ?? v.name ?? ''),
              price: Number(v.price ?? data.usdPrice ?? 0),
              image: '',
            })),
          });

          toast.success(t('productContentGeneratedSuccessfully'));
        }).catch((error) => {
          toast.error(t('productContentGenerationFailed'));
        })
        .finally(() => setAiLoading(false));
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6"
    >
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-4xl lg:max-w-5xl w-full p-5 sm:p-7 shadow-2xl border border-[#dce9ff] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        <ModalHeader step={step} onClose={onClose} />
        <Stepper step={step} />

        {step === 'source' && (
          <SourceStep
            url={sourceUrl}
            isScraping={isScraping}
            hasError={scrapeError}
            onUrlChange={setSourceUrl}
            onScrape={handleScrape}
            onManual={handleManualStart}
            onCancel={onClose}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            values={values}
            setField={setField}
            scrapedUrl={scrapedFrom?.url}
            onBack={goBack}
            onNext={() => setStep('extras')}
            onCancel={onClose}
            onGenerateWithAi={handleGenerateWithAi}
            aiLoading={aiLoading}
          />
        )}

        {step === 'extras' && (
          <ExtrasStep values={values} setField={setField} onBack={goBack} onSave={handleSave} onCancel={onClose} />
        )}
      </div>
    </div>
  );
};
