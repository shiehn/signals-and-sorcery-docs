import {defineUserConfig} from 'vuepress'

import { defaultTheme } from 'vuepress'
import {googleAnalyticsPlugin} from "@vuepress/plugin-google-analytics";
export default { 
    lang: 'en-US',
    title: ' ',
    description: 'AI Stem separation, Audio style transfer, Text-to-Audio, and more!',
    theme: defaultTheme({
        logo: "https://storage.googleapis.com/docs-assets/dawnet-docs-logo.png",
        colorModeSwitch: false,
        colorMode: 'dark',
        navbar: [
            {
                text: 'Intro',
                link: '/intro/',
            },
            {
                text: 'Getting Started',
                link: '/getting-started/',
            },
            {
                text: 'Plugin',
                link: '/plugin/',
            },
            {
                text: 'Client',
                link: '/client/',
            },
            {
                text: 'Remotes',
                link: '/remotes/',
            },
            {
                text: 'Community',
                link: '/community/',
            },
        ],
    }),
    plugins: [
        googleAnalyticsPlugin({
            id: 'G-B2QMDKHWHF'
        }),
    ],
}
