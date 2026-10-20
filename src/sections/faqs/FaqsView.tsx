import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { FaqBlockElement, FaqCategory, FaqElementType, FaqItem } from './types';
import { JsonExportModal } from './JsonExportModal';

interface FaqsViewProps {
  categories: FaqCategory[];
  onUpdateCategories: (categories: FaqCategory[]) => void;
}

type AccordionBehavior = FaqCategory['accordionBehavior'];

const BLOCK_TYPES: { type: FaqElementType; icon: string; addKey: string; labelKey: string }[] = [
  { type: 'title', icon: 'title', addKey: 'faqs_add_title', labelKey: 'faqs_el_title' },
  { type: 'paragraph', icon: 'notes', addKey: 'faqs_add_paragraph', labelKey: 'faqs_el_paragraph' },
  { type: 'list', icon: 'format_list_bulleted', addKey: 'faqs_add_list', labelKey: 'faqs_el_list' },
  { type: 'image', icon: 'image', addKey: 'faqs_add_image', labelKey: 'faqs_el_image' },
  { type: 'video', icon: 'smart_display', addKey: 'faqs_add_video', labelKey: 'faqs_el_video' },
];

const ACCORDION_OPTIONS: { value: AccordionBehavior; labelKey: string }[] = [
  { value: 'multi-open', labelKey: 'faqs_accordion_multi' },
  { value: 'strict', labelKey: 'faqs_accordion_strict' },
  { value: 'expanded', labelKey: 'faqs_accordion_expanded' },
];

const TARGET_PAGES: { key: string; labelKey: string }[] = [
  { key: 'all_pages', labelKey: 'faqs_target_global' },
  { key: 'checkout', labelKey: 'faqs_target_checkout' },
  { key: 'pdp', labelKey: 'faqs_target_pdp' },
];

const CARD = 'bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs';
const SECTION_LABEL = 'text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider';
const FIELD_LABEL = 'text-[11px] text-[#565e74] dark:text-slate-400 font-medium';
const INPUT = 'bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white focus:outline-none border border-transparent focus:border-[#2563eb]/40 transition-colors';
const BLOCK_INPUT = 'bg-white dark:bg-[#131b2e] rounded-lg text-[#0b1c30] dark:text-white focus:outline-none border border-transparent focus:border-[#2563eb]/30';
const ICON_BTN = 'p-1.5 rounded text-[#565e74] dark:text-slate-400 hover:bg-[#e5eeff] dark:hover:bg-slate-700 transition-colors';
const TOOLBAR_BTN = 'flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#131b2e] hover:bg-[#2563eb] hover:text-white text-[#0b1c30] dark:text-white rounded-lg shadow-2xs text-[11px] font-medium transition-all';

