module.exports = {
  presets: [
    '@vue/app',
    "@vue/babel-preset-jsx"
  ],
   "plugins": [
      "@babel/plugin-transform-runtime",
      "transform-vue-jsx",
      // "lodash",
    [
    "component",
    {
      "libraryName": "element-ui",
      "styleLibraryName": "theme-chalk"
    }
  ]],
}
