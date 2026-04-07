/**
 * VuePress 2 client config — adds signup-funnel telemetry to the marketing site.
 *
 * Currently this hooks the download buttons (which point at the .dmg files
 * hosted on Google Cloud Storage) and fires a `download_click` event into
 * the existing GA4 property (G-B2QMDKHWHF, configured in config.js).
 *
 * It also mints an anonymous `funnel_id` UUID, persists it in localStorage,
 * and appends it to the download href as a URL fragment so that — IF the
 * fragment survives the .dmg download → install → first launch hop — the
 * Electron app can read it and the gateway can stamp the resulting
 * /v1/me upsert with the same correlation key.
 *
 * The fragment trick is intentionally best-effort. See the implementation
 * plan ("Open question") for why we accept this as a nice-to-have rather
 * than depending on it.
 */
import { defineClientConfig } from '@vuepress/client';

const FUNNEL_ID_STORAGE_KEY = 'sas_funnel_id';
const DOWNLOAD_HREF_PATTERN = /storage\.googleapis\.com\/docs-assets\/signals-and-sorcery-/;

function uuidv4() {
  // RFC 4122 v4 — uses crypto.getRandomValues when available, falls back to Math.random.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateFunnelId() {
  try {
    let id = window.localStorage.getItem(FUNNEL_ID_STORAGE_KEY);
    if (!id) {
      id = uuidv4();
      window.localStorage.setItem(FUNNEL_ID_STORAGE_KEY, id);
    }
    return id;
  } catch (_e) {
    // Private browsing mode disables localStorage — degrade to a per-session ID.
    return uuidv4();
  }
}

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

  const funnelId = getOrCreateFunnelId();
  const { arch, appVersion } = extractArchAndVersion(anchor.href);

  // Stamp the href with the funnel ID as a URL fragment. Mutating href on
  // mousedown gives the browser the updated value before navigation begins
  // on the subsequent click.
  if (anchor.href.indexOf('#funnel_id=') === -1) {
    anchor.href = `${anchor.href}#funnel_id=${funnelId}`;
  }

  // Fire the GA4 event. gtag is installed by @vuepress/plugin-google-analytics
  // — it will be undefined in dev/SSR contexts, in which case we silently no-op.
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'download_click', {
      funnel_id: funnelId,
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
  },
});
