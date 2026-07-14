/**
 * Client app enhancement file.
 *
 * https://v1.vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements
 */

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
  // Load download links dynamically from downloads.json
  if (typeof window !== 'undefined') {
    router.onReady(() => {
      // Run on initial load and after each route change
      const loadDownloadLinks = () => {
        const downloadLinksDiv = document.getElementById('download-links');
        if (!downloadLinksDiv) return;

        fetch('https://signalsandsorcery.com/downloads.json')
          .then(response => response.json())
          .then(data => {
            // Supported platforms: Apple Silicon mac + Windows x64. Each
            // carries its own version — releases are cut per-OS and may be
            // staggered, so the versions can briefly differ. (Intel mac was
            // retired; old DMGs remain hosted but are no longer listed.)
            const mac = data.platforms?.mac || {};
            const windows = data.platforms?.windows || {};
            let html = '<ul style="list-style: none; padding: 0;">';

            if (mac.arm64) {
              const v = mac.arm64.version ? ` (v${mac.arm64.version})` : '';
              html += `<li style="margin: 10px 0;"><strong><a href="${mac.arm64.url}">Mac — Apple Silicon</a></strong>${v} - Download for Apple Silicon Macs</li>`;
            } else {
              html += '<li style="margin: 10px 0;"><strong>Mac — Apple Silicon</strong> - Coming soon</li>';
            }

            if (windows.x64) {
              const v = windows.x64.version ? ` (v${windows.x64.version})` : '';
              html += `<li style="margin: 10px 0;"><strong><a href="${windows.x64.url}">Windows — 64-bit</a></strong>${v} - Download for Windows 10/11</li>`;
            } else {
              html += '<li style="margin: 10px 0;"><strong>Windows — 64-bit</strong> - Coming soon</li>';
            }

            html += '</ul>';
            downloadLinksDiv.innerHTML = html;
          })
          .catch(error => {
            console.error('Failed to load download links:', error);
            downloadLinksDiv.innerHTML = '<p>Unable to load download links. Please visit <a href="https://signalsandsorcery.com">signalsandsorcery.com</a></p>';
          });
      };

      // Load on initial page
      loadDownloadLinks();

      // Reload after each route change
      router.afterEach(() => {
        Vue.nextTick(() => {
          loadDownloadLinks();
        });
      });
    });
  }
}
