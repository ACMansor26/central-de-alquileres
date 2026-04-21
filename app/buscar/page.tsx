import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
} from "lucide-react";
import PropertyCard from "@/components/propiedades/PropertyCard";
import SearchBar from "@/components/ui/SearchBar";
import SortDropdown from "@/components/ui/SortDropdown";
import { getSearchPageData, type SearchFilters } from "@/lib/data/properties";
import { buildPageMetadata } from "@/lib/seo";

interface SearchProps {
  searchParams: Promise<SearchFilters>;
}

export async function generateMetadata({
  searchParams,
}: SearchProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Object.values(params).some(Boolean);

  return buildPageMetadata({
    title: hasFilters ? "Resultados de busqueda" : "Buscar alquileres",
    description: hasFilters
      ? "Resultados filtrados de alquileres en AMBA por zona, tipo, precio, superficie y ambientes."
      : "Busca alquileres en AMBA por zona, tipo de propiedad, precio, metros y ambientes.",
    path: "/buscar",
    noIndex: hasFilters,
  });
}

function buildSearchUrl(
  currentParams: Record<string, string | undefined>,
  newParams: Record<string, string | number | undefined>
) {
  const nextParams = new URLSearchParams();

  Object.entries(currentParams).forEach(([key, value]) => {
    if (value) nextParams.set(key, value);
  });

  Object.entries(newParams).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      nextParams.delete(key);
      return;
    }

    nextParams.set(key, value.toString());
  });

  return `/buscar?${nextParams.toString()}`;
}

export default async function BuscarPage({ searchParams }: SearchProps) {
  const sParams = await searchParams;
  const { q, tipo, min, max, page, sort, moneda, minM2, maxM2, ambientes } = sParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const zoneList = q
    ? q
        .split(",")
        .map((zone) => zone.trim())
        .filter(Boolean)
    : [];

  const { properties: propiedades, hasNextPage, visiblePages } = await getSearchPageData(sParams);

  const currentSearchParams = {
    q,
    tipo,
    moneda,
    min,
    max,
    minM2,
    maxM2,
    ambientes,
    sort,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 font-semibold text-[#006AFF] transition-colors hover:text-blue-800 hover:underline"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Link>

            <div className="flex min-w-[130px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-center shadow-sm">
              <span className="mb-1 text-base font-bold leading-none text-slate-800">
                {propiedades.length.toLocaleString("es-AR")}
              </span>
              <span className="text-[10px] font-semibold uppercase leading-none tracking-widest text-slate-500">
                En pagina
              </span>
            </div>
          </div>

          <div className="relative z-[100] mb-10 w-full">
            <SearchBar
              key={`${q ?? ""}|${tipo ?? ""}|${moneda ?? ""}|${min ?? ""}|${max ?? ""}|${minM2 ?? ""}|${maxM2 ?? ""}|${ambientes ?? ""}`}
              initialTipo={tipo}
              initialMoneda={moneda}
              initialZonas={zoneList}
              initialMin={min}
              initialMax={max}
              initialMinM2={minM2}
              initialMaxM2={maxM2}
              initialAmbientes={ambientes}
            />
          </div>

          <div className="relative z-[90] mb-6 flex justify-end">
            <SortDropdown sort={sort} />
          </div>
        </div>

        <div className="relative z-10">
          {propiedades.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {propiedades.map((prop) => (
                  <PropertyCard key={prop.id} data={prop} />
                ))}
              </div>

              {currentPage > 1 || hasNextPage ? (
                <div className="mt-16 flex items-center justify-center gap-1 sm:gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={buildSearchUrl(currentSearchParams, { page: currentPage - 1 })}
                      aria-label="Pagina anterior"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-700 sm:h-12 sm:w-12"
                    >
                      <ChevronLeft size={18} className="sm:h-5 sm:w-5" />
                    </Link>
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-slate-300 sm:h-12 sm:w-12">
                      <ChevronLeft size={18} className="sm:h-5 sm:w-5" />
                    </div>
                  )}

                  <div className="flex items-center gap-1 sm:gap-2">
                    {visiblePages.map((pageNumber) => {
                      const isActive = pageNumber === currentPage;

                      return (
                        <Link
                          key={pageNumber}
                          href={buildSearchUrl(currentSearchParams, { page: pageNumber })}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all sm:h-12 sm:w-12 sm:text-lg ${
                            isActive
                              ? "border-2 border-blue-500 text-slate-900"
                              : "border-transparent text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      );
                    })}
                  </div>

                  {hasNextPage ? (
                    <Link
                      href={buildSearchUrl(currentSearchParams, { page: currentPage + 1 })}
                      aria-label="Pagina siguiente"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:text-slate-900 sm:h-12 sm:w-12"
                    >
                      <ChevronRight size={18} className="sm:h-5 sm:w-5" />
                    </Link>
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-slate-300 sm:h-12 sm:w-12">
                      <ChevronRight size={18} className="sm:h-5 sm:w-5" />
                    </div>
                  )}
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-32 text-center shadow-sm">
              <SearchIcon size={64} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-xl font-bold text-slate-800">No encontramos propiedades</h2>
              <p className="mt-2 text-slate-500">
                Intenta ajustando los filtros o ampliando la zona de busqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
