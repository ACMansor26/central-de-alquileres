import Link from "next/link";
import { ArrowLeft, Database, Search, ShieldCheck, Zap, UserRoundSearch, BookOpen } from "lucide-react";

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline mb-12">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Documentación Técnica
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Un desglose del proceso de ingeniería de datos detrás de este proyecto personal.
          </p>
        </header>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          {/* FASE 1 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Search size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-blue-600 font-black text-xs tracking-widest uppercase mb-2 block">Fase 1</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ingesta y Agregación</h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                El proceso comienza con la recolección automatizada de datos provenientes de los principales portales inmobiliarios. Se extraen variables críticas como precio, ubicación y dimensiones, consolidando una base de datos centralizada que permite analizar el mercado del AMBA de forma integral.
              </p>
            </div>
          </div>

          {/* FASE 2 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <ShieldCheck size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-indigo-600 font-black text-xs tracking-widest uppercase mb-2 block">Fase 2</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Normalización de Datos</h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                Para asegurar la calidad de la información, se aplican algoritmos de limpieza que eliminan registros duplicados y detectan valores atípicos. Este paso es fundamental para unificar las nomenclaturas geográficas y garantizar que las métricas finales sean consistentes y veraces.
              </p>
            </div>
          </div>

          {/* FASE 3 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Database size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-emerald-600 font-black text-xs tracking-widest uppercase mb-2 block">Fase 3</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Estructura Relacional</h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                Los datos validados se almacenan en un entorno relacional que prioriza la integridad referencial. Esto permite mantener una trazabilidad absoluta entre cada propiedad y su historial de precios, asegurando que no existan inconsistencias en el flujo de información.
              </p>
            </div>
          </div>

          {/* FASE 4 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-rose-100 text-rose-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Zap size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-rose-600 font-black text-xs tracking-widest uppercase mb-2 block">Fase 4</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Optimización de Consulta</h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                La etapa final se centra en la eficiencia de la entrega. Mediante el uso de estructuras de datos pre-calculadas e índices de búsqueda avanzados, la plataforma permite realizar filtrados complejos en milisegundos, ofreciendo una experiencia de usuario fluida y sin latencia.
              </p>
            </div>
          </div>

        </div>

        {/* CUADRO FINAL PERSONALIZADO */}
        <div className="mt-20 p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
          
          <h4 className="text-2xl font-bold text-slate-900 mb-4">Sobre este desarrollo</h4>
          <p className="text-slate-600 mb-8 text-base leading-relaxed text-justify max-w-xl mx-auto">
            Central de Alquileres nace como una iniciativa personal para aplicar metodologías de <strong>Data Analytics y Web Scraping</strong> a una problemática real: la fragmentación del mercado inmobiliario. Como analista de datos en formación, mi objetivo es transformar grandes volúmenes de información en herramientas prácticas que aporten claridad y valor a quienes buscan un nuevo hogar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* REEMPLAZÁ EL LINK POR EL TUYO */}
            <a 
              href="https://www.linkedin.com/in/amir-mansor25/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0077B5] text-white font-bold rounded-2xl hover:bg-[#005f91] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <UserRoundSearch size={20} /> Conectar en LinkedIn
            </a>
            
            <a 
              href="https://public.tableau.com/views/AnlisisdelmercadodealquileresenAMBA/Portada?:language=es-ES&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              <BookOpen size={20} /> Ver informe en tableau
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}