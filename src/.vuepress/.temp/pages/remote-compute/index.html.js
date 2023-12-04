export const data = JSON.parse("{\"key\":\"v-bdb4d734\",\"path\":\"/remote-compute/\",\"title\":\"Config\",\"lang\":\"en-US\",\"frontmatter\":{\"sidebar\":\"auto\"},\"headers\":[{\"level\":2,\"title\":\"foo\",\"slug\":\"foo\",\"link\":\"#foo\",\"children\":[]},{\"level\":2,\"title\":\"bar\",\"slug\":\"bar\",\"link\":\"#bar\",\"children\":[]}],\"git\":{\"updatedTime\":1701651573000,\"contributors\":[{\"name\":\"stevehiehn\",\"email\":\"stevehiehn@gmail.com\",\"commits\":1}]},\"filePathRelative\":\"remote-compute/README.md\"}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
