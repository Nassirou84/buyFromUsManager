'use client';

import useLocales from '@/locales/use-locales';
import React, { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GET_PRODUCT_RETURNS_QUERY_KEY } from '@/api/returns/get-product-returns';
import { GET_PRODUCT_RETURN_BY_UID_QUERY_KEY } from '@/api/returns/get-product-return';
import { useUpdateReturnItemCondition } from '@/api/returns/update-return-item-condition';
import { useAddReturnNote } from '@/api/returns/add-return-note';
import { useApproveReturnItem } from '@/api/returns/approve-return-item';
import { useRejectReturnItem } from '@/api/returns/reject-return-item';
import { getCompleteReturnErrorCode, useCompleteProductReturn } from '@/api/returns/complete-product-return';
import { mapApiProductReturn } from './mapper';
import {
  PACKAGING_CONTROL_CODES,
  type ItemCondition,
  type PackagingCheck,
  type ReturnItemDecision,
  type RmaItem,
  type RmaLine,
} from './types';
import {
  CONDITIONS,
  ReturnDetailHeader,
  ReturnItemsCard,
  ReturnLedgerCard,
  ReturnOrderCard,
  ReturnSlipModal,
  ReturnSummaryCard,
} from './components';

interface ReturnDetailViewProps {
  rma: RmaItem;
  /** Applies an update to the latest return state (so rollbacks never use a stale copy). */
  onUpdate: (updater: (prev: RmaItem) => RmaItem) => void;
  onBack: () => void;
}

// Codes of the checks that passed, as stored in ProductReturnItem.itemControls.
const toControls = (check: PackagingCheck): string[] =>
  (Object.keys(PACKAGING_CONTROL_CODES) as (keyof PackagingCheck)[])
    .filter((key) => check[key])
    .map((key) => PACKAGING_CONTROL_CODES[key]);

