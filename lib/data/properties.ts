import { supabase } from "@/lib/supabase";

export interface PropertyCardData {
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

interface PropertyListRow {
  id_publicacion: string | number | null;
  Direccion: string | null;
  zona: string | null;
  precio_alquiler: number | null;
  moneda_alquiler: string | null;
  expensas_num: number | null;
  Tipo: string | null;
  Metros: number | string | null;
  ambientes: number | null;
  orientacion?: string | null;
  amenity_score?: number | null;
  antiguedad_anios: number | null;
  tiene_cochera: boolean | null;
  tiene_pileta: boolean | null;
  tiene_seguridad: boolean | null;
  tiene_patio: boolean | null;
  tiene_balcon: boolean | null;
  politica_mascotas?: string | null;
  URL: string | null;
  imagen_url: string | null;
}

type FeaturedPropertyRow = Required<
  Pick<
    PropertyListRow,
    | "id_publicacion"
    | "Direccion"
    | "zona"
    | "precio_alquiler"
    | "moneda_alquiler"
    | "expensas_num"
    | "Tipo"
    | "Metros"
    | "ambientes"
    | "orientacion"
    | "amenity_score"
    | "antiguedad_anios"
    | "tiene_cochera"
    | "tiene_pileta"
    | "tiene_seguridad"
    | "tiene_patio"
    | "tiene_balcon"
    | "URL"
    | "imagen_url"
  >
> &
  Partial<Pick<PropertyListRow, "politica_mascotas">>;

export interface SearchPageData {
  properties: PropertyCardData[];
  hasNextPage: boolean;
  visiblePages: number[];
}

export interface SearchFilters {
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
}

const FEATURED_TYPES = ["Departamento", "Casa", "Ph"] as const;
const FEATURED_CANDIDATES_PER_TYPE = 18;
const FEATURED_ITEMS_PER_TYPE = 2;
const PAGE_SIZE = 20;

const BASE_PROPERTY_SELECT = `
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

const FEATURED_PROPERTY_SELECT = `
  ${BASE_PROPERTY_SELECT},
  orientacion,
  amenity_score,
  politica_mascotas
`;

function parsePositiveInt(value?: string) {
  if (!value) return undefined;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : undefined;
}

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

function mapPropertyCardData(row: PropertyListRow): PropertyCardData {
  return {
    id: row.id_publicacion?.toString() ?? `${row.Tipo ?? "prop"}-${row.Direccion ?? "sin-id"}`,
    direccion: row.Direccion ?? "Direccion no informada",
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
    politicaMascotas: row.politica_mascotas ?? undefined,
    url: row.URL ?? "",
    imagen_url: row.imagen_url,
  };
}

async function getFeaturedByType(tipo: (typeof FEATURED_TYPES)[number]) {
  const { data, error } = await supabase
    .from("mv_propiedades_listas")
    .select(FEATURED_PROPERTY_SELECT)
    .ilike("Tipo", tipo)
    .not("URL", "is", null)
    .not("imagen_url", "is", null)
    .order("amenity_score", { ascending: false, nullsFirst: false })
    .order("id_publicacion", { ascending: false })
    .limit(FEATURED_CANDIDATES_PER_TYPE);

  if (error) {
    throw new Error(`No se pudieron cargar destacadas para ${tipo}.`);
  }

  const seen = new Set<string>();
  const featuredCandidates: Array<PropertyCardData & { qualityScore: number }> = [];

  for (const row of (data ?? []) as FeaturedPropertyRow[]) {
    if (!isFeaturedCandidate(row)) continue;

    const dedupeKey = getDedupeKey(row);
    if (!dedupeKey || seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    featuredCandidates.push({
      ...mapPropertyCardData(row),
      qualityScore: buildQualityScore(row),
    });
  }

  return featuredCandidates
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, FEATURED_ITEMS_PER_TYPE);
}

function getVisiblePages(currentPage: number, hasNextPage: boolean) {
  const firstPage = Math.max(1, currentPage - 1);
  const lastPage = currentPage + (hasNextPage ? 1 : 0);
  const pages: number[] = [];

  for (let page = firstPage; page <= lastPage; page += 1) {
    pages.push(page);
  }

  return pages;
}

export async function getFeaturedProperties(): Promise<PropertyCardData[]> {
  const featuredByType = await Promise.all(FEATURED_TYPES.map((tipo) => getFeaturedByType(tipo)));
  return featuredByType.flat();
}

export async function getSearchPageData(filters: SearchFilters): Promise<SearchPageData> {
  const { q, tipo, min, max, page, sort, moneda, minM2, maxM2, ambientes } = filters;

  const currentPage = Math.max(1, parsePositiveInt(page) ?? 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

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

  let resultsQuery = supabase.from("mv_propiedades_listas").select(BASE_PROPERTY_SELECT);

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

  const { data, error } = await resultsQuery.range(from, to);

  if (error) {
    throw new Error("No se pudieron cargar los resultados de busqueda.");
  }

  const rawResults = (data ?? []) as PropertyListRow[];
  const hasNextPage = rawResults.length > PAGE_SIZE;

  return {
    properties: rawResults.slice(0, PAGE_SIZE).map(mapPropertyCardData),
    hasNextPage,
    visiblePages: getVisiblePages(currentPage, hasNextPage),
  };
}
