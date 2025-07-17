import { SITE_URL } from "./constants";

export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const normalizedPath = cleanPath.replace(/\/+/g, "/").replace(/\/$/, "");

  const baseUrl = SITE_URL.replace(/\/$/, "");

  return `${baseUrl}${normalizedPath || "/"}`;
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url, SITE_URL);

    const pathname = parsed.pathname.replace(/\/+/g, "/").replace(/\/$/, "");

    return `${parsed.origin}${pathname || "/"}`;
  } catch {
    return generateCanonicalUrl(url);
  }
}
