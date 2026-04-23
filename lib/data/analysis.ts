import { supabase } from "@/lib/supabase";

export type RegionKey = "all" | "CABA" | "GBA Norte" | "GBA Sur" | "GBA Oeste";
export type CurrencyKey = "all" | "Pesos" | "Dolares";
export type PropertyType = "Departamento" | "Casa" | "PH";
export type RoomBucket = "1" | "2" | "3" | "4" | "5+";
export type PriceMode = "ARS" | Exclude<CurrencyKey, "all">;
type AmenityLabel = "Balcon" | "Pileta" | "Cochera" | "Patio" | "Seguridad";
export type ZoneProfile = "mono-tipo" | "bi-tipo" | "multi-tipo";
type CoverageSummary = { count: number; percentage: number };

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

type CurrencySummaryRow = {
  moneda_origen: "Pesos" | "Dolares";
  cantidad: number | string;
  valor_tipico_moneda_original: number | string | null;
};

type ExpensesZoneRow = {
  zona: string;
  cantidad_con_expensas: number | string;
  precio_publicado_tipico: number | string | null;
  costo_real_tipico: number | string | null;
  gap_pct: number | string | null;
};

type AgeRow = {
  antiguedad_categoria: string;
  cantidad: number | string;
  valor_tipico_ars: number | string | null;
};

type CoverageRow = {
  total_avisos: number | string;
  avisos_con_expensas: number | string;
  avisos_con_m2: number | string;
  avisos_con_orientacion: number | string;
  avisos_con_mascotas_definidas: number | string;
  avisos_sin_antiguedad: number | string;
};

type M2ZonesRow = {
  zona: string;
  cantidad: number | string;
  valor_tipico_m2: number | string | null;
};

type M2ZoneTypeRow = {
  zona: string;
  tipo: string;
  cantidad: number | string;
  valor_tipico_m2: number | string | null;
};

type M2TypesRow = {
  tipo: string;
  cantidad: number | string;
  valor_tipico_m2: number | string | null;
};

const PRESENCE_MIN_ZONE_SAMPLE = 10;
const PROFILE_MIN_TYPE_SAMPLE = 5;
const COMPARISON_MIN_VALID_TYPES = 2;
const ROOMS_MIN_SAMPLE = 4;
const TYPE_MIN_SAMPLE = 4;
const AMENITY_MIN_SAMPLE = 5;
const EXPENSES_MIN_ZONE_SAMPLE = 20;
const AGE_MIN_SAMPLE = 5;
const ROOM_BUCKETS: RoomBucket[] = ["1", "2", "3", "4", "5+"];
const PROPERTY_TYPES: PropertyType[] = ["Departamento", "PH", "Casa"];
const AMENITIES: AmenityLabel[] = ["Balcon", "Pileta", "Cochera", "Patio", "Seguridad"];
const AGE_CATEGORY_ORDER = [
  "A estrenar",
  "Hasta 5 años",
  "6 a 10 años",
  "11 a 20 años",
  "21 a 50 años",
  "Más de 50 años",
] as const;

