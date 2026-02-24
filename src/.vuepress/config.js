import {defineUserConfig} from 'vuepress'

import { defaultTheme } from 'vuepress'
import {googleAnalyticsPlugin} from "@vuepress/plugin-google-analytics";
import {sitemapPlugin} from "vuepress-plugin-sitemap2";
export default {
    lang: 'en-US',
    title: 'Signals & Sorcery',
    description: 'Generative music performance platform for creating and arranging clips in a dual-deck workflow.',
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
                text: 'Features',
                link: '/api-server/',
            },
            {
                text: 'About',
                link: '/guild/',
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
        ['meta', { name: 'keywords', content: 'generative music, AI music, live performance, DJ software, music generation, MIDI generation, Surge XT, electronic music, Tracktion Engine' }],
        ['meta', { property: 'og:title', content: 'Signals & Sorcery - Generative Music Performance Platform' }],
        ['meta', { property: 'og:description', content: 'AI-powered clip generation with DJ-style dual-deck workflow. Generate in headphones, perform to audience.' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:url', content: 'https://signalsandsorcery.com' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'Signals & Sorcery - Generative Music Performance Platform' }],
        ['meta', { name: 'twitter:description', content: 'AI-powered clip generation with DJ-style dual-deck workflow. Generate in headphones, perform to audience.' }],
    ],
}
