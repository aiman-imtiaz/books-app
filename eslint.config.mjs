// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  // Source - https://stackoverflow.com/a/66448043
  // Posted by Everton Nogueira
  // Retrieved 2026-07-29, License - CC BY-SA 4.0
  {
    rules: { 'vue/no-multiple-template-root': 'off' }
  }

)
