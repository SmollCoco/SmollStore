import { ref, onMounted, computed } from 'vue';
import { useNuxtApp } from '#app';
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

export const useAuth = () => {
  const { $auth: auth } = useNuxtApp();
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(true);
  const authError = ref(null);
  const authInitialized = ref(false);
  const authMode = ref('email');

  // Clear any previous auth errors
  const clearError = () => {
    authError.value = null;
  };

  // Set Firebase authentication persistence to local
  const setupPersistence = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (error) {
      console.error('Failed to set auth persistence:', error);
      authError.value = 'Failed to set up authentication persistence';
    }
  };

  // Email/Password Sign Up
  const signUpWithEmail = async (email, password, displayName) => {
    clearError();
    try {
      isLoading.value = true;
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }
      authMode.value = 'email';
      return true;
    } catch (error) {
      console.error('Email signup error:', error);
      authError.value = error.message || 'Failed to create account';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Email/Password Sign In
  const signInWithEmail = async (email, password) => {
    clearError();
    try {
      isLoading.value = true;
      await signInWithEmailAndPassword(auth, email, password);
      authMode.value = 'email';
      return true;
    } catch (error) {
      console.error('Email login error:', error);
      authError.value = error.message || 'Failed to sign in with email/password';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Sign out
  const signOut = async () => {
    authError.value = null;
    try {
      await firebaseSignOut(auth);
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      authError.value = error.message || 'Failed to sign out';
      return false;
    }
  };

  // Add isAnonymous computed property to match usage in layout and components
  const isAnonymous = computed(() => {
    return user.value?.isAnonymous === true;
  });

  onMounted(async () => {
    await setupPersistence();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser;
      isAuthenticated.value = !!currentUser;
      isLoading.value = false;
      authInitialized.value = true;
    }, (error) => {
      console.error('Auth state change error:', error);
      authError.value = error.message || 'Authentication error occurred';
      isLoading.value = false;
      authInitialized.value = true;
    });
    return () => unsubscribe();
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    authError,
    authInitialized,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    clearError,
    authMode,
    isAnonymous
  };
};
