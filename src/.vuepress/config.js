import {defineUserConfig} from 'vuepress'
import { fileURLToPath, URL } from 'node:url'

import { defaultTheme } from 'vuepress'
import {googleAnalyticsPlugin} from "@vuepress/plugin-google-analytics";
import {sitemapPlugin} from "vuepress-plugin-sitemap2";
export default {
    lang: 'en-US',
    title: 'Signals & Sorcery',
    description: 'Generative Audio Workstation (GAW) for contract-based composing with Gemini MIDI and Lyria audio generation.',
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
        googleAnalyticsPlugin({
            id: 'G-B2QMDKHWHF'
        }),
        sitemapPlugin({
            hostname: 'https://signalsandsorcery.com',
        }),
    ],
    head: [
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }],
        ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Baloo+2&family=Rye&display=swap' }],
        // SEO meta tags
        ['meta', { name: 'keywords', content: 'generative audio workstation, GAW, AI music, live performance, music generation, MIDI generation, Gemini, Lyria, contract-based composing, plugin SDK, electronic music, Tracktion Engine' }],
        ['meta', { property: 'og:title', content: 'Signals & Sorcery - Generative Audio Workstation' }],
        ['meta', { property: 'og:description', content: 'Contract-based composing with Gemini MIDI and Lyria audio generation. Preview in headphones, perform to audience.' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:url', content: 'https://signalsandsorcery.com' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'Signals & Sorcery - Generative Audio Workstation' }],
        ['meta', { name: 'twitter:description', content: 'Contract-based composing with Gemini MIDI and Lyria audio generation. Preview in headphones, perform to audience.' }],
    ],
}
