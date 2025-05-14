import { ref, onMounted } from 'vue';
import { auth } from '~/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(true);

  const signIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  onMounted(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser;
      isAuthenticated.value = !!currentUser;
      isLoading.value = false;
      
      if (!currentUser) {
        signIn();
      }
    });

    return unsubscribe;
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn
  };
};
