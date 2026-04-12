"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X, DollarSign, SlidersHorizontal } from "lucide-react";

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

  const hayFiltrosActivos = minPrecio || maxPrecio || minM2 || maxM2 || ambientes;

  useEffect(() => {
    const buscarSugerencias = async () => {
      if (inputValue.length < 2) { setSugerencias([]); return; }
      try {
        const response = await fetch(`/api/barrios?nombre=${inputValue}`);
        const data = await response.json();
        setSugerencias(data.filter((s: string) => !zonasSeleccionadas.includes(s)));
      } catch (error) { console.error(error); }
    };
    const timer = setTimeout(buscarSugerencias, 300);
    return () => clearTimeout(timer);
  }, [inputValue, zonasSeleccionadas]);

  const agregarZona = (zona: string) => {
    if (!zonasSeleccionadas.includes(zona)) setZonasSeleccionadas([...zonasSeleccionadas, zona]);
    setInputValue("");
    setSugerencias([]);
  };

  const eliminarZona = (zonaEliminar: string) => {
    setZonasSeleccionadas(zonasSeleccionadas.filter(zona => zona !== zonaEliminar));
  };

  // 👇 handleSearch corregido — solo arma la URL
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (zonasSeleccionadas.length > 0) params.append("q", zonasSeleccionadas.join(","));
    if (tipo) params.append("tipo", tipo);
    if (moneda) params.append("moneda", moneda);
    if (minPrecio) params.append("min", minPrecio);
    if (maxPrecio) params.append("max", maxPrecio);
    if (minM2) params.append("minM2", minM2);
    if (maxM2) params.append("maxM2", maxM2);
    if (ambientes) params.append("ambientes", ambientes);
    router.push(`/buscar?${params.toString()}`);
  };

  const opcionesAmbientes = ["1", "2", "3", "4", "5+"];

  return (
    <form onSubmit={handleSearch} className="bg-white p-0 rounded-2xl md:rounded-[2rem] shadow-xl flex flex-col md:flex-row w-full border border-slate-200 relative z-[9999]">

      {/* 1. Selector de Tipo */}
      <div className="relative md:min-w-[160px] border-b md:border-b-0 md:border-r border-slate-100 flex items-center pl-4">
        <select
          value={tipo} onChange={(e) => setTipo(e.target.value)}
          className="w-full h-full py-4 md:py-3 bg-transparent text-slate-800 font-bold appearance-none focus:outline-none cursor-pointer text-sm relative z-10"
        >
          <option value="Departamento">Departamento</option>
          <option value="Casa">Casa</option>
          <option value="Ph">PH</option>
        </select>
        <ChevronDown className="absolute right-4 md:right-3 text-slate-400 pointer-events-none z-0" size={14} />
      </div>

      {/* 2. Selector de Moneda */}
      <div className="relative border-b md:border-b-0 md:border-r border-slate-100 flex items-center px-4 md:px-3 py-3 md:py-0">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button type="button" onClick={() => setMoneda("Pesos")} className={`flex-1 md:flex-none py-2 md:py-1.5 px-4 text-center rounded-lg text-[11px] md:text-xs font-black transition-all ${moneda === "Pesos" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>ARS</button>
          <button type="button" onClick={() => setMoneda("Dolares")} className={`flex-1 md:flex-none py-2 md:py-1.5 px-4 text-center rounded-lg text-[11px] md:text-xs font-black transition-all ${moneda === "Dolares" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>USD</button>
        </div>
      </div>

      {/* 3. Filtros (Precio + M2 + Ambientes) */}
      <div className="relative border-b md:border-b-0 md:border-r border-slate-100 flex items-center px-4 py-4 md:py-0">
        <button
          type="button"
          onClick={() => setShowFiltros(!showFiltros)}
          className="text-slate-700 font-bold flex justify-between md:justify-start items-center gap-2 w-full md:w-auto whitespace-nowrap text-sm"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-slate-400" />
            Filtros
            {hayFiltrosActivos && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
          </span>
          <ChevronDown size={14} className={`transition-transform ${showFiltros ? "rotate-180" : ""}`} />
        </button>

        {showFiltros && (
          <div className="absolute top-[calc(100%+12px)] left-4 md:left-0 right-4 md:right-auto bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 z-[99999] md:w-80 text-left animate-in fade-in slide-in-from-top-2 flex flex-col gap-6">

            {/* Precio */}
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                <DollarSign size={12} /> Precio en {moneda === "Pesos" ? "ARS" : "USD"}
              </h4>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={minPrecio} onChange={(e) => setMinPrecio(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none" />
                <span className="text-slate-400 font-bold flex-shrink-0">—</span>
                <input type="number" placeholder="Max" value={maxPrecio} onChange={(e) => setMaxPrecio(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none" />
              </div>
            </div>

            {/* M2 */}
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Superficie (m²)</h4>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min m²" value={minM2} onChange={(e) => setMinM2(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none" />
                <span className="text-slate-400 font-bold flex-shrink-0">—</span>
                <input type="number" placeholder="Max m²" value={maxM2} onChange={(e) => setMaxM2(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none" />
              </div>
            </div>

            {/* Ambientes */}
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Ambientes</h4>
              <div className="flex gap-2 flex-wrap">
                {opcionesAmbientes.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setAmbientes(ambientes === op ? "" : op)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${ambientes === op ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"}`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFiltros(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-black shadow-md hover:bg-blue-700 transition-colors"
            >
              APLICAR
            </button>
          </div>
        )}
      </div>

      {/* 4. Zonas (Tags + Input) */}
      <div className="flex-grow min-w-0 relative flex items-center gap-2 px-4 h-[60px] md:h-[60px]">
        <div className="flex flex-nowrap items-center gap-2 flex-grow overflow-x-auto no-scrollbar py-1">
          {zonasSeleccionadas.map(z => (
            <div key={z} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 h-7 flex-shrink-0">
              <span>{z}</span>
              <button type="button" onClick={() => eliminarZona(z)} className="text-slate-400 hover:text-slate-700"><X size={14} /></button>
            </div>
          ))}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={zonasSeleccionadas.length === 0 ? "Ingresá localidades..." : ""}
            className="flex-grow py-2 text-slate-800 bg-transparent focus:outline-none min-w-[120px] font-medium text-sm h-8 placeholder:text-slate-400 flex-shrink-0"
          />
        </div>

        {sugerencias.length > 0 && (
          <div className="absolute left-0 top-[calc(100%+12px)] w-full bg-white rounded-2xl shadow-2xl border border-slate-200 z-[99999] overflow-y-auto max-h-60 custom-scrollbar">
            {sugerencias.map((s, index) => (
              <button key={`${s}-${index}`} type="button" onClick={() => agregarZona(s)} className="w-full px-6 py-4 hover:bg-blue-50 text-slate-700 font-bold text-sm text-left border-b border-slate-50 last:border-b-0 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Botón de búsqueda */}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 h-[60px] md:h-auto w-full md:w-auto rounded-b-2xl md:rounded-bl-none md:rounded-r-[2rem] transition-all active:scale-95 text-sm flex-shrink-0"
      >
        Buscar
      </button>
    </form>
  );
}