function formatCompactCurrency(value: number, currencyMode: PriceMode | "Pesos" | "Dolares") {
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

function getZoneProfile(validTypeCount: number): ZoneProfile {
  if (validTypeCount >= 3) return "multi-tipo";
  if (validTypeCount >= 2) return "bi-tipo";
  return "mono-tipo";
}

function getPercentage(part: number, total: number) {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

function buildZoneDatasets(
  zoneRows: Array<{ zona: string; cantidad: number | string; valor_tipico: number | string | null }>,
  zoneTypeRows: Array<{ zona: string; tipo: string; cantidad: number | string; valor_tipico: number | string | null }>
) {
  const zoneBuckets = new Map<
    string,
    {
      byType: Record<PropertyType, { count: number; value: number | null }>;
      totalProps: number;
      globalMedian: number | null;
    }
  >();

  zoneRows.forEach((row) => {
    const zoneName = row.zona?.trim();
    if (!zoneName || !isComparableZone(zoneName)) return;

    zoneBuckets.set(zoneName, {
      byType: zoneBuckets.get(zoneName)?.byType ?? {
        Departamento: { count: 0, value: null },
        PH: { count: 0, value: null },
        Casa: { count: 0, value: null },
      },
      totalProps: toNumber(row.cantidad) ?? 0,
      globalMedian: toNumber(row.valor_tipico),
    });
  });

  zoneTypeRows.forEach((row) => {
    const zoneName = row.zona?.trim();
    const propertyType = normalizePropertyType(row.tipo);
    if (!zoneName || !propertyType || !isComparableZone(zoneName)) return;

    const bucket = zoneBuckets.get(zoneName) ?? {
      byType: {
        Departamento: { count: 0, value: null },
        PH: { count: 0, value: null },
        Casa: { count: 0, value: null },
      },
      totalProps: 0,
      globalMedian: null,
    };

    bucket.byType[propertyType] = {
      count: toNumber(row.cantidad) ?? 0,
      value: toNumber(row.valor_tipico),
    };

    zoneBuckets.set(zoneName, bucket);
  });

  const presenceZoneData = [...zoneBuckets.entries()]
    .map(([name, bucket]) => {
      const departamentoCount = bucket.byType.Departamento.count;
      const phCount = bucket.byType.PH.count;
      const casaCount = bucket.byType.Casa.count;
      const validTypeCount = [departamentoCount, phCount, casaCount].filter(
        (count) => count >= PROFILE_MIN_TYPE_SAMPLE
      ).length;

      return {
        name,
        shortName: abbreviateZone(name),
        Departamento:
          departamentoCount >= PROFILE_MIN_TYPE_SAMPLE ? bucket.byType.Departamento.value : null,
        PH: phCount >= PROFILE_MIN_TYPE_SAMPLE ? bucket.byType.PH.value : null,
        Casa: casaCount >= PROFILE_MIN_TYPE_SAMPLE ? bucket.byType.Casa.value : null,
        departamentoCount,
        phCount,
        casaCount,
        totalProps: bucket.totalProps,
        globalMedian: bucket.globalMedian,
        validTypeCount,
        profile: getZoneProfile(Math.max(validTypeCount, 1)),
      };
    })
    .filter(
      (zone) =>
        zone.totalProps >= PRESENCE_MIN_ZONE_SAMPLE &&
        zone.globalMedian !== null &&
        zone.validTypeCount >= 1
    );

  return {
    presenceZoneData,
    comparisonZoneChartData: presenceZoneData.filter(
      (zone) => zone.validTypeCount >= COMPARISON_MIN_VALID_TYPES
    ),
  };
}

export async function getAnalysisDashboard(
  region: RegionKey,
  moneda: CurrencyKey,
  priceMode: PriceMode
) {
  const regionScope = region === "all" ? "all" : region;
  const currencyScope = moneda === "all" ? "all" : moneda;

  const [
    { data: summary, error: summaryError },
    { data: zoneRows, error: zonesError },
    { data: zoneTypeRows, error: zoneTypeError },
    { data: roomRows, error: roomsError },
    { data: typeRows, error: typesError },
    { data: amenityRows, error: amenitiesError },
    { data: currencyRows, error: currencyError },
    { data: coverageRow, error: coverageError },
    { data: expenseRows, error: expenseError },
    { data: ageRows, error: ageError },
    { data: sqmZoneRows, error: sqmZoneError },
    { data: sqmZoneTypeRows, error: sqmZoneTypeError },
    { data: sqmTypeRows, error: sqmTypeError },
  ] = await Promise.all([
    supabase
      .from("mv_analisis_resumen")
      .select("avisos_utiles, valor_tipico_general")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .eq("unidad_precio", priceMode)
      .maybeSingle<SummaryRow>(),
    supabase
      .from("mv_analisis_zonas")
      .select("zona, cantidad, valor_tipico")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .eq("unidad_precio", priceMode)
      .returns<ZonesRow[]>(),
    supabase
      .from("mv_analisis_zona_tipo")
      .select("zona, tipo, cantidad, valor_tipico")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .eq("unidad_precio", priceMode)
      .returns<ZoneTypeRow[]>(),
    supabase
      .from("mv_analisis_ambientes")
      .select("ambientes_bucket, cantidad, valor_tipico")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .eq("unidad_precio", priceMode)
      .returns<RoomsRow[]>(),
    supabase
      .from("mv_analisis_tipos")
      .select("tipo, cantidad, valor_tipico")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .eq("unidad_precio", priceMode)
      .returns<TypesRow[]>(),
    supabase
      .from("mv_analisis_amenities")
      .select("amenity, tiene_amenity, cantidad, valor_tipico")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .eq("unidad_precio", priceMode)
      .returns<AmenitiesRow[]>(),
    supabase
      .from("mv_analisis_resumen_monedas")
      .select("moneda_origen, cantidad, valor_tipico_moneda_original")
      .eq("region_analisis", regionScope)
      .returns<CurrencySummaryRow[]>(),
    supabase
      .from("mv_analisis_cobertura")
      .select(
        "total_avisos, avisos_con_expensas, avisos_con_m2, avisos_con_orientacion, avisos_con_mascotas_definidas, avisos_sin_antiguedad"
      )
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .maybeSingle<CoverageRow>(),
    supabase
      .from("mv_analisis_expensas_zona")
      .select("zona, cantidad_con_expensas, precio_publicado_tipico, costo_real_tipico, gap_pct")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .returns<ExpensesZoneRow[]>(),
    supabase
      .from("mv_analisis_antiguedad")
      .select("antiguedad_categoria, cantidad, valor_tipico_ars")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .returns<AgeRow[]>(),
    supabase
      .from("mv_analisis_zonas_m2")
      .select("zona, cantidad, valor_tipico_m2")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .returns<M2ZonesRow[]>(),
    supabase
      .from("mv_analisis_zona_tipo_m2")
      .select("zona, tipo, cantidad, valor_tipico_m2")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .returns<M2ZoneTypeRow[]>(),
    supabase
      .from("mv_analisis_tipos_m2")
      .select("tipo, cantidad, valor_tipico_m2")
      .eq("region_analisis", regionScope)
      .eq("moneda_analisis", currencyScope)
      .returns<M2TypesRow[]>(),
  ]);

  const errors = [
    summaryError,
    zonesError,
    zoneTypeError,
    roomsError,
    typesError,
    amenitiesError,
    currencyError,
    coverageError,
    expenseError,
    ageError,
    sqmZoneError,
    sqmZoneTypeError,
    sqmTypeError,
  ]
    .filter(Boolean)
    .map((error) => error?.message);

  if (errors.length > 0) {
    throw new Error(`No se pudo cargar el dashboard de analisis. ${errors.join(" | ")}`);
  }

  const usefulListings =
    toNumber(coverageRow?.total_avisos) ?? toNumber(summary?.avisos_utiles) ?? 0;
  const overallMedian = toNumber(summary?.valor_tipico_general);

  const { presenceZoneData: zoneRankingData, comparisonZoneChartData: zoneChartData } =
    buildZoneDatasets(zoneRows ?? [], zoneTypeRows ?? []);

  const { presenceZoneData: sqmZoneRankingData, comparisonZoneChartData: sqmZoneChartData } =
    buildZoneDatasets(
      (sqmZoneRows ?? []).map((row) => ({
        zona: row.zona,
        cantidad: row.cantidad,
        valor_tipico: row.valor_tipico_m2,
      })),
      (sqmZoneTypeRows ?? []).map((row) => ({
        zona: row.zona,
        tipo: row.tipo,
        cantidad: row.cantidad,
        valor_tipico: row.valor_tipico_m2,
      }))
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

  const sqmTypeChartData = PROPERTY_TYPES.map((propertyType) => {
    const match = (sqmTypeRows ?? []).find((row) => row.tipo === propertyType);
    const count = toNumber(match?.cantidad) ?? 0;

    return {
      name: propertyType,
      value: count >= TYPE_MIN_SAMPLE ? toNumber(match?.valor_tipico_m2) : null,
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
            percentage: getPercentage(count, offerTotal),
          };
        }).filter((item) => item.value > 0);

  const amenityMap = new Map<
    AmenityLabel,
    {
      withAmenity: { count: number; value: number | null };
      withoutAmenity: { count: number; value: number | null };
    }
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

  const currencyReferences = (currencyRows ?? [])
    .filter((row) => moneda === "all" || row.moneda_origen === moneda)
    .map((row) => {
      const count = toNumber(row.cantidad) ?? 0;
      const median = toNumber(row.valor_tipico_moneda_original);

      if (count === 0 || median === null) return null;

      return {
        currency: row.moneda_origen,
        median,
        count,
        share: getPercentage(count, usefulListings),
      };
    })
    .filter(
      (item): item is {
        currency: "Pesos" | "Dolares";
        median: number;
        count: number;
        share: number;
      } => item !== null
    );

  const expenseCoverage: CoverageSummary = {
    count: toNumber(coverageRow?.avisos_con_expensas) ?? 0,
    percentage: getPercentage(
      toNumber(coverageRow?.avisos_con_expensas) ?? 0,
      usefulListings
    ),
  };

  const priceVsCostData = (expenseRows ?? [])
    .map((row) => ({
      name: row.zona,
      shortName: abbreviateZone(row.zona),
      publishedMedian: toNumber(row.precio_publicado_tipico),
      totalMedian: toNumber(row.costo_real_tipico),
      gapValue:
        toNumber(row.costo_real_tipico) !== null && toNumber(row.precio_publicado_tipico) !== null
          ? (toNumber(row.costo_real_tipico) ?? 0) - (toNumber(row.precio_publicado_tipico) ?? 0)
          : null,
      gapPercentage: toNumber(row.gap_pct),
      count: toNumber(row.cantidad_con_expensas) ?? 0,
    }))
    .filter(
      (item) =>
        item.count >= EXPENSES_MIN_ZONE_SAMPLE &&
        item.publishedMedian !== null &&
        item.totalMedian !== null
    )
    .sort((a, b) => (b.gapPercentage ?? 0) - (a.gapPercentage ?? 0));

  const ageChartData = (ageRows ?? [])
    .map((row) => ({
      name: row.antiguedad_categoria,
      value: toNumber(row.valor_tipico_ars),
      count: toNumber(row.cantidad) ?? 0,
      orderIndex: AGE_CATEGORY_ORDER.indexOf(row.antiguedad_categoria as (typeof AGE_CATEGORY_ORDER)[number]),
    }))
    .filter(
      (item) =>
        item.name !== "Sin dato" && item.count >= AGE_MIN_SAMPLE && item.value !== null
    )
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const missingAgeCount = toNumber(coverageRow?.avisos_sin_antiguedad) ?? 0;
  const ageCoverage = {
    missingCount: missingAgeCount,
    missingPercentage: getPercentage(missingAgeCount, usefulListings),
    declaredCount: usefulListings - missingAgeCount,
    declaredPercentage: getPercentage(usefulListings - missingAgeCount, usefulListings),
  };

  const sqmCoverage: CoverageSummary = {
    count: toNumber(coverageRow?.avisos_con_m2) ?? 0,
    percentage: getPercentage(toNumber(coverageRow?.avisos_con_m2) ?? 0, usefulListings),
  };

  const petsCoverage: CoverageSummary = {
    count: toNumber(coverageRow?.avisos_con_mascotas_definidas) ?? 0,
    percentage: getPercentage(
      toNumber(coverageRow?.avisos_con_mascotas_definidas) ?? 0,
      usefulListings
    ),
  };

  const orientationCoverage: CoverageSummary = {
    count: toNumber(coverageRow?.avisos_con_orientacion) ?? 0,
    percentage: getPercentage(
      toNumber(coverageRow?.avisos_con_orientacion) ?? 0,
      usefulListings
    ),
  };

  const mostExpensiveZone =
    zoneRankingData
      .map((zone) => ({
        zone: zone.name,
        value: zone.globalMedian,
        profile: zone.profile,
      }))
      .filter(
        (item): item is { zone: string; value: number; profile: ZoneProfile } =>
          item.value !== null
      )
      .sort((a, b) => b.value - a.value)[0] ?? null;

  const presenceTypeTotals = PROPERTY_TYPES.reduce<Record<PropertyType, number>>(
    (acc, propertyType) => {
      acc[propertyType] = zoneRankingData.reduce((sum, zone) => {
        if (propertyType === "Departamento") return sum + zone.departamentoCount;
        if (propertyType === "PH") return sum + zone.phCount;
        return sum + zone.casaCount;
      }, 0);
      return acc;
    },
    {
      Departamento: 0,
      PH: 0,
      Casa: 0,
    }
  );

  const mostOfferedType =
    PROPERTY_TYPES.map((propertyType) => [
      propertyType,
      presenceTypeTotals[propertyType],
    ] as const).sort((a, b) => b[1] - a[1])[0] ?? null;

  const strongestAmenityGap =
    amenitiesChartData
      .map((item) => {
        if (item.conAmenity === null || item.sinAmenity === null) return null;

        return {
          name: item.name,
          gap: item.conAmenity - item.sinAmenity,
        };
      })
      .filter((item): item is { name: AmenityLabel; gap: number } => item !== null)
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0] ?? null;

  const insights: AnalysisInsight[] = [];

  if (mostExpensiveZone) {
    insights.push({
      eyebrow: "Zona lider",
      title: `${mostExpensiveZone.zone} marca la referencia mas alta del recorte`,
      description: `Dentro de las zonas con presencia suficiente, hoy encabeza la lectura con un valor tipico de ${formatCompactCurrency(mostExpensiveZone.value, priceMode)} y perfil ${mostExpensiveZone.profile}.`,
    });
  }

  if (mostOfferedType && usefulListings > 0) {
    const share = getPercentage(mostOfferedType[1], usefulListings);

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
    const direction = strongestAmenityGap.gap >= 0 ? "eleva" : "recorta";

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
    currencyReferences,
    zoneRankingData,
    zoneChartData,
    sqmZoneRankingData,
    sqmZoneChartData,
    roomsChartData,
    typeChartData,
    sqmTypeChartData,
    amenitiesChartData,
    offerDistributionData,
    priceVsCostData,
    expenseCoverage,
    ageChartData,
    ageCoverage,
    sqmCoverage,
    petsCoverage,
    orientationCoverage,
    mostExpensiveZone,
    mostOfferedType,
    dominantTypeShare:
      mostOfferedType && usefulListings > 0 ? getPercentage(mostOfferedType[1], usefulListings) : null,
    insights,
  };
}