export const FaqsView: React.FC<FaqsViewProps> = ({ categories, onUpdateCategories }) => {
  const { t } = useLocales();
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [selectedFaqId, setSelectedFaqId] = useState<string>(categories[0]?.items[0]?.id || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [deployedNow, setDeployedNow] = useState(false);

  const currentCategory = categories.find((c) => c.id === selectedCatId) || categories[0];
  const activeFaq = currentCategory?.items.find((f) => f.id === selectedFaqId) || currentCategory?.items[0];

  const totalFaqs = categories.reduce((sum, c) => sum + (c.items.length || c.faqsCount), 0);

  const updateCategoryProp = <K extends keyof FaqCategory>(key: K, value: FaqCategory[K]) => {
    onUpdateCategories(categories.map((cat) => (cat.id === currentCategory.id ? { ...cat, [key]: value } : cat)));
  };

  const updateActiveFaq = (updater: (prev: FaqItem) => FaqItem) => {
    if (!activeFaq) return;
    const updatedFaq = updater(activeFaq);
    onUpdateCategories(
      categories.map((cat) =>
        cat.id === currentCategory.id
          ? { ...cat, items: cat.items.map((item) => (item.id === activeFaq.id ? updatedFaq : item)) }
          : cat
      )
    );
  };

  const updateElementAt = (idx: number, patch: Partial<FaqBlockElement>) => {
    updateActiveFaq((prev) => ({
      ...prev,
      elements: prev.elements.map((el, i) => (i === idx ? { ...el, ...patch } : el)),
    }));
  };

  const handleAddBlockElement = (type: FaqElementType) => {
    if (!activeFaq) return;
    const id = `el-${Date.now()}`;
    const templates: Record<FaqElementType, FaqBlockElement> = {
      title: { id, type: 'title', title: t('faqs_new_title'), level: 'H3' },
      paragraph: { id, type: 'paragraph', text: t('faqs_new_paragraph') },
      list: { id, type: 'list', items: [t('faqs_new_list_item_1'), t('faqs_new_list_item_2')] },
      image: {
        id,
        type: 'image',
        title: t('faqs_new_image_title'),
        imageUrl: '/assets/aistudio/Image_1_8fc2c815.jpeg',
        imageAlt: t('faqs_new_image_alt'),
        imageDimensions: '800 x 450 px',
      },
      video: {
        id,
        type: 'video',
        title: t('faqs_new_video_title'),
        videoUrl: 'https://media.flotboutique.ci/video/sample-guide.mp4',
        videoDuration: '01:30',
        videoFormat: 'MP4 / HLS',
      },
    };
    updateActiveFaq((prev) => ({ ...prev, elements: [...prev.elements, templates[type]] }));
    toast.success(t('faqs_toast_block_added', { type }));
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    if (!activeFaq) return;
    const elements = [...activeFaq.elements];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= elements.length) return;
    [elements[index], elements[targetIndex]] = [elements[targetIndex], elements[index]];
    updateActiveFaq((prev) => ({ ...prev, elements }));
  };

  const deleteElement = (index: number) => {
    updateActiveFaq((prev) => ({ ...prev, elements: prev.elements.filter((_, idx) => idx !== index) }));
    toast.info(t('faqs_toast_block_deleted'));
  };

  const handlePublish = () => {
    setIsPublishing(true);
    toast.info(t('faqs_toast_syncing'));
    setTimeout(() => {
      setIsPublishing(false);
      setDeployedNow(true);
      toast.success(t('faqs_toast_deployed'));
    }, 1200);
  };

  const handleAddNewFaq = () => {
    if (!currentCategory) return;
    const newFaqId = `faq-${Date.now().toString().slice(-4)}`;
    const newFaq: FaqItem = {
      id: newFaqId,
      order: currentCategory.items.length + 1,
      question: t('faqs_new_question'),
      published: true,
      highlight: false,
      tags: ['Storefront', 'Support'],
      satisfactionRate: 0.95,
      elements: [{ id: `el-p-${Date.now()}`, type: 'paragraph', text: t('faqs_new_answer') }],
    };
    const updatedItems = [...currentCategory.items, newFaq];
    onUpdateCategories(
      categories.map((cat) =>
        cat.id === currentCategory.id ? { ...cat, items: updatedItems, faqsCount: updatedItems.length } : cat
      )
    );
    setSelectedFaqId(newFaqId);
    toast.success(t('faqs_toast_question_created'));
  };

  const handleAddCategory = () => {
    const title = window.prompt(t('faqs_category_prompt'));
    if (!title) return;
    const newCat: FaqCategory = {
      id: `cat-${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title,
      icon: 'help_outline',
      accordionBehavior: 'multi-open',
      targetPages: ['all_pages'],
      displayOrder: categories.length + 1,
      faqsCount: 0,
      items: [],
    };
    onUpdateCategories([...categories, newCat]);
    setSelectedCatId(newCat.id);
    toast.success(t('faqs_toast_category_created', { title }));
  };

  const handleDuplicateFaq = () => {
    if (!activeFaq) return;
    const duplicated: FaqItem = {
      ...activeFaq,
      id: `faq-${Date.now().toString().slice(-4)}`,
      order: currentCategory.items.length + 1,
      question: t('faqs_copy_suffix', { question: activeFaq.question }),
    };
    const updatedItems = [...currentCategory.items, duplicated];
    onUpdateCategories(
      categories.map((cat) =>
        cat.id === currentCategory.id ? { ...cat, items: updatedItems, faqsCount: updatedItems.length } : cat
      )
    );
    toast.success(t('faqs_toast_duplicated'));
  };

  const handleDeleteFaq = () => {
    if (!activeFaq || !window.confirm(t('faqs_confirm_delete'))) return;
    const updatedItems = currentCategory.items.filter((i) => i.id !== activeFaq.id);
    onUpdateCategories(
      categories.map((cat) =>
        cat.id === currentCategory.id ? { ...cat, items: updatedItems, faqsCount: updatedItems.length } : cat
      )
    );
    if (updatedItems.length > 0) setSelectedFaqId(updatedItems[0].id);
    toast.info(t('faqs_toast_deleted'));
  };

  const handleAddTag = () => {
    const tag = newTagInput.trim();
    if (!tag || !activeFaq) return;
    if (!activeFaq.tags.includes(tag)) {
      updateActiveFaq((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateActiveFaq((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const openStorefront = () => {
    window.open(process.env.NEXT_PUBLIC_STORE_FRONT_URL || '#', '_blank', 'noopener,noreferrer');
  };

  if (!currentCategory) {
    return (
      <div className={`${CARD} p-10 text-center text-[#565e74] dark:text-slate-400`}>
        <button onClick={handleAddCategory} className="text-[#004ac6] dark:text-blue-400 font-semibold" type="button">
          {t('faqs_new_category')}
        </button>
      </div>
    );
  }

  const kpis = [
    {
      label: t('faqs_kpi_total'),
      value: String(totalFaqs),
      delta: <span className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold">{t('faqs_kpi_total_delta', { count: 3 })}</span>,
      note: t('faqs_kpi_total_note', { count: categories.length }),
      icon: 'quiz',
      iconBox: 'bg-[#eff4ff] dark:bg-slate-800 text-[#004ac6] dark:text-blue-400',
    },
    {
      label: t('faqs_kpi_blocks'),
      value: String(categories.length),
      delta: <span className="text-[11px] text-[#bc4800] font-semibold">{t('faqs_kpi_blocks_delta')}</span>,
      note: t('faqs_kpi_blocks_note'),
      icon: 'dashboard_customize',
      iconBox: 'bg-[#eff4ff] dark:bg-slate-800 text-[#3f465c] dark:text-slate-300',
    },
    {
      label: t('faqs_kpi_satisfaction'),
      value: '94.2%',
      delta: <span className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold">↑ 1.8%</span>,
      note: t('faqs_kpi_satisfaction_note', { votes: '1 480' }),
      icon: 'thumb_up',
      iconBox: 'bg-[#dae2fd] text-[#131b2e]',
    },
    {
      label: t('faqs_kpi_deploy'),
      value: deployedNow ? t('faqs_deploy_now') : t('faqs_deploy_ago', { count: 18 }),
      delta: null,
      note: 'Build #faq-84f9 · Edge CDN',
      icon: 'bolt',
      iconBox: 'bg-[#e5eeff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-400',
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top action & meta header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded uppercase tracking-wider font-semibold">
              {t('faqs_eyebrow')}
            </span>
            <span className="text-[#737686] text-xs">/</span>
            <span className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold flex items-center gap-1">
              <Icon name="schema" className="text-[16px]" />
              {t('faqs_schema_badge')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white tracking-tight">{t('faqs_title')}</h1>
          <p className="text-[13px] text-[#565e74] dark:text-slate-400 max-w-2xl">{t('faqs_subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#e5eeff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 transition-colors text-[13px] shadow-2xs font-medium"
            onClick={openStorefront}
          >
            <Icon name="visibility" className="text-[18px]" />
            <span>{t('faqs_preview')}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#131b2e] text-[#0b1c30] dark:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 transition-colors text-[13px] shadow-2xs font-medium border border-[#e5eeff] dark:border-slate-700"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Icon name="download" className="text-[18px]" />
            <span>{t('faqs_export_json')}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#004ac6] transition-all text-[13px] shadow-md active:scale-95 font-semibold disabled:opacity-60"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Icon name={isPublishing ? 'autorenew' : 'cloud_sync'} className={`text-[18px] ${isPublishing ? 'animate-spin' : ''}`} />
            <span>{isPublishing ? t('faqs_publishing') : t('faqs_publish')}</span>
          </button>
        </div>
      </div>

      {/* KPI banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${CARD} p-4 flex items-center justify-between`}>
            <div className="flex flex-col">
              <span className={SECTION_LABEL}>{k.label}</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl text-[#0b1c30] dark:text-white font-bold">{k.value}</span>
                {k.delta}
              </div>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400 mt-0.5">{k.note}</span>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${k.iconBox}`}>
              <Icon name={k.icon} className="text-[26px]" />
            </div>
          </div>
        ))}
      </div>

      {/* Builder workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: categories & block settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className={`${CARD} p-4 flex flex-col gap-2.5`}>
            <div className="flex items-center justify-between pb-1">
              <span className={SECTION_LABEL}>{t('faqs_categories')}</span>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-[#004ac6] dark:text-blue-400 hover:text-[#2563eb] transition-colors font-semibold"
                onClick={handleAddCategory}
              >
                <Icon name="add_circle" className="text-[16px]" />
                <span>{t('faqs_new_category')}</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => {
                const isSelected = cat.id === currentCategory.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      if (cat.items.length > 0) setSelectedFaqId(cat.items[0].id);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] transition-all text-left ${
                      isSelected
                        ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                        : 'bg-[#eff4ff] dark:bg-slate-800 text-[#565e74] dark:text-slate-300 hover:bg-[#dae2fd] dark:hover:bg-slate-700 hover:text-[#0b1c30] dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon name={cat.icon} className="text-[18px]" />
                      <span className="truncate max-w-[210px]">{cat.title}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                        isSelected ? 'bg-white/20' : 'bg-[#dae2fd] dark:bg-slate-700'
                      }`}
                    >
                      {t('faqs_count', { count: cat.items.length || cat.faqsCount })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`${CARD} p-4 flex flex-col gap-4`}>
            <div className="flex items-center justify-between pb-1 border-b border-[#f0f4ff] dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Icon name="settings_suggest" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
                <span className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{t('faqs_block_settings')}</span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#e5eeff] dark:bg-slate-700 text-[#565e74] dark:text-slate-300 rounded font-mono text-[11px]">
                {currentCategory.slug}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className={FIELD_LABEL}>{t('faqs_displayed_title')}</label>
              <input
                type="text"
                className={`h-10 px-3 ${INPUT}`}
                value={currentCategory.title}
                onChange={(e) => updateCategoryProp('title', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={FIELD_LABEL}>{t('faqs_anchor_slug')}</label>
              <div className="flex items-center bg-[#eff4ff] dark:bg-slate-800 px-3 h-10 rounded-lg border border-transparent focus-within:border-[#2563eb]/40">
                <span className="text-[#737686] text-[13px] font-mono mr-1">/faq#</span>
                <input
                  type="text"
                  className="w-full bg-transparent text-[13px] text-[#0b1c30] dark:text-white focus:outline-none"
                  value={currentCategory.slug}
                  onChange={(e) => updateCategoryProp('slug', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className={FIELD_LABEL}>{t('faqs_icon')}</label>
                <div className="flex items-center gap-1.5 h-10 px-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded-lg">
                  <Icon name={currentCategory.icon} className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                  <input
                    type="text"
                    className="w-full bg-transparent text-[13px] text-[#0b1c30] dark:text-white focus:outline-none"
                    value={currentCategory.icon}
                    onChange={(e) => updateCategoryProp('icon', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className={FIELD_LABEL}>{t('faqs_behavior')}</label>
                <select
                  className="h-10 px-1.5 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white focus:outline-none cursor-pointer"
                  value={currentCategory.accordionBehavior}
                  onChange={(e) => updateCategoryProp('accordionBehavior', e.target.value as AccordionBehavior)}
                >
                  {ACCORDION_OPTIONS.map(({ value, labelKey }) => (
                    <option key={value} value={value}>{t(labelKey)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className={FIELD_LABEL}>{t('faqs_targets')}</span>
              <div className="flex flex-col gap-1.5 text-[13px] text-[#0b1c30] dark:text-white">
                {TARGET_PAGES.map(({ key, labelKey }) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentCategory.targetPages.includes(key)}
                      onChange={(e) =>
                        updateCategoryProp(
                          'targetPages',
                          e.target.checked
                            ? [...currentCategory.targetPages, key]
                            : currentCategory.targetPages.filter((p) => p !== key)
                        )
                      }
                      className="rounded accent-[#2563eb] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px]">{t(labelKey)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={`${CARD} p-4 flex items-center justify-between gap-2`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e5eeff] dark:bg-slate-700 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
                <Icon name="code" className="text-[18px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">{t('faqs_schema_title')}</span>
                <span className="text-[11px] text-[#737686]">{t('faqs_schema_note')}</span>
              </div>
            </div>
            <button
              type="button"
              className="px-2.5 py-1.5 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[#004ac6] dark:text-blue-400 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
              onClick={() => setIsExportModalOpen(true)}
            >
              <Icon name="content_copy" className="text-[14px]" />
              <span>{t('faqs_copy_json')}</span>
            </button>
          </div>
        </div>

        {/* Right column: question builder */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{t('faqs_questions_title')}</h2>
              <span className="px-2.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded-full font-semibold">
                {t('faqs_active_count', { count: currentCategory.items.length })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white rounded-lg text-[11px] transition-colors border border-[#e5eeff] dark:border-slate-700"
                onClick={() => toast.info(t('faqs_toast_reorder'))}
              >
                <Icon name="swap_vert" className="text-[16px]" />
                <span>{t('faqs_reorder')}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#2563eb]/10 hover:bg-[#2563eb]/20 text-[#004ac6] dark:text-blue-400 rounded-lg text-[11px] font-semibold transition-colors"
                onClick={handleAddNewFaq}
              >
                <Icon name="add" className="text-[16px]" />
                <span>{t('faqs_add_faq')}</span>
              </button>
            </div>
          </div>

          {activeFaq && (
            <div className={`${CARD} p-5 shadow-md border-[#2563eb]/20 flex flex-col gap-5`}>
              {/* Card top bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#f0f4ff] dark:border-slate-800">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Icon name="drag_indicator" className="text-[24px] text-[#737686]" />
                  <span className="px-2.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded font-bold">
                    {t('faqs_active_badge', { order: activeFaq.order })}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#e5eeff] dark:bg-slate-700 text-[#0b1c30] dark:text-white font-mono text-[11px] rounded">
                    ID: {activeFaq.id}
                  </span>
                  <span className="flex items-center gap-1 text-[#004ac6] dark:text-blue-400 text-[11px] font-semibold">
                    <span className={`w-2 h-2 rounded-full inline-block ${activeFaq.published ? 'bg-[#2563eb]' : 'bg-[#737686]'}`}></span>
                    {activeFaq.published ? t('faqs_status_published') : t('faqs_status_draft')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" className={ICON_BTN} title={t('faqs_duplicate')} onClick={handleDuplicateFaq}>
                    <Icon name="content_copy" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors"
                    title={t('faqs_delete_question')}
                    onClick={handleDeleteFaq}
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>

              {/* Question title */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#0b1c30] dark:text-white font-semibold flex items-center justify-between">
                  <span>{t('faqs_question_label')}</span>
                  <span className="text-[#737686] font-normal">{t('faqs_chars', { count: activeFaq.question.length })}</span>
                </label>
                <input
                  type="text"
                  className={`h-12 px-3 text-[15px] font-semibold ${INPUT}`}
                  value={activeFaq.question}
                  onChange={(e) => updateActiveFaq((prev) => ({ ...prev, question: e.target.value }))}
                />
              </div>

              {/* Modular content blocks builder */}
              <div className="flex flex-col gap-4 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-[#f0f4ff] dark:border-slate-800">
                  <div>
                    <h3 className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{t('faqs_structured_title')}</h3>
                    <p className="text-[13px] text-[#565e74] dark:text-slate-400">{t('faqs_structured_desc')}</p>
                  </div>
                  <span className="text-[11px] text-[#3f465c] dark:text-slate-300 font-medium font-mono">
                    {t('faqs_blocks_count', { count: activeFaq.elements.length })}
                  </span>
                </div>

                <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-[#e5eeff] dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-[#0b1c30] dark:text-white text-[13px] font-semibold">
                    <Icon name="add_circle" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
                    <span>{t('faqs_add_element')}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {BLOCK_TYPES.map(({ type, icon, addKey }) => (
                      <button key={type} type="button" onClick={() => handleAddBlockElement(type)} className={TOOLBAR_BTN}>
                        <Icon name={icon} className="text-[16px]" />
                        <span>{t(addKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {activeFaq.elements.map((element, idx) => {
                    const meta = BLOCK_TYPES.find((b) => b.type === element.type)!;
                    return (
                      <div
                        key={element.id}
                        className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-xl border border-[#e5eeff] dark:border-slate-700 hover:border-[#c3c6d7] dark:hover:border-slate-600 transition-all flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Icon name="drag_indicator" className="text-[24px] text-[#737686]" />
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#e5eeff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-400 rounded text-[11px] font-semibold">
                              <Icon name={meta.icon} className="text-[16px]" />
                              {t('faqs_element_prefix', { type: t(meta.labelKey) })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveElement(idx, 'up')}
                              disabled={idx === 0}
                              className={`${ICON_BTN} disabled:opacity-30`}
                              title={t('faqs_move_up')}
                            >
                              <Icon name="arrow_upward" className="text-[18px]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveElement(idx, 'down')}
                              disabled={idx === activeFaq.elements.length - 1}
                              className={`${ICON_BTN} disabled:opacity-30`}
                              title={t('faqs_move_down')}
                            >
                              <Icon name="arrow_downward" className="text-[18px]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteElement(idx)}
                              className="p-1.5 rounded text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors"
                              title={t('faqs_delete_block')}
                            >
                              <Icon name="delete" className="text-[18px]" />
                            </button>
                          </div>
                        </div>

                        {element.type === 'title' && (
                          <input
                            type="text"
                            className={`w-full h-10 px-3 text-[15px] font-semibold ${BLOCK_INPUT}`}
                            value={element.title || ''}
                            onChange={(e) => updateElementAt(idx, { title: e.target.value })}
                          />
                        )}

                        {element.type === 'paragraph' && (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 bg-white dark:bg-[#131b2e] px-2 py-1 rounded w-fit text-xs font-semibold text-[#0b1c30] dark:text-white">
                              <button type="button" className="px-1.5 hover:text-[#2563eb]" onClick={() => toast.info(t('faqs_toast_bold'))}>
                                B
                              </button>
                              <button type="button" className="px-1.5 italic hover:text-[#2563eb]" onClick={() => toast.info(t('faqs_toast_italic'))}>
                                I
                              </button>
                              <button type="button" className="px-1.5 hover:text-[#2563eb] flex items-center" onClick={() => toast.info(t('faqs_toast_link'))}>
                                <Icon name="link" className="text-[14px]" />
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              className={`w-full p-3 text-[14px] leading-relaxed ${BLOCK_INPUT}`}
                              value={element.text || ''}
                              onChange={(e) => updateElementAt(idx, { text: e.target.value })}
                            />
                          </div>
                        )}

                        {element.type === 'list' && (
                          <div className="flex flex-col gap-1.5">
                            {element.items?.map((itemText, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-1.5 bg-white dark:bg-[#131b2e] p-1.5 rounded-lg">
                                <Icon name="check_circle" className="text-[16px] text-[#2563eb] ml-1" />
                                <input
                                  type="text"
                                  className="w-full bg-transparent px-1.5 text-[13px] text-[#0b1c30] dark:text-white focus:outline-none"
                                  value={itemText}
                                  onChange={(e) => {
                                    const newItems = [...(element.items || [])];
                                    newItems[itemIdx] = e.target.value;
                                    updateElementAt(idx, { items: newItems });
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => updateElementAt(idx, { items: (element.items || []).filter((_, i) => i !== itemIdx) })}
                                  className="text-[#737686] hover:text-[#ba1a1a] mr-1"
                                >
                                  <Icon name="close" className="text-[16px]" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => updateElementAt(idx, { items: [...(element.items || []), t('faqs_new_list_row')] })}
                              className="flex items-center gap-1 text-[#004ac6] dark:text-blue-400 text-[11px] font-semibold pt-1 hover:underline w-fit"
                            >
                              <Icon name="add" className="text-[16px]" />
                              <span>{t('faqs_add_list_row')}</span>
                            </button>
                          </div>
                        )}

                        {element.type === 'image' && (
                          <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#131b2e] p-4 rounded-lg items-center">
                            <div className="w-32 h-24 rounded-lg bg-[#e5eeff] dark:bg-slate-700 flex items-center justify-center text-[#004ac6] relative overflow-hidden shrink-0 shadow-inner border border-[#dae2fd] dark:border-slate-600">
                              {element.imageUrl ? (
                                <img src={element.imageUrl} alt={element.imageAlt || ''} className="w-full h-full object-cover" />
                              ) : (
                                <Icon name="map" className="text-[32px]" />
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 w-full">
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  className="text-[11px] text-[#0b1c30] dark:text-white font-semibold bg-transparent border-b border-dashed border-[#c3c6d7] focus:outline-none min-w-0"
                                  value={element.title || ''}
                                  onChange={(e) => updateElementAt(idx, { title: e.target.value })}
                                />
                                <span className="px-1.5 py-0.5 bg-[#e5eeff] dark:bg-slate-700 rounded text-[#565e74] dark:text-slate-300 font-mono text-[10px] shrink-0">
                                  {element.imageDimensions || '840 x 480 px'}
                                </span>
                              </div>
                              <input
                                type="text"
                                className="h-9 px-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded text-[13px] text-[#0b1c30] dark:text-white focus:outline-none"
                                placeholder={t('faqs_alt_placeholder')}
                                value={element.imageAlt || ''}
                                onChange={(e) => updateElementAt(idx, { imageAlt: e.target.value })}
                              />
                              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                                <span className="text-[#737686]">{t('faqs_image_caption_note')}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newUrl = window.prompt(t('faqs_image_url_prompt'), element.imageUrl);
                                    if (newUrl) updateElementAt(idx, { imageUrl: newUrl });
                                  }}
                                  className="text-[#004ac6] dark:text-blue-400 hover:underline font-semibold shrink-0"
                                >
                                  {t('faqs_replace_image')}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {element.type === 'video' && (
                          <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#131b2e] p-4 rounded-lg items-center">
                            <div className="w-36 h-24 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden shrink-0 shadow-md">
                              <Icon name="play_circle" className="text-[36px] text-[#dae2fd]" />
                              <span className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[10px] font-mono text-white">
                                {element.videoDuration || '01:45'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 w-full">
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  className="text-[11px] text-[#0b1c30] dark:text-white font-semibold bg-transparent border-b border-dashed border-[#c3c6d7] focus:outline-none min-w-0"
                                  value={element.title || ''}
                                  onChange={(e) => updateElementAt(idx, { title: e.target.value })}
                                />
                                <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] rounded text-[11px] font-medium shrink-0">
                                  {element.videoFormat || 'MP4 / Stream HLS'}
                                </span>
                              </div>
                              <div className="flex items-center bg-[#eff4ff] dark:bg-slate-800 px-2.5 h-9 rounded">
                                <span className="text-[#737686] text-[13px] font-mono mr-1">URL:</span>
                                <input
                                  type="text"
                                  className="w-full bg-transparent text-xs font-mono text-[#0b1c30] dark:text-white focus:outline-none"
                                  value={element.videoUrl || ''}
                                  onChange={(e) => updateElementAt(idx, { videoUrl: e.target.value })}
                                />
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                                <span className="text-[#737686]">{t('faqs_video_note')}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newUrl = window.prompt(t('faqs_video_url_prompt'), element.videoUrl);
                                    if (newUrl) updateElementAt(idx, { videoUrl: newUrl });
                                  }}
                                  className="text-[#004ac6] dark:text-blue-400 hover:underline font-semibold shrink-0"
                                >
                                  {t('faqs_change_video')}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA & tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#f0f4ff] dark:border-slate-800">
                <div className="flex flex-col gap-1">
                  <label className={FIELD_LABEL}>{t('faqs_cta_label')}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      className={`h-10 px-2.5 ${INPUT}`}
                      placeholder={t('faqs_cta_text_ph')}
                      value={activeFaq.cta?.label || ''}
                      onChange={(e) =>
                        updateActiveFaq((prev) => ({
                          ...prev,
                          cta: e.target.value ? { label: e.target.value, url: prev.cta?.url || '/action' } : null,
                        }))
                      }
                    />
                    <input
                      type="text"
                      className={`h-10 px-2.5 ${INPUT}`}
                      placeholder="URL (/page)"
                      value={activeFaq.cta?.url || ''}
                      onChange={(e) =>
                        updateActiveFaq((prev) => ({
                          ...prev,
                          cta: prev.cta ? { ...prev.cta, url: e.target.value } : null,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={FIELD_LABEL}>{t('faqs_tags_label')}</label>
                  <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#eff4ff] dark:bg-slate-800 rounded-lg min-h-10">
                    {activeFaq.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 bg-[#dae2fd] text-[#131b2e] rounded text-[11px] flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-[#ba1a1a] leading-none">
                          ×
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        className="bg-transparent px-1 text-[13px] text-[#0b1c30] dark:text-white focus:outline-none w-20"
                        placeholder={t('faqs_tag_placeholder')}
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      {newTagInput && (
                        <button type="button" onClick={handleAddTag} className="text-[#004ac6] dark:text-blue-400 text-xs font-bold">
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer toggles & save bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#f0f4ff] dark:border-slate-800">
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFaq.published}
                      onChange={(e) => updateActiveFaq((prev) => ({ ...prev, published: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#dae2fd] dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563eb]"></div>
                    <span className="ml-2.5 text-[13px] text-[#0b1c30] dark:text-white font-medium">{t('faqs_active_storefront')}</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[13px] text-[#0b1c30] dark:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFaq.highlight}
                      onChange={(e) => updateActiveFaq((prev) => ({ ...prev, highlight: e.target.checked }))}
                      className="rounded accent-[#2563eb] w-4 h-4"
                    />
                    <span>{t('faqs_highlight')}</span>
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toast.info(t('faqs_toast_reset'))}
                    className="px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors"
                  >
                    {t('faqs_reset')}
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success(t('faqs_toast_saved'))}
                    className="px-5 py-2 bg-[#2563eb] text-white hover:bg-[#004ac6] text-[13px] font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Icon name="save" className="text-[18px]" />
                    <span>{t('faqs_save')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other questions in this category */}
          <div className="flex flex-col gap-2.5">
            {currentCategory.items
              .filter((item) => item.id !== activeFaq?.id)
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFaqId(item.id)}
                  className={`${CARD} p-4 hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer hover:border-[#2563eb]/30`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Icon name="drag_indicator" className="text-[24px] text-[#737686]" />
                    <span className="px-1.5 py-0.5 bg-[#e5eeff] dark:bg-slate-700 text-[#0b1c30] dark:text-white text-[11px] rounded font-mono shrink-0">
                      #{item.order}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] text-[#0b1c30] dark:text-white truncate">{item.question}</span>
                      <div className="flex items-center gap-1.5 mt-1 text-[#565e74] dark:text-slate-400 text-[13px] flex-wrap">
                        {item.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-slate-200 text-[11px] rounded">
                            {tag}
                          </span>
                        ))}
                        <span className="text-[#737686] text-[11px]">
                          · {t('faqs_blocks_summary', { count: item.elements.length, types: item.elements.map((e) => e.type).slice(0, 3).join(', ') })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block ${item.published ? 'bg-[#2563eb]' : 'bg-[#737686]'}`}
                      title={item.published ? t('faqs_online') : t('faqs_disabled')}
                    ></span>
                    <button type="button" className={ICON_BTN} title={t('faqs_edit')}>
                      <Icon name="edit" className="text-[20px]" />
                    </button>
                    <button type="button" className={ICON_BTN} title={t('faqs_expand')}>
                      <Icon name="expand_more" className="text-[20px]" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <button
            type="button"
            onClick={handleAddNewFaq}
            className="w-full py-4 rounded-xl bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#004ac6] dark:text-blue-400 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all border border-dashed border-[#c3c6d7] dark:border-slate-700 hover:border-[#2563eb]"
          >
            <Icon name="add_circle" className="text-[20px]" />
            <span>{t('faqs_add_question_block')}</span>
          </button>
        </div>
      </div>

      <JsonExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} category={currentCategory} />
    </div>
  );
};
