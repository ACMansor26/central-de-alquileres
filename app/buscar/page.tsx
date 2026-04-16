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
import { supabase } from "@/lib/supabase";

interface SearchProps {
  searchParams: Promise<{
    q?: string;
    tipo?: string;
    min?: string;
    max?: string;
    page?: string;
    sort?: string;
    moneda?: string;
    minM2?: string;
    maxM2?: string;
    ambientes?: string;
  }>;
}

interface SearchResultRow {
  id_publicacion: string | number | null;
  Direccion: string | null;
  zona: string | null;
  precio_alquiler: number | null;
  moneda_alquiler: string | null;
  expensas_num: number | null;
  Tipo: string | null;
  Metros: number | string | null;
  ambientes: number | null;
  antiguedad_anios: number | null;
  tiene_cochera: boolean | null;
  tiene_pileta: boolean | null;
  tiene_seguridad: boolean | null;
  tiene_patio: boolean | null;
  tiene_balcon: boolean | null;
  URL: string | null;
  imagen_url: string | null;
}

const PAGE_SIZE = 20;

const SEARCH_RESULT_SELECT = `
  id_publicacion,
  Direccion,
  zona,
  precio_alquiler,
  moneda_alquiler,
  expensas_num,
  Tipo,
  Metros,
  ambientes,
  antiguedad_anios,
  tiene_cochera,
  tiene_pileta,
  tiene_seguridad,
  tiene_patio,
  tiene_balcon,
  URL,
  imagen_url
`;

function parsePositiveInt(value?: string) {
  if (!value) return undefined;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : undefined;
}

