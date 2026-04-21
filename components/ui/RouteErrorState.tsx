"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RouteErrorState({
  title,
  description,
  reset,
  href = "/",
  hrefLabel = "Volver al inicio",
}: {
  title: string;
  description: string;
  reset?: () => void;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 pb-16 pt-24 text-slate-900 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_-46px_rgba(15,23,42,0.24)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
          <AlertTriangle size={28} />
        </div>

        <h1 className="mt-6 text-2xl font-black text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <RefreshCw size={15} />
              Reintentar
            </button>
          ) : null}

          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
          >
            {hrefLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
