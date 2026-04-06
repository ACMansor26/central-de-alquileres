import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get('nombre');

  if (!nombre || nombre.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // 👇 ESTE .ilike() ES EL QUE DISPARA EL ÍNDICE TRIGRAM EN POSTGRES 👇
    const { data, error } = await supabase
      .from('ubicacion') // O 'mv_propiedades_listas' si querés sacar los barrios de ahí
      .select('zona')
      .ilike('zona', `%${nombre}%`) 
      .limit(10); // Límite bajo porque es solo para sugerencias

    if (error) throw error;

    // Extraemos solo los nombres y sacamos duplicados
    const zonasUnicas = Array.from(new Set(data.map(item => item.zona)));
    
    return NextResponse.json(zonasUnicas);
  } catch (error) {
    console.error("Error buscando barrios:", error);
    return NextResponse.json([]);
  }
}