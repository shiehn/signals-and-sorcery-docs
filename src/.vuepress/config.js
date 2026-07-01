import {defineUserConfig} from 'vuepress'
import { fileURLToPath, URL } from 'node:url'

import { defaultTheme } from 'vuepress'
import {sitemapPlugin} from "vuepress-plugin-sitemap2";

// Standard GA4 (gtag) bootstrap for the shared property. Full cookie-based
// measurement is the default — no consent-mode gate. This is the same
// behaviour the site had via @vuepress/plugin-google-analytics before the
// cookieless consent-default switch, which (unintentionally) suppressed nearly
// all reporting: with analytics_storage defaulted to 'denied' and never
// granted, GA4 only received anonymous cookieless pings, so standard reports
// and Realtime read as ~zero for a low-traffic site.
const GA4_ID = 'G-B2QMDKHWHF'
const GTAG_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');
`
export default {
    lang: 'en-US',
    title: 'Signals & Sorcery',
    description: 'Generative Audio Workstation (GAW) for contract-based composing. Generate infinite MIDI and audio layers within your contract and compose with them for full creative control, not one-shot song generation. MIDI via Gemini, audio via Stable Audio and Lyria.',
    // Client-side enhancement: signup-funnel telemetry on the download buttons.
    // See client.js for the implementation.
    clientConfigFile: fileURLToPath(new URL('./client.js', import.meta.url)),
    theme: defaultTheme({
        // logo: "/sas_sm_logo.png",
        // alt: "Signals & Sorcery",
        colorModeSwitch: false,
        colorMode: 'dark',
        navbar: [
            {
                text: 'Overview',
                link: '/prologue/',
            },
            {
                text: 'Getting Started',
                link: '/getting-started/',
            },
            {
                text: 'Tutorials',
                link: '/tutorials/',
            },
            {
                text: 'Features',
                link: '/api-server/',
            },
            {
                text: 'Custom Sounds',
                link: '/custom-sounds/',
            },
            {
                text: 'Ableton',
                link: '/ableton/',
            },
            {
                text: 'Automation',
                link: '/automation/',
            },
            {
                text: 'Plugin SDK',
                link: '/plugin-sdk/',
            },
            {
                text: 'About',
                link: '/guild/',
            },
            {
                text: 'Legal',
                children: [
                    {
                        text: 'Privacy Policy',
                        link: '/privacy-policy/',
                    },
                    {
                        text: 'Terms of Service',
                        link: '/terms-of-service/',
                    },
                ],
            },
        ],
    }),
    plugins: [
        sitemapPlugin({
            hostname: 'https://signalsandsorcery.com',
        }),
    ],
    head: [
        // The inline bootstrap defines dataLayer + runs gtag('config') before
        // the async gtag library loads and drains the queue.
        ['script', {}, GTAG_BOOTSTRAP],
        ['script', { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}` }],
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }],
        ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Baloo+2&family=Rye&display=swap' }],
        // SEO meta tags
        ['meta', { name: 'keywords', content: 'generative audio workstation, GAW, generative music, live performance, music generation, MIDI generation, Gemini, Lyria, Stable Audio, contract-based composing, plugin SDK, electronic music, Tracktion Engine, creative control, music layers, prompt to layer, Ableton, Ableton Live, Ableton integration, export to Ableton' }],
        ['meta', { property: 'og:title', content: 'Signals & Sorcery - Generative Audio Workstation' }],
        ['meta', { property: 'og:description', content: 'You compose; it generates infinite MIDI and audio layers within your contract. Stay in the creative process: preview in headphones, perform to audience.' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:url', content: 'https://signalsandsorcery.com' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'Signals & Sorcery - Generative Audio Workstation' }],
        ['meta', { name: 'twitter:description', content: 'You compose; it generates infinite MIDI and audio layers within your contract. Stay in the creative process: preview in headphones, perform to audience.' }],
    ],
}
