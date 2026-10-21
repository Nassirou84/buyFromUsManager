import React from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Fullscreen overlay + rounded panel. Clicking the backdrop closes it. */
export const ModalShell: React.FC<ModalShellProps> = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div
        className={`bg-white dark:bg-[#131b2e] rounded-2xl w-full shadow-2xl border border-[#dce9ff] dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
