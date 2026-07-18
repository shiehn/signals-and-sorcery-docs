/**
 * VuePress 2 client config: download-links renderer + signup-funnel
 * telemetry for the marketing site.
 *
 * Three jobs:
 *
 * 1. The `<DownloadLinks/>` component (used by the homepage,
 *    getting-started, and guild pages): renders the platform download list
 *    from downloads.json. Releases are cut per-OS and may be staggered, so
 *    each platform entry carries its own version — the markdown must NEVER
 *    hardcode versioned artifact URLs (sas-app's
 *    verify-version-consistency.js enforces this). Supported platforms are
 *    Mac Apple Silicon + Windows x64; Intel mac is retired (old DMGs stay
 *    hosted for existing users but are no longer listed). A platform with
 *    no manifest entry yet renders "Coming soon".
 *
 * 2. `download_click` events on the download links (arch + version), fired
 *    into the shared GA4 property (G-B2QMDKHWHF, bootstrapped via the
 *    inline gtag snippet in config.js). The listener is delegated, so it
 *    catches the dynamically-rendered <DownloadLinks/> anchors too.
 *
 * 3. SPA `page_view` events on client-side route changes. The inline gtag
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
import { defineComponent, h, onMounted, ref } from 'vue';

const DOWNLOADS_JSON_URL = 'https://signalsandsorcery.com/downloads.json';

// One manifest fetch per page session, shared by every <DownloadLinks/>
// instance. A failed fetch clears the cache so a later mount can retry.
let manifestPromise = null;
function fetchManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(DOWNLOADS_JSON_URL).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
    manifestPromise.catch(() => {
      manifestPromise = null;
    });
  }
  return manifestPromise;
}

const DownloadLinks = defineComponent({
  name: 'DownloadLinks',
  setup() {
    const state = ref('loading'); // 'loading' | 'ready' | 'error'
    const macArm = ref(null);
    const winX64 = ref(null);

    onMounted(async () => {
      try {
        const data = await fetchManifest();
        macArm.value = data.platforms?.mac?.arm64 || null;
        winX64.value = data.platforms?.windows?.x64 || null;
        state.value = 'ready';
      } catch (error) {
        console.error('Failed to load download links:', error);
        state.value = 'error';
      }
    });

    const item = (label, entry, blurb) => {
      if (entry && entry.url) {
        const version = entry.version ? ` (v${entry.version})` : '';
        return h('li', { style: 'margin: 10px 0;' }, [
          h('strong', [h('a', { href: entry.url }, label)]),
          `${version} — ${blurb}`,
        ]);
      }
      return h('li', { style: 'margin: 10px 0;' }, [h('strong', label), ' — Coming soon']);
    };

    return () => {
      if (state.value === 'loading') {
        return h('p', 'Loading download links…');
      }
      if (state.value === 'error') {
        return h('p', [
          'Unable to load download links. Please visit ',
          h('a', { href: 'https://signalsandsorcery.com' }, 'signalsandsorcery.com'),
          '.',
        ]);
      }
      return h('ul', { style: 'list-style: none; padding: 0;' }, [
        item('Mac — Apple Silicon', macArm.value, 'Download for Apple Silicon Macs'),
        item('Windows — 64-bit', winX64.value, 'Download for Windows 10/11'),
      ]);
    };
  },
});

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

function extractPlatformInfo(href) {
  const lower = href.toLowerCase();
  // Mac installers ship as .dmg, Windows as .exe (electron-builder NSIS).
  // Fall back to substring hints so a future .msi/.zip still classifies.
  let os = 'unknown';
  if (lower.endsWith('.dmg') || lower.includes('mac')) {
    os = 'mac';
  } else if (lower.endsWith('.exe') || lower.endsWith('.msi') || lower.includes('win')) {
    os = 'windows';
  }
  const arch = lower.includes('arm64') ? 'arm64' : 'x64';
  const versionMatch = /signals-and-sorcery-([\d_]+)/.exec(href);
  const appVersion = versionMatch ? versionMatch[1].replace(/_/g, '.') : 'unknown';
  return { os, arch, appVersion };
}

function handleDownloadInteraction(event) {
  const anchor = findDownloadAnchor(event.target);
  if (!anchor) return;

  // gtag is installed by the inline snippet in config.js; undefined in
  // dev/SSR contexts, in which case we silently no-op.
  if (typeof window.gtag === 'function') {
    const { os, arch, appVersion } = extractPlatformInfo(anchor.href);
    // `os` = which BUILD was grabbed (mac/windows); GA4's auto-collected
    // operatingSystem dimension separately records what OS the visitor was
    // ON, so cross-platform downloads are visible too.
    window.gtag('event', 'download_click', {
      os,
      arch,
      app_version: appVersion,
    });
  }
}

export default defineClientConfig({
  enhance({ app, router }) {
    app.component('DownloadLinks', DownloadLinks);

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
