import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PriceByZoneChart from "@/components/analisis/PriceByZoneChart";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Analisis del mercado de alquileres",
  description:
    "Visualiza tendencias, precios y distribucion del mercado de alquileres en AMBA con datos consolidados.",
  path: "/analisis",
});

export default async function AnalisisPage() {
  const { data: propiedades } = await supabase
    .from("vista_analisis_propiedades")
    .select(
      "precio_alquiler_ars, zona, tipo, tiene_balcon, tiene_pileta, tiene_cochera, tiene_patio, tiene_seguridad"
    )
    .not("precio_alquiler_ars", "is", null);

  if (!propiedades) return <div>Cargando datos...</div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <Link href="/" className="group mb-6 inline-flex items-center gap-2 font-bold text-indigo-600 hover:underline">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900 md:text-4xl">
            <TrendingUp className="text-indigo-600" size={36} />
            Análisis del Mercado
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Basado en {propiedades.length.toLocaleString("es-AR")} propiedades en pesos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-indigo-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800">Precio Promedio por Zona</h2>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-600">
                Mercado en Pesos
              </span>
            </div>

            <PriceByZoneChart rawData={propiedades} />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="text-slate-400" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Impacto de Amenities en el Precio</h2>
            </div>
            <div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
              [Gráfico Radar en construcción...]
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <PieChart className="text-slate-400" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Distribución de la Oferta</h2>
            </div>
            <div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
              [Gráfico Donut en construcción...]
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
