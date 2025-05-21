// Global error handling plugin
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  name: 'error-handler',
  enforce: 'post', // Run after everything else
  setup(nuxtApp) {
    // Add global error handler
    if (process.client) {
      // Handle Vue errors
      nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
        console.error('Vue Error:', error)
        console.error('Error Info:', info)
        
        // Show notification if available
        if (window.$notification) {
          window.$notification.error('An application error occurred. Please try again.')
        }
      }
      
      // Handle global JS errors
      window.addEventListener('error', (event) => {
        console.error('Global JS Error:', event.error)
        
        // Only show notification for non-network errors
        if (!event.filename.includes('chunk-') && window.$notification) {
          window.$notification.error('An unexpected error occurred. Please refresh the page.')
        }
      })
      
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason)
        
        // Show notification if available
        if (window.$notification) {
          window.$notification.error('A background operation failed. Please try again.')
        }
      })
    }
  }
})
