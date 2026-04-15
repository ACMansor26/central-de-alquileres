"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Filter } from "lucide-react";

interface SortDropdownProps {
  sort?: string;
}

const SORT_OPTIONS = [
  { label: "Más recientes", value: "" },
  { label: "Menor precio", value: "precio_asc" },
  { label: "Mayor precio", value: "precio_desc" },
];

export default function SortDropdown({ sort }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const currentLabel = useMemo(() => {
    return SORT_OPTIONS.find((option) => option.value === (sort ?? ""))?.label ?? "Más recientes";
  }, [sort]);

  const createHref = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sortValue) params.set("sort", sortValue);
    else params.delete("sort");

    params.set("page", "1");

    return `${pathname}?${params.toString()}`;
  };

  return (
    <div ref={containerRef} className="relative z-10 self-start md:self-end">
      <button
        type="button"
        onClick={() => setOpen((currentValue) => !currentValue)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-400"
      >
        <Filter size={16} className="text-slate-400" />
        <span>
          Ordenar por: <span className="text-blue-600">{currentLabel}</span>
        </span>
        <ChevronDown
          size={14}
          className={`ml-1 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = (sort ?? "") === option.value;

            return (
              <Link
                key={option.label}
                href={createHref(option.value)}
                onClick={() => setOpen(false)}
                className={`block border-b border-slate-50 px-5 py-4 font-medium transition-colors last:border-0 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
