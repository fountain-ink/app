import { SITE_NAME, SITE_URL } from "./constants";

interface ArticleSchemaProps {
  title: string;
  description?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  image?: string;
  url: string;
  tags?: string[];
}

export function generateArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  author,
  image,
  url,
  tags,
}: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
    ...(tags &&
      tags.length > 0 && {
        keywords: tags.join(", "),
      }),
  };
}

interface PersonSchemaProps {
  name: string;
  username: string;
  description?: string;
  image?: string;
  url: string;
}

export function generatePersonSchema({ name, username, description, image, url }: PersonSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: username,
    description,
    url,
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  };
}

interface BlogSchemaProps {
  name: string;
  description?: string;
  url: string;
  author: {
    name: string;
    url?: string;
  };
}

export function generateBlogSchema({ name, description, url, author }: BlogSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name,
    description,
    url,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
