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
            const mac = data.platforms?.mac || {};
            let html = '<ul style="list-style: none; padding: 0;">';

            if (mac.arm64) {
              html += `<li style="margin: 10px 0;"><strong><a href="${mac.arm64.url}">Apple Silicon Mac</a></strong> - Download for Apple Silicon Macs</li>`;
            }

            if (mac.x64) {
              html += `<li style="margin: 10px 0;"><strong><a href="${mac.x64.url}">Intel Mac</a></strong> - Download for Intel Macs</li>`;
            } else {
              html += '<li style="margin: 10px 0;"><strong>Intel Mac</strong> - Coming soon</li>';
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
