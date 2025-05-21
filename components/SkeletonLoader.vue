<template>
  <div class="skeleton-loader">
    <div class="skeleton-thumbnail"></div>
    <div class="skeleton-details">
      <div class="skeleton-title"></div>
      <div class="skeleton-author"></div>
      <div class="skeleton-desc"></div>
    </div>
  </div>
</template>

<script setup>
// No script needed for static skeleton
</script>

<style scoped>
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1rem;
  min-height: 250px;
  width: 100%;
  max-width: 250px;
}
.skeleton-thumbnail {
  width: 100%;
  height: 140px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  border-radius: 0.25rem;
  animation: skeleton-loading 1.2s infinite linear;
}
.skeleton-details {
  margin-top: 0.75rem;
}
.skeleton-title, .skeleton-author, .skeleton-desc {
  height: 16px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  animation: skeleton-loading 1.2s infinite linear;
}
.skeleton-title { width: 70%; height: 18px; }
.skeleton-author { width: 50%; }
.skeleton-desc { width: 90%; height: 14px; }

@keyframes skeleton-loading {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
</style>
