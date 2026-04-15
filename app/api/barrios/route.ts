import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
      .limit(20);

    if (error) throw error;

    const zonasUnicas = Array.from(
      new Set((data ?? []).map((item) => item.zona).filter(Boolean))
    ).slice(0, 10);

    return NextResponse.json(zonasUnicas);
  } catch (error) {
    console.error("Error buscando barrios:", error);
    return NextResponse.json([]);
  }
}
