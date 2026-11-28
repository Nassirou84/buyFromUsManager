import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-[500px]">
        <div className="flex flex-col items-center gap-2 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Flot Boutique" className="w-14 h-14 rounded-2xl shadow-sm object-contain" />
          <span className="text-xl font-bold text-[#0b1c30] tracking-tight">Flot Boutique</span>
        </div>
        {children}
      </div>
    </main>
  );
}
