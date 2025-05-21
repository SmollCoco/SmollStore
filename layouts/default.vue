<template>
  <div class="app-container d-flex flex-column min-vh-100">
    <!-- Navigation Bar -->    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">        <NuxtLink to="/" class="navbar-brand logo-container">
          SmollStore
        </NuxtLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <NuxtLink to="/" class="nav-link" exact-active-class="active">
                <i class="fas fa-search me-1"></i> Search
              </NuxtLink>
            </li>            <li class="nav-item">
              <NuxtLink to="/library" class="nav-link" active-class="active">
                <i class="fas fa-bookmark me-1"></i> My Library
              </NuxtLink>
            </li>
            
            <!-- Auth Dropdown Menu -->
            <li class="nav-item dropdown ms-2">
              <a 
                class="nav-link dropdown-toggle" 
                href="#" 
                id="authDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <span 
                  class="auth-status" 
                  :class="{ 
                    'auth-active': isAuthenticated, 
                    'auth-inactive': !isAuthenticated,
                    'auth-email': isAuthenticated && !isAnonymous
                  }"
                  data-bs-toggle="tooltip" 
                  data-bs-placement="bottom"
                  :title="getAuthStatusText.value"
                >
                  <i class="fas" :class="getAuthIconClass"></i>
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="authDropdown">
                <!-- User Profile Info (When Logged In) -->
                <li v-if="isAuthenticated">
                  <div class="dropdown-item-text">
                    <div class="fw-bold text-truncate" style="max-width: 200px;">
                      {{ getUserDisplayName }}
                    </div>
                    <small class="text-muted">{{ user?.email || 'Anonymous User' }}</small>
                  </div>
                  <hr class="dropdown-divider">
                </li>
                
                <!-- Login/Signup Button -->
                <li v-if="!isAuthenticated || isAnonymous">
                  <NuxtLink to="/auth" class="dropdown-item">
                    <i class="fas fa-sign-in-alt me-2"></i>
                    {{ isAnonymous ? 'Create Account' : 'Sign In' }}
                  </NuxtLink>
                </li>
                
                <!-- Logout Button -->
                <li v-if="isAuthenticated">
                  <a href="#" class="dropdown-item" @click.prevent="handleSignOut">
                    <i class="fas fa-sign-out-alt me-2"></i>
                    Sign Out
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>    <!-- Main Content -->
    <main class="container flex-grow-1 py-4">      <!-- Auth Error Alert -->
      <div v-if="authError" class="alert alert-danger alert-dismissible fade show m-3" role="alert">
        <strong>Authentication Error:</strong> {{ authError }}
        <button type="button" class="btn-close" @click="clearError" aria-label="Close"></button>
      </div>

      <!-- Main Content -->
      <slot />
    </main>    <!-- Footer -->    <footer class="footer bg-light py-3 mt-auto">
      <div class="container text-center">
        <p class="mb-0 text-muted">
          <small>© 2025 SmollStore - Your Personal Book Tracker</small>
        </p>
      </div>
    </footer>
    
    <!-- Notification Component -->
    <Notification />
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtApp } from '#app';

const router = useRouter();
const { $db: db, $auth: auth } = useNuxtApp();

// Initialize auth on layout load to ensure persistence across the app
const { isAuthenticated, user, authError, signOut, isAnonymous, clearError } = useAuth();

// Computed property for user display name
const getUserDisplayName = computed(() => {
  if (!user.value) return 'Guest';
  if (user.value.displayName) return user.value.displayName;
  if (user.value.isAnonymous) return 'Anonymous User';
  return user.value.email?.split('@')[0] || 'User';
});

// Computed property for auth status text
const getAuthStatusText = computed(() => {
  if (!isAuthenticated.value) return 'Not signed in';
  if (isAnonymous.value) return 'Signed in anonymously';
  return `Signed in as ${getUserDisplayName.value}`;
});

// Computed property for auth icon class
const getAuthIconClass = computed(() => {
  if (!isAuthenticated.value) return 'fa-user-slash';
  if (isAnonymous.value) return 'fa-user-check';
  return 'fa-user-circle';
});

// Handle sign out action
const handleSignOut = async () => {
  const success = await signOut();
  if (success) {
    if (window.$notification) {
      window.$notification.success('Successfully signed out');
    }
    // Redirect to home page after sign out
    router.push('/');
  }
};

// Initialize Bootstrap tooltips when the component is mounted
onMounted(() => {
  if (process.client && window.bootstrap) {
    // Initialize all tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].forEach(tooltipTriggerEl => 
      new window.bootstrap.Tooltip(tooltipTriggerEl)
    );
    
    // Initialize all dropdowns
    const dropdownTriggerList = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    [...dropdownTriggerList].forEach(dropdownTriggerEl => 
      new window.bootstrap.Dropdown(dropdownTriggerEl)
    );
  }
});
</script>

<style scoped>
.navbar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 0.75rem 0;
}

.navbar-brand {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
}

.navbar-brand img {
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: translateY(-2px);
}

.navbar-brand:hover img {
  transform: rotate(5deg);
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  transition: all 0.3s ease;
  border-radius: 6px;
  margin: 0 0.2rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.15);
}

.auth-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
}

.auth-status:hover {
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.2);
}

.auth-active {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--sage-green-light);
}

.auth-inactive {
  color: var(--dusty-rose-light);
}

.auth-email {
  color: var(--muted-gold);
}

.dropdown-menu {
  border: none;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  min-width: 240px;
}

.dropdown-item {
  border-radius: 6px;
  padding: 0.7rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(168, 195, 160, 0.15);
}

.dropdown-item-text {
  padding: 0.7rem 1rem;
}

.footer {
  margin-top: 3rem;
  border-top: 1px solid rgba(189, 195, 199, 0.2);
  padding: 1.5rem 0;
}
</style>
