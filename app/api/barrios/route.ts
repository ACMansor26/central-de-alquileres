import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 🚀 1. Le decimos a Next.js que corra esto en Vercel Edge (cero milisegundos de arranque)
export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get("nombre")?.trim();

  if (!nombre || nombre.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from("ubicacion")
      .select("zona")
      .ilike("zona", `%${nombre}%`)
      // Traemos un poco más de resultados por si hay muchos repetidos antes del Set
      .limit(50); 

    if (error) throw error;

    const zonasUnicas = Array.from(
      new Set((data ?? []).map((item) => item.zona).filter(Boolean))
    ).slice(0, 10);

    // 🚀 2. MAGIA DE CACHÉ: Guardamos la respuesta en la red de Vercel/Next por 24 horas.
    // Si alguien busca lo mismo, la respuesta es instantánea.
    return NextResponse.json(zonasUnicas, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("Error buscando barrios:", error);
    return NextResponse.json([]);
  }
}