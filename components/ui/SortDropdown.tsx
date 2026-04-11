"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Filter, ChevronDown } from "lucide-react";

interface SortDropdownProps {
  sort?: string;
  // Eliminamos getUrlWithParams de las props
}

export default function SortDropdown({ sort }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Hooks de Next.js para leer y modificar la URL
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función interna para crear la nueva URL
  const createQueryString = useCallback(
    (sortValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (sortValue) {
        params.set("sort", sortValue);
      } else {
        params.delete("sort"); // Si es "Recientes", borramos el parámetro
      }
      
      params.set("page", "1"); // Siempre que ordenamos, volvemos a la página 1
      
      return `${pathname}?${params.toString()}`;
    },
    [searchParams, pathname]
  );

  const label =
    sort === "precio_asc" ? "Menor Precio" :
    sort === "precio_desc" ? "Mayor Precio" :
    "Recientes";

  const opciones = [
    { label: "Más recientes", value: "" },
    { label: "Menor precio",  value: "precio_asc" },
    { label: "Mayor precio",  value: "precio_desc" },
  ];

  return (
    <div className="relative self-start md:self-end z-10" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold shadow-sm hover:border-blue-400 transition-all"
      >
        <Filter size={16} className="text-slate-400" />
        <span>
          Ordenar por:{" "}
          <span className="text-blue-600">{label}</span>
        </span>
        <ChevronDown
          size={14}
          className={`ml-1 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {opciones.map((op) => (
            <Link
              key={op.label}
              // Usamos nuestra función interna para generar el href
              href={createQueryString(op.value)}
              onClick={() => setOpen(false)}
              className="block px-5 py-4 text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-medium border-b last:border-0 border-slate-50 transition-colors"
            >
              {op.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}