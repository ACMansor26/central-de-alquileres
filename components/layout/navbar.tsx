"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BarChart3, Menu, X, Building2 } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  // Si no estamos en la home, el fondo siempre será sólido (blanco)
  const isDarkPage = pathname !== "/";

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    handleScroll(); 
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Lógica de estilos dinámicos
  const isSolidBackground = mounted ? (isScrolled || isDarkPage) : isDarkPage;

  const navbarBg = isSolidBackground
    ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3" 
    : "bg-transparent py-4";

  const textColor = isSolidBackground ? "text-slate-900" : "text-white";
  const subtitleColor = isSolidBackground ? "text-slate-500" : "text-white/90";
  
  const menuContainerBg = isSolidBackground 
    ? "bg-slate-50/80 border-slate-200" 
    : "bg-white/10 border-white/20";

  if (!mounted) {
    return <nav className={`fixed top-0 left-0 right-0 z-[999] px-4 sm:px-8 w-full ${isDarkPage ? "bg-white border-b border-slate-200 py-3" : "bg-transparent py-4"}`} />;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 px-4 sm:px-8 max-w-[100vw] ${navbarBg}`}>
      
      {/* Contenedor principal de la barra */}
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-[1000]">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
          {/* Ícono azul clásico estilo Zillow */}
          <div className="w-10 h-10 bg-[#006AFF] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Building2 size={20} className="text-white" />
          </div>
          <span className={`text-xl tracking-tight transition-colors ${textColor}`}>
            <strong className="font-black">Central</strong>
            <span className={`font-medium hidden sm:inline transition-colors ${subtitleColor}`}> de alquileres</span>
          </span>
        </Link>

        {/* MENÚ DE ESCRITORIO */}
        <div className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-sm transition-colors ${menuContainerBg}`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            
            // Colores de los links dependiendo si el fondo es blanco o transparente
            const activeStyle = isSolidBackground 
              ? "bg-white text-[#006AFF] shadow-sm border border-slate-200" 
              : "bg-white/20 text-white shadow-sm";
            
            const inactiveStyle = isSolidBackground
              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              : "text-white/80 hover:text-white hover:bg-white/10";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive ? activeStyle : inactiveStyle
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
            className={`px-6 py-3 font-bold text-sm rounded-xl transition-all active:scale-95 shadow-sm border ${
              isSolidBackground
                ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-[#006AFF]"
                : "bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#006AFF]"
            }`}
          >
            Metodología
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA (Móvil) */}
        <button 
          className={`md:hidden p-2 transition-colors rounded-xl ${
            isSolidBackground 
              ? "text-slate-700 bg-slate-100 hover:bg-slate-200" 
              : "text-white bg-white/10 hover:bg-white/20"
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MENÚ MÓVIL FULLSCREEN (Siempre fondo blanco para legibilidad) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-[100dvh] bg-white z-[998] flex flex-col md:hidden animate-in fade-in zoom-in-95 duration-200 pt-24 px-6 pb-6">
          
          <div className="flex flex-col gap-3 flex-grow">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-5 rounded-2xl font-bold text-lg transition-colors border ${
                    isActive 
                      ? "bg-[#006AFF]/5 border-[#006AFF]/20 text-[#006AFF]" 
                      : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className={`${isActive ? "text-[#006AFF]" : "text-slate-400"}`}>
                    {link.icon}
                  </div>
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <Link
              href="/metodologia"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-full p-5 bg-[#006AFF] text-white font-bold rounded-2xl text-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Ver Metodología
            </Link>
          </div>
          
        </div>
      )}
    </nav>
  );
}