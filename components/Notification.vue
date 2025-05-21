<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div 
      v-for="(toast, index) in toasts" 
      :key="index"
      class="toast show"
      :class="'bg-' + toast.type"
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div class="toast-header">
        <strong class="me-auto">{{ toast.title }}</strong>
        <button 
          type="button" 
          class="btn-close" 
          @click="removeToast(index)"
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body text-white">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Toast state
const toasts = ref([]);

// Add a new toast notification
const addToast = (title, message, type = 'primary', duration = 3000) => {
  const id = Date.now();
  
  // Add the toast to the array
  toasts.value.push({
    id,
    title,
    message,
    type,
  });
  
  // Remove toast after duration
  setTimeout(() => {
    removeToastById(id);
  }, duration);
  
  return id;
};

// Remove toast by index
const removeToast = (index) => {
  toasts.value.splice(index, 1);
};

// Remove toast by id
const removeToastById = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    removeToast(index);
  }
};

// Create a composable for using the toast throughout the app
const useNotification = () => {
  return {
    success: (message, title = 'Success', duration = 3000) => 
      addToast(title, message, 'success', duration),
    error: (message, title = 'Error', duration = 3000) => 
      addToast(title, message, 'danger', duration),
    info: (message, title = 'Info', duration = 3000) => 
      addToast(title, message, 'info', duration),
    warning: (message, title = 'Warning', duration = 3000) => 
      addToast(title, message, 'warning', duration)
  };
};

// Make the notification functions available globally
onMounted(() => {
  if (process.client) {
    // Only define if it doesn't already exist
    if (!window.$notification) {
      window.$notification = useNotification();
    }
  }
});

// Export the composable
defineExpose({
  useNotification
});
</script>

<style scoped>
.toast-container {
  z-index: 1100;
}

.toast {
  margin-bottom: 15px;
  min-width: 300px;
  border-radius: var(--border-radius);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border: none;
  overflow: hidden;
  animation: slideInRight 0.3s ease forwards;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-header {
  border-bottom: none;
  padding: 0.8rem 1rem;
}

.toast-body {
  padding: 1rem;
  font-size: 0.95rem;
}

.bg-success {
  background-color: var(--sage-green) !important;
}

.bg-danger {
  background-color: var(--dusty-rose) !important;
}

.bg-warning {
  background-color: var(--muted-gold) !important;
}

.bg-info {
  background-color: var(--soft-navy) !important;
}
</style>
