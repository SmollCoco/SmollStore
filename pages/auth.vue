<template>
  <div class="auth-page">
    <div class="container">
      <div class="row justify-content-center">        <div class="col-md-8 col-lg-6">          <div class="text-center mb-4">
            <NuxtLink to="/" class="text-decoration-none">
              <img src="~/assets/images/logo.png" alt="SmollStore Logo" class="app-logo app-logo-lg mb-3">
              <h1 class="brand-title">SmollStore</h1>
              <p class="text-muted">Your personal book tracker</p>
            </NuxtLink>
          </div>
          
          <AuthForm :redirect="redirect" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

const route = useRoute();
const router = useRouter();
const { isAuthenticated, isLoading, authInitialized } = useAuth();
const { $auth: auth } = useNuxtApp();

// Get redirect path from query parameters or default to library
const redirect = route.query.redirect || '/library';

// Redirect to library if already authenticated
watch([isAuthenticated, authInitialized], ([authenticated, initialized]) => {
  if (initialized && authenticated && !isLoading.value) {
    router.replace(redirect);
  }
}, { immediate: true });

// Use auth for all Firebase Auth operations in this file
</script>

<style scoped>
.auth-page {
  padding: 3rem 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.brand-title {
  color: var(--bs-primary);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

/* Custom animation for the auth page logo */
.auth-page .app-logo {
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.auth-page .app-logo:hover {
  transform: scale(1.1) rotate(5deg);
}
</style>
