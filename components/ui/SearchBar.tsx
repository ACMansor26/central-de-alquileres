"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, DollarSign, SlidersHorizontal, X } from "lucide-react";

interface SearchBarProps {
  initialTipo?: string;
  initialMoneda?: string;
  initialZonas?: string[];
  initialMin?: string;
  initialMax?: string;
  initialMinM2?: string;
  initialMaxM2?: string;
  initialAmbientes?: string;
}

const ROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const MIN_ZONE_QUERY_LENGTH = 3;

export default function SearchBar({
  initialTipo = "Departamento",
  initialMoneda = "Pesos",
  initialZonas = [],
  initialMin = "",
  initialMax = "",
  initialMinM2 = "",
  initialMaxM2 = "",
  initialAmbientes = "",
}: SearchBarProps) {
  const router = useRouter();
  const suggestionsCache = useRef(new Map<string, string[]>());

  const [tipo, setTipo] = useState(initialTipo);
  const [moneda, setMoneda] = useState(initialMoneda);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>(initialZonas);
  const [minPrecio, setMinPrecio] = useState(initialMin);
  const [maxPrecio, setMaxPrecio] = useState(initialMax);
  const [minM2, setMinM2] = useState(initialMinM2);
  const [maxM2, setMaxM2] = useState(initialMaxM2);
  const [ambientes, setAmbientes] = useState(initialAmbientes);
  const [inputValue, setInputValue] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [showFiltros, setShowFiltros] = useState(false);

  const deferredInputValue = useDeferredValue(inputValue);
  const activeFilters = Boolean(minPrecio || maxPrecio || minM2 || maxM2 || ambientes);

  const fetchSuggestions = useEffectEvent(
    async (query: string, selectedZones: string[], signal: AbortSignal) => {
      const normalizedQuery = query.trim().toLowerCase();
      const selectedZoneSet = new Set(selectedZones);

      if (suggestionsCache.current.has(normalizedQuery)) {
        setSugerencias(
          (suggestionsCache.current.get(normalizedQuery) ?? []).filter(
            (zone) => !selectedZoneSet.has(zone)
          )
        );
        return;
      }

      const response = await fetch(`/api/barrios?nombre=${encodeURIComponent(query.trim())}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error(`Error buscando barrios: ${response.status}`);
      }

      const data = (await response.json()) as string[];
      suggestionsCache.current.set(normalizedQuery, data);

      if (!signal.aborted) {
        setSugerencias(data.filter((zone) => !selectedZoneSet.has(zone)));
      }
    }
  );

  useEffect(() => {
    const query = deferredInputValue.trim();

    if (query.length < MIN_ZONE_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchSuggestions(query, zonasSeleccionadas, controller.signal).catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error(error);
        setSugerencias([]);
      });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [deferredInputValue, zonasSeleccionadas]);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (value.trim().length < MIN_ZONE_QUERY_LENGTH) {
      setSugerencias([]);
    }
  };

  const agregarZona = (zona: string) => {
    setZonasSeleccionadas((currentZones) =>
      currentZones.includes(zona) ? currentZones : [...currentZones, zona]
    );
    setInputValue("");
    setSugerencias([]);
  };

  const eliminarZona = (zonaEliminar: string) => {
    setZonasSeleccionadas((currentZones) =>
      currentZones.filter((zona) => zona !== zonaEliminar)
    );
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (zonasSeleccionadas.length > 0) params.set("q", zonasSeleccionadas.join(","));
    if (tipo) params.set("tipo", tipo);
    if (moneda) params.set("moneda", moneda);
    if (minPrecio) params.set("min", minPrecio);
    if (maxPrecio) params.set("max", maxPrecio);
    if (minM2) params.set("minM2", minM2);
    if (maxM2) params.set("maxM2", maxM2);
    if (ambientes) params.set("ambientes", ambientes);

    startTransition(() => {
      router.push(`/buscar?${params.toString()}`);
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative z-[9999] flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-0 shadow-xl md:flex-row md:rounded-[2rem]"
    >
      <div className="relative flex items-center border-b border-slate-100 pl-4 md:min-w-[160px] md:border-b-0 md:border-r">
        <select
          value={tipo}
          onChange={(event) => setTipo(event.target.value)}
          className="relative z-10 h-full w-full cursor-pointer appearance-none bg-transparent py-4 text-sm font-bold text-slate-800 focus:outline-none md:py-3"
        >
          <option value="Departamento">Departamento</option>
          <option value="Casa">Casa</option>
          <option value="Ph">PH</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 z-0 text-slate-400 md:right-3"
          size={14}
        />
      </div>

      <div className="relative flex items-center border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r md:px-3 md:py-0">
        <div className="flex w-full rounded-xl bg-slate-100 p-1 md:w-auto">
          <button
            type="button"
            onClick={() => setMoneda("Pesos")}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-[11px] font-black transition-all md:flex-none md:py-1.5 md:text-xs ${
              moneda === "Pesos" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
            }`}
          >
            ARS
          </button>
          <button
            type="button"
            onClick={() => setMoneda("Dolares")}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-[11px] font-black transition-all md:flex-none md:py-1.5 md:text-xs ${
              moneda === "Dolares" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      <div className="relative flex items-center border-b border-slate-100 px-4 py-4 md:border-b-0 md:border-r md:py-0">
        <button
          type="button"
          onClick={() => setShowFiltros((currentValue) => !currentValue)}
          className="flex w-full items-center justify-between gap-2 whitespace-nowrap text-sm font-bold text-slate-700 md:w-auto md:justify-start"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-slate-400" />
            Filtros
            {activeFilters ? (
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            ) : null}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${showFiltros ? "rotate-180" : ""}`}
          />
        </button>

        {showFiltros ? (
          <div className="absolute left-4 right-4 top-[calc(100%+12px)] z-[99999] flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-2xl animate-in fade-in slide-in-from-top-2 md:left-0 md:right-auto md:w-80">
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <DollarSign size={12} /> Precio en {moneda === "Pesos" ? "ARS" : "USD"}
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrecio}
                  onChange={(event) => setMinPrecio(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:outline-none"
                />
                <span className="flex-shrink-0 font-bold text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrecio}
                  onChange={(event) => setMaxPrecio(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Superficie (m2)
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min m2"
                  value={minM2}
                  onChange={(event) => setMinM2(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:outline-none"
                />
                <span className="flex-shrink-0 font-bold text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max m2"
                  value={maxM2}
                  onChange={(event) => setMaxM2(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Ambientes
              </h4>
              <div className="flex flex-wrap gap-2">
                {ROOM_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAmbientes((currentValue) => (currentValue === option ? "" : option))
                    }
                    className={`rounded-xl border px-4 py-2 text-xs font-black transition-all ${
                      ambientes === option
                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFiltros(false)}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-black text-white shadow-md transition-colors hover:bg-blue-700"
            >
              APLICAR
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative flex h-[60px] min-w-0 flex-grow items-center gap-2 px-4">
        <div className="no-scrollbar flex flex-grow flex-nowrap items-center gap-2 overflow-x-auto py-1">
          {zonasSeleccionadas.map((zona) => (
            <div
              key={zona}
              className="flex h-7 flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700"
            >
              <span>{zona}</span>
              <button
                type="button"
                onClick={() => eliminarZona(zona)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <input
            value={inputValue}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder={zonasSeleccionadas.length === 0 ? "Ingresa localidades..." : ""}
            className="h-8 min-w-[120px] flex-grow flex-shrink-0 bg-transparent py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {deferredInputValue.trim().length >= MIN_ZONE_QUERY_LENGTH && sugerencias.length > 0 ? (
          <div className="custom-scrollbar absolute left-0 top-[calc(100%+12px)] z-[99999] max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {sugerencias.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => agregarZona(suggestion)}
                className="w-full border-b border-slate-50 px-6 py-4 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-blue-50 last:border-b-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        className="h-[60px] w-full flex-shrink-0 rounded-b-2xl bg-blue-600 px-10 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 md:h-auto md:w-auto md:rounded-r-[2rem] md:rounded-bl-none"
      >
        Buscar
      </button>
    </form>
  );
}
