"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, X, DollarSign } from "lucide-react";

interface SearchBarProps {
  initialTipo?: string;
  initialMoneda?: string;
  initialZonas?: string[];
  initialMin?: string;
  initialMax?: string;
}

export default function SearchBar({
  initialTipo = "Departamento",
  initialMoneda = "Pesos",
  initialZonas = [],
  initialMin = "",
  initialMax = ""
}: SearchBarProps) {
  const router = useRouter();

  const [tipo, setTipo] = useState(initialTipo);
  const [moneda, setMoneda] = useState(initialMoneda);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>(initialZonas);
  const [minPrecio, setMinPrecio] = useState(initialMin);
  const [maxPrecio, setMaxPrecio] = useState(initialMax);
  
  const [inputValue, setInputValue] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [showPrecios, setShowPrecios] = useState(false);

  useEffect(() => {
    const buscarSugerencias = async () => {
      if (inputValue.length < 2) {
        setSugerencias([]);
        return;
      }
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
    if (!zonasSeleccionadas.includes(zona)) {
      setZonasSeleccionadas([...zonasSeleccionadas, zona]);
    }
    setInputValue("");
    setSugerencias([]);
  };

  const eliminarZona = (zonaEliminar: string) => {
    setZonasSeleccionadas(zonasSeleccionadas.filter(zona => zona !== zonaEliminar));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (zonasSeleccionadas.length > 0) params.append("q", zonasSeleccionadas.join(","));
    if (tipo) params.append("tipo", tipo);
    if (moneda) params.append("moneda", moneda);
    if (minPrecio) params.append("min", minPrecio);
    if (maxPrecio) params.append("max", maxPrecio);
    
    router.push(`/buscar?${params.toString()}`);
  };

  return (
  <form onSubmit={handleSearch} className="bg-white p-3 md:p-2 rounded-2xl md:rounded-full shadow-xl flex flex-col md:flex-row md:gap-2 w-full border border-slate-200 relative z-30">
    
    {/* 1. Selector de Tipo */}
    <div className="relative md:min-w-[160px] border-b md:border-b-0 md:border-r border-slate-100 flex items-center">
      <select 
        value={tipo} onChange={(e) => setTipo(e.target.value)}
        className="w-full h-full px-4 py-3 md:py-3 bg-transparent text-slate-800 font-bold appearance-none focus:outline-none cursor-pointer text-sm"
      >
        <option value="Departamento">Departamento</option>
        <option value="Casa">Casa</option>
        <option value="Ph">PH</option>
      </select>
      <ChevronDown className="absolute right-4 md:right-3 text-slate-400 pointer-events-none" size={14} />
    </div>

    {/* 2. Selector de Moneda */}
    <div className="relative border-b md:border-b-0 md:border-r border-slate-100 flex items-center px-4 md:px-2 py-3 md:py-0">
      <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto justify-center">
        <button type="button" onClick={() => setMoneda("Pesos")} className={`py-1.5 px-6 md:px-3 flex-1 md:flex-none rounded-lg text-[10px] md:text-xs font-black transition-all ${moneda === "Pesos" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>ARS</button>
        <button type="button" onClick={() => setMoneda("Dolares")} className={`py-1.5 px-6 md:px-3 flex-1 md:flex-none rounded-lg text-[10px] md:text-xs font-black transition-all ${moneda === "Dolares" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>USD</button>
      </div>
    </div>

    {/* 3. Filtro de Precio */}
    <div className="relative border-b md:border-b-0 md:border-r border-slate-100 flex items-center px-4 py-3 md:py-0">
      <button type="button" onClick={() => setShowPrecios(!showPrecios)} className="text-slate-700 font-bold flex justify-between md:justify-start items-center gap-2 w-full md:w-auto whitespace-nowrap text-sm">
        <span className="flex items-center gap-2">
          <DollarSign size={16} className="text-slate-400" />
          Precio {(minPrecio || maxPrecio) && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
        </span>
        <ChevronDown size={14} className={`transition-transform ${showPrecios ? 'rotate-180' : ''}`} />
      </button>

      {showPrecios && (
        <div className="absolute top-[calc(100%+10px)] left-0 md:left-0 right-0 md:right-auto mx-4 md:mx-0 bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 z-[100] md:w-72 text-left animate-in fade-in slide-in-from-top-2">
          <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Rango en {moneda}</h4>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPrecio} onChange={(e) => setMinPrecio(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none" />
            <span className="text-slate-400 font-bold">-</span>
            <input type="number" placeholder="Max" value={maxPrecio} onChange={(e) => setMaxPrecio(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none" />
          </div>
          <button type="button" onClick={() => setShowPrecios(false)} className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl text-xs font-black shadow-md">APLICAR</button>
        </div>
      )}
    </div>

    {/* 4. Zonas (Tags + Input) */}
    <div className="flex-grow relative flex items-center gap-2 px-4 py-2 md:py-0 min-h-[60px] md:min-h-[50px]">
      <div className="flex flex-wrap items-center gap-2 flex-grow py-2">
        {zonasSeleccionadas.map(z => (
          <div key={z} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 h-7">
            <span>{z}</span>
            <button type="button" onClick={() => eliminarZona(z)} className="text-slate-400 hover:text-slate-700"><X size={14} /></button>
          </div>
        ))}
        <input 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder={zonasSeleccionadas.length === 0 ? "Ingresá localidades..." : ""} 
          className="flex-grow py-2 text-slate-800 bg-transparent focus:outline-none min-w-[100px] font-medium text-sm h-8 placeholder:text-slate-400" 
        />
      </div>

      {sugerencias.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-y-auto max-h-60">
          {sugerencias.map((s, index) => (
            <button key={`${s}-${index}`} type="button" onClick={() => agregarZona(s)} className="w-full px-6 py-4 hover:bg-blue-50 text-slate-700 font-bold text-sm text-left border-b border-slate-50 last:border-b-0">{s}</button>
          ))}
        </div>
      )}
    </div>

    {/* Botón de búsqueda (Ocupa todo el ancho en móvil, se encoge en PC) */}
    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 md:py-0 w-full md:w-auto rounded-xl md:rounded-full transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm mt-2 md:mt-0">
      Buscar
    </button>
  </form>
);
}