import {defineUserConfig} from 'vuepress'

import { defaultTheme } from 'vuepress'
import {googleAnalyticsPlugin} from "@vuepress/plugin-google-analytics";
import {sitemapPlugin} from "vuepress-plugin-sitemap2";
export default {
    lang: 'en-US',
    title: 'Signals & Sorcery',
    description: 'Generative audio tool powered by the REAPER DAW',
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
            hostname: 'signalsandsorcery.app',
        }),
    ],
    head: [
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }],
        ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Baloo+2&family=Rye&display=swap' }],
    ],
}
