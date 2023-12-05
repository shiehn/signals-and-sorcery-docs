import {defineUserConfig} from 'vuepress'

import { defaultTheme } from 'vuepress'
export default {
    port: 80,
    lang: 'en-US',
    title: ' ',
    description: 'BYOC (bring your own compute)',
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
                text: 'Remote',
                link: '/remote-compute/',
            },
            {
                text: 'Community',
                link: '/community-remotes/',
            },
        ],
    })
}

// export default defineUserConfig({

//
//
//     theme: defaultTheme(,
//
//
// })


// const { description } = require('../../package')
//
// module.exports = {
//   port: 8080,
//   /**
//    * Ref：https://v1.vuepress.vuejs.org/config/#title
//    */
//   title: 'Vuepress Docs Boilerplate',
//   /**
//    * Ref：https://v1.vuepress.vuejs.org/config/#description
//    */
//   description: description,
//
//   /**
//    * Extra tags to be injected to the page HTML `<head>`
//    *
//    * ref：https://v1.vuepress.vuejs.org/config/#head
//    */
//   head: [
//     ['meta', { name: 'theme-color', content: '#3eaf7c' }],
//     ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
//     ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
//   ],
//
//   /**
//    * Theme configuration, here is the default theme configuration for VuePress.
//    *
//    * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
//    */
//   themeConfig: {
//     colorMode: 'dark',
//     repo: '',
//     editLinks: false,
//     docsDir: '',
//     editLinkText: '',
//     lastUpdated: false,
//     nav: [
//       {
//         text: 'Guide',
//         link: '/guide/',
//       },
//       {
//         text: 'Config',
//         link: '/config/'
//       },
//       {
//         text: 'VuePress',
//         link: 'https://v1.vuepress.vuejs.org'
//       }
//     ],
//     sidebar: {
//       '/guide/': [
//         {
//           title: 'Guide',
//           collapsable: false,
//           children: [
//             '',
//             'using-vue',
//           ]
//         }
//       ],
//     }
//   },
//
//   /**
//    * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
//    */
//   plugins: [
//     '@vuepress/plugin-back-to-top',
//     '@vuepress/plugin-medium-zoom',
//   ]
// }
