import {defineUserConfig} from 'vuepress'

import { defaultTheme } from 'vuepress'
import {googleAnalyticsPlugin} from "@vuepress/plugin-google-analytics";
import {sitemapPlugin} from "vuepress-plugin-sitemap2";
export default {
    lang: 'en-US',
    title: ' ',
    description: 'Plugins to run generative AI functions',
    theme: defaultTheme({
        logo: "/sas_sm_logo.png",
        // alt: "Signals & Sorcery",
        colorModeSwitch: false,
        colorMode: 'dark',
        navbar: [
            {
                text: 'prologue',
                link: '/prologue/',
            },
            {
                text: 'glossary',
                link: '/glossary/',
            },
            {
                text: 'getting-started',
                link: '/getting-started/',
            },
            {
                text: 'runes-cli',
                link: '/runes-cli/',
            },
            {
                text: 'crucible-plugins',
                link: '/crucible-plugins/',
            },
            {
                text: 'runes',
                link: '/runes/',
            },
            {
                text: 'api',
                link: '/api-server/',
            },
            {
                text: 'vault',
                link: '/vault/',
            },
            {
                text: 'guild',
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
