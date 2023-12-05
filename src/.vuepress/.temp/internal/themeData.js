export const themeData = JSON.parse("{\"logo\":\"https://storage.googleapis.com/docs-assets/dawnet-docs-logo.png\",\"colorModeSwitch\":false,\"colorMode\":\"dark\",\"navbar\":[{\"text\":\"Intro\",\"link\":\"/intro/\"},{\"text\":\"Getting Started\",\"link\":\"/getting-started/\"},{\"text\":\"Plugin\",\"link\":\"/plugin/\"},{\"text\":\"Client\",\"link\":\"/client/\"},{\"text\":\"Remote\",\"link\":\"/remote-compute/\"},{\"text\":\"Community\",\"link\":\"/community-remotes/\"}],\"locales\":{\"/\":{\"selectLanguageName\":\"English\"}},\"repo\":null,\"selectLanguageText\":\"Languages\",\"selectLanguageAriaLabel\":\"Select language\",\"sidebar\":\"auto\",\"sidebarDepth\":2,\"editLink\":true,\"editLinkText\":\"Edit this page\",\"lastUpdated\":true,\"lastUpdatedText\":\"Last Updated\",\"contributors\":true,\"contributorsText\":\"Contributors\",\"notFound\":[\"There's nothing here.\",\"How did we get here?\",\"That's a Four-Oh-Four.\",\"Looks like we've got some broken links.\"],\"backToHome\":\"Take me home\",\"openInNewWindow\":\"open in new window\",\"toggleColorMode\":\"toggle color mode\",\"toggleSidebar\":\"toggle sidebar\"}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateThemeData) {
    __VUE_HMR_RUNTIME__.updateThemeData(themeData)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ themeData }) => {
    __VUE_HMR_RUNTIME__.updateThemeData(themeData)
  })
}
