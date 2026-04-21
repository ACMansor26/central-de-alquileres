"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownAZ, ArrowUpAZ, Info } from "lucide-react";
import type { TooltipProps } from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import ChartMountGuard from "@/components/analisis/ChartMountGuard";
import { ANALYSIS_CHART_COLORS } from "@/components/analisis/chartTheme";

type PropertyType = "Departamento" | "Casa" | "PH";
type CurrencyMode = "ARS" | "Pesos" | "Dolares";

type ChartDatum = {
  name: string;
  shortName: string;
  Departamento: number | null;
  Casa: number | null;
  PH: number | null;
  departamentoCount: number;
  casaCount: number;
  phCount: number;
  totalProps: number;
  globalMedian: number | null;
};

const MIN_ZONE_SAMPLE = 5;
const MAX_ZONES = 16;
const PROPERTY_TYPES: PropertyType[] = ["Departamento", "PH", "Casa"];

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

function CustomTooltip({
  active,
  payload,
  currencyMode,
}: TooltipProps<ValueType, NameType> & {
  currencyMode: CurrencyMode;
  payload?: Array<Payload<ValueType, NameType>>;
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  const rows: Array<{ label: PropertyType; value: number | null; count: number }> = [
    {
      label: "Departamento",
      value: datum.Departamento,
      count: datum.departamentoCount,
    },
    {
      label: "PH",
      value: datum.PH,
      count: datum.phCount,
    },
    {
      label: "Casa",
      value: datum.Casa,
      count: datum.casaCount,
    },
  ];

  return (
    <div className="min-w-[260px] rounded-3xl border border-slate-200 bg-white/98 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
      <div className="mb-3 border-b border-slate-100 pb-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Zona
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">{datum.name}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {datum.totalProps} publicaciones tomadas para esta zona
        </p>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: BAR_COLORS[row.label] }}
              />
              <span className="font-medium text-slate-700">{row.label}</span>
            </div>

            <div className="text-right">
              <div className="font-semibold text-slate-900">
                {row.value ? formatCurrency(row.value, currencyMode) : "Muestra baja"}
              </div>
              <div className="text-xs text-slate-500">{row.count} avisos</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PriceByZoneChart({
  data,
  currencyMode = "ARS",
}: {
  data: ChartDatum[];
  currencyMode?: CurrencyMode;
}) {
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const chartData = useMemo<ChartDatum[]>(() => {
    return [...data]
      .sort((a, b) =>
        sortDirection === "desc"
          ? (b.globalMedian ?? 0) - (a.globalMedian ?? 0)
          : (a.globalMedian ?? 0) - (b.globalMedian ?? 0)
      )
      .slice(0, MAX_ZONES);
  }, [data, sortDirection]);

  const chartHeight = Math.max(420, chartData.length * 54 + 80);
  const valueLabel =
    currencyMode === "ARS"
      ? "Valores normalizados a ARS"
      : currencyMode === "Dolares"
        ? "Valores originales en dolares"
        : "Valores originales en pesos";
  const sortLabel =
    sortDirection === "desc"
      ? `Top ${MAX_ZONES} zonas mas caras`
      : `Top ${MAX_ZONES} zonas mas baratas`;

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No hay datos suficientes para mostrar precios por zona.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Zonas comparables
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Precio tipico por zona</p>
          <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500">
            <p>
              Se muestran hasta {MAX_ZONES} zonas por vista. Cada barra representa la
              referencia tipica del alquiler para ese tipo de propiedad.
            </p>
            <p>
              Solo se incluyen zonas con {MIN_ZONE_SAMPLE} o mas publicaciones y con
              muestras validas en Departamento, PH y Casa.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 self-start sm:items-end sm:self-auto">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Info size={13} />
            {valueLabel}
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

          <p className="text-xs font-medium text-slate-400">{sortLabel}</p>
        </div>
      </div>

      <ChartMountGuard height={chartHeight}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            barCategoryGap="22%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke={ANALYSIS_CHART_COLORS.grid}
            />

            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: ANALYSIS_CHART_COLORS.softText, fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrency(value, currencyMode)}
            />

            <YAxis
              type="category"
              dataKey="shortName"
              width={112}
              axisLine={false}
              tickLine={false}
              tick={{ fill: ANALYSIS_CHART_COLORS.mutedText, fontSize: 12, fontWeight: 600 }}
            />

            <Tooltip
              content={<CustomTooltip currencyMode={currencyMode} />}
              cursor={{ fill: ANALYSIS_CHART_COLORS.hover }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "16px",
                fontSize: "12px",
                color: ANALYSIS_CHART_COLORS.mutedText,
              }}
            />

            {PROPERTY_TYPES.map((propertyType) => (
              <Bar
                key={propertyType}
                dataKey={propertyType}
                name={propertyType}
                fill={BAR_COLORS[propertyType]}
                radius={[0, 999, 999, 0]}
                maxBarSize={14}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartMountGuard>
    </div>
  );
}
