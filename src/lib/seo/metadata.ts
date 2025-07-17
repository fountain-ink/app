import type { Metadata } from "next";
import { generateCanonicalUrl } from "./canonical";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./constants";

interface EnhancedMetadataProps {
  title?: string;
  description?: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    creator?: string;
  };
  noIndex?: boolean;
  customCanonical?: string;
}

export function generateEnhancedMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  ogImage,
  ogType = "website",
  article,
  twitter,
  noIndex = false,
  customCanonical,
}: EnhancedMetadataProps): Metadata {
  const canonicalUrl = customCanonical || generateCanonicalUrl(path);
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: ogType,
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title || SITE_NAME,
          },
        ],
      }),
    },
    twitter: {
      card: twitter?.card || (ogImage ? "summary_large_image" : "summary"),
      creator: twitter?.creator,
      title: fullTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: true,
      },
    }),
  };

  if (article && ogType === "article") {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime: article.publishedTime,
      modifiedTime: article.modifiedTime,
      authors: article.author ? [article.author] : undefined,
      section: article.section,
      tags: article.tags,
    };
  }

  return metadata;
}

export function generateStructuredDataScript(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
