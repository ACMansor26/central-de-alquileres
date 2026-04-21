import type { Metadata } from "next";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PropertyCard from "@/components/propiedades/PropertyCard";
import SearchBar from "@/components/ui/SearchBar";
import { getFeaturedProperties } from "@/lib/data/properties";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Alquileres en AMBA",
  description:
    "Explora alquileres en AMBA con filtros por zona, precio, metros y tipo de propiedad en una sola plataforma.",
  path: "/",
});

export default async function Home() {
  const propiedades = await getFeaturedProperties();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <section className="relative flex min-h-[65vh] w-full flex-col items-center justify-center px-4 pb-16 pt-20">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 z-0 bg-black/40" />

        <div className="relative z-20 mt-10 flex w-full max-w-4xl flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white drop-shadow-lg md:text-6xl">
            Encontrá tu próximo hogar
          </h1>

          <p className="mb-10 max-w-2xl text-lg font-medium text-white/90 drop-shadow-md md:text-xl">
            Buscá entre miles de propiedades en alquiler en Buenos Aires.
          </p>

          <div className="mx-auto w-full max-w-4xl rounded-xl bg-white p-3 shadow-2xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="relative z-0 w-full bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Propiedades recomendadas para vos
              </h2>
              <p className="mt-1 text-base text-slate-500">
                Una selección destacada con mejor calidad de datos y más variedad por tipo.
              </p>
            </div>
            <Link
              href="/buscar"
              className="font-semibold text-[#006AFF] transition-colors hover:text-blue-800 hover:underline"
            >
              Ver más alquileres
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {propiedades.length > 0 ? (
              propiedades.map((propiedad) => <PropertyCard key={propiedad.id} data={propiedad} />)
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-32">
                <Loader2 className="mb-4 animate-spin text-[#006AFF]" size={48} />
                <span className="text-sm font-semibold text-slate-500">
                  No pudimos cargar propiedades destacadas en este momento.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
