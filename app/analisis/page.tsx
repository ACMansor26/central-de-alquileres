import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Home,
  PieChart,
  TrendingUp,
} from "lucide-react";
import AnalysisFilters from "@/components/analisis/AnalysisFilters";
import AmenitiesImpactChart from "@/components/analisis/AmenitiesImpactChart";
import OfferDistributionChart from "@/components/analisis/OfferDistributionChart";
import PriceByRoomsChart from "@/components/analisis/PriceByRoomsChart";
import PriceByTypeChart from "@/components/analisis/PriceByTypeChart";
import PriceByZoneChart from "@/components/analisis/PriceByZoneChart";
import {
  getAnalysisDashboard,
  type CurrencyKey,
  type PriceMode,
  type RegionKey,
} from "@/lib/data/analysis";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 1800;

interface AnalisisPageProps {
  searchParams: Promise<{
    region?: string;
    moneda?: string;
  }>;
}

const REGION_OPTIONS: Array<{ value: RegionKey; label: string }> = [
  { value: "all", label: "AMBA completo" },
  { value: "CABA", label: "CABA" },
  { value: "GBA Norte", label: "GBA Norte" },
  { value: "GBA Sur", label: "GBA Sur" },
  { value: "GBA Oeste", label: "GBA Oeste" },
];

const CURRENCY_OPTIONS: Array<{ value: CurrencyKey; label: string }> = [
  { value: "all", label: "Todas las monedas" },
  { value: "Pesos", label: "Pesos" },
  { value: "Dolares", label: "Dolares" },
];

const REPORT_INSIGHTS = [
  {
    eyebrow: "Estructura del mercado",
    title: "La oferta se segmenta por region, tipo y nivel de gasto total",
    description:
      "El tablero sirve mejor cuando se lee por recortes concretos. CABA, GBA Norte, GBA Sur y GBA Oeste muestran dinamicas distintas en precio y composicion de la oferta.",
  },
  {
    eyebrow: "Costo real de alquilar",
    title: "El alquiler publicado no siempre cuenta toda la historia",
    description:
      "El informe pone foco en el peso de las expensas y en la diferencia entre precio de aviso y costo real. Conviene complementar el precio con el contexto del gasto total.",
  },
  {
    eyebrow: "Formacion de precios",
    title: "Comparar por valor tipico ayuda a evitar lecturas distorsionadas",
    description:
      "Los extremos del mercado pueden empujar promedios y esconder la referencia central. Por eso el dashboard prioriza el valor tipico y exige minimos de muestra antes de comparar.",
  },
];

const METHODOLOGY_SECTIONS = [
  {
    title: "Como leer este tablero",
    content:
      'Los graficos comparan avisos de alquiler publicados en AMBA y usan el mismo recorte activo de region y moneda. Cuando se elige "Todas las monedas", los valores se normalizan a ARS para que la comparacion sea consistente.',
  },
  {
    title: "Criterios de construccion",
    content:
      "El dashboard agrupa la oferta por zona, tipo, ambientes y amenities, y usa valor tipico en lugar de promedio para reducir el efecto de outliers. En los graficos comparativos se exigen minimos de muestra antes de mostrar una referencia.",
  },
  {
    title: "Alcance y limites",
    content:
      "La lectura describe avisos publicados y no precios de cierre. Los resultados pueden variar segun cobertura por zona, calidad del dato y composicion de la muestra disponible en cada recorte.",
  },
];

function getSelectedRegion(region?: string): RegionKey {
  const match = REGION_OPTIONS.find((option) => option.value === region);
  return match?.value ?? "all";
}

function getSelectedCurrency(moneda?: string): CurrencyKey {
  const match = CURRENCY_OPTIONS.find((option) => option.value === moneda);
  return match?.value ?? "all";
}

function buildAnalisisHref(region: RegionKey, moneda: CurrencyKey) {
  const params = new URLSearchParams();

  if (region !== "all") {
    params.set("region", region);
  }

  if (moneda !== "all") {
    params.set("moneda", moneda);
  }

  const query = params.toString();
  return query ? `/analisis?${query}` : "/analisis";
}

function getRegionLabel(region: RegionKey) {
  return region === "all" ? "AMBA" : region;
}

function getCurrencyLabel(moneda: CurrencyKey) {
  return moneda === "all" ? "todas las monedas" : moneda;
}

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

export async function generateMetadata({
  searchParams,
}: AnalisisPageProps): Promise<Metadata> {
  const params = await searchParams;
  const selectedRegion = getSelectedRegion(params.region);
  const selectedCurrency = getSelectedCurrency(params.moneda);

  const titleParts = ["Analisis del mercado de alquileres"];
  if (selectedRegion !== "all") titleParts.push(selectedRegion);
  if (selectedCurrency !== "all") titleParts.push(selectedCurrency);

  const description =
    selectedCurrency === "all"
      ? `Visualiza tendencias, precios y distribucion del mercado de alquileres en ${getRegionLabel(selectedRegion)} con valores normalizados a ARS.`
      : `Visualiza tendencias, precios y distribucion del mercado de alquileres en ${getRegionLabel(selectedRegion)} para avisos publicados en ${selectedCurrency}.`;

  return buildPageMetadata({
    title: titleParts.join(" - "),
    description,
    path: buildAnalisisHref(selectedRegion, selectedCurrency),
    noIndex: selectedRegion !== "all" || selectedCurrency !== "all",
  });
}

export default async function AnalisisPage({ searchParams }: AnalisisPageProps) {
  const params = await searchParams;
  const selectedRegion = getSelectedRegion(params.region);
  const selectedCurrency = getSelectedCurrency(params.moneda);
  const chartMode: PriceMode = selectedCurrency === "all" ? "ARS" : selectedCurrency;

  const {
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
  } = await getAnalysisDashboard(selectedRegion, selectedCurrency, chartMode);

  const kpis = [
    {
      label: "Valor tipico general",
      value: overallMedian ? formatCompactCurrency(overallMedian, chartMode) : "Sin dato",
      helper:
        selectedCurrency === "all"
          ? "Referencia central del recorte activo, con valores llevados a ARS."
          : `Referencia central del recorte activo en ${selectedCurrency.toLowerCase()}.`,
      icon: TrendingUp,
    },
    {
      label: "Avisos analizados",
      value: usefulListings.toLocaleString("es-AR"),
      helper: "Publicaciones que entran en el recorte actual y alimentan este tablero.",
      icon: BarChart3,
    },
    {
      label: "Zona comparable mas cara",
      value: mostExpensiveZone?.zone ?? "Sin dato",
      helper: mostExpensiveZone
        ? `Referencia tipica: ${formatCompactCurrency(mostExpensiveZone.value, chartMode)}.`
        : "Solo se consideran zonas con muestra valida en los tres tipos principales.",
      icon: Building2,
    },
    {
      label: "Tipo con mayor oferta",
      value: mostOfferedType?.[0] ?? "Sin dato",
      helper: mostOfferedType
        ? `${mostOfferedType[1].toLocaleString("es-AR")} publicaciones activas en el recorte actual.`
        : "Todavia no hay muestra suficiente.",
      icon: Home,
    },
  ];

  if (
    !overallMedian &&
    zoneChartData.length === 0 &&
    roomsChartData.length === 0 &&
    typeChartData.length === 0 &&
    amenitiesChartData.length === 0
  ) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-4 pb-16 pt-24 text-slate-900 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_-46px_rgba(15,23,42,0.24)] sm:rounded-[32px] sm:p-10">
          <h1 className="text-2xl font-black text-slate-900">Todavia no hay datos para este recorte</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Proba con otra region o con otra moneda para volver a cargar el tablero.
          </p>
          <div className="mt-8">
            <Link
              href="/analisis"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
            >
              Ver AMBA completo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(30,64,175,0.18),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#16213e_34%,_#eef4ff_34%,_#f6f8fc_100%)] sm:h-[460px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_30px_90px_-48px_rgba(15,23,42,0.55)] sm:mb-8 sm:rounded-[34px]">
            <div className="border-b border-white/10 bg-[linear-gradient(135deg,_rgba(15,23,42,0.96)_0%,_rgba(23,37,84,0.94)_55%,_rgba(29,78,216,0.9)_100%)] p-5 text-white sm:p-6 md:p-8">
              <Link
                href="/"
                className="group mb-5 inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-white hover:underline sm:mb-6 sm:text-base"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Volver al inicio
              </Link>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-blue-100">
                    Market Snapshot
                  </span>
                  <h1 className="mt-4 flex items-center gap-3 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl">
                    <TrendingUp className="text-blue-200" size={32} />
                    Analisis del mercado
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base md:text-lg">
                    Una lectura rapida del mercado de alquileres en AMBA, con referencias de
                    precio, zonas comparables y composicion de la oferta segun el recorte activo.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-200 backdrop-blur sm:px-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                    Recorte activo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {getRegionLabel(selectedRegion)} | {getCurrencyLabel(selectedCurrency)}
                  </p>
                  <p className="mt-1">
                    Basado en {usefulListings.toLocaleString("es-AR")} publicaciones.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 bg-white px-5 py-4 md:grid-cols-[1.25fr,0.75fr] md:px-8 md:py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  Enfoque
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  La vista prioriza comparacion entre zonas, lectura rapida de oferta y senales
                  de precio con una estetica inspirada en reportes de mercado inmobiliario.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  Corte actual
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {selectedCurrency === "all"
                    ? "Comparacion en ARS normalizado"
                    : `Comparacion en ${selectedCurrency.toLowerCase()}`}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Los graficos y KPIs se recalculan con este mismo recorte.
                </p>
              </div>
            </div>
          </div>

          <AnalysisFilters
            regionOptions={REGION_OPTIONS}
            currencyOptions={CURRENCY_OPTIONS}
            selectedRegion={selectedRegion}
            selectedCurrency={selectedCurrency}
          />

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 xl:grid-cols-3">
            {REPORT_INSIGHTS.map((insight) => (
              <article
                key={insight.title}
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.24)] sm:rounded-[28px] sm:p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  {insight.eyebrow}
                </p>
                <h2 className="mt-3 text-base font-bold leading-7 text-slate-900 sm:text-lg">
                  {insight.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{insight.description}</p>
              </article>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;

              return (
                <div
                  key={kpi.label}
                  className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.28)] sm:rounded-[28px] sm:p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {kpi.label}
                      </p>
                      <p className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{kpi.value}</p>
                    </div>
                    <span className="rounded-2xl border border-blue-100 bg-blue-50 p-2 text-[#1d4ed8]">
                      <Icon size={18} />
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">{kpi.helper}</p>
                </div>
              );
            })}
          </div>

          {insights.length > 0 ? (
            <section className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 xl:grid-cols-3">
              {insights.map((insight) => (
                <article
                  key={insight.title}
                  className="rounded-[24px] border border-blue-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-5 shadow-[0_20px_55px_-42px_rgba(29,78,216,0.2)] sm:rounded-[28px] sm:p-6"
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    {insight.eyebrow}
                  </p>
                  <h2 className="mt-3 text-base font-bold leading-7 text-slate-900 sm:text-lg">
                    {insight.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{insight.description}</p>
                </article>
              ))}
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
            <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.3)] sm:rounded-[32px] sm:p-8 lg:col-span-2">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl border border-blue-100 bg-blue-50 p-2.5 text-[#1d4ed8]">
                    <BarChart3 size={24} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Precio tipico por zona</h2>
                    <p className="text-sm text-slate-500">
                      {selectedCurrency === "all"
                        ? "Comparacion con valores llevados a ARS para leer todo en una misma escala."
                        : `Comparacion con valores publicados en ${selectedCurrency.toLowerCase()}.`}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#1d4ed8]">
                  {getRegionLabel(selectedRegion)} | {getCurrencyLabel(selectedCurrency)}
                </span>
              </div>

              <PriceByZoneChart data={zoneChartData} currencyMode={chartMode} />
            </div>

            <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.24)] sm:rounded-[28px] sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-600">
                  <Building2 size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-800">Valor tipico por ambientes</h2>
              </div>
              <PriceByRoomsChart data={roomsChartData} currencyMode={chartMode} />
            </div>

            <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.24)] sm:rounded-[28px] sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-600">
                  <Home size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-800">Precio tipico por tipo</h2>
              </div>
              <PriceByTypeChart data={typeChartData} currencyMode={chartMode} />
            </div>

            <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.24)] sm:rounded-[28px] sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-600">
                  <TrendingUp size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-800">Como influyen los amenities</h2>
              </div>
              <AmenitiesImpactChart data={amenitiesChartData} currencyMode={chartMode} />
            </div>

            <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.24)] sm:rounded-[28px] sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-600">
                  <PieChart size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-800">Como se reparte la oferta</h2>
              </div>
              <OfferDistributionChart data={offerDistributionData} />
            </div>
          </div>

          <section className="mt-10 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.24)] sm:mt-12 sm:rounded-[32px] sm:p-6 md:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Informe de apoyo
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Metodologia y alcance del analisis
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Esta seccion resume los criterios del informe base y ayuda a interpretar mejor
                  las comparaciones del dashboard sin salir de la pagina.
                </p>
              </div>

              <Link
                href="/informacion_pdf.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
              >
                Ver informe completo
              </Link>
            </div>

            <div className="space-y-4">
              {METHODOLOGY_SECTIONS.map((section) => (
                <details
                  key={section.title}
                  className="group rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4 open:bg-white sm:rounded-[24px] sm:px-5"
                >
                  <summary className="cursor-pointer list-none text-base font-bold text-slate-900">
                    <span className="flex items-center justify-between gap-4">
                      {section.title}
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
                    {section.content}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
