import React from 'react';
import useLocales from '@/locales/use-locales';
import { type ItemCondition, type ReturnItemDecision, type RmaItem, type RmaLine } from '../../types';
import { SECTION_LABEL } from '../../shared';
import { SectionCard } from '../common/SectionCard';
import { ReturnLineItem } from './ReturnLineItem';

interface ReturnItemsCardProps {
  rma: RmaItem;
  /** ProductReturnItem.id whose inspection is currently being saved. */
  savingItemId?: number;
  /** ProductReturnItem.id whose approve / reject call is in flight. */
  decidingItemId?: number;
  onConditionSelect: (lineIndex: number, condition: ItemCondition) => void;
  onPackagingToggle: (lineIndex: number, key: keyof RmaLine['packagingCheck'], checked: boolean) => void;
  onDecide: (lineIndex: number, decision: ReturnItemDecision) => void;
  onPrintSlip: (lineIndex: number) => void;
}

// Quality grading card: every returned line with its inspection controls.
export const ReturnItemsCard: React.FC<ReturnItemsCardProps> = ({
  rma,
  savingItemId,
  decidingItemId,
  onConditionSelect,
  onPackagingToggle,
  onDecide,
  onPrintSlip,
}) => {
  const { t } = useLocales();

  return (
    <SectionCard
      icon="grading"
      title={t('rma_inspection_title')}
      aside={<span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_inspector')}</span>}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className={SECTION_LABEL}>{t('rma_returned_items')}</span>
          <span className="text-[11px] text-[#565e74] dark:text-slate-400">
            {t('rma_items_count', { count: rma.itemCount })}
          </span>
        </div>

        {rma.lines.length === 0 ? (
          <p className="text-[12px] text-[#565e74] dark:text-slate-400 p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg">
            {t('rma_no_items')}
          </p>
        ) : (
          rma.lines.map((line, idx) => (
            <ReturnLineItem
              key={idx}
              line={line}
              index={idx}
              // The inspection workbench is only available once the item has been collected.
              showInspection={rma.status !== 'initiated'}
              isSaving={line.itemId !== undefined && line.itemId === savingItemId}
              onConditionSelect={(cond) => onConditionSelect(idx, cond)}
              onPackagingToggle={(key, checked) => onPackagingToggle(idx, key, checked)}
              isDeciding={line.itemId !== undefined && line.itemId === decidingItemId}
              onDecide={(decision) => onDecide(idx, decision)}
              onPrintSlip={() => onPrintSlip(idx)}
            />
          ))
        )}

        {rma.customerNote && (
          <div className="text-[11px] text-[#565e74] dark:text-slate-400 px-1">
            {t('rma_customer_note')}: <em className="text-[#0b1c30] dark:text-white">&quot;{rma.customerNote}&quot;</em>
          </div>
        )}
      </div>
    </SectionCard>
  );
};
