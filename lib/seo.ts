import type { Metadata } from "next";

export const SITE_NAME = "Central de Alquileres";
export const SITE_DESCRIPTION =
  "Buscador de alquileres en AMBA con propiedades consolidadas, filtros rapidos y analisis del mercado.";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

function normalizeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export function getBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  return new URL(normalizeUrl(envUrl || "http://localhost:3000"));
}

export function absoluteUrl(path = "/") {
  return new URL(path, getBaseUrl()).toString();
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  images = [DEFAULT_OG_IMAGE],
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(path);
  const absoluteImages = images.map((image) => absoluteUrl(image));

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "es_AR",
      type: "website",
      images: absoluteImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: absoluteImages,
    },
  };
}
