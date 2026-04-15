"use client";

import { useMemo } from "react";
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
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface RawData {
  zona: string;
  precio_alquiler_ars: number;
  tipo: string;
}

type PropertyType = "Departamento" | "Casa" | "PH";

type ZoneBuckets = Record<PropertyType, number[]>;

type ChartDatum = {
  name: string;
  Departamento: number | null;
  Casa: number | null;
  PH: number | null;
  totalProps: number;
  sortValue: number;
};

const MIN_PRICE_ARS = 50_000;
const MAX_PRICE_ARS = 10_000_000;
const MIN_ZONE_SAMPLE = 5;
const MAX_ZONES = 25;

const PROPERTY_TYPES: PropertyType[] = ["Departamento", "PH", "Casa"];

const BAR_COLORS: Record<PropertyType, string> = {
  Departamento: "#4f46e5",
  PH: "#f59e0b",
  Casa: "#10b981",
};

function getMedian(values: number[]) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getPropertyType(tipo: string): PropertyType | null {
  const normalizedType = tipo.trim().toLowerCase();

  if (normalizedType.includes("departamento")) return "Departamento";
  if (normalizedType.includes("casa")) return "Casa";
  if (normalizedType.includes("ph")) return "PH";

  return null;
}

export default function PriceByZoneChart({ rawData }: { rawData: RawData[] }) {
  const chartData = useMemo<ChartDatum[]>(() => {
    const zones: Record<string, ZoneBuckets> = {};

    rawData.forEach((item) => {
      if (
        !item.zona?.trim() ||
        item.precio_alquiler_ars <= MIN_PRICE_ARS ||
        item.precio_alquiler_ars >= MAX_PRICE_ARS
      ) {
        return;
      }

      const propertyType = getPropertyType(item.tipo ?? "");
      if (!propertyType) return;

      const zoneName = item.zona.trim();

      if (!zones[zoneName]) {
        zones[zoneName] = { Departamento: [], Casa: [], PH: [] };
      }

      zones[zoneName][propertyType].push(item.precio_alquiler_ars);
    });

    return Object.entries(zones)
      .map(([name, buckets]) => {
        const departamentoMedian = getMedian(buckets.Departamento);
        const casaMedian = getMedian(buckets.Casa);
        const phMedian = getMedian(buckets.PH);
        const totalProps =
          buckets.Departamento.length + buckets.Casa.length + buckets.PH.length;
        const sortValue = Math.max(
          departamentoMedian ?? 0,
          casaMedian ?? 0,
          phMedian ?? 0
        );

        return {
          name,
          Departamento: departamentoMedian,
          Casa: casaMedian,
          PH: phMedian,
          totalProps,
          sortValue,
        };
      })
      .filter((zone) => zone.totalProps >= MIN_ZONE_SAMPLE && zone.sortValue > 0)
      .sort((a, b) => b.sortValue - a.sortValue)
      .slice(0, MAX_ZONES);
  }, [rawData]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No hay datos suficientes para mostrar precios por zona.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 110 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            dx={-5}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(value: number) =>
              `$${Math.round(value / 1000).toLocaleString("es-AR")}k`
            }
          />

          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: ValueType | undefined, name: NameType | undefined) => {
              if (typeof value !== "number") {
                return ["Sin datos", String(name ?? "")];
              }

              return [
                `$${value.toLocaleString("es-AR")}`,
                `Mediana ${String(name ?? "")}`,
              ];
            }}
            labelStyle={{ color: "#0f172a", fontWeight: "bold", marginBottom: "8px" }}
          />

          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: "20px" }}
          />

          {PROPERTY_TYPES.map((propertyType) => (
            <Bar
              key={propertyType}
              dataKey={propertyType}
              fill={BAR_COLORS[propertyType]}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
