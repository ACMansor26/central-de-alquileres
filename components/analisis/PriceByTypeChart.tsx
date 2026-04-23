"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Ruler } from "lucide-react";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import ChartMountGuard from "@/components/analisis/ChartMountGuard";
import { ANALYSIS_CHART_COLORS } from "@/components/analisis/chartTheme";

type CurrencyMode = "ARS" | "Pesos" | "Dolares";
type PropertyType = "Departamento" | "Casa" | "PH";

type ChartDatum = {
  name: PropertyType;
  value: number | null;
  count: number;
};
type MetricView = "total" | "sqm";

const BAR_COLORS: Record<PropertyType, string> = {
  Departamento: ANALYSIS_CHART_COLORS.primary,
  PH: ANALYSIS_CHART_COLORS.secondary,
  Casa: ANALYSIS_CHART_COLORS.accent,
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

function CustomTooltip({
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

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  return (
    <div className="min-w-[220px] rounded-3xl border border-slate-200 bg-white/98 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        Tipo de propiedad
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{datum.name}</p>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Valor tipico</span>
          <span className="font-semibold text-slate-900">
            {datum.value ? formatMetricValue(datum.value, currencyMode, metricView) : "Muestra baja"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Publicaciones</span>
          <span className="font-semibold text-slate-900">
            {datum.count.toLocaleString("es-AR")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PriceByTypeChart({
  data,
  sqmData = [],
  sqmCoverage,
  currencyMode = "ARS",
}: {
  data: ChartDatum[];
  sqmData?: ChartDatum[];
  sqmCoverage?: { count: number; percentage: number } | null;
  currencyMode?: CurrencyMode;
}) {
  const [metricView, setMetricView] = useState<MetricView>("total");
  const chartData = metricView === "sqm" ? sqmData : data;

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No hay datos suficientes para mostrar precios por tipo.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Tipologia de la oferta
        </p>
        <p className="text-sm font-semibold text-slate-800">Precio tipico por tipo</p>
        <p className="text-xs text-slate-500">
          {metricView === "sqm" && sqmCoverage
            ? `Compara el valor tipico por m² entre departamentos, PH y casas. Cobertura actual: ${sqmCoverage.count.toLocaleString("es-AR")} avisos con m² calculado (${sqmCoverage.percentage.toLocaleString("es-AR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}%).`
            : "Compara el valor tipico entre departamentos, PH y casas dentro del recorte activo."}
        </p>
      </div>

      <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
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

      <ChartMountGuard height={320}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={chartData} margin={{ top: 10, right: 16, left: 6, bottom: 6 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={ANALYSIS_CHART_COLORS.grid}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: ANALYSIS_CHART_COLORS.mutedText, fontSize: 12, fontWeight: 600 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: ANALYSIS_CHART_COLORS.softText, fontSize: 11 }}
              tickFormatter={(value: number) => formatMetricValue(value, currencyMode, metricView)}
            />

            <Tooltip content={<CustomTooltip currencyMode={currencyMode} metricView={metricView} />} />

            <Bar dataKey="value" name="Valor tipico" radius={[10, 10, 0, 0]} maxBarSize={52}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={BAR_COLORS[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartMountGuard>
    </div>
  );
}
