<template>
  <div class="auth-container">
    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h2 class="card-title text-center mb-4">{{ isRegister ? 'Create Account' : 'Sign In' }}</h2>
        
        <!-- Auth Error Alert -->
        <div v-if="authError" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {{ authError }}
          <button type="button" class="btn-close" @click="clearError" aria-label="Close"></button>
        </div>
        
        <form @submit.prevent="submitForm">
          <!-- Display Name (Register Only) -->
          <div v-if="isRegister" class="mb-3">
            <label for="displayName" class="form-label">Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="displayName" 
              v-model="displayName"
              placeholder="Your name"
            >
          </div>
          
          <!-- Email -->
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              v-model="email"
              placeholder="email@example.com" 
              required
            >
          </div>
          
          <!-- Password -->
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <div class="input-group">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                class="form-control" 
                id="password" 
                v-model="password"
                placeholder="Password" 
                required
                minlength="6"
              >
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="showPassword = !showPassword"
              >
                <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <div v-if="isRegister" class="form-text text-muted">
              Password must be at least 6 characters
            </div>
          </div>
          
          <!-- Submit Button -->
          <div class="d-grid gap-2 mb-3">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isLoading || !isFormValid"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isRegister ? 'Sign Up' : 'Sign In' }}
            </button>
          </div>
          
          <!-- Link Anonymous Account Option -->
          <div v-if="isAnonymous && isRegister" class="form-check mb-3">
            <input class="form-check-input" type="checkbox" v-model="linkAccount" id="linkAccount">
            <label class="form-check-label" for="linkAccount">
              Keep my current library
            </label>
            <div class="form-text text-muted">
              Link your anonymous account to keep your saved books
            </div>
          </div>
          
          <!-- Toggle Between Login and Register -->
          <div class="text-center">
            <button type="button" class="btn btn-link" @click="isRegister = !isRegister">
              {{ isRegister ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';

const props = defineProps({
  redirect: {
    type: String,
    default: '/'
  }
});

const router = useRouter();
const { 
  signInWithEmail, 
  signUpWithEmail, 
  linkAnonymousAccount, 
  authError, 
  isLoading, 
  isAnonymous,
  clearError
} = useAuth();

// Form state
const isRegister = ref(false);
const email = ref('');
const password = ref('');
const displayName = ref('');
const showPassword = ref(false);
const linkAccount = ref(true);

// Form validation
const isFormValid = computed(() => {
  return email.value.includes('@') && password.value.length >= 6;
});

// Form submission handler
const submitForm = async () => {
  let success = false;
  
  if (isRegister.value) {
    if (isAnonymous.value && linkAccount.value) {
      // Link anonymous account
      success = await linkAnonymousAccount(email.value, password.value, displayName.value);
    } else {
      // Create new account
      success = await signUpWithEmail(email.value, password.value, displayName.value);
    }
  } else {
    // Sign in with existing account
    success = await signInWithEmail(email.value, password.value);
  }
  
  if (success) {
    // Show success notification
    if (window.$notification) {
      window.$notification.success(`Successfully ${isRegister.value ? 'registered' : 'signed in'}`);
    }
    
    // Redirect after successful authentication
    router.push(props.redirect);
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 480px;
  margin: 3rem auto;
  padding: 0 1.5rem;
}

.card {
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-radius: var(--border-radius);
  background-color: white;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
}

.card-body {
  padding: 2.5rem !important;
}

.form-control {
  padding: 0.8rem 1rem;
  border-radius: var(--border-radius);
  background-color: rgba(250, 243, 224, 0.3);
  border: 1px solid var(--cool-gray);
  transition: all 0.3s ease;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(232, 174, 183, 0.25);
  border-color: var(--dusty-rose);
  background-color: white;
}

.input-group .btn {
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

.form-label {
  font-weight: 500;
  color: var(--soft-navy);
  margin-bottom: 0.5rem;
}

.alert {
  border-radius: var(--border-radius);
  border: none;
}

.btn-link {
  color: var(--dusty-rose);
  text-decoration: none;
  transition: color 0.3s ease;
}

.btn-link:hover {
  color: var(--soft-navy);
  text-decoration: underline;
}
</style>
