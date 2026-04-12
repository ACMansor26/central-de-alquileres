import SearchBar from "@/components/ui/SearchBar";
import SortDropdown from "@/components/ui/SortDropdown";
import PropertyCard from "@/components/propiedades/PropertyCard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search as SearchIcon, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

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

export default async function BuscarPage({ searchParams }: SearchProps) {
  const sParams = await searchParams;
  const { q, tipo, min, max, page, sort, moneda, minM2, maxM2, ambientes } = sParams;
  
  const pageSize = 20;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const listaZonas = q ? q.split(",") : [];

  let query = supabase.from('vista_propiedades_front').select('*', { count: 'exact' });

  // Filtros Básicos
  if (tipo) query = query.eq('Tipo', tipo);
  if (moneda) query = query.eq('moneda_alquiler', moneda);
  if (min) query = query.gte('precio_alquiler', parseInt(min));
  if (max) query = query.lte('precio_alquiler', parseInt(max));
  if (minM2) query = query.gte('Metros', parseInt(minM2));
  if (maxM2) query = query.lte('Metros', parseInt(maxM2));
  if (ambientes) {
    if (ambientes === "5+") {
      query = query.gte('ambientes', 5);
    } else {
      query = query.lte('ambientes', parseInt(ambientes));
    }
  }

  if (listaZonas.length > 0) {
    const orString = listaZonas.map(z => `zona.ilike.%${z}%`).join(',');
    query = query.or(orString);
  }

  // Ordenamiento
  if (sort === "precio_asc") query = query.order('precio_alquiler', { ascending: true });
  else if (sort === "precio_desc") query = query.order('precio_alquiler', { ascending: false });
  else query = query.order('id_publicacion', { ascending: false });

  // Paginación
  query = query.range(from, to);

  const { data: resultados, count } = await query;
  
  const totalPages = Math.ceil((count || 0) / pageSize);

  // Mapeo
  const propiedades = resultados?.map((p: any) => ({
    id: p.id_publicacion?.toString(),
    direccion: p.Direccion,
    zona: p.zona,
    precio: p.precio_alquiler,
    moneda: p.moneda_alquiler,
    expensas: p.expensas_num,
    tipo: p.Tipo,
    metros: p.Metros,
    ambientes: p.ambientes,
    antiguedad_anios: p.antiguedad_anios,
    tieneCochera: p.tiene_cochera,
    tienePileta: p.tiene_pileta,
    tieneSeguridad: p.tiene_seguridad,
    tienePatio: p.tiene_patio,
    tieneBalcon: p.tiene_balcon,
    url: p.URL,
    imagen_url: p.imagen_url,
  })) || [];

  const getUrlWithParams = (newParams: Record<string, string | number | undefined>) => {
  const nextParams = new URLSearchParams();
  if (q) nextParams.append("q", q);
  if (tipo) nextParams.append("tipo", tipo);
  if (moneda) nextParams.append("moneda", moneda);
  if (min) nextParams.append("min", min);
  if (max) nextParams.append("max", max);
  if (minM2) nextParams.append("minM2", minM2);       // 👈 nuevo
  if (maxM2) nextParams.append("maxM2", maxM2);       // 👈 nuevo
  if (ambientes) nextParams.append("ambientes", ambientes); // 👈 nuevo
  if (sort && !newParams.sort) nextParams.append("sort", sort);
  
  Object.entries(newParams).forEach(([key, value]) => {
    if (value) nextParams.set(key, value.toString());
    else if (value === undefined) nextParams.delete(key);
  });
  return `/buscar?${nextParams.toString()}`;
};

  return (
    <main className="min-h-screen bg-slate-50 pt-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO Y BUSCADOR MODULAR */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Link>

            <div className="bg-white border border-slate-200 rounded-[2rem] px-6 py-2.5 shadow-sm flex flex-col items-center justify-center text-center min-w-[130px]">
              <span className="text-base font-black text-slate-800 leading-none mb-1.5">
                {count ? count.toLocaleString("es-AR") : "0"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                Resultados
              </span>
            </div>
          </div>

          {/* BUSCADOR PRE-LLENADO */}
          <div className="w-full mb-10 relative z-[100]"> 
            <SearchBar 
              initialTipo={tipo} 
              initialMoneda={moneda} 
              initialZonas={listaZonas} 
              initialMin={min} 
              initialMax={max} 
            />
          </div>

          {/* MENÚ DE ORDENAMIENTO */}
          <div className="flex justify-end mb-6 relative z-[90]"> 
            <SortDropdown sort={sort} />
          </div>
        </div>

        {/* GRILLA DE RESULTADOS */}
        <div className="relative z-10">
          {propiedades.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {propiedades.map((prop) => (
                  <PropertyCard key={prop.id} data={prop} />
                ))}
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="mt-20 flex items-center justify-center gap-6">
                  {currentPage > 1 && (
                    <Link href={getUrlWithParams({ page: currentPage - 1 })} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all">
                      <ChevronLeft size={20} /> Anterior
                    </Link>
                  )}
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Página {currentPage} / {totalPages}</span>
                  {currentPage < totalPages && (
                    <Link href={getUrlWithParams({ page: currentPage + 1 })} className="px-6 py-3 bg-blue-600 border border-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 shadow-lg flex items-center gap-2 transition-all">
                      Siguiente <ChevronRight size={20} />
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-inner">
              <SearchIcon size={80} className="mx-auto text-slate-100 mb-6" />
              <h2 className="text-2xl font-bold text-slate-800">No hay resultados</h2>
              <p className="text-slate-400 mt-2">Intentá ajustando los filtros en el buscador de arriba.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}