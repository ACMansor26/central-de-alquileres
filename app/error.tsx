"use client";

import RouteErrorState from "@/components/ui/RouteErrorState";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="No pudimos cargar esta vista"
      description="Hubo un problema al traer los datos o renderizar la pagina. Podés reintentar o volver al inicio."
      reset={reset}
    />
  );
}
