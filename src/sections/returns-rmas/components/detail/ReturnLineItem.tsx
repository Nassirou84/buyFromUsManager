import React, { useState } from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { formatWithCurrency } from '@/utils/lodash';
import { type ItemCondition, type ReturnItemDecision, type RmaLine } from '../../types';
import { getReasonLabelKey } from '../../shared';
import { ProductThumb } from '../common/ProductThumb';

export const CONDITIONS: { value: ItemCondition; labelKey: string; descKey: string }[] = [
  { value: 'grade_a', labelKey: 'rma_cond_a', descKey: 'rma_cond_a_desc' },
  { value: 'grade_b', labelKey: 'rma_cond_b', descKey: 'rma_cond_b_desc' },
  { value: 'unsellable', labelKey: 'rma_cond_c', descKey: 'rma_cond_c_desc' },
];

const PACKAGING_CHECKS: {
  key: keyof RmaLine['packagingCheck'];
  id: string;
  labelKey: string;
}[] = [
  { key: 'packagingKept', id: 'checkPackagingKept', labelKey: 'rma_check_packaging_kept' },
  { key: 'returnCauseChecked', id: 'checkReturnCause', labelKey: 'rma_check_return_cause' },
];
// Approve is green and reject is red: a tinted outline while undecided, solid once chosen.
const DECISIONS: {
  value: ReturnItemDecision;
  labelKey: string;
  icon: string;
  idleClass: string;
  selectedClass: string;
}[] = [
  {
    value: 'approved',
    labelKey: 'rma_item_approve_btn',
    icon: 'check_circle',
    idleClass:
      'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold',
    selectedClass: 'bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 text-white font-semibold shadow-2xs',
  },
  {
    value: 'rejected',
    labelKey: 'rma_item_reject_btn',
    icon: 'cancel',
    idleClass:
      'bg-[#ffdad6]/40 dark:bg-red-950/40 border border-[#ffb4ab] dark:border-red-900 text-[#ba1a1a] dark:text-red-400 hover:bg-[#ffdad6]/70 dark:hover:bg-red-900/50 font-semibold',
    selectedClass: 'bg-[#ba1a1a] hover:bg-[#93000a] border border-[#ba1a1a] text-white font-semibold shadow-2xs',
  },
];

// "Item match" is not a checkbox: it is confirmed with a button after the serial check.

// Serials are compared ignoring case and whitespace, since they are often typed by hand.
const normalizeSerial = (value: string): string => value.replace(/\s+/g, '').toUpperCase();

const SUB_LABEL = 'text-[10px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider';

interface ReturnLineItemProps {
  line: RmaLine;
  /** Row index, used to keep checkbox ids unique. */
  index: number;
  /** Show the condition / packaging workbench (once the parcel is collected). */
  showInspection: boolean;
  /** An inspection save for this line is in flight. */
  isSaving?: boolean;
  onConditionSelect: (condition: ItemCondition) => void;
  onPackagingToggle: (key: keyof RmaLine['packagingCheck'], checked: boolean) => void;
  /** An approve / reject call for this line is in flight. */
  isDeciding?: boolean;
  onDecide: (decision: ReturnItemDecision) => void;
  /** Open the return slip for this item. */
  onPrintSlip: () => void;
}

