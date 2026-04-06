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

  // Lógica de Datos: "Filtro de Hierro" y Cascada
  useEffect(() => {
    const loadInitialData = async () => {
      const getCandidatas = async (t: string, f: string) => {
        const result = await supabase
          .from('mv_propiedades_listas')
          .select(`
            id_propiedad, direccion, zona, precio_alquiler, 
            moneda_alquiler, expensas_num, tipo, metros_totales, 
            tiene_cochera, tiene_pileta, tiene_seguridad, 
            url_publicacion, politica_mascotas, imagen_url
          `)
          .eq('tipo', t)
          .ilike('fuente', f)
          .not('metros_totales', 'is', null)
          .gt('metros_totales', 0)
          .order('id_propiedad', { ascending: false })
          .limit(15);

        return result;
      };

      const consultas = await Promise.all([
        getCandidatas('Departamento', '%zonaprop%'),
        getCandidatas('Departamento', '%argenprop%'),
        getCandidatas('Casa', '%zonaprop%'),
        getCandidatas('Casa', '%argenprop%'),
        getCandidatas('Ph', '%zonaprop%'),
        getCandidatas('Ph', '%argenprop%')
      ]);

      const destacadas = consultas.map(resultado => {
        const candidatas = resultado.data || [];
        
        if (candidatas.length === 0) return null;
        
        let ganadora = candidatas.find(p => 
          p.tiene_cochera === true || 
          p.tiene_pileta === true || 
          p.tiene_seguridad === true ||
          p.politica_mascotas === "Acepta"
        );

        // Si hay ganadora la usamos, sino usamos la primera de la lista
        return ganadora || candidatas[0]; 
      }).filter(Boolean);

      if (destacadas.length > 0) {
        setPropiedades(destacadas.map((p: any) => ({
          id: p.id_propiedad.toString(),
          direccion: p.direccion,
          zona: p.zona,
          precio: p.precio_alquiler,
          moneda: p.moneda_alquiler,
          expensas: p.expensas_num,
          tipo: p.tipo,
          metros: Number(p.metros_totales) || 0,
          tieneCochera: p.tiene_cochera,
          tienePileta: p.tiene_pileta,
          tieneSeguridad: p.tiene_seguridad,
          url: p.url_publicacion,
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
      
      {/* HERO SECTION - ESTILO STARTUP MODERNA */}
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 px-4 pt-20 pb-16">
        
        {/* Decoración abstracta de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none -z-0"></div>

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
              <p className="text-slate-500 mt-2 font-medium text-lg">A lo largo y ancho de todo AMBA.</p>
            </div>
            <Link href="/buscar" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95">
              Ver todo el listado →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">Recolectando datos...</span>
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