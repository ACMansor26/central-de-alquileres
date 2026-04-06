"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BarChart3, Menu, X, Building2 } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isDarkPage = pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloquea el scroll de la página cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Inicio", href: "/", icon: <Home size={20} /> },
    { name: "Buscar", href: "/buscar", icon: <Search size={20} /> },
    { name: "Análisis", href: "/analisis", icon: <BarChart3 size={20} /> },
  ];

  const navbarBg = (isScrolled || isDarkPage) 
    ? "bg-zinc-950/90 backdrop-blur-md border-b border-white/10 py-3" 
    : "bg-transparent py-4";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 px-4 sm:px-8 max-w-[100vw] ${navbarBg}`}>
      
      {/* Contenedor principal de la barra */}
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-[1000]">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="text-xl tracking-tight text-white">
            <strong className="font-black">Central</strong>
            <span className="font-medium text-indigo-200 hidden sm:inline"> de alquileres</span>
          </span>
        </Link>

        {/* MENÚ DE ESCRITORIO (Se oculta con md:flex) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* BOTÓN METODOLOGÍA (Escritorio) */}
        <div className="hidden md:block">
          <Link 
            href="/metodologia" 
            className="px-6 py-3 bg-white text-zinc-950 font-black text-sm rounded-xl hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 active:scale-95"
          >
            Metodología
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA (Móvil) */}
        <button 
          className="md:hidden p-2 text-white bg-white/10 hover:bg-white/20 transition-colors rounded-xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 👇 CAMBIO CLAVE 2: MENÚ MÓVIL FULLSCREEN 👇 */}
      {/* Al usar fixed inset-0, garantizamos que ocupe 100% de la pantalla del celular */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-[100dvh] bg-zinc-950 z-[998] flex flex-col md:hidden animate-in fade-in zoom-in-95 duration-200 pt-24 px-6 pb-6">
          
          <div className="flex flex-col gap-4 flex-grow">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-5 rounded-2xl font-bold text-lg transition-colors ${
                  pathname === link.href 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className={`${pathname === link.href ? "text-white" : "text-indigo-400"}`}>
                  {link.icon}
                </div>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <Link
              href="/metodologia"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-full p-5 bg-white text-zinc-950 font-black rounded-2xl text-lg hover:bg-zinc-200 transition-colors"
            >
              Ver Metodología
            </Link>
          </div>
          
        </div>
      )}
    </nav>
  );
}