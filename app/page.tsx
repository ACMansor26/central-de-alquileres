import Link from "next/link";
import { Loader2 } from "lucide-react";
import PropertyCard from "@/components/propiedades/PropertyCard";
import SearchBar from "@/components/ui/SearchBar";
import { supabase } from "@/lib/supabase";

const FEATURED_TYPES = ["Departamento", "Casa", "Ph"] as const;
const FEATURED_CANDIDATES_PER_TYPE = 18;
const FEATURED_ITEMS_PER_TYPE = 2;

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

interface FeaturedCandidate extends FeaturedProperty {
  qualityScore: number;
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

function normalizeText(value?: string | null) {
  return (
    value
      ?.normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim() ?? ""
  );
}

function isInformativeAddress(value?: string | null) {
  const normalized = normalizeText(value);

  return Boolean(
    normalized &&
      normalized !== "direccion no informada" &&
      normalized !== "sin direccion" &&
      normalized !== "no informada"
  );
}

function isFiniteValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) return false;

  return Number.isFinite(Number(value));
}

function getDedupeKey(row: FeaturedPropertyRow) {
  const normalizedUrl = row.URL?.trim().toLowerCase();
  if (normalizedUrl) return `url:${normalizedUrl}`;

  return [
    normalizeText(row.Tipo),
    normalizeText(row.zona),
    normalizeText(row.Direccion),
  ].join("|");
}

function buildQualityScore(row: FeaturedPropertyRow) {
  const amenityScore = row.amenity_score ?? 0;
  const metros = isFiniteValue(row.Metros) ? Number(row.Metros) : 0;
  const ambientes = row.ambientes ?? 0;
  const amenityFlags = [
    row.tiene_cochera,
    row.tiene_pileta,
    row.tiene_seguridad,
    row.tiene_patio,
    row.tiene_balcon,
  ].filter(Boolean).length;

  return (
    amenityScore * 10 +
    Math.min(metros, 220) / 12 +
    Math.min(ambientes, 6) * 1.5 +
    amenityFlags * 1.5 +
    (isFiniteValue(row.expensas_num) ? 2 : 0) +
    (row.orientacion?.trim() ? 1 : 0) +
    (row.antiguedad_anios !== null && row.antiguedad_anios !== undefined ? 1 : 0) +
    ((row.id_publicacion ? Number(row.id_publicacion) : 0) % 1000) / 1000
  );
}

function isFeaturedCandidate(row: FeaturedPropertyRow) {
  return (
    Boolean(row.id_publicacion) &&
    Boolean(row.URL?.trim()) &&
    Boolean(row.imagen_url?.trim()) &&
    Boolean(row.zona?.trim()) &&
    isInformativeAddress(row.Direccion) &&
    isFiniteValue(row.Metros) &&
    Number(row.Metros) > 0 &&
    isFiniteValue(row.precio_alquiler) &&
    Number(row.precio_alquiler) > 0
  );
}

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

async function getFeaturedByType(tipo: (typeof FEATURED_TYPES)[number]) {
  const { data, error } = await supabase
    .from("vista_propiedades_front")
    .select(FEATURED_PROPERTY_SELECT)
    .ilike("Tipo", tipo)
    .not("URL", "is", null)
    .not("imagen_url", "is", null)
    .order("amenity_score", { ascending: false, nullsFirst: false })
    .order("id_publicacion", { ascending: false })
    .limit(FEATURED_CANDIDATES_PER_TYPE);

  if (error) {
    console.error(`Error cargando ${tipo}:`, error);
    return [];
  }

  const seen = new Set<string>();
  const featuredCandidates: FeaturedCandidate[] = [];

  for (const row of (data ?? []) as FeaturedPropertyRow[]) {
    if (!isFeaturedCandidate(row)) continue;

    const dedupeKey = getDedupeKey(row);
    if (!dedupeKey || seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    featuredCandidates.push({
      ...mapFeaturedProperty(row),
      qualityScore: buildQualityScore(row),
    });
  }

  return featuredCandidates
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, FEATURED_ITEMS_PER_TYPE);
}

async function getFeaturedProperties(): Promise<FeaturedProperty[]> {
  const featuredByType = await Promise.all(FEATURED_TYPES.map((tipo) => getFeaturedByType(tipo)));
  return featuredByType.flat();
}

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
