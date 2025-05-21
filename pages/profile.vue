<template>
  <div class="profile-container">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Profile Settings</h2>
            
            <!-- Loading Indicator -->
            <div v-if="isLoading" class="text-center p-4">
              <LoadingSpinner />
              <p class="mt-3 text-muted">Loading profile...</p>
            </div>
            
            <!-- Not Authenticated Message -->
            <div v-else-if="!isAuthenticated" class="alert alert-warning">
              <p class="mb-0">You need to be signed in to access profile settings.</p>
              <div class="mt-3">
                <NuxtLink to="/auth" class="btn btn-primary">Sign In</NuxtLink>
              </div>
            </div>
            
            <!-- Profile Form for Authenticated Users -->
            <div v-else>
              <!-- Profile Information -->
              <div class="text-center mb-4">
                <div class="avatar-placeholder mb-3">
                  <i class="fas fa-user-circle fa-4x"></i>
                </div>
                <h4>{{ user?.displayName || 'User' }}</h4>
                <p class="text-muted">{{ user?.email }}</p>
              </div>
              
              <!-- Profile Update Form -->
              <form @submit.prevent="updateProfile">
                <!-- Display Name -->
                <div class="mb-3">
                  <label for="displayName" class="form-label">Display Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="displayName" 
                    v-model="displayName"
                    placeholder="Your name"
                  >
                </div>
                
                <!-- Submit Button -->
                <div class="d-grid gap-2 mb-3">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    :disabled="isUpdating || !displayName"
                  >
                    <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Update Profile
                  </button>
                </div>
              </form>
              
              <hr class="my-4">
              
              <!-- Account Actions -->
              <div class="account-actions mt-4">
                <h5>Account Actions</h5>
                <div class="list-group">
                  <!-- Password Reset -->
                  <button 
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    @click="sendPasswordReset"
                    :disabled="isUpdating"
                  >
                    <span>
                      <i class="fas fa-key me-2"></i>
                      Reset Password
                    </span>
                    <i class="fas fa-chevron-right"></i>
                  </button>
                  
                  <!-- Sign Out -->
                  <button 
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    @click="handleSignOut"
                    :disabled="isUpdating"
                  >
                    <span>
                      <i class="fas fa-sign-out-alt me-2"></i>
                      Sign Out
                    </span>
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';
import { updateProfile as firebaseUpdateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { useNuxtApp } from '#app';

const router = useRouter();
const { 
  user, 
  isAuthenticated, 
  isLoading, 
  authError, 
  signOut, 
  clearError 
} = useAuth();

const { $auth: auth } = useNuxtApp();

// Form state
const displayName = ref('');
const isUpdating = ref(false);

// Initialize form with user data
onMounted(() => {
  if (user.value?.displayName) {
    displayName.value = user.value.displayName;
  } else if (user.value?.email) {
    // Use email username as fallback
    displayName.value = user.value.email.split('@')[0];
  }
});

// Update profile 
const updateProfile = async () => {
  if (!displayName.value.trim() || !user.value) return;
  
  isUpdating.value = true;
  try {
    await firebaseUpdateProfile(auth.currentUser, {
      displayName: displayName.value.trim()
    });
    
    // Force refresh user profile in UI
    if (user.value) {
      user.value.displayName = displayName.value.trim();
    }
    
    if (window.$notification) {
      window.$notification.success('Profile updated successfully');
    }
  } catch (error) {
    console.error('Failed to update profile:', error);
    if (window.$notification) {
      window.$notification.error('Failed to update profile: ' + error.message);
    }
  } finally {
    isUpdating.value = false;
  }
};

// Send password reset email
const sendPasswordReset = async () => {
  if (!user.value?.email) return;
  isUpdating.value = true;
  try {
    await sendPasswordResetEmail(auth, user.value.email);
    if (window.$notification) {
      window.$notification.success('Password reset email sent!');
    }
  } catch (error) {
    console.error('Failed to send password reset:', error);
    if (window.$notification) {
      window.$notification.error('Failed to send reset email: ' + error.message);
    }
  } finally {
    isUpdating.value = false;
  }
};

// Handle sign out
const handleSignOut = async () => {
  const success = await signOut();
  if (success) {
    if (window.$notification) {
      window.$notification.success('Successfully signed out');
    }
    router.push('/');
  }
};
</script>

<style scoped>
.profile-container {
  padding: 3rem 0;
}

.card {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  border-radius: var(--border-radius);
  background-color: white;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-body {
  padding: 2.5rem !important;
}

.card-title {
  color: var(--soft-navy);
  font-weight: 700;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}

.card-title::after {
  content: '';
  position: absolute;
  width: 40%;
  height: 3px;
  background: linear-gradient(to right, var(--dusty-rose), var(--sage-green));
  bottom: -10px;
  left: 30%;
  border-radius: 2px;
}

.avatar-placeholder {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(250, 243, 224, 0.5);
  color: var(--soft-navy);
  transition: all 0.3s ease;
}

.avatar-placeholder:hover {
  transform: scale(1.05);
  background-color: rgba(232, 174, 183, 0.2);
}

h4 {
  color: var(--soft-navy);
  font-weight: 600;
  margin-top: 1rem;
}

.text-muted {
  color: var(--cool-gray) !important;
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

.form-label {
  font-weight: 500;
  color: var(--soft-navy);
  margin-bottom: 0.5rem;
}

.alert {
  border-radius: var(--border-radius);
  border: none;
  padding: 1.5rem;
}

.alert-warning {
  background-color: rgba(212, 175, 127, 0.2);
  color: var(--soft-navy);
}

.alert-info {
  background-color: rgba(168, 195, 160, 0.2);
  color: var(--soft-navy);
}

.account-actions h5 {
  color: var(--soft-navy);
  font-weight: 600;
  margin-bottom: 1rem;
}

.account-actions .list-group {
  border-radius: var(--border-radius);
  overflow: hidden;
}

.account-actions .list-group-item {
  padding: 1rem 1.25rem;
  transition: all 0.25s ease;
  border-color: rgba(189, 195, 199, 0.2);
}

.account-actions .list-group-item:hover {
  background-color: rgba(250, 243, 224, 0.5);
  transform: translateX(5px);
}

.account-actions .list-group-item i.fa-chevron-right {
  color: var(--cool-gray);
  transition: transform 0.3s ease;
}

.account-actions .list-group-item:hover i.fa-chevron-right {
  transform: translateX(3px);
  color: var(--dusty-rose);
}
</style>
