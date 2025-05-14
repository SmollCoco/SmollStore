// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '@fortawesome/fontawesome-free/css/all.min.css',
    '@/assets/css/main.css' // Will create this file later
  ],
  
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'SmollStore - Book Tracker',
      meta: [
        { name: 'description', content: 'Track your favorite books with SmollStore.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  runtimeConfig: {
    public: {
      googleBooksApiUrl: 'https://www.googleapis.com/books/v1/volumes'
    }
  }
})
