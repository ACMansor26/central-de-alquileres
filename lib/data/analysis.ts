import { supabase } from "@/lib/supabase";

export type RegionKey = "all" | "CABA" | "GBA Norte" | "GBA Sur" | "GBA Oeste";
export type CurrencyKey = "all" | "Pesos" | "Dolares";
export type PropertyType = "Departamento" | "Casa" | "PH";
export type RoomBucket = "1" | "2" | "3" | "4" | "5+";
export type PriceMode = "ARS" | Exclude<CurrencyKey, "all">;
type AmenityLabel = "Balcon" | "Pileta" | "Cochera" | "Patio" | "Seguridad";

export interface AnalysisInsight {
  eyebrow: string;
  title: string;
  description: string;
}

type SummaryRow = {
  avisos_utiles: number | string;
  valor_tipico_general: number | string | null;
};

type ZoneTypeRow = {
  zona: string;
  tipo: string;
  cantidad: number | string;
  valor_tipico: number | string | null;
};

type ZonesRow = {
  zona: string;
  cantidad: number | string;
  valor_tipico: number | string | null;
};

type RoomsRow = {
  ambientes_bucket: string | null;
  cantidad: number | string;
  valor_tipico: number | string | null;
};

type TypesRow = {
  tipo: string;
  cantidad: number | string;
  valor_tipico: number | string | null;
};

type AmenitiesRow = {
  amenity: string;
  tiene_amenity: boolean;
  cantidad: number | string;
  valor_tipico: number | string | null;
};

const KPI_MIN_ZONE_SAMPLE = 5;
const KPI_MIN_TYPE_SAMPLE = 3;
const ROOMS_MIN_SAMPLE = 4;
const TYPE_MIN_SAMPLE = 4;
const AMENITY_MIN_SAMPLE = 5;
const ROOM_BUCKETS: RoomBucket[] = ["1", "2", "3", "4", "5+"];
const PROPERTY_TYPES: PropertyType[] = ["Departamento", "PH", "Casa"];
const AMENITIES: AmenityLabel[] = ["Balcon", "Pileta", "Cochera", "Patio", "Seguridad"];

