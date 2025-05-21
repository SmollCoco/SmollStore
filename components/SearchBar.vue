<template>
  <div class="search-container">
    <div class="input-group">
      <input 
        type="text" 
        class="form-control" 
        v-model="searchQuery" 
        placeholder="Search for books..."
        @keyup.enter="search"
      >
      <button class="btn btn-primary" @click="search">
        <i class="fas fa-search"></i> Search
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
const emit = defineEmits(['search']);

const search = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim());
  }
};
</script>

<style scoped>
.search-container {
  max-width: 650px;
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.search-container:focus-within {
  transform: scale(1.02);
}

.input-group {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.form-control {
  border-right: none;
  background-color: white;
  font-size: 1.05rem;
  padding: 0.8rem 1.2rem;
  transition: all 0.25s ease;
}

.form-control:focus {
  box-shadow: none;
  background-color: white;
  border-color: var(--dusty-rose);
}

.btn-primary {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>