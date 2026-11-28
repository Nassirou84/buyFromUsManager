'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { RETURN_DETAIL_SEED_KEY, useGetProductReturnByUid } from '@/api/returns/get-product-return';
import { mapApiProductReturn } from '@/sections/returns-rmas/mapper';
import { ReturnDetailView } from '@/sections/returns-rmas/ReturnDetailView';
import { RmaItem } from '@/sections/returns-rmas/types';

export default function Page() {
  const { t } = useLocales();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const uid = Array.isArray(params.uid) ? params.uid[0] : (params.uid ?? '');

  // Session-local workbench edits (condition, packaging, notes, status) layered on
  // top of the resolved return. These actions have no backend endpoint yet.
  const [edited, setEdited] = useState<RmaItem | null>(null);

  // Seeded copy from the list (keyed by uid) for an instant paint; the authoritative
  // record is fetched by uid, so a hard refresh / deep link resolves on its own too.
  const seeded = queryClient.getQueryData<RmaItem>([RETURN_DETAIL_SEED_KEY, uid]) ?? null;
  const { data: fetched, isLoading } = useGetProductReturnByUid(uid || undefined, !!uid);

  const rma = useMemo<RmaItem | null>(() => {
    if (edited) return edited;
    if (fetched) return mapApiProductReturn(fetched);
    return seeded;
  }, [edited, fetched, seeded]);

  // Reset local edits when navigating to a different return.
  useEffect(() => setEdited(null), [uid]);

  const backToList = () => router.push('/dashboard/returns-rmas');

  if (!rma) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-[#565e74] dark:text-slate-400">
          <Icon name="progress_activity" className="text-[18px] animate-spin" />
          <span>{t('rma_loading')}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-[14px] text-[#565e74] dark:text-slate-400">{t('returns_load_error')}</p>
        <button
          type="button"
          onClick={backToList}
          className="text-[13px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
        >
          {t('back_to_returns')}
        </button>
      </div>
    );
  }

  // Edits apply to the latest local copy (or the resolved return on the first edit).
  const current = rma;
  return (
    <ReturnDetailView
      rma={rma}
      onUpdate={(updater) => setEdited((prev) => updater(prev ?? current))}
      onBack={backToList}
    />
  );
}
