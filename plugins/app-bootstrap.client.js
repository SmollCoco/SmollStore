// Client-side plugin to initialize Bootstrap
import { defineNuxtPlugin } from '#app'
import * as bootstrap from 'bootstrap'

export default defineNuxtPlugin({
  name: 'app-bootstrap',
  enforce: 'pre',  // Run this plugin before others
  async setup(nuxtApp) {
    // Only run on client
    if (process.client) {
      // Make bootstrap available globally
      window.bootstrap = bootstrap;
      
      // Initialize on app mounted
      nuxtApp.hook('app:mounted', () => {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl)
        })
        
        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
        popoverTriggerList.map(function (popoverTriggerEl) {
          return new bootstrap.Popover(popoverTriggerEl)
        })
        
        // Initialize dropdowns
        const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
        dropdownElementList.map(function (dropdownToggleEl) {
          return new bootstrap.Dropdown(dropdownToggleEl)
        })
      })
    }
    
    // Provide bootstrap to components through useNuxtApp()
    nuxtApp.provide('bootstrap', bootstrap)
  }
})
