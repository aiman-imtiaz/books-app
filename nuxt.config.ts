// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxthub/core',
    '@pinia/nuxt',
    '@pinia/colada-nuxt'
  ],

  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-07-27',

  nitro: {
    experimental: {
      tasks: true
    }
  },

  hub: {
    db: 'postgresql'
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        commaDangle: 'never'
      }
    }
  }
})
