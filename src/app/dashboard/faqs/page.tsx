'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useLocales from '@/locales/use-locales';
import useGetFaqs, { GET_FAQS_QUERY_KEY } from '@/api/faq/get-faqs';
import usePutFaqs from '@/api/faq/put-faqs';
import usePostFaqCategory, { FaqCategoryPayload } from '@/api/faq/post-faq-category';
import usePatchFaqCategory from '@/api/faq/patch-faq-category';
import { FaqsView } from '@/sections/faqs/FaqsView';
import { FaqCategory } from '@/sections/faqs/types';

export default function Page() {
  const { t } = useLocales();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useGetFaqs();
  const { mutateAsync: saveFaqs } = usePutFaqs();
  const { mutateAsync: createCategory } = usePostFaqCategory();
  const { mutateAsync: updateCategory } = usePatchFaqCategory();
  // Edits stay in this draft until the admin publishes them.
  const [draft, setDraft] = useState<FaqCategory[] | null>(null);
  const categories = draft ?? data;

  const handlePublish = async (toPublish: FaqCategory[]) => {
    const saved = await saveFaqs(toPublish);
    queryClient.setQueryData(GET_FAQS_QUERY_KEY, saved);
    setDraft(saved);
    return saved;
  };

  // Category settings are saved as soon as the modal is submitted, unlike the questions, which wait for Publish.
  const handleSaveCategory = (values: FaqCategoryPayload, id?: FaqCategory['id']) =>
    id ? updateCategory({ id, data: values }) : createCategory(values);

  if (isLoading) {
    return <div className="p-6 text-sm text-[#565e74] dark:text-slate-400">{t('faqs_loading')}</div>;
  }

  if (isError || !categories) {
    return (
      <div className="p-6 flex items-center gap-4">
        <span className="text-sm text-red-600">{t('faqs_load_failed')}</span>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 text-xs font-semibold text-[#004ac6] dark:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {t('faqs_retry')}
        </button>
      </div>
    );
  }

  return <FaqsView categories={categories} onUpdateCategories={setDraft} onPublish={handlePublish} onSaveCategory={handleSaveCategory} />;
}
