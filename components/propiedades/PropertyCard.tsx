"use client";

import Link from "next/link";
import { 
  Maximize, 
  Car, 
  Waves, 
  ShieldCheck, 
  ExternalLink,
  PawPrint,
  MapPin 
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
  tieneCochera: boolean;
  tienePileta: boolean;
  tieneSeguridad: boolean;
  politicaMascotas?: string;
  url: string;
  imagen_url: string | null; 
}

export default function PropertyCard({ data }: { data: PropertyData }) {
  // 1. Manejo seguro de la URL (si es nula o undefined, asigna string vacío)
  const urlSegura = data?.url || "";
  
  // 2. Determinamos la fuente usando la url segura
  const esZonaprop = urlSegura.toLowerCase().includes('zonaprop');
  const nombreFuente = esZonaprop ? 'Zonaprop' : 'Argenprop';

  // 3. Definimos el Placeholder Oficial (Imagen de respaldo)
  const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop";

  
  return (
    <Link 
      href={urlSegura || "#"} 
      target={urlSegura ? "_blank" : "_self"} 
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-300 overflow-hidden cursor-pointer"
      title={urlSegura ? `Ver publicación original en ${nombreFuente}` : "Publicación original no disponible"}
    >
      
      {/* ── IMAGEN DIRECTA CON BLINDAJE ── */}
      <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
        <img 
          // Usamos la URL directa de la base de datos
          src={data?.imagen_url && data.imagen_url.trim() !== "" ? data.imagen_url : PLACEHOLDER_IMG} 
          alt={`Propiedad en ${data?.direccion || "AMBA"}`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          
          // Escudo Nivel 1: Evita enviar datos de tu web a Zonaprop para sortear bloqueos simples
          referrerPolicy="no-referrer"
          
          // Escudo Nivel 2: Si el link está roto o nos bloquean de todos modos, usamos el placeholder
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-black text-slate-800 shadow-sm z-10">
          {data?.tipo}
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        
        <div className="flex items-start gap-1 text-indigo-600 mb-2">
          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
          <span className="text-xs font-black uppercase tracking-widest truncate">
            {data?.zona}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-6 line-clamp-2 group-hover:text-indigo-700 transition-colors" title={data?.direccion}>
          {data?.direccion}
        </h3>

        {/* ── PRECIO Y FUENTE ── */}
        <div className="mt-auto flex flex-col gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Precio Alquiler
              </span>
              <p className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1">
                {data?.moneda === 'Dolares' ? 'U$S' : '$'}
                {data?.precio?.toLocaleString("es-AR") || "0"}
              </p>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border ${
              esZonaprop ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              {nombreFuente}
            </span>
          </div>

          {/* Lógica de Expensas */}
          <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center">
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

        {/* ── AMENITIES Y FOOTER ── */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-500">
          
          <div className="flex items-center gap-4">
            {/* Metros: Envuelto en un div (o span) para el tooltip nativo sin romper TypeScript */}
            <div className="flex items-center gap-1.5 text-slate-700 group-hover:text-indigo-600 transition-colors cursor-help" title="Metros totales">
              <Maximize size={16} className="text-slate-400 group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-bold">
                {data?.metros > 0 ? `${data.metros} m²` : <span className="text-[11px] text-slate-400 font-medium">N/D m²</span>}
              </span>
            </div>
            
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              
              {/* Mascotas */}
              <span title={`Mascotas: ${data?.politicaMascotas || "No menciona"}`} className="cursor-help">
                <PawPrint 
                  size={16} 
                  className={`transition-all duration-300 ${
                    data?.politicaMascotas === "Acepta" 
                      ? "text-rose-500 hover:scale-125 opacity-100" 
                      : "text-slate-400 opacity-40 grayscale"
                  }`} 
                />
              </span>
              
              {/* Cochera */}
              <span title={data?.tieneCochera ? "Tiene Cochera" : "Sin cochera"} className="cursor-help">
                <Car 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tieneCochera ? "text-indigo-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>
              
              {/* Pileta */}
              <span title={data?.tienePileta ? "Tiene Pileta" : "Sin pileta"} className="cursor-help">
                <Waves 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tienePileta ? "text-cyan-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>
              
              {/* Seguridad */}
              <span title={data?.tieneSeguridad ? "Seguridad 24hs" : "Sin seguridad"} className="cursor-help">
                <ShieldCheck 
                  size={16} 
                  className={`transition-all duration-300 ${data?.tieneSeguridad ? "text-emerald-500 hover:scale-125 opacity-100" : "text-slate-400 opacity-40 grayscale"}`} 
                />
              </span>
              
            </div>
          </div>

          <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors border ${urlSegura ? 'bg-slate-50 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 border-slate-200 group-hover:border-indigo-200' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
            <ExternalLink size={16} />
          </div>
        </div>

      </div>
    </Link>
  );
}