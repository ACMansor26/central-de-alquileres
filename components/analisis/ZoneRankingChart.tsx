"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ArrowDownAZ, ArrowUpAZ, BadgeInfo, Ruler } from "lucide-react";
import ChartMountGuard from "@/components/analisis/ChartMountGuard";
import { ANALYSIS_CHART_COLORS } from "@/components/analisis/chartTheme";
import type { ZoneProfile } from "@/lib/data/analysis";

type CurrencyMode = "ARS" | "Pesos" | "Dolares";

type RankingDatum = {
  name: string;
  shortName: string;
  profile: ZoneProfile;
  totalProps: number;
  globalMedian: number | null;
  validTypeCount: number;
};
type MetricView = "total" | "sqm";

const MAX_ZONES = 14;

const PROFILE_COLORS: Record<ZoneProfile, string> = {
  "multi-tipo": ANALYSIS_CHART_COLORS.primary,
  "bi-tipo": ANALYSIS_CHART_COLORS.teal,
  "mono-tipo": ANALYSIS_CHART_COLORS.accent,
};

const PROFILE_SHORT_LABEL: Record<ZoneProfile, string> = {
  "multi-tipo": "multi",
  "bi-tipo": "bi",
  "mono-tipo": "mono",
};

function formatCurrency(value: number, currencyMode: CurrencyMode) {
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

function formatMetricValue(value: number, currencyMode: CurrencyMode, metricView: MetricView) {
  if (metricView === "sqm") {
    return `$${Math.round(value).toLocaleString("es-AR")}/m²`;
  }

  return formatCurrency(value, currencyMode);
}

function RankingTooltip({
  active,
  payload,
  currencyMode,
  metricView,
}: TooltipProps<ValueType, NameType> & {
  currencyMode: CurrencyMode;
  metricView: MetricView;
  payload?: Array<Payload<ValueType, NameType>>;
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as RankingDatum | undefined;
  if (!datum || datum.globalMedian === null) return null;

  return (
    <div className="min-w-[260px] rounded-3xl border border-slate-200 bg-white/98 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Zona</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{datum.name}</p>
      <div className="mt-3 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-600">Valor tipico</span>
        <span className="font-semibold text-slate-900">
          {formatMetricValue(datum.globalMedian, currencyMode, metricView)}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-600">Perfil</span>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold capitalize text-white"
          style={{ backgroundColor: PROFILE_COLORS[datum.profile] }}
        >
          {datum.profile}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-600">Avisos totales</span>
        <span className="font-semibold text-slate-900">
          {datum.totalProps.toLocaleString("es-AR")}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Tipos con muestra valida: {datum.validTypeCount} de 3.
      </p>
    </div>
  );
}

export default function ZoneRankingChart({
  data,
  sqmData = [],
  sqmCoverage,
  currencyMode = "ARS",
}: {
  data: RankingDatum[];
  sqmData?: RankingDatum[];
  sqmCoverage?: { count: number; percentage: number } | null;
  currencyMode?: CurrencyMode;
}) {
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [metricView, setMetricView] = useState<MetricView>("total");

  const chartData = useMemo(() => {
    const source = metricView === "sqm" ? sqmData : data;

    return [...source]
      .filter((zone): zone is RankingDatum & { globalMedian: number } => zone.globalMedian !== null)
      .sort((a, b) =>
        sortDirection === "desc" ? b.globalMedian - a.globalMedian : a.globalMedian - b.globalMedian
      )
      .slice(0, MAX_ZONES)
      .map((zone) => ({
        ...zone,
        axisLabel: `${zone.shortName} · ${PROFILE_SHORT_LABEL[zone.profile]}`,
      }));
  }, [data, metricView, sortDirection, sqmData]);

  const chartHeight = Math.max(400, chartData.length * 52 + 60);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No hay zonas con presencia suficiente para armar el ranking.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Filtro de presencia
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            Ranking general por zona
          </p>
          <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500">
            <p>
              Entran zonas con 10 o mas avisos totales, aunque esten concentradas en uno o dos
              tipos de propiedad.
            </p>
            <p>
              La etiqueta junto a cada zona resume su perfil: mono-tipo, bi-tipo o multi-tipo.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 self-start sm:items-end sm:self-auto">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMetricView("total")}
              aria-pressed={metricView === "total"}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                metricView === "total"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Precio total
            </button>
            <button
              type="button"
              onClick={() => setMetricView("sqm")}
              aria-pressed={metricView === "sqm"}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                metricView === "sqm"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Ruler size={14} />
              Precio por m²
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <BadgeInfo size={13} />
            {metricView === "sqm" && sqmCoverage
              ? `${sqmCoverage.count.toLocaleString("es-AR")} avisos con m² calculado (${sqmCoverage.percentage.toLocaleString("es-AR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%)`
              : "Perfil segun tipos con 5+ avisos"}
          </p>

          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setSortDirection("desc")}
              aria-pressed={sortDirection === "desc"}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortDirection === "desc"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowDownAZ size={14} />
              Mas caras
            </button>

            <button
              type="button"
              onClick={() => setSortDirection("asc")}
              aria-pressed={sortDirection === "asc"}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortDirection === "asc"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowUpAZ size={14} />
              Mas baratas
            </button>
          </div>
        </div>
      </div>

      <ChartMountGuard height={chartHeight}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 18, left: 8, bottom: 8 }}
            barCategoryGap="26%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal
              vertical={false}
              stroke={ANALYSIS_CHART_COLORS.grid}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: ANALYSIS_CHART_COLORS.softText, fontSize: 11 }}
              tickFormatter={(value: number) => formatMetricValue(value, currencyMode, metricView)}
            />
            <YAxis
              type="category"
              dataKey="axisLabel"
              width={150}
              axisLine={false}
              tickLine={false}
              tick={{ fill: ANALYSIS_CHART_COLORS.mutedText, fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip
              content={<RankingTooltip currencyMode={currencyMode} metricView={metricView} />}
              cursor={{ fill: ANALYSIS_CHART_COLORS.hover }}
            />
            <Bar
              dataKey="globalMedian"
              name="Valor tipico"
              fill={ANALYSIS_CHART_COLORS.primary}
              radius={[0, 999, 999, 0]}
              maxBarSize={16}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={PROFILE_COLORS[entry.profile]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartMountGuard>
    </div>
  );
}
