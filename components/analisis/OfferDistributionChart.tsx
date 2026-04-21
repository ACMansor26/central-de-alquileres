"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import ChartMountGuard from "@/components/analisis/ChartMountGuard";
import { ANALYSIS_CHART_COLORS } from "@/components/analisis/chartTheme";

type PropertyType = "Departamento" | "Casa" | "PH";

type ChartDatum = {
  name: PropertyType;
  value: number;
  percentage: number;
};

const CHART_COLORS: Record<PropertyType, string> = {
  Departamento: ANALYSIS_CHART_COLORS.primary,
  PH: ANALYSIS_CHART_COLORS.secondary,
  Casa: ANALYSIS_CHART_COLORS.accent,
};

function CustomTooltip({
  active,
  payload,
}: TooltipProps<ValueType, NameType> & {
  payload?: Array<Payload<ValueType, NameType>>;
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;

  return (
    <div className="min-w-[210px] rounded-3xl border border-slate-200 bg-white/98 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Oferta</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{datum.name}</p>
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Publicaciones</span>
          <span className="font-semibold text-slate-900">
            {datum.value.toLocaleString("es-AR")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Participacion</span>
          <span className="font-semibold text-slate-900">
            {datum.percentage.toLocaleString("es-AR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OfferDistributionChart({ data }: { data: ChartDatum[] }) {
  const chartData = data;

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No hay datos suficientes para mostrar la distribucion de la oferta.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Mix de la oferta
        </p>
        <p className="text-sm font-semibold text-slate-800">Como se reparte la oferta</p>
        <p className="text-xs text-slate-500">
          Muestra que parte de la oferta corresponde a departamentos, PH y casas.
        </p>
      </div>

      <ChartMountGuard height={320}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={72}
              outerRadius={112}
              paddingAngle={3}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={CHART_COLORS[entry.name]} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{
                paddingTop: "18px",
                fontSize: "12px",
                color: ANALYSIS_CHART_COLORS.mutedText,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartMountGuard>
    </div>
  );
}
