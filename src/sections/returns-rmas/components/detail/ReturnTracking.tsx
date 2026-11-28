import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { type ProductReturnStatus } from '@/api/returns/get-product-returns';
import { type RmaStatus } from '../../types';

// Return lifecycle (ProductReturnStatusEnum). The happy path runs in this order;
// `rejected` is a terminal branch handled separately.
const LIFECYCLE: { status: ProductReturnStatus; labelKey: string; icon: string }[] = [
  { status: 'initiated', labelKey: 'rma_status_initiated', icon: 'assignment_return' },
  { status: 'collected', labelKey: 'rma_status_collected', icon: 'local_shipping' },
  { status: 'inspected', labelKey: 'rma_status_inspected', icon: 'search' },
  { status: 'approved', labelKey: 'rma_status_approved', icon: 'task_alt' },
  { status: 'completed', labelKey: 'rma_status_completed', icon: 'check_circle' },
];

type TrackState = 'done' | 'active' | 'todo' | 'rejected';
interface TrackStep {
  key: string;
  labelKey: string;
  icon: string;
  state: TrackState;
}

// Build the tracking timeline from the return's current status. Every stage up to
// the current one is complete, the current one is active, later ones are pending.
// A rejected return shows the stages it cleared plus a terminal "Rejected" node.
const buildTracking = (status: RmaStatus): TrackStep[] => {
  if (status === 'rejected') {
    return [
      ...LIFECYCLE.slice(0, 3).map((s): TrackStep => ({
        key: s.status,
        labelKey: s.labelKey,
        icon: 'check',
        state: 'done',
      })),
      { key: 'rejected', labelKey: 'rma_status_rejected', icon: 'cancel', state: 'rejected' },
    ];
  }

  const current = LIFECYCLE.findIndex((s) => s.status === status);
  return LIFECYCLE.map((s, idx): TrackStep => {
    const state: TrackState =
      idx < current ? 'done' : idx === current ? (status === 'completed' ? 'done' : 'active') : 'todo';
    return { key: s.status, labelKey: s.labelKey, icon: state === 'done' ? 'check' : s.icon, state };
  });
};

const NODE_CLASS: Record<TrackState, string> = {
  done: 'bg-[#2563eb] text-white shadow-sm',
  active: 'bg-[#bc4800] text-white ring-4 ring-[#ffdbcd] shadow-sm',
  rejected: 'bg-[#ba1a1a] text-white ring-4 ring-[#ffdad6] shadow-sm',
  todo: 'bg-[#dae2fd] dark:bg-slate-700 text-[#565e74] dark:text-slate-300',
};

const LABEL_CLASS: Record<TrackState, string> = {
  done: 'font-semibold text-[#0b1c30] dark:text-white',
  active: 'font-bold text-[#bc4800]',
  rejected: 'font-bold text-[#ba1a1a]',
  todo: 'text-[#565e74] dark:text-slate-400',
};

// Connector colour is driven by the step it leads into.
const CONNECTOR_CLASS: Record<TrackState, string> = {
  done: 'bg-[#2563eb]',
  active: 'bg-[#2563eb]',
  rejected: 'bg-[#ba1a1a]',
  todo: 'bg-[#dae2fd] dark:bg-slate-700',
};

interface ReturnTrackingProps {
  status: RmaStatus;
}

// Horizontal status timeline derived from the return's current status.
export const ReturnTracking: React.FC<ReturnTrackingProps> = ({ status }) => {
  const { t } = useLocales();
  const steps = buildTracking(status);

  return (
    <div className="flex items-start">
      {steps.map((step, idx) => {
        const isCurrent = step.state === 'active' || step.state === 'rejected';
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center text-center gap-1 shrink-0 w-14">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${NODE_CLASS[step.state]}`}>
                <Icon name={step.icon} className="text-[17px]" />
              </div>
              <span className={`text-[11px] leading-tight ${LABEL_CLASS[step.state]}`}>{t(step.labelKey)}</span>
              {isCurrent && (
                <span
                  className={`text-[10px] font-semibold ${
                    step.state === 'rejected' ? 'text-[#ba1a1a]' : 'text-[#bc4800]'
                  }`}
                >
                  {t('rma_tracking_current')}
                </span>
              )}
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mt-4 rounded-full ${CONNECTOR_CLASS[steps[idx + 1].state]}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
