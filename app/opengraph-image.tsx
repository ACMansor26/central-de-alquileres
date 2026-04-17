import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, rgb(248,250,252) 0%, rgb(219,234,254) 45%, rgb(255,255,255) 100%)",
          color: "#0f172a",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
            color: "#2563eb",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#2563eb",
              display: "flex",
            }}
          />
          Central de Alquileres
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: "80%" }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 800 }}>
            Alquileres y datos del mercado en un solo lugar
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "#334155" }}>
            Buscador de propiedades en AMBA con filtros, destacadas y analisis del mercado.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#475569",
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>Departamentos</span>
            <span>Casas</span>
            <span>PH</span>
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>AMBA</div>
        </div>
      </div>
    ),
    size
  );
}