function mapSearchResult(row: SearchResultRow) {
  return {
    id: row.id_publicacion?.toString() ?? `${row.Tipo ?? "prop"}-${row.Direccion ?? "sin-id"}`,
    direccion: row.Direccion ?? "Dirección no informada",
    zona: row.zona ?? "Zona no informada",
    precio: row.precio_alquiler ?? 0,
    moneda: row.moneda_alquiler ?? "Pesos",
    expensas: row.expensas_num,
    tipo: row.Tipo ?? "Propiedad",
    metros: Number(row.Metros) || 0,
    ambientes: row.ambientes ?? undefined,
    antiguedad_anios: row.antiguedad_anios ?? undefined,
    tieneCochera: Boolean(row.tiene_cochera),
    tienePileta: Boolean(row.tiene_pileta),
    tieneSeguridad: Boolean(row.tiene_seguridad),
    tienePatio: Boolean(row.tiene_patio),
    tieneBalcon: Boolean(row.tiene_balcon),
    url: row.URL ?? "",
    imagen_url: row.imagen_url,
  };
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

  const currentPage = Math.max(1, parsePositiveInt(page) ?? 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const minPrice = parsePositiveInt(min);
  const maxPrice = parsePositiveInt(max);
  const minSquareMeters = parsePositiveInt(minM2);
  const maxSquareMeters = parsePositiveInt(maxM2);
  const roomCount = parsePositiveInt(ambientes);
  const zoneList = q
    ? q
        .split(",")
        .map((zone) => zone.trim())
        .filter(Boolean)
    : [];

  let resultsQuery = supabase
    .from("vista_propiedades_front")
    .select(SEARCH_RESULT_SELECT);

  if (tipo) resultsQuery = resultsQuery.eq("Tipo", tipo);
  if (moneda) resultsQuery = resultsQuery.eq("moneda_alquiler", moneda);
  if (minPrice !== undefined) resultsQuery = resultsQuery.gte("precio_alquiler", minPrice);
  if (maxPrice !== undefined) resultsQuery = resultsQuery.lte("precio_alquiler", maxPrice);
  if (minSquareMeters !== undefined) resultsQuery = resultsQuery.gte("Metros", minSquareMeters);
  if (maxSquareMeters !== undefined) resultsQuery = resultsQuery.lte("Metros", maxSquareMeters);

  if (ambientes === "5+") {
    resultsQuery = resultsQuery.gte("ambientes", 5);
  } else if (roomCount !== undefined) {
    resultsQuery = resultsQuery.lte("ambientes", roomCount);
  }

  if (zoneList.length > 0) {
    const orString = zoneList.map((zone) => `zona.ilike.%${zone}%`).join(",");
    resultsQuery = resultsQuery.or(orString);
  }

  if (sort === "precio_asc") {
    resultsQuery = resultsQuery.order("precio_alquiler", { ascending: true });
  } else if (sort === "precio_desc") {
    resultsQuery = resultsQuery.order("precio_alquiler", { ascending: false });
  } else {
    resultsQuery = resultsQuery.order("id_publicacion", { ascending: false });
  }

  let countQuery = supabase
    .from("vista_propiedades_front")
    .select("id_publicacion", { count: "exact", head: true });

  if (tipo) countQuery = countQuery.eq("Tipo", tipo);
  if (moneda) countQuery = countQuery.eq("moneda_alquiler", moneda);
  if (minPrice !== undefined) countQuery = countQuery.gte("precio_alquiler", minPrice);
  if (maxPrice !== undefined) countQuery = countQuery.lte("precio_alquiler", maxPrice);
  if (minSquareMeters !== undefined) countQuery = countQuery.gte("Metros", minSquareMeters);
  if (maxSquareMeters !== undefined) countQuery = countQuery.lte("Metros", maxSquareMeters);

  if (ambientes === "5+") {
    countQuery = countQuery.gte("ambientes", 5);
  } else if (roomCount !== undefined) {
    countQuery = countQuery.lte("ambientes", roomCount);
  }

  if (zoneList.length > 0) {
    const orString = zoneList.map((zone) => `zona.ilike.%${zone}%`).join(",");
    countQuery = countQuery.or(orString);
  }

  const [
    { data: resultados, error: resultsError },
    { count, error: countError },
  ] = await Promise.all([
    resultsQuery.range(from, to),
    countQuery,
  ]);

  if (resultsError) {
    console.error("Error cargando resultados de búsqueda:", resultsError);
  }

  if (countError) {
    console.error("Error contando resultados de búsqueda:", countError);
  }

  const totalResults = count ?? 0;
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);
  const propiedades = ((resultados ?? []) as SearchResultRow[]).map(mapSearchResult);

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
    <main className="min-h-screen bg-slate-50 px-4 pt-28 sm:px-6 lg:px-8 pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="group inline-flex items-center gap-2 font-semibold text-[#006AFF] hover:text-blue-800 hover:underline transition-colors">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Link>

            <div className="flex min-w-[130px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-center shadow-sm">
              <span className="mb-1 text-base font-bold leading-none text-slate-800">
                {totalResults.toLocaleString("es-AR")}
              </span>
              <span className="text-[10px] font-semibold uppercase leading-none tracking-widest text-slate-500">
                Resultados
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

              {totalPages > 1 ? (
                <div className="mt-16 flex items-center justify-center gap-6">
                  {currentPage > 1 ? (
                    <Link
                      href={buildSearchUrl(currentSearchParams, { page: currentPage - 1 })}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                    >
                      <ChevronLeft size={20} /> Anterior
                    </Link>
                  ) : null}
                  
                  <span className="text-sm font-semibold text-slate-500">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  {currentPage < totalPages ? (
                    <Link
                      href={buildSearchUrl(currentSearchParams, { page: currentPage + 1 })}
                      className="flex items-center gap-2 rounded-xl border border-[#006AFF] bg-[#006AFF] px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:border-blue-700"
                    >
                      Siguiente <ChevronRight size={20} />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-32 text-center shadow-sm">
              <SearchIcon size={64} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-xl font-bold text-slate-800">No encontramos propiedades</h2>
              <p className="mt-2 text-slate-500">
                Intentá ajustando los filtros o ampliando la zona de búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}