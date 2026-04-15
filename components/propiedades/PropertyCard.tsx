import Image from "next/image";
import {
  CalendarDays,
  Car,
  ExternalLink,
  MapPin,
  Maximize,
  PawPrint,
  ShieldCheck,
  Star,
  Sun,
  TreePine,
  Waves,
  Wind,
} from "lucide-react";

interface PropertyData {
  id: string;
  direccion: string;
  zona: string;
  precio: number;
  moneda: string;
  expensas?: number | null;
  tipo: string;
  metros: number;
  ambientes?: number;
  orientacion?: string;
  amenityScore?: number;
  antiguedad_anios?: number;
  tieneCochera: boolean;
  tienePileta: boolean;
  tieneSeguridad: boolean;
  tienePatio?: boolean;
  tieneBalcon?: boolean;
  politicaMascotas?: string;
  url: string;
  imagen_url: string | null;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop";

function getSizeLabel(metros: number, ambientes?: number) {
  const hasMeters = metros > 0;
  const hasRooms = typeof ambientes === "number" && ambientes > 0;

  if (hasMeters && hasRooms) return `${metros} m² | ${ambientes} amb`;
  if (hasRooms) return `${ambientes} amb`;
  if (hasMeters) return `${metros} m²`;

  return "N/D m²";
}

function acceptsPets(policy?: string) {
  const normalizedPolicy = policy?.trim().toLowerCase();
  if (!normalizedPolicy) return false;

  return (
    normalizedPolicy.includes("si") ||
    normalizedPolicy.includes("permite") ||
    normalizedPolicy === "acepta"
  );
}

export default function PropertyCard({ data }: { data: PropertyData }) {
  const safeUrl = data.url || "";
  const sourceUrl = data.imagen_url?.trim() ? data.imagen_url : PLACEHOLDER_IMAGE;
  const sourceName = safeUrl.toLowerCase().includes("zonaprop") ? "Zonaprop" : "Argenprop";
  const isPremium =
    data.amenityScore !== undefined &&
    data.amenityScore >= (data.tipo.toLowerCase() === "casa" ? 5 : 4);
  const isBright =
    !!data.orientacion &&
    (data.orientacion.toLowerCase().includes("norte") ||
      data.orientacion.toLowerCase().includes("este"));
  const showPets = acceptsPets(data.politicaMascotas);
  const sizeLabel = getSizeLabel(data.metros, data.ambientes);
  const currencySymbol = data.moneda === "Dolares" || data.moneda === "USD" ? "U$S" : "$";
  const priceLabel = `${currencySymbol}${data.precio?.toLocaleString("es-AR") || "0"}`;
  const expensesLabel =
    data.expensas && data.expensas > 0
      ? `+ $${data.expensas.toLocaleString("es-AR")}`
      : "No expresadas";
  const ageLabel =
    data.antiguedad_anios === 0 ? "A estrenar" : `${data.antiguedad_anios} años`;

  const WrapperTag = safeUrl ? "a" : "div";

  return (
    <WrapperTag
      {...(safeUrl
        ? {
            href: safeUrl,
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {})}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10"
      title={
        safeUrl ? `Ver publicación original en ${sourceName}` : "Publicación original no disponible"
      }
    >
      <div className="relative h-56 w-full overflow-hidden bg-slate-200">
        <Image
          src={sourceUrl}
          alt={`Propiedad en ${data.direccion || "AMBA"}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 z-10 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm backdrop-blur-sm">
          {data.tipo}
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
          {isPremium ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-400/90 px-2.5 py-1 text-[10px] font-black text-amber-950 shadow-sm backdrop-blur-sm">
              <Star size={12} className="fill-amber-950" /> PREMIUM
            </div>
          ) : null}

          {isBright ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-sky-400/90 px-2.5 py-1 text-[10px] font-black text-sky-950 shadow-sm backdrop-blur-sm">
              <Sun size={12} className="fill-sky-950" /> LUMINOSO
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-6 md:p-8">
        <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
          {data.antiguedad_anios !== undefined && data.antiguedad_anios !== null ? (
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <CalendarDays size={12} />
              <span>{ageLabel}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-1 text-indigo-600">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest">{data.zona}</span>
          </div>

          <h3
            className="mt-1 line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-indigo-700"
            title={data.direccion}
          >
            {data.direccion}
          </h3>
        </div>

        <div className="mt-auto flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-colors group-hover:bg-indigo-50">
          <div className="relative flex w-full flex-col items-center justify-between sm:flex-row sm:items-start">
            <div className="mb-3 flex w-full justify-center sm:order-2 sm:mb-0 sm:w-auto sm:justify-end">
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-bold shadow-sm ${
                  sourceName === "Zonaprop"
                    ? "border-orange-100 bg-orange-50 text-orange-600"
                    : "border-blue-100 bg-blue-50 text-blue-600"
                }`}
              >
                {sourceName}
              </span>
            </div>

            <div className="flex w-full flex-col items-center sm:order-1 sm:w-auto sm:items-start">
              <span className="mb-1 block text-center text-[10px] font-black uppercase tracking-widest text-slate-400 sm:text-left">
                Precio Alquiler
              </span>
              <p className="flex items-baseline justify-center gap-1 text-2xl font-extrabold text-slate-900 sm:justify-start">
                {priceLabel}
              </p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between border-t border-slate-200/60 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Expensas
            </span>
            <span className="text-sm font-bold text-slate-700">{expensesLabel}</span>
          </div>
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6 text-slate-500">
          <div className="flex w-full flex-col items-center justify-center gap-3 pr-8 sm:flex-row sm:gap-4 sm:pr-0">
            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-sm text-slate-600">
              <Maximize size={16} className="text-slate-400" />
              <span className="font-medium">{sizeLabel}</span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
              <span title={`Mascotas: ${data.politicaMascotas || "No menciona"}`} className="cursor-help">
                <PawPrint
                  size={16}
                  className={`transition-all duration-300 ${
                    showPets
                      ? "text-rose-500 opacity-100 hover:scale-125"
                      : "text-slate-400 opacity-40 grayscale"
                  }`}
                />
              </span>

              <span title={data.tienePatio ? "Tiene Patio" : "Sin patio"} className="cursor-help">
                <TreePine
                  size={16}
                  className={`transition-all duration-300 ${
                    data.tienePatio
                      ? "text-green-500 opacity-100 hover:scale-125"
                      : "text-slate-400 opacity-40 grayscale"
                  }`}
                />
              </span>

              <span
                title={data.tieneBalcon ? "Tiene Balcón" : "Sin balcón"}
                className="cursor-help"
              >
                <Wind
                  size={16}
                  className={`transition-all duration-300 ${
                    data.tieneBalcon
                      ? "text-sky-500 opacity-100 hover:scale-125"
                      : "text-slate-400 opacity-40 grayscale"
                  }`}
                />
              </span>

              <span title={data.tieneCochera ? "Tiene Cochera" : "Sin cochera"} className="cursor-help">
                <Car
                  size={16}
                  className={`transition-all duration-300 ${
                    data.tieneCochera
                      ? "text-indigo-500 opacity-100 hover:scale-125"
                      : "text-slate-400 opacity-40 grayscale"
                  }`}
                />
              </span>

              <span title={data.tienePileta ? "Tiene Pileta" : "Sin pileta"} className="cursor-help">
                <Waves
                  size={16}
                  className={`transition-all duration-300 ${
                    data.tienePileta
                      ? "text-cyan-500 opacity-100 hover:scale-125"
                      : "text-slate-400 opacity-40 grayscale"
                  }`}
                />
              </span>

              <span
                title={data.tieneSeguridad ? "Seguridad 24hs" : "Sin seguridad"}
                className="cursor-help"
              >
                <ShieldCheck
                  size={16}
                  className={`transition-all duration-300 ${
                    data.tieneSeguridad
                      ? "text-emerald-500 opacity-100 hover:scale-125"
                      : "text-slate-400 opacity-40 grayscale"
                  }`}
                />
              </span>
            </div>
          </div>

          <div
            className={`absolute right-0 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-colors sm:static ${
              safeUrl
                ? "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                : "border-slate-100 bg-slate-50 text-slate-300"
            }`}
          >
            <ExternalLink size={14} />
          </div>
        </div>
      </div>
    </WrapperTag>
  );
}
