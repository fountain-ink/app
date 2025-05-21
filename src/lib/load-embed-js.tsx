"use client"

export function loadIframelyEmbedJs() {
  if (document.querySelectorAll("[data-iframely-url]").length === 0
    && document.querySelectorAll("iframe[src*='iframe.ly']").length === 0) return;
  var iframely = (window as any).iframely = (window as any).iframely || {};
  if (iframely.load) {
    iframely.load();
  } else {
    var ifs = document.createElement('script'); ifs.type = 'text/javascript'; ifs.async = true;
    ifs.src = (document.location.protocol === 'https:' ? 'https:' : 'http:') + '//cdn.iframe.ly/embed.js';
    var s = document.getElementsByTagName('script')[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(ifs, s);
    }
  }
}



