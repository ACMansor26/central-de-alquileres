import Link from "next/link";
import { Loader2 } from "lucide-react";
import PropertyCard from "@/components/propiedades/PropertyCard";
import { supabase } from "@/lib/supabase";
import SearchBar from "@/components/ui/SearchBar";

interface FeaturedProperty {
  id: string;
  direccion: string;
  zona: string;
  precio: number;
  moneda: string;
  expensas?: number | null;
  tipo: string;
  metros: number;
  ambientes?: number;
  orientacion?: string;
  amenityScore?: number;
  antiguedad_anios?: number;
  tieneCochera: boolean;
  tienePileta: boolean;
  tieneSeguridad: boolean;
  tienePatio?: boolean;
  tieneBalcon?: boolean;
  politicaMascotas?: string;
  url: string;
  imagen_url: string | null;
}

interface FeaturedPropertyRow {
  id_publicacion: string | number | null;
  Direccion: string | null;
  zona: string | null;
  precio_alquiler: number | null;
  moneda_alquiler: string | null;
  expensas_num: number | null;
  Tipo: string | null;
  Metros: number | string | null;
  ambientes: number | null;
  orientacion: string | null;
  amenity_score: number | null;
  antiguedad_anios: number | null;
  tiene_cochera: boolean | null;
  tiene_pileta: boolean | null;
  tiene_seguridad: boolean | null;
  tiene_patio: boolean | null;
  tiene_balcon: boolean | null;
  URL: string | null;
  imagen_url: string | null;
}

const FEATURED_PROPERTY_SELECT = `
  id_publicacion,
  Direccion,
  zona,
  precio_alquiler,
  moneda_alquiler,
  expensas_num,
  Tipo,
  Metros,
  ambientes,
  orientacion,
  amenity_score,
  antiguedad_anios,
  tiene_cochera,
  tiene_pileta,
  tiene_seguridad,
  tiene_patio,
  tiene_balcon,
  URL,
  imagen_url
`;

function mapFeaturedProperty(row: FeaturedPropertyRow): FeaturedProperty {
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
    orientacion: row.orientacion ?? undefined,
    amenityScore: row.amenity_score ?? undefined,
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

async function getFeaturedProperties(): Promise<FeaturedProperty[]> {
  const getBestByType = async (tipo: string) => {
    const { data, error } = await supabase
      .from("vista_propiedades_front")
      .select(FEATURED_PROPERTY_SELECT)
      .ilike("Tipo", tipo)
      .not("Metros", "is", null)
      .gt("Metros", 0)
      .order("amenity_score", { ascending: false, nullsFirst: false })
      .order("id_publicacion", { ascending: false })
      .limit(2);

    if (error) {
      console.error(`Error cargando ${tipo}:`, error);
      return [];
    }

    return (data ?? []) as FeaturedPropertyRow[];
  };

  const [deptos, casas, phs] = await Promise.all([
    getBestByType("Departamento"),
    getBestByType("Casa"),
    getBestByType("Ph"),
  ]);

  return [...deptos, ...casas, ...phs].map(mapFeaturedProperty);
}

export default async function Home() {
  const propiedades = await getFeaturedProperties();

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <section className="relative flex min-h-[70vh] w-full flex-col items-center justify-center bg-zinc-950 px-4 pb-16 pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -z-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 -z-0 h-[300px] w-[400px] rounded-full bg-rose-500/10 blur-[100px]" />
        </div>

        <div className="relative z-20 mt-10 flex w-full max-w-4xl flex-col items-center text-center">
          <span className="mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-400 shadow-lg shadow-indigo-500/5">
            ALQUILAR NO TIENE QUE SER UN ESTRÉS
          </span>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-7xl">
            Todas las propiedades
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              en un solo lugar
            </span>
          </h1>

          <p className="mb-12 max-w-2xl text-lg font-medium text-zinc-400 md:text-xl">
            Comparamos la oferta inmobiliaria por vos para que solo te preocupes por
            armar las cajas de la mudanza.
          </p>

          <div className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="relative z-0 w-full px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Propiedades destacadas
              </h2>
              <p className="mt-2 text-lg font-medium text-slate-500">
                La mejor relación calidad-comodidades del mercado.
              </p>
            </div>
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            >
              Ver todo el listado →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {propiedades.length > 0 ? (
              propiedades.map((propiedad) => (
                <PropertyCard key={propiedad.id} data={propiedad} />
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 bg-white py-32">
                <Loader2 className="mb-4 text-indigo-600" size={48} />
                <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
                  No pudimos cargar propiedades destacadas.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
