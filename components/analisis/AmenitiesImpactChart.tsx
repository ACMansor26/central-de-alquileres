"use client";

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
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import ChartMountGuard from "@/components/analisis/ChartMountGuard";
import { ANALYSIS_CHART_COLORS } from "@/components/analisis/chartTheme";

type CurrencyMode = "ARS" | "Pesos" | "Dolares";

type ChartDatum = {
  name: string;
  conAmenity: number | null;
  sinAmenity: number | null;
  conCount: number;
  sinCount: number;
};

const MIN_SAMPLE = 5;

const BAR_COLORS = {
  conAmenity: ANALYSIS_CHART_COLORS.primary,
  sinAmenity: ANALYSIS_CHART_COLORS.secondarySoft,
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
  label,
  currencyMode,
}: TooltipProps<ValueType, NameType> & {
  currencyMode: CurrencyMode;
  payload?: Array<Payload<ValueType, NameType>>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  return (
    <div className="min-w-[240px] rounded-3xl border border-slate-200 bg-white/98 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
      <div className="mb-3 border-b border-slate-100 pb-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Amenity
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">{label}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Comparacion del valor tipico con y sin este amenity
        </p>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium text-slate-700">Con amenity</span>
          <div className="text-right">
            <div className="font-semibold text-slate-900">
              {datum.conAmenity ? formatCurrency(datum.conAmenity, currencyMode) : "Muestra baja"}
            </div>
            <div className="text-xs text-slate-500">{datum.conCount} avisos</div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium text-slate-700">Sin amenity</span>
          <div className="text-right">
            <div className="font-semibold text-slate-900">
              {datum.sinAmenity ? formatCurrency(datum.sinAmenity, currencyMode) : "Muestra baja"}
            </div>
            <div className="text-xs text-slate-500">{datum.sinCount} avisos</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AmenitiesImpactChart({
  data,
  currencyMode = "ARS",
}: {
  data: ChartDatum[];
  currencyMode?: CurrencyMode;
}) {
  const chartData = data;

  const chartHeight = Math.max(320, chartData.length * 56 + 20);
  const valueLabel =
    currencyMode === "ARS"
      ? "Valores tipicos comparados en ARS"
      : currencyMode === "Dolares"
        ? "Valores tipicos en dolares"
        : "Valores tipicos en pesos";

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No hay datos suficientes para comparar amenities.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Impacto de amenities
        </p>
        <p className="text-sm font-semibold text-slate-800">Valor tipico con y sin cada amenity</p>
        <p className="text-xs text-slate-500">
          Cada comparacion necesita al menos {MIN_SAMPLE} avisos por grupo. {valueLabel}.
        </p>
      </div>

      <ChartMountGuard height={chartHeight}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 12, left: 10, bottom: 10 }}
            barCategoryGap="24%"
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
              dataKey="name"
              width={96}
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
                paddingBottom: "12px",
                fontSize: "12px",
                color: ANALYSIS_CHART_COLORS.mutedText,
              }}
            />

            <Bar
              dataKey="conAmenity"
              name="Con amenity"
              fill={BAR_COLORS.conAmenity}
              radius={[0, 999, 999, 0]}
              maxBarSize={14}
            />
            <Bar
              dataKey="sinAmenity"
              name="Sin amenity"
              fill={BAR_COLORS.sinAmenity}
              radius={[0, 999, 999, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartMountGuard>
    </div>
  );
}
