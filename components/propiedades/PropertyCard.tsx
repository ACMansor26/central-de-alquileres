"use client";

import Link from "next/link";
import { 
  Maximize, 
  Car, 
  Waves, 
  ShieldCheck, 
  ExternalLink,
  PawPrint,
  MapPin,
  Star,
  Sun,
  CalendarDays,
  TreePine,
  Wind
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

export default function PropertyCard({ data }: { data: PropertyData }) {
  const renderMetrosYAmbientes = () => {
    const tieneMetros = data.metros && data.metros > 0;
    const tieneAmbientes = data.ambientes && data.ambientes > 0;

    if (tieneMetros && tieneAmbientes) {
      return `${data.metros} m² | ${data.ambientes} amb`;
    }
    if (!tieneMetros && tieneAmbientes) {
      return `${data.ambientes} amb`;
    }
    if (tieneMetros && !tieneAmbientes) {
      return `${data.metros} m²`;
    }
    
    return "N/D m²";
  };

  const urlSegura = data?.url || "";
  const esZonaprop = urlSegura.toLowerCase().includes('zonaprop');
  const nombreFuente = esZonaprop ? 'Zonaprop' : 'Argenprop';
  const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop";

  return (
    <Link 
      href={urlSegura || "#"} 
      target={urlSegura ? "_blank" : "_self"} 
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-300 overflow-hidden cursor-pointer relative"
      title={urlSegura ? `Ver publicación original en ${nombreFuente}` : "Publicación original no disponible"}
    >
      
      {/* ── IMAGEN Y BADGES SUPERIORES ── */}
      <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
        <img 
          src={data?.imagen_url && data.imagen_url.trim() !== "" ? data.imagen_url : PLACEHOLDER_IMG} 
          alt={`Propiedad en ${data?.direccion || "AMBA"}`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />
        
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-black text-slate-800 shadow-sm z-10">
          {data?.tipo}
        </div>

        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
          {data?.amenityScore !== undefined && data.amenityScore >= (data.tipo.toLowerCase() === 'casa' ? 5 : 4) ? (
            <div className="bg-amber-400/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-amber-950 shadow-sm flex items-center gap-1.5">
              <Star size={12} className="fill-amber-950" /> PREMIUM
            </div>
          ) : null}

          {data?.orientacion && (data.orientacion.toLowerCase().includes('norte') || data.orientacion.toLowerCase().includes('este')) ? (
            <div className="bg-sky-400/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-sky-950 shadow-sm flex items-center gap-1.5">
              <Sun size={12} className="fill-sky-950" /> LUMINOSO
            </div>
          ) : null}
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        
        {/* ── NUEVA CABECERA CENTRADA ── */}
        <div className="flex flex-col items-center text-center mb-6 gap-1.5">
          
          {/* 1. Antigüedad */}
          {data?.antiguedad_anios !== undefined && data?.antiguedad_anios !== null && (
             <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
               <CalendarDays size={12} />
               <span>{data.antiguedad_anios === 0 ? "A estrenar" : `${data.antiguedad_anios} años`}</span>
             </div>
          )}

          {/* 2. Zona / Localidad */}
          <div className="flex items-center justify-center gap-1 text-indigo-600">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest">
              {data?.zona}
            </span>
          </div>
          
          {/* 3. Dirección */}
          <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-indigo-700 transition-colors mt-1" title={data?.direccion}>
            {data?.direccion}
          </h3>

        </div>

        {/* ── SECCIÓN PRECIO ── */}
        <div className="mt-auto flex flex-col gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
          
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start relative w-full">
            
            {/* Badge de Fuente */}
            <div className="w-full flex justify-center sm:w-auto sm:justify-end sm:order-2 mb-3 sm:mb-0">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border ${
                esZonaprop ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {nombreFuente}
              </span>
            </div>
            
            {/* Texto de Precio */}
            <div className="sm:order-1 flex flex-col items-center sm:items-start w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1 text-center sm:text-left">
                Precio Alquiler
              </span>
              <p className="text-2xl font-extrabold text-slate-900 flex items-baseline justify-center sm:justify-start gap-1">
                {data?.moneda === 'Dolares' || data?.moneda === 'USD' ? 'U$S' : '$'}
                {data?.precio?.toLocaleString("es-AR") || "0"}
              </p>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Expensas
            </span>
            <span className="text-sm font-bold text-slate-700">
              {data?.expensas && data.expensas > 0 
                ? `+ $${data.expensas.toLocaleString("es-AR")}` 
                : "No expresadas"}
            </span>
          </div>
        </div>

        {/* ── SECCIÓN AMENITIES ── */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-500 relative">
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full pr-8 sm:pr-0">
            
            {/* Fila 1: Metros | Ambientes */}
            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-sm whitespace-nowrap">
              <Maximize size={16} className="text-slate-400" /> 
              <span className="font-medium">{renderMetrosYAmbientes()}</span>
            </div>
            
            {/* Fila 2: Íconos */}
            <div className="flex items-center justify-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
              
              <span title={`Mascotas: ${data?.politicaMascotas || "No menciona"}`} className="cursor-help">
                <PawPrint 
                  size={16} 
                  className={`transition-all duration-300 ${
                    data?.politicaMascotas?.toLowerCase().includes("si") || data?.politicaMascotas?.toLowerCase().includes("permite") || data?.politicaMascotas === "Acepta"
                      ? "text-rose-500 hover:scale-125 opacity-100" 
                      : "text-slate-400 opacity-40 grayscale"
                  }`} 
                />
              </span>

              <span title={data?.tienePatio ? "Tiene Patio" : "Sin patio"} className="cursor-help">
                <TreePine 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tienePatio ? "text-green-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>

              <span title={data?.tieneBalcon ? "Tiene Balcón" : "Sin balcón"} className="cursor-help">
                <Wind 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tieneBalcon ? "text-sky-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>
              
              <span title={data?.tieneCochera ? "Tiene Cochera" : "Sin cochera"} className="cursor-help">
                <Car 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tieneCochera ? "text-indigo-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>
              
              <span title={data?.tienePileta ? "Tiene Pileta" : "Sin pileta"} className="cursor-help">
                <Waves 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tienePileta ? "text-cyan-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>
              
              <span title={data?.tieneSeguridad ? "Seguridad 24hs" : "Sin seguridad"} className="cursor-help">
                <ShieldCheck 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tieneSeguridad ? "text-emerald-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>
              
            </div>
          </div>

          <div className={`absolute right-0 sm:static w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors border ${urlSegura ? 'bg-slate-50 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 border-slate-200 group-hover:border-indigo-200' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
            <ExternalLink size={14} />
          </div>
        </div>

      </div>
    </Link>
  );
}