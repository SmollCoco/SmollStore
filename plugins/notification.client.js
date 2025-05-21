// Client-side notification plugin
import { useNuxtApp } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // Create notification functions
  const notification = {
    success: (message, title = 'Success', duration = 3000) => {
      if (process.client && window.$notification) {
        return window.$notification.success(message, title, duration);
      }
    },
    error: (message, title = 'Error', duration = 3000) => {
      if (process.client && window.$notification) {
        return window.$notification.error(message, title, duration);
      }
    },
    info: (message, title = 'Info', duration = 3000) => {
      if (process.client && window.$notification) {
        return window.$notification.info(message, title, duration);
      }
    },
    warning: (message, title = 'Warning', duration = 3000) => {
      if (process.client && window.$notification) {
        return window.$notification.warning(message, title, duration);
      }
    }
  };

  // Make available in Nuxt app
  nuxtApp.provide('notification', notification);
});