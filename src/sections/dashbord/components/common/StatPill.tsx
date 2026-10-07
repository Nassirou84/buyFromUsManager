import React from 'react';

interface StatPillProps {
  children: React.ReactNode;
  /** Highlighted (blue, bold) vs. muted. */
  accent?: boolean;
}

export const StatPill: React.FC<StatPillProps> = ({ children, accent = false }) => (
  <span
    className={`px-2.5 py-1 bg-[#eff4ff] dark:bg-slate-800 rounded-lg border border-[#dce9ff] dark:border-slate-700 ${
      accent
        ? 'text-[#004ac6] dark:text-blue-300 font-bold'
        : 'text-[#565e74] dark:text-slate-300 font-semibold'
    }`}
  >
    {children}
  </span>
);