function formatCompactCurrency(value: number, currencyMode: PriceMode) {
  if (currencyMode === "Dolares") {
    if (value >= 1_000) {
      return `U$S ${(value / 1_000).toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })} mil`;
    }

    return `U$S ${Math.round(value).toLocaleString("es-AR")}`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })} M`;
  }

  return `$${Math.round(value / 1_000).toLocaleString("es-AR")} mil`;
}

function isComparableZone(zone: string) {
  const normalizedZone = zone.trim().toLowerCase();

  return !["otro", "otros", "otra", "otras", "sin zona", "zona no informada"].includes(
    normalizedZone
  );
}

function abbreviateZone(zone: string) {
  if (zone.length <= 16) return zone;
  return `${zone.slice(0, 14).trim()}...`;
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePropertyType(tipo: string): PropertyType | null {
  if (tipo === "Departamento" || tipo === "PH" || tipo === "Casa") {
    return tipo;
  }

  return null;
}

function normalizeRoomBucket(bucket: string | null): RoomBucket | null {
  if (bucket === "1" || bucket === "2" || bucket === "3" || bucket === "4" || bucket === "5+") {
    return bucket;
  }

  return null;
}

function normalizeAmenity(amenity: string): AmenityLabel | null {
  if (
    amenity === "Balcon" ||
    amenity === "Pileta" ||
    amenity === "Cochera" ||
    amenity === "Patio" ||
    amenity === "Seguridad"
  ) {
    return amenity;
  }

  return null;
}

export async function getAnalysisDashboard(region: RegionKey, moneda: CurrencyKey, priceMode: PriceMode) {
  const regionScope = region === "all" ? "all" : region;
  const currencyScope = moneda === "all" ? "all" : moneda;

  const summaryQuery = supabase
    .from("mv_analisis_resumen")
    .select("avisos_utiles, valor_tipico_general")
    .eq("region_analisis", regionScope)
    .eq("moneda_analisis", currencyScope)
    .eq("unidad_precio", priceMode)
    .maybeSingle<SummaryRow>();

  const zoneTypeQuery = supabase
    .from("mv_analisis_zona_tipo")
    .select("zona, tipo, cantidad, valor_tipico")
    .eq("region_analisis", regionScope)
    .eq("moneda_analisis", currencyScope)
    .eq("unidad_precio", priceMode)
    .returns<ZoneTypeRow[]>();

  const zonesQuery = supabase
    .from("mv_analisis_zonas")
    .select("zona, cantidad, valor_tipico")
    .eq("region_analisis", regionScope)
    .eq("moneda_analisis", currencyScope)
    .eq("unidad_precio", priceMode)
    .returns<ZonesRow[]>();

  const roomsQuery = supabase
    .from("mv_analisis_ambientes")
    .select("ambientes_bucket, cantidad, valor_tipico")
    .eq("region_analisis", regionScope)
    .eq("moneda_analisis", currencyScope)
    .eq("unidad_precio", priceMode)
    .returns<RoomsRow[]>();

  const typesQuery = supabase
    .from("mv_analisis_tipos")
    .select("tipo, cantidad, valor_tipico")
    .eq("region_analisis", regionScope)
    .eq("moneda_analisis", currencyScope)
    .eq("unidad_precio", priceMode)
    .returns<TypesRow[]>();

  const amenitiesQuery = supabase
    .from("mv_analisis_amenities")
    .select("amenity, tiene_amenity, cantidad, valor_tipico")
    .eq("region_analisis", regionScope)
    .eq("moneda_analisis", currencyScope)
    .eq("unidad_precio", priceMode)
    .returns<AmenitiesRow[]>();

  const [
    { data: summary, error: summaryError },
    { data: zoneRows, error: zonesError },
    { data: zoneTypeRows, error: zoneTypeError },
    { data: roomRows, error: roomsError },
    { data: typeRows, error: typesError },
    { data: amenityRows, error: amenitiesError },
  ] = await Promise.all([
    summaryQuery,
    zonesQuery,
    zoneTypeQuery,
    roomsQuery,
    typesQuery,
    amenitiesQuery,
  ]);

  const errors = [summaryError, zonesError, zoneTypeError, roomsError, typesError, amenitiesError]
    .filter(Boolean)
    .map((error) => error?.message);

  if (errors.length > 0) {
    throw new Error(`No se pudo cargar el dashboard de analisis. ${errors.join(" | ")}`);
  }

  const zoneBuckets = new Map<
    string,
    {
      byType: Record<PropertyType, { count: number; value: number | null }>;
      totalProps: number;
      globalMedian: number | null;
    }
  >();

  (zoneRows ?? []).forEach((row) => {
    const zoneName = row.zona?.trim();
    if (!zoneName || !isComparableZone(zoneName)) return;

    const zoneBucket = zoneBuckets.get(zoneName) ?? {
      byType: {
        Departamento: { count: 0, value: null },
        PH: { count: 0, value: null },
        Casa: { count: 0, value: null },
      },
      totalProps: 0,
      globalMedian: null,
    };

    zoneBucket.totalProps = toNumber(row.cantidad) ?? 0;
    zoneBucket.globalMedian = toNumber(row.valor_tipico);
    zoneBuckets.set(zoneName, zoneBucket);
  });

  (zoneTypeRows ?? []).forEach((row) => {
    const propertyType = normalizePropertyType(row.tipo);
    const zoneName = row.zona?.trim();
    const count = toNumber(row.cantidad) ?? 0;
    const value = toNumber(row.valor_tipico);

    if (!propertyType || !zoneName || !isComparableZone(zoneName)) return;

    const zoneBucket = zoneBuckets.get(zoneName) ?? {
      byType: {
        Departamento: { count: 0, value: null },
        PH: { count: 0, value: null },
        Casa: { count: 0, value: null },
      },
      totalProps: 0,
      globalMedian: null,
    };

    zoneBucket.byType[propertyType] = { count, value };
    zoneBuckets.set(zoneName, zoneBucket);
  });

  const zoneChartData = [...zoneBuckets.entries()]
    .map(([name, bucket]) => {
      const departamentoCount = bucket.byType.Departamento.count;
      const phCount = bucket.byType.PH.count;
      const casaCount = bucket.byType.Casa.count;
      const departamentoMedian =
        departamentoCount >= KPI_MIN_TYPE_SAMPLE ? bucket.byType.Departamento.value : null;
      const phMedian = phCount >= KPI_MIN_TYPE_SAMPLE ? bucket.byType.PH.value : null;
      const casaMedian = casaCount >= KPI_MIN_TYPE_SAMPLE ? bucket.byType.Casa.value : null;

      return {
        name,
        shortName: abbreviateZone(name),
        Departamento: departamentoMedian,
        PH: phMedian,
        Casa: casaMedian,
        departamentoCount,
        phCount,
        casaCount,
        totalProps: bucket.totalProps,
        globalMedian: bucket.globalMedian,
      };
    })
    .filter(
      (zone) =>
        zone.totalProps >= KPI_MIN_ZONE_SAMPLE &&
        zone.globalMedian !== null &&
        [zone.Departamento, zone.PH, zone.Casa].every((value) => value !== null)
    );

  const roomsMap = new Map<RoomBucket, { count: number; value: number | null }>();
  (roomRows ?? []).forEach((row) => {
    const bucket = normalizeRoomBucket(row.ambientes_bucket);
    if (!bucket) return;

    roomsMap.set(bucket, {
      count: toNumber(row.cantidad) ?? 0,
      value: toNumber(row.valor_tipico),
    });
  });

  const roomsChartData = ROOM_BUCKETS.map((bucket) => {
    const roomData = roomsMap.get(bucket);
    const count = roomData?.count ?? 0;

    return {
      name: bucket,
      value: count >= ROOMS_MIN_SAMPLE ? roomData?.value ?? null : null,
      count,
    };
  }).filter((item) => item.count > 0);

  const typesMap = new Map<PropertyType, { count: number; value: number | null }>();
  (typeRows ?? []).forEach((row) => {
    const propertyType = normalizePropertyType(row.tipo);
    if (!propertyType) return;

    typesMap.set(propertyType, {
      count: toNumber(row.cantidad) ?? 0,
      value: toNumber(row.valor_tipico),
    });
  });

  const typeChartData = PROPERTY_TYPES.map((propertyType) => {
    const typeData = typesMap.get(propertyType);
    const count = typeData?.count ?? 0;

    return {
      name: propertyType,
      value: count >= TYPE_MIN_SAMPLE ? typeData?.value ?? null : null,
      count,
    };
  }).filter((item) => item.count > 0);

  const offerTotal = PROPERTY_TYPES.reduce(
    (sum, propertyType) => sum + (typesMap.get(propertyType)?.count ?? 0),
    0
  );

  const offerDistributionData =
    offerTotal === 0
      ? []
      : PROPERTY_TYPES.map((propertyType) => {
          const count = typesMap.get(propertyType)?.count ?? 0;

          return {
            name: propertyType,
            value: count,
            percentage: offerTotal > 0 ? (count / offerTotal) * 100 : 0,
          };
        }).filter((item) => item.value > 0);

  const amenityMap = new Map<
    AmenityLabel,
    { withAmenity: { count: number; value: number | null }; withoutAmenity: { count: number; value: number | null } }
  >();

  (amenityRows ?? []).forEach((row) => {
    const amenity = normalizeAmenity(row.amenity);
    if (!amenity) return;

    const bucket = amenityMap.get(amenity) ?? {
      withAmenity: { count: 0, value: null },
      withoutAmenity: { count: 0, value: null },
    };

    const target = row.tiene_amenity ? bucket.withAmenity : bucket.withoutAmenity;
    target.count = toNumber(row.cantidad) ?? 0;
    target.value = toNumber(row.valor_tipico);

    amenityMap.set(amenity, bucket);
  });

  const amenitiesChartData = AMENITIES.map((amenity) => {
    const amenityData = amenityMap.get(amenity);
    const conCount = amenityData?.withAmenity.count ?? 0;
    const sinCount = amenityData?.withoutAmenity.count ?? 0;

    return {
      name: amenity,
      conAmenity: conCount >= AMENITY_MIN_SAMPLE ? amenityData?.withAmenity.value ?? null : null,
      sinAmenity:
        sinCount >= AMENITY_MIN_SAMPLE ? amenityData?.withoutAmenity.value ?? null : null,
      conCount,
      sinCount,
    };
  }).filter((item) => item.conAmenity !== null || item.sinAmenity !== null);

  const overallMedian = toNumber(summary?.valor_tipico_general);
  const usefulListings = toNumber(summary?.avisos_utiles) ?? offerTotal;

  const mostExpensiveZone =
    zoneChartData
      .map((zone) => ({
        zone: zone.name,
        value: zone.globalMedian,
      }))
      .filter((item): item is { zone: string; value: number } => item.value !== null)
      .sort((a, b) => b.value - a.value)[0] ?? null;

  const mostOfferedType =
    PROPERTY_TYPES.map((propertyType) => [
      propertyType,
      typesMap.get(propertyType)?.count ?? 0,
    ] as const).sort((a, b) => b[1] - a[1])[0] ?? null;

  const strongestAmenityGap =
    amenitiesChartData
      .map((item) => {
        if (item.conAmenity === null || item.sinAmenity === null) return null;

        return {
          name: item.name,
          gap: item.conAmenity - item.sinAmenity,
          conAmenity: item.conAmenity,
          sinAmenity: item.sinAmenity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0] ?? null;

  const insights: AnalysisInsight[] = [];

  if (mostExpensiveZone) {
    insights.push({
      eyebrow: "Zona lider",
      title: `${mostExpensiveZone.zone} marca la referencia mas alta del recorte`,
      description: `Entre las zonas comparables, hoy encabeza la lectura con un valor tipico de ${formatCompactCurrency(mostExpensiveZone.value, priceMode)}.`,
    });
  }

  if (mostOfferedType && offerTotal > 0) {
    const share = (mostOfferedType[1] / offerTotal) * 100;

    insights.push({
      eyebrow: "Oferta dominante",
      title: `${mostOfferedType[0]} concentra la mayor parte de la oferta`,
      description: `Representa el ${share.toLocaleString("es-AR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}% de los avisos activos dentro de este recorte.`,
    });
  }

  if (strongestAmenityGap) {
    const direction =
      strongestAmenityGap.gap >= 0 ? "eleva" : "recorta";

    insights.push({
      eyebrow: "Brecha por amenity",
      title: `${strongestAmenityGap.name} es el diferencial mas marcado`,
      description: `En este recorte, ${strongestAmenityGap.name.toLowerCase()} ${direction} la referencia tipica en ${formatCompactCurrency(
        Math.abs(strongestAmenityGap.gap),
        priceMode
      )} frente a propiedades comparables sin ese atributo.`,
    });
  }

  return {
    overallMedian,
    usefulListings,
    zoneChartData,
    roomsChartData,
    typeChartData,
    amenitiesChartData,
    offerDistributionData,
    mostExpensiveZone,
    mostOfferedType,
    insights,
  };
}
