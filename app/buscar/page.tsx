import SearchBar from "@/components/ui/SearchBar";
import PropertyCard from "@/components/propiedades/PropertyCard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search as SearchIcon, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown 
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
  }>;
}

export default async function BuscarPage({ searchParams }: SearchProps) {
  const sParams = await searchParams;
  const { q, tipo, min, max, page, sort, moneda } = sParams;
  
  const pageSize = 20;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const listaZonas = q ? q.split(",") : [];

  let query = supabase.from('mv_propiedades_listas').select('*', { count: 'exact' });

  // Filtros Básicos
  if (tipo) query = query.eq('tipo', tipo);
  if (moneda) query = query.eq('moneda_alquiler', moneda);
  if (min) query = query.gte('precio_alquiler', parseInt(min));
  if (max) query = query.lte('precio_alquiler', parseInt(max));

  if (listaZonas.length > 0) {
    const orString = listaZonas.map(z => `zona.ilike.%${z}%`).join(',');
    query = query.or(orString);
  }

  // Ordenamiento
  if (sort === "precio_asc") query = query.order('precio_alquiler', { ascending: true });
  else if (sort === "precio_desc") query = query.order('precio_alquiler', { ascending: false });
  else query = query.order('id_propiedad', { ascending: false });

  // Paginación
  query = query.range(from, to);

  const { data: resultados, count } = await query;
  const totalPages = Math.ceil((count || 0) / pageSize);

  const propiedades = resultados?.map((p: any) => ({
    id: p.id_propiedad.toString(),
    direccion: p.direccion,
    zona: p.zona,
    precio: p.precio_alquiler,
    moneda: p.moneda_alquiler,
    expensas: p.expensas_num,
    tipo: p.tipo,
    metros: p.metros_totales,
    tieneCochera: p.tiene_cochera,
    tienePileta: p.tiene_pileta,
    tieneSeguridad: p.tiene_seguridad,
    url: p.url_publicacion,
    imagen_url: p.imagen_url,
  })) || [];

  const getUrlWithParams = (newParams: Record<string, string | number | undefined>) => {
    const nextParams = new URLSearchParams();
    if (q) nextParams.append("q", q);
    if (tipo) nextParams.append("tipo", tipo);
    if (moneda) nextParams.append("moneda", moneda);
    if (min) nextParams.append("min", min);
    if (max) nextParams.append("max", max);
    if (sort && !newParams.sort) nextParams.append("sort", sort);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) nextParams.set(key, value.toString());
      else if (value === undefined) nextParams.delete(key);
    });
    return `/buscar?${nextParams.toString()}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO Y BUSCADOR MODULAR */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6 pt-24">
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al inicio
            </Link>
            <span className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              {count} {count === 1 ? 'Resultado' : 'Resultados'}
            </span>
          </div>

          {/* BUSCADOR PRE-LLENADO */}
          <div className="w-full mb-10 relative z-20">
            <SearchBar 
              initialTipo={tipo} 
              initialMoneda={moneda} 
              initialZonas={listaZonas} 
              initialMin={min} 
              initialMax={max} 
            />
          </div>

          {/* MENÚ DE ORDENAMIENTO (HOVER PURE CSS) */}
          <div className="flex justify-end mb-6">
            <div className="relative group self-start md:self-end z-10">
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold shadow-sm cursor-pointer group-hover:border-blue-400 transition-all">
                <Filter size={16} className="text-slate-400" />
                <span>Ordenar por: <span className="text-blue-600">
                  {sort === "precio_asc" ? "Menor Precio" : sort === "precio_desc" ? "Mayor Precio" : "Recientes"}
                </span></span>
                <ChevronDown size={14} className="ml-1 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
              </div>
              
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden hidden group-hover:block animate-in fade-in zoom-in duration-200">
                <Link href={getUrlWithParams({ sort: undefined, page: 1 })} className="block px-5 py-4 text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-medium border-b border-slate-50 transition-colors">Más recientes</Link>
                <Link href={getUrlWithParams({ sort: "precio_asc", page: 1 })} className="block px-5 py-4 text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-medium border-b border-slate-50 transition-colors">Menor precio</Link>
                <Link href={getUrlWithParams({ sort: "precio_desc", page: 1 })} className="block px-5 py-4 text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors">Mayor precio</Link>
              </div>
            </div>
          </div>
        </div>

        {/* GRILLA DE RESULTADOS */}
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
    </main>
  );
}