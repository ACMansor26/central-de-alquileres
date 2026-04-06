import Link from "next/link";
import { BarChart3, ArrowLeft, BellRing } from "lucide-react";

export default function AnalisisProximamentePage() {
  return (
    // Agregamos pt-32 y pb-20 para evitar que el Navbar tape el contenido
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden px-4 pt-32 pb-20">
      
      {/* Luces de fondo abstractas */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Ampliamos el max-w a 3xl para que todo tenga más respiro */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        
        {/* Agrandamos un poco el ícono y su margen inferior */}
        <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md mb-10 shadow-2xl shadow-blue-500/20">
          <BarChart3 size={48} className="text-blue-400" />
        </div>

        <span className="px-5 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase rounded-full mb-8">
          En Desarrollo
        </span>

        {/* Le damos más aire al título con mb-8 */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
          El mercado inmobiliario,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            traducido a datos.
          </span>
        </h1>

        {/* Aumentamos el texto, el interlineado y el margen inferior */}
        <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-14 max-w-2xl">
          Estamos procesando miles de publicaciones históricas para traerte gráficos interactivos, evolución de precios y rentabilidad por barrio en el AMBA.
        </p>

        {/* Separamos un poco más los botones */}
        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
          <Link href="/" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors backdrop-blur-sm">
            <ArrowLeft size={20} /> Volver al buscador
          </Link>
        </div>
      </div>
    </main>
  );
}