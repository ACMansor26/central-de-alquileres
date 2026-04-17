import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

const MIN_QUERY_LENGTH = 3;
const DB_RESULT_LIMIT = 20;
const RESPONSE_LIMIT = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get("nombre")?.replace(/\s+/g, " ").trim() ?? "";

  if (nombre.length < MIN_QUERY_LENGTH) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from("ubicacion")
      .select("zona")
      .ilike("zona", `%${nombre}%`)
      .order("zona", { ascending: true })
      .limit(DB_RESULT_LIMIT);

    if (error) throw error;

    const zonasUnicas = Array.from(
      new Map(
        (data ?? [])
          .map((item) => item.zona?.trim())
          .filter((zona): zona is string => Boolean(zona))
          .map((zona) => [zona.toLowerCase(), zona])
      ).values()
    ).slice(0, RESPONSE_LIMIT);

    return NextResponse.json(zonasUnicas, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error buscando barrios:", error);
    return NextResponse.json([]);
  }
}
