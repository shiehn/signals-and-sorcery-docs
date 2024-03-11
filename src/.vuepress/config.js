import {defineUserConfig} from 'vuepress'

import { defaultTheme } from 'vuepress'
import {googleAnalyticsPlugin} from "@vuepress/plugin-google-analytics";
import {sitemapPlugin} from "vuepress-plugin-sitemap2";
export default { 
    lang: 'en-US',
    title: ' ',
    description: 'Package, Share, and Self-Host AI Elixirs.',
    theme: defaultTheme({
        logo: "https://storage.googleapis.com/docs-assets/dawnet-docs-logo.png",
        colorModeSwitch: false,
        colorMode: 'dark',
        navbar: [
            {
                text: 'Prologue',
                link: '/prologue/',
            },
            {
                text: 'Getting Started',
                link: '/getting-started/',
            },
            {
                text: 'Oracles',
                link: '/oracles/',
            },
            {
                text: 'Crucible CLI',
                link: '/crucible/',
            },
            {
                text: 'Elixirs',
                link: '/elixirs/',
            },
            {
                text: 'Vault',
                link: '/vault/',
            },
            {
                text: 'Guild',
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
}
