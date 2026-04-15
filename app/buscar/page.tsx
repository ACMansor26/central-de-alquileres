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

  let query = supabase
    .from("vista_propiedades_front")
    .select(SEARCH_RESULT_SELECT, { count: "exact" });

  if (tipo) query = query.eq("Tipo", tipo);
  if (moneda) query = query.eq("moneda_alquiler", moneda);
  if (minPrice !== undefined) query = query.gte("precio_alquiler", minPrice);
  if (maxPrice !== undefined) query = query.lte("precio_alquiler", maxPrice);
  if (minSquareMeters !== undefined) query = query.gte("Metros", minSquareMeters);
  if (maxSquareMeters !== undefined) query = query.lte("Metros", maxSquareMeters);

  if (ambientes === "5+") {
    query = query.gte("ambientes", 5);
  } else if (roomCount !== undefined) {
    query = query.lte("ambientes", roomCount);
  }

  if (zoneList.length > 0) {
    const orString = zoneList.map((zone) => `zona.ilike.%${zone}%`).join(",");
    query = query.or(orString);
  }

  if (sort === "precio_asc") query = query.order("precio_alquiler", { ascending: true });
  else if (sort === "precio_desc") query = query.order("precio_alquiler", { ascending: false });
  else query = query.order("id_publicacion", { ascending: false });

  const { data: resultados, count, error } = await query.range(from, to);

  if (error) {
    console.error("Error cargando resultados de búsqueda:", error);
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);
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
    <main className="min-h-screen bg-slate-50 px-4 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="group inline-flex items-center gap-2 font-bold text-indigo-600 hover:underline">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Link>

            <div className="flex min-w-[130px] flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white px-6 py-2.5 text-center shadow-sm">
              <span className="mb-1.5 text-base font-black leading-none text-slate-800">
                {count ? count.toLocaleString("es-AR") : "0"}
              </span>
              <span className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">
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
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {propiedades.map((prop) => (
                  <PropertyCard key={prop.id} data={prop} />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-20 flex items-center justify-center gap-6">
                  {currentPage > 1 ? (
                    <Link
                      href={buildSearchUrl(currentSearchParams, { page: currentPage - 1 })}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                    >
                      <ChevronLeft size={20} /> Anterior
                    </Link>
                  ) : null}
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                    Página {currentPage} / {totalPages}
                  </span>
                  {currentPage < totalPages ? (
                    <Link
                      href={buildSearchUrl(currentSearchParams, { page: currentPage + 1 })}
                      className="flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700"
                    >
                      Siguiente <ChevronRight size={20} />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white py-32 text-center shadow-inner">
              <SearchIcon size={80} className="mx-auto mb-6 text-slate-100" />
              <h2 className="text-2xl font-bold text-slate-800">No hay resultados</h2>
              <p className="mt-2 text-slate-400">
                Intentá ajustando los filtros en el buscador de arriba.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
