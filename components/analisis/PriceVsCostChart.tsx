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

type ChartDatum = {
  name: string;
  shortName: string;
  publishedMedian: number | null;
  totalMedian: number | null;
  gapValue: number | null;
  gapPercentage: number | null;
  count: number;
};

function formatCurrency(value: number) {
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
}: TooltipProps<ValueType, NameType> & {
  payload?: Array<Payload<ValueType, NameType>>;
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum || datum.publishedMedian === null || datum.totalMedian === null) return null;

  return (
    <div className="min-w-[260px] rounded-3xl border border-slate-200 bg-white/98 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Zona</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{datum.name}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Precio publicado</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(datum.publishedMedian)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Costo real</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(datum.totalMedian)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Gap por expensas</span>
          <span className="font-semibold text-slate-900">
            {datum.gapValue !== null ? formatCurrency(datum.gapValue) : "Sin dato"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Gap porcentual</span>
          <span className="font-semibold text-slate-900">
            {datum.gapPercentage !== null
              ? `${datum.gapPercentage.toLocaleString("es-AR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%`
              : "Sin dato"}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{datum.count} avisos con expensas declaradas.</p>
    </div>
  );
}

export default function PriceVsCostChart({
  data,
  coverageNote,
}: {
  data: ChartDatum[];
  coverageNote?: string;
}) {
  const chartData = data.slice(0, 12);
  const chartHeight = Math.max(340, chartData.length * 52 + 20);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No hay zonas con suficientes expensas declaradas para comparar precio publicado y costo real.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Expensas y costo total
        </p>
        <p className="text-sm font-semibold text-slate-800">Precio publicado vs costo real</p>
        <p className="text-xs text-slate-500">
          Solo se incluyen zonas con 20 o mas avisos que declaran expensas y costo total.
        </p>
        {coverageNote ? <p className="text-xs text-slate-500">{coverageNote}</p> : null}
      </div>

      <ChartMountGuard height={chartHeight}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 12, left: 10, bottom: 10 }}
            barCategoryGap="22%"
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
              tickFormatter={(value: number) => formatCurrency(value)}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fill: ANALYSIS_CHART_COLORS.mutedText, fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: ANALYSIS_CHART_COLORS.hover }} />
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
              dataKey="publishedMedian"
              name="Precio publicado"
              fill={ANALYSIS_CHART_COLORS.secondarySoft}
              radius={[0, 999, 999, 0]}
              maxBarSize={14}
            />
            <Bar
              dataKey="totalMedian"
              name="Costo real"
              fill={ANALYSIS_CHART_COLORS.primary}
              radius={[0, 999, 999, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartMountGuard>
    </div>
  );
}
