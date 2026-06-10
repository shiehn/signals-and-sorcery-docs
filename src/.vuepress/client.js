/**
 * VuePress 2 client config — signup-funnel telemetry for the marketing site.
 *
 * Two jobs:
 *
 * 1. `download_click` events on the .dmg download buttons (arch + version),
 *    fired into the shared GA4 property (G-B2QMDKHWHF, bootstrapped cookieless
 *    in config.js with consent defaulted to denied).
 *
 * 2. SPA `page_view` events on client-side route changes. The inline gtag
 *    snippet only reports the initial load; the old analytics plugin's router
 *    hook is replicated here.
 *
 * The previous funnel_id localStorage + `#funnel_id=` URL-fragment hop was
 * removed: a fragment on a .dmg link cannot survive download → install →
 * first launch, so the app mints its own funnel_id (sas-app
 * src/main/auth/funnel-id.ts) and no identifier needs to be stored on the
 * website at all.
 */
import { defineClientConfig } from '@vuepress/client';

const DOWNLOAD_HREF_PATTERN = /storage\.googleapis\.com\/docs-assets\/signals-and-sorcery-/;

function findDownloadAnchor(target) {
  // Walk up to 3 ancestors looking for an <a> with a matching href. Three is
  // enough for the markdown-rendered button structure (a > strong > text).
  let el = target;
  for (let i = 0; i < 4 && el; i += 1) {
    if (el.tagName === 'A' && el.href && DOWNLOAD_HREF_PATTERN.test(el.href)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function extractArchAndVersion(href) {
  const arch = href.includes('arm64') ? 'arm64' : 'x64';
  const versionMatch = /signals-and-sorcery-([\d_]+)/.exec(href);
  const appVersion = versionMatch ? versionMatch[1].replace(/_/g, '.') : 'unknown';
  return { arch, appVersion };
}

function handleDownloadInteraction(event) {
  const anchor = findDownloadAnchor(event.target);
  if (!anchor) return;

  // gtag is installed by the inline snippet in config.js — undefined in
  // dev/SSR contexts, in which case we silently no-op.
  if (typeof window.gtag === 'function') {
    const { arch, appVersion } = extractArchAndVersion(anchor.href);
    window.gtag('event', 'download_click', {
      arch,
      app_version: appVersion,
    });
  }
}

export default defineClientConfig({
  enhance({ app, router }) {
    if (typeof window === 'undefined') return;

    // Use a single delegated mousedown listener so it picks up future download
    // buttons added on later releases without re-binding.
    window.addEventListener('mousedown', handleDownloadInteraction, { capture: true });

    // SPA page_views. The initial load is reported by gtag('config') in the
    // head snippet; from.matched is empty exactly (and only) for that first
    // navigation, so skipping it avoids a double count.
    router.afterEach((to, from) => {
      if (typeof window.gtag !== 'function') return;
      if (from.matched.length === 0) return;
      window.gtag('event', 'page_view', {
        page_path: to.fullPath,
        page_location: window.location.origin + to.fullPath,
        page_title: document.title,
      });
    });
  },
});
