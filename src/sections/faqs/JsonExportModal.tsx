import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { FaqCategory } from './types';

interface JsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: FaqCategory;
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({ isOpen, onClose, category }) => {
  const { t } = useLocales();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const payload = {
    schema_version: '2.3.0',
    tenant: 'flot_boutique_ci',
    exported_at: new Date().toISOString(),
    block_id: `block_faq_${category.slug.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
    category: {
      slug: category.slug,
      title: category.title,
      icon: category.icon,
      accordion_behavior: category.accordionBehavior,
      display_order: category.displayOrder,
      target_pages: category.targetPages,
    },
    items: category.items.map((item) => ({
      id: item.id,
      order: item.order,
      question: item.question,
      published: item.published,
      highlight: item.highlight,
      tags: item.tags,
      cta: item.cta,
      satisfaction_rate: item.satisfactionRate,
      elements: item.elements,
    })),
  };

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success(t('faqs_toast_json_copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faq_${category.slug}_schema_v2.3.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('faqs_toast_json_downloaded', { slug: category.slug }));
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl bg-white dark:bg-[#131b2e] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 flex flex-col overflow-hidden max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 border-b border-[#e5eeff] dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Icon name="data_object" className="text-[22px] text-[#004ac6] dark:text-blue-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0b1c30] dark:text-white">
                {t('faqs_json_title', { title: category.title })}
              </span>
              <span className="text-[11px] text-[#565e74] dark:text-slate-400 font-mono">{t('faqs_json_subtitle')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#737686] hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#e5eeff] dark:hover:bg-slate-700 transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs text-emerald-400">
          <pre className="p-2 whitespace-pre-wrap">{jsonString}</pre>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-[#eff4ff]/60 dark:bg-slate-800/60 border-t border-[#e5eeff] dark:border-slate-700">
          <span className="text-xs text-[#565e74] dark:text-slate-400">
            {t('faqs_json_size', { size: (jsonString.length / 1024).toFixed(1) })}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#e5eeff] dark:bg-slate-700 hover:bg-[#dae2fd] dark:hover:bg-slate-600 text-[#0b1c30] dark:text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Icon name="content_copy" className="text-[16px]" />
              <span>{copied ? t('faqs_copied') : t('faqs_copy_json')}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Icon name="download" className="text-[16px]" />
              <span>{t('faqs_download_json')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
