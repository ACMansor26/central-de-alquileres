"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PropertyCard from "@/components/propiedades/PropertyCard";
import { supabase } from "@/lib/supabase";
import SearchBar from "@/components/ui/SearchBar";

export default function Home() {
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      
      const getMejoresPorTipo = async (tipo: string) => {
        const { data, error } = await supabase
          .from('vista_propiedades_front')
          .select('*')
          .ilike('Tipo', tipo)
          .not('Metros', 'is', null)
          .gt('Metros', 0)
          .order('amenity_score', { ascending: false, nullsFirst: false })
          .order('id_publicacion', { ascending: false }) 
          .limit(2);
          
        if (error) console.error(`Error cargando ${tipo}:`, error);
        return data || [];
      };

      const [deptos, casas, phs] = await Promise.all([
        getMejoresPorTipo('Departamento'),
        getMejoresPorTipo('Casa'),
        getMejoresPorTipo('Ph') 
      ]);

      const destacadasRaw = [...deptos, ...casas, ...phs];

      if (destacadasRaw.length > 0) {
        setPropiedades(destacadasRaw.map((p: any) => ({
          id: p.id_publicacion?.toString(),
          direccion: p.Direccion,
          zona: p.zona,
          precio: p.precio_alquiler,
          moneda: p.moneda_alquiler,
          expensas: p.expensas_num,
          tipo: p.Tipo,
          metros: Number(p.Metros) || 0,
          ambientes: p.ambientes,
          orientacion: p.orientacion,
          amenityScore: p.amenity_score,
          antiguedad_anios: p.antiguedad_anios,
          tieneCochera: p.tiene_cochera,
          tienePileta: p.tiene_pileta,
          tieneSeguridad: p.tiene_seguridad,
          tienePatio: p.tiene_patio,
          tieneBalcon: p.tiene_balcon,
          url: p.URL,
          politicaMascotas: p.politica_mascotas,
          imagen_url: p.imagen_url
        })));
      }
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 px-4 pt-20 pb-16">
        
        {/* Decoración abstracta de fondo - contenida en su propio wrapper */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full -z-0"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-rose-500/10 blur-[100px] rounded-full -z-0"></div>
        </div>

        <div className="relative z-20 text-center w-full max-w-4xl mx-auto flex flex-col items-center mt-10">
          
          <span className="mb-6 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black tracking-widest uppercase rounded-full shadow-lg shadow-indigo-500/5">
            ALQUILAR NO TIENE QUE SER UN ESTRÉS
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            Todas las propiedades<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              en un solo lugar
            </span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl font-medium mb-12 max-w-2xl">
            Comparamos la oferta inmobiliaria por vos para que solo te preocupes por armar las cajas de la mudanza.
          </p>

          {/* El SearchBar envuelto en Glassmorphism */}
          <div className="w-full max-w-4xl mx-auto bg-white/10 p-2 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-2xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* SECCIÓN DE DESTACADOS */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Propiedades destacadas</h2>
              <p className="text-slate-500 mt-2 font-medium text-lg">La mejor relación calidad-comodidades del mercado.</p>
            </div>
            <Link href="/buscar" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95">
              Ver todo el listado →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">Calculando ranking de propiedades...</span>
              </div>
            ) : (
              propiedades.map(p => <PropertyCard key={p.id} data={p} />)
            )}
          </div>
        </div>
      </section>
    </main>
  );
}