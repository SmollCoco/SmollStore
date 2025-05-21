<template>  <div class="spinner-container">
    <div 
      class="spinner-border" 
      role="status" 
      :class="[spinnerSize, spinnerColor]"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
    <p v-if="message" class="spinner-message mt-2" :class="messageClass">{{ message }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
  },
  centered: {
    type: Boolean,
    default: true
  }
});

const spinnerSize = computed(() => {
  const sizes = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'text-lg'
  };
  return sizes[props.size];
});

const spinnerColor = computed(() => {
  return `text-${props.variant}`;
});

const messageClass = computed(() => {
  return props.variant !== 'primary' ? `text-${props.variant}` : '';
});
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.text-lg {
  width: 3rem;
  height: 3rem;
}

.spinner-container {
  padding: 1.5rem;
  opacity: 0.9;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 0.9; }
}

.spinner-message {
  color: var(--cool-gray);
  text-align: center;
  margin-bottom: 0;
  font-weight: 500;
  font-size: 0.95rem;
}

.text-primary { color: var(--dusty-rose) !important; }
.text-secondary { color: var(--sage-green) !important; }
.text-success { color: var(--sage-green) !important; }
.text-danger { color: var(--dusty-rose) !important; }
.text-warning { color: var(--muted-gold) !important; }
.text-info { color: var(--soft-navy) !important; }
.text-light { color: var(--warm-cream) !important; }
.text-dark { color: var(--rich-charcoal) !important; }
</style>