export const ReturnDetailView: React.FC<ReturnDetailViewProps> = ({ rma, onUpdate, onBack }) => {
  const { t } = useLocales();
  const queryClient = useQueryClient();
  const { mutate: saveInspection, isPending: isSavingInspection, variables: savingVars } =
    useUpdateReturnItemCondition();
  const { mutate: saveNote, isPending: isSavingNote } = useAddReturnNote();
  const { mutate: approveItem, isPending: isApproving, variables: approvingVars } = useApproveReturnItem();
  const { mutate: rejectItem, isPending: isRejecting, variables: rejectingVars } = useRejectReturnItem();
  const { mutate: completeReturn, isPending: isCompleting } = useCompleteProductReturn();
  // Line whose approve / reject call is in flight (one at a time per line).
  const decidingItemId = isApproving ? approvingVars?.itemId : isRejecting ? rejectingVars?.itemId : undefined;
  // Lines whose return slips are open in the print modal (null = closed).
  const [slipLineIndexes, setSlipLineIndexes] = useState<number[] | null>(null);
  const closeSlips = useCallback((): void => setSlipLineIndexes(null), []);

  const updateRma = onUpdate;

  // Replace one line's inspection fields in the local return.
  const setLineInspection = (
    itemId: number,
    inspection: Pick<RmaLine, 'condition' | 'packagingCheck'>,
  ): void => {
    updateRma((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.itemId === itemId ? { ...l, ...inspection } : l)),
    }));
  };

  // Persist one line's inspection (grade + passed checks). The UI updates first; on
  // failure the line goes back to what it was so the admin can retry.
  const persistLineInspection = (
    line: RmaLine,
    next: { condition: ItemCondition; packagingCheck: PackagingCheck },
    successMessage?: string,
  ): void => {
    if (line.itemId === undefined) return;
    const itemId = line.itemId;
    const previous = { condition: line.condition, packagingCheck: line.packagingCheck };

    setLineInspection(itemId, next);
    saveInspection(
      { uid: rma.id, itemId, condition: next.condition, controls: toControls(next.packagingCheck) },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_RETURN_BY_UID_QUERY_KEY, rma.id] });
          void queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_RETURNS_QUERY_KEY] });
          if (successMessage) toast.success(successMessage);
        },
        onError: () => {
          setLineInspection(itemId, previous);
          toast.error(t('rma_toast_inspection_error'));
        },
      },
    );
  };

  // Grade one returned line. Each item is inspected and classified on its own.
  const handleLineConditionSelect = (idx: number, cond: ItemCondition): void => {
    const line = rma.lines[idx];
    if (!line) return;
    const labelKey = CONDITIONS.find((c) => c.value === cond)?.labelKey;
    persistLineInspection(
      line,
      { condition: cond, packagingCheck: line.packagingCheck },
      t('rma_toast_condition', { condition: labelKey ? t(labelKey) : cond }),
    );
  };

  // Toggle a packaging/accessory check on one returned line. The endpoint requires a
  // grade, so this is only reachable once the line has a condition.
  const handleLinePackagingToggle = (
    idx: number,
    key: keyof RmaLine['packagingCheck'],
    checked: boolean,
  ): void => {
    const line = rma.lines[idx];
    if (!line?.condition) return;
    persistLineInspection(
      line,
      { condition: line.condition, packagingCheck: { ...line.packagingCheck, [key]: checked } },
      key === 'itemMatch' && checked ? t('rma_toast_item_match') : undefined,
    );
  };

  // Save the inspector note (one per return; saving again replaces it). The note is
  // only applied locally once the backend accepted it.
  const handleSaveNote = (note: string, onSaved: () => void): void => {
    saveNote(
      { uid: rma.id, note },
      {
        onSuccess: () => {
          updateRma((prev) => ({ ...prev, inspectorNote: note }));
          onSaved();
          void queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_RETURN_BY_UID_QUERY_KEY, rma.id] });
          toast.success(t('rma_toast_note'));
        },
        onError: () => {
          toast.error(t('rma_toast_note_error'));
        },
      },
    );
  };

  // Replace one line's decision in the local return.
  const setLineDecision = (itemId: number, decision: ReturnItemDecision | null): void => {
    updateRma((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.itemId === itemId ? { ...l, decision } : l)),
    }));
  };

  // Approve or reject one returned item. Each line is decided on its own. The UI
  // updates first; on failure the line goes back to its previous decision so the
  // admin can retry.
  const handleLineDecision = (idx: number, decision: ReturnItemDecision): void => {
    const line = rma.lines[idx];
    if (!line || line.itemId === undefined) return;
    const itemId = line.itemId;
    const previous = line.decision;
    const decide = decision === 'approved' ? approveItem : rejectItem;

    setLineDecision(itemId, decision);
    decide(
      { itemId },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_RETURN_BY_UID_QUERY_KEY, rma.id] });
          void queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_RETURNS_QUERY_KEY] });
          const title = line.title || t('rma_item_untitled');
          toast.success(
            t(decision === 'approved' ? 'rma_toast_item_approved' : 'rma_toast_item_rejected', { item: title }),
          );
        },
        onError: () => {
          setLineDecision(itemId, previous);
          toast.error(t('rma_toast_item_decision_error'));
        },
      },
    );
  };

  // Complete the return and close the case (after the admin confirmed in the dialog).
  // Only applied once the backend accepted it, using the return it sends back. On
  // failure the case stays open; the dialog too, so the admin can retry, except when
  // the refund outcome is unknown, since retries are blocked until it's reconciled.
  const handleComplete = (closeDialog: () => void): void => {
    completeReturn(
      { uid: rma.id },
      {
        onSuccess: ({ productReturn }) => {
          updateRma((prev) =>
            productReturn ? mapApiProductReturn(productReturn) : { ...prev, status: 'completed' },
          );
          closeDialog();
          void queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_RETURN_BY_UID_QUERY_KEY, rma.id] });
          void queryClient.invalidateQueries({ queryKey: [GET_PRODUCT_RETURNS_QUERY_KEY] });
          toast.success(t('rma_toast_completed', { id: rma.id }));
        },
        onError: (error) => {
          const code = getCompleteReturnErrorCode(error);
          if (code === 'refund_outcome_unknown') closeDialog();
          toast.error(t(code ? `rma_complete_error_${code}` : 'rma_toast_complete_error'));
        },
      },
    );
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <ReturnDetailHeader
        rma={rma}
        onBack={onBack}
        onPrintSlips={() => setSlipLineIndexes(rma.lines.map((_, idx) => idx))}
      />
      <ReturnSummaryCard rma={rma} />
      {rma.order && <ReturnOrderCard order={rma.order} customerEmail={rma.customerEmail} />}
      <ReturnItemsCard
        rma={rma}
        savingItemId={isSavingInspection ? savingVars?.itemId : undefined}
        decidingItemId={decidingItemId}
        onConditionSelect={handleLineConditionSelect}
        onPackagingToggle={handleLinePackagingToggle}
        onDecide={handleLineDecision}
        onPrintSlip={(idx) => setSlipLineIndexes([idx])}
      />
      <ReturnLedgerCard
        rma={rma}
        isSavingNote={isSavingNote}
        onSaveNote={handleSaveNote}
        isCompleting={isCompleting}
        onComplete={handleComplete}
      />
      <ReturnSlipModal
        rma={rma}
        lineIndexes={slipLineIndexes ?? []}
        isOpen={slipLineIndexes !== null}
        onClose={closeSlips}
      />
    </div>
  );
};
