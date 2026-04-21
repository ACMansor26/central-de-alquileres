"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

type RegionKey = "all" | "CABA" | "GBA Norte" | "GBA Sur" | "GBA Oeste";
type CurrencyKey = "all" | "Pesos" | "Dolares";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface AnalysisFiltersProps {
  regionOptions: Array<Option<RegionKey>>;
  currencyOptions: Array<Option<CurrencyKey>>;
  selectedRegion: RegionKey;
  selectedCurrency: CurrencyKey;
}

function buildAnalisisHref(region: RegionKey, moneda: CurrencyKey) {
  const params = new URLSearchParams();

  if (region !== "all") {
    params.set("region", region);
  }

  if (moneda !== "all") {
    params.set("moneda", moneda);
  }

  const query = params.toString();
  return query ? `/analisis?${query}` : "/analisis";
}

function getRegionLabel(region: RegionKey) {
  return region === "all" ? "AMBA" : region;
}

function getCurrencyLabel(moneda: CurrencyKey) {
  return moneda === "all" ? "Todas las monedas" : moneda;
}

export default function AnalysisFilters({
  regionOptions,
  currencyOptions,
  selectedRegion,
  selectedCurrency,
}: AnalysisFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const summary = `${getRegionLabel(selectedRegion)} | ${getCurrencyLabel(selectedCurrency)}`;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:bottom-6 sm:left-auto sm:right-6">
      <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2.5rem)]">
        <div className="rounded-[24px] border border-slate-800/60 bg-slate-950/92 p-2 text-white shadow-[0_22px_60px_-28px_rgba(15,23,42,0.75)] backdrop-blur">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            className="flex w-full items-center justify-between gap-3 rounded-[18px] px-3 py-2.5 text-left transition-colors hover:bg-white/5 sm:min-w-[290px] sm:px-3.5 sm:py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="rounded-2xl border border-white/10 bg-white/10 p-2 text-blue-200">
                <SlidersHorizontal size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Filtros</p>
                <p className="truncate text-[11px] text-slate-300 sm:text-xs">{summary}</p>
              </div>
            </div>

            <ChevronDown
              size={16}
              className={`flex-shrink-0 transition-transform ${
                isOpen ? "rotate-180 text-white" : "text-slate-300"
              }`}
            />
          </button>

          {isOpen ? (
            <div className="max-h-[60vh] overflow-y-auto border-t border-white/10 px-3 pb-3 pt-3 sm:max-h-[70vh]">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Region
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {regionOptions.map((option) => {
                      const isActive = option.value === selectedRegion;

                      return (
                        <Link
                          key={option.value}
                          href={buildAnalisisHref(option.value, selectedCurrency)}
                          aria-current={isActive ? "page" : undefined}
                          className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                            isActive
                              ? "border-blue-500 bg-blue-600 text-white"
                              : "border-white/10 bg-white/5 text-slate-200 hover:border-blue-400/40 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Moneda
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currencyOptions.map((option) => {
                      const isActive = option.value === selectedCurrency;

                      return (
                        <Link
                          key={option.value}
                          href={buildAnalisisHref(selectedRegion, option.value)}
                          aria-current={isActive ? "page" : undefined}
                          className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                            isActive
                              ? "border-white bg-white text-slate-950"
                              : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