// One returned line: image, title, variant, quantity, price, reason and the
// per-item inspection controls.
export const ReturnLineItem: React.FC<ReturnLineItemProps> = ({
  line,
  index,
  showInspection,
  isSaving = false,
  onConditionSelect,
  onPackagingToggle,
  isDeciding = false,
  onDecide,
  onPrintSlip,
}) => {
  const { t } = useLocales();
  // Serial read off the returned item by the inspector. Kept local: there is no
  // backend field for it, only the resulting "item match" check is saved.
  const [returnedSerial, setReturnedSerial] = useState('');
  // Result of the last front-end serial check (cleared as soon as the input changes).
  const [serialError, setSerialError] = useState<'empty' | 'mismatch' | null>(null);

  // Translate a stored reason code, falling back to the raw value when unknown.
  const reasonLabel = (code: string): string => {
    const key = getReasonLabelKey(code);
    return key ? t(key) : code;
  };

  // The line can only be saved once it is addressable on the backend, and the
  // endpoint needs a grade, so packaging checks unlock after a condition is picked.
  const canSave = line.itemId !== undefined && !isSaving;
  const canTogglePackaging = canSave && line.condition !== null;
  // Approve / reject only needs the line to be addressable on the backend.
  const canDecide = line.itemId !== undefined && !isDeciding;

  // "Item match" is confirmed only when the returned item's serial equals the one
  // recorded on the order item. The comparison runs here first; the endpoint is only
  // called once it passes.
  const hasOrderSerial = line.orderSerialNumber !== '';
  const isItemMatched = line.packagingCheck.itemMatch;
  const serialInputId = `returnedSerial-${index}`;

  const handleConfirmItemMatch = (): void => {
    if (!canTogglePackaging) return;
    if (returnedSerial.trim() === '') {
      setSerialError('empty');
      return;
    }
    if (normalizeSerial(returnedSerial) !== normalizeSerial(line.orderSerialNumber)) {
      setSerialError('mismatch');
      return;
    }
    setSerialError(null);
    onPackagingToggle('itemMatch', true);
  };

  return (
    <div className="flex items-start gap-3.5 p-3.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg">
      {/* Main image: the variant photo when the line has one, else the product cover. */}
      <ProductThumb
        src={line.variantImage || line.productImage}
        alt={line.title}
        className="w-16 h-20 rounded-lg"
        iconClassName="text-[24px]"
      />

      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
        <div className="flex items-start justify-between gap-2">
          {line.slug ? (
            <a
              href={`${process.env.NEXT_PUBLIC_STORE_FRONT_URL}/products/${line.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#004ac6] dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 min-w-0"
            >
              <span className="truncate">{line.title || t('rma_item_untitled')}</span>
              <Icon name="open_in_new" className="text-[13px] shrink-0" />
            </a>
          ) : (
            <span className="text-[14px] text-[#0b1c30] dark:text-white font-bold">
              {line.title || t('rma_item_untitled')}
            </span>
          )}
          <span className="text-[14px] text-[#0b1c30] dark:text-white font-bold shrink-0">
            {formatWithCurrency(line.unitPrice)}
          </span>
        </div>

        {/* Variant label (the variant photo is shown as the main image above). */}
        {line.variantLabel && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#dae2fd] dark:bg-slate-700 text-[#0b1c30] dark:text-white text-[11px] rounded font-medium">
              {line.variantLabel}
            </span>
          </div>
        )}

        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#565e74] dark:text-slate-400">
          <span className="font-semibold text-[#0b1c30] dark:text-white">
            {t('rma_qty_short', { count: line.quantity })}
          </span>
          <button
            type="button"
            onClick={onPrintSlip}
            className="flex items-center gap-1 font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
          >
            <Icon name="print" className="text-[13px]" />
            {t('return_slip_print_item')}
          </button>
        </div>

        {/* Return reason — shown prominently as a labelled chip. */}
        {line.reason && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider">
              {t('rma_reason_label')}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#ffdbcd] text-[#943700] dark:bg-amber-900/40 dark:text-amber-300 rounded font-semibold text-[12px]">
              <Icon name="assignment_return" className="text-[13px]" />
              {reasonLabel(line.reason)}
            </span>
          </div>
        )}

        {showInspection && (
          <>
            {/* Per-item condition classification */}
            <div className="flex flex-col gap-1 pt-1.5 mt-0.5 border-t border-[#dbe4ff] dark:border-slate-700">
              <span className={`${SUB_LABEL} flex items-center gap-1`}>
                {t('rma_condition_title')}
                {isSaving && <Icon name="progress_activity" className="text-[12px] animate-spin" />}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.map(({ value, labelKey, descKey }) => {
                  const selected = line.condition === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => !selected && onConditionSelect(value)}
                      disabled={!canSave}
                      aria-pressed={selected}
                      title={t(descKey)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                        selected
                          ? 'bg-[#2563eb] text-white font-semibold shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-600 text-[#0b1c30] dark:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-700 font-medium'
                      }`}
                    >
                      <Icon name={selected ? 'check_circle' : 'radio_button_unchecked'} className="text-[14px]" />
                      {t(labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Per-item packaging & accessories check */}
            <div className="flex flex-col gap-1 pt-1.5">
              <span className={SUB_LABEL}>{t('rma_packaging_title')}</span>
              {line.condition === null && (
                <span className="text-[11px] text-[#565e74] dark:text-slate-400">
                  {t('rma_packaging_requires_condition')}
                </span>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {PACKAGING_CHECKS.map(({ key, id, labelKey }) => {
                  const inputId = `${id}-${index}`;
                  const checked = line.packagingCheck[key];
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <input
                        checked={checked}
                        onChange={(e) => onPackagingToggle(key, e.target.checked)}
                        disabled={!canTogglePackaging}
                        className="w-4 h-4 rounded accent-[#2563eb] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        id={inputId}
                        type="checkbox"
                      />
                      <label
                        className="text-[11px] text-[#0b1c30] dark:text-white cursor-pointer select-none font-medium"
                        htmlFor={inputId}
                      >
                        {t(labelKey)}
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Item match: verify the serial on the returned item, then confirm */}
              <div className="flex flex-col gap-1 pt-1">
                <label htmlFor={serialInputId} className="text-[11px] text-[#565e74] dark:text-slate-400">
                  {t('rma_serial_label')}
                </label>
                {isItemMatched ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                      <Icon name="check_circle" className="text-[14px]" />
                      {t('rma_item_match_confirmed')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPackagingToggle('itemMatch', false)}
                      disabled={!canTogglePackaging}
                      className="text-[11px] font-semibold text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {t('rma_item_match_undo')}
                    </button>
                  </div>
                ) : hasOrderSerial ? (
                  <div className="flex flex-col gap-1.5 items-start">
                    <input
                      id={serialInputId}
                      type="text"
                      value={returnedSerial}
                      onChange={(e) => {
                        setReturnedSerial(e.target.value);
                        setSerialError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleConfirmItemMatch();
                        }
                      }}
                      placeholder={t('rma_serial_placeholder')}
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={serialError !== null}
                      className={`h-8 w-full max-w-[260px] px-2.5 bg-white dark:bg-slate-800 text-[12px] font-mono text-[#0b1c30] dark:text-white placeholder:text-[#737686] placeholder:font-sans rounded-md border focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors ${
                        serialError ? 'border-[#ba1a1a]' : 'border-[#c3c6d7] dark:border-slate-600'
                      }`}
                    />
                    {serialError && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#ba1a1a] dark:text-red-400">
                        <Icon name="cancel" className="text-[14px]" />
                        {t(serialError === 'empty' ? 'rma_serial_required' : 'rma_serial_mismatch')}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleConfirmItemMatch}
                      disabled={!canTogglePackaging}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2563eb] hover:bg-[#004ac6] text-white text-[11px] font-semibold shadow-2xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Icon name="verified" className="text-[14px]" />
                      {t('rma_confirm_item_match')}
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#bc4800] dark:text-amber-300">{t('rma_serial_missing')}</span>
                )}
              </div>
            </div>

            {/* Per-item decision: each returned item is approved or rejected on its own */}
            <div className="flex flex-col gap-1 pt-1.5 mt-0.5 border-t border-[#dbe4ff] dark:border-slate-700">
              <span className={`${SUB_LABEL} flex items-center gap-1`}>
                {t('rma_item_decision_title')}
                {isDeciding && <Icon name="progress_activity" className="text-[12px] animate-spin" />}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DECISIONS.map(({ value, labelKey, icon, idleClass, selectedClass }) => {
                  const selected = line.decision === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => !selected && onDecide(value)}
                      disabled={!canDecide}
                      aria-pressed={selected}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                        selected ? selectedClass : idleClass
                      }`}
                    >
                      <Icon name={icon} className="text-[14px]" />
                      {t(labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
