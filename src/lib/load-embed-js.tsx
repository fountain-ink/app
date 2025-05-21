"use client";

export function loadIframelyEmbedJs() {
  if (
    document.querySelectorAll("[data-iframely-url]").length === 0 &&
    document.querySelectorAll("iframe[src*='iframe.ly']").length === 0
  )
    return;
  const iframely = ((window as any).iframely = (window as any).iframely || {});
  if (iframely.load) {
    iframely.load();
  } else {
    const ifs = document.createElement("script");
    ifs.type = "text/javascript";
    ifs.async = true;
    ifs.src = `${document.location.protocol === "https:" ? "https:" : "http:"}//cdn.iframe.ly/embed.js`;
    const s = document.getElementsByTagName("script")[0];
    if (s?.parentNode) {
      s.parentNode.insertBefore(ifs, s);
    }
  }
}
