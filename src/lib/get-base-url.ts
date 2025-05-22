export const getBaseUrl = () => {
  let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? process?.env?.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000/";

  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;

  // Make sure to include trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;

  return url;
};
