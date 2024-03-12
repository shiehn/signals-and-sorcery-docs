import {defineUserConfig} from 'vuepress'

import { defaultTheme } from 'vuepress'
import {googleAnalyticsPlugin} from "@vuepress/plugin-google-analytics";
import {sitemapPlugin} from "vuepress-plugin-sitemap2";
export default {
    lang: 'en-US',
    title: 'Signals & Sorcery',
    description: 'Create, Consume, Share, & Self-Host AI Elixirs.',
    theme: defaultTheme({
        // logo: "https://storage.googleapis.com/docs-assets/dawnet-docs-logo.png",
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
                text: 'elixir-ais',
                link: '/elixirs/',
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
            hostname: 'dawnet.tools',
        }),
    ],
    head: [
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }],
        ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Baloo+2&family=Rye&display=swap' }],
    ],
}
