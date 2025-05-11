export const LoadEmbedJs = () => {
  return (
    <script type="text/javascript">
      {`
    function loadIframelyEmbedJs() {
      if (document.querySelectorAll("[data-iframely-url]").length === 0
        && document.querySelectorAll("iframe[src*='iframe.ly']").length === 0) return;
      var iframely = window.iframely = window.iframely || {};
      if (iframely.load) {
        iframely.load();
      } else {
        var ifs = document.createElement('script'); ifs.type = 'text/javascript'; ifs.async = true;
        ifs.src = ('https:' == document.location.protocol ? 'https:' : 'http:') + '//cdn.iframe.ly/embed.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ifs, s);
      }
    }

    loadIframelyEmbedJs();

  `}
    </script>
  )
};

