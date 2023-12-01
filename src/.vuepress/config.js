import { defineUserConfig } from 'vuepress'
import { defaultTheme } from 'vuepress'

export default defineUserConfig({
  lang: 'en-US',
  title: "VST3",

  theme: defaultTheme({
    // default theme config
    colorModeSwitch: false,
    colorMode: 'dark',
    navbar: false,
  }),
})

// navbar: [
//   {
//     text: 'Home',
//     link: '/',
//   },
// ],

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