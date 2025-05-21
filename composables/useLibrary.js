import { ref, onMounted, computed } from 'vue';
import { useNuxtApp } from '#app';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const useLibrary = () => {
  const { $db: db, $auth: auth } = useNuxtApp();
  const savedBooks = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const unsubscribe = ref(null);

  // Helper for consistent error handling
  const handleDatabaseError = (err, operation = 'database operation') => {
    console.error(`Error in ${operation}:`, err);
    error.value = err.message || `Failed to perform ${operation}`;
    
    // Show notification if available
    if (process.client && window.$notification) {
      window.$notification.error(`Database error: ${error.value}`);
    }
    
    return false;
  };
  // Count by category for stats
  const categoryCounts = computed(() => {
    const counts = {};
    savedBooks.value.forEach(book => {
      if (book.categories && book.categories.length > 0) {
        book.categories.forEach(category => {
          counts[category] = (counts[category] || 0) + 1;
        });
      }    });
    return counts;
  });
  
  // Real-time listener for library changes
  const subscribeToLibrary = () => {
    if (!auth.currentUser) return;
      // Unsubscribe from any existing subscription
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }

    const userId = auth.currentUser.uid;
    const q = query(
      collection(db, 'books'), 
      where('userId', '==', userId)
      // Removed orderBy to avoid index requirement
    );

    loading.value = true;
    error.value = null;

    try {      unsubscribe.value = onSnapshot(q, (snapshot) => {
        // Map and then sort in memory since we removed orderBy from the query
        const books = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by addedAt in descending order (newest first)
        savedBooks.value = books.sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt.seconds * 1000) : new Date(0);
          const dateB = b.addedAt ? new Date(b.addedAt.seconds * 1000) : new Date(0);
          return dateB - dateA;
        });
        
        loading.value = false;
      }, (err) => {
        handleDatabaseError(err, 'fetching library');
        loading.value = false;
      });
    } catch (err) {
      handleDatabaseError(err, 'setting up library subscription');
      loading.value = false;
    }
  };
    
  // Fetch books once (for initial load or when not using real-time updates)
  const fetchSavedBooks = async () => {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
      try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'books'), 
        where('userId', '==', userId)
        // Removed orderBy to avoid index requirement
      );
        const querySnapshot = await getDocs(q);
      
      // Map docs to books objects
      const books = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in memory by addedAt in descending order
      savedBooks.value = books.sort((a, b) => {
        const dateA = a.addedAt ? new Date(a.addedAt.seconds * 1000) : new Date(0);
        const dateB = b.addedAt ? new Date(b.addedAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
      });
    } catch (err) {
      handleDatabaseError(err, 'fetching books from library');
      savedBooks.value = [];
    } finally {
      loading.value = false;
    }
  };
  const saveBook = async (book) => {
    if (!auth.currentUser) return false;
    
    loading.value = true;
    error.value = null;
    
    try {      // Check if book already exists in library - using a different approach to avoid composite index
      const q = query(
        collection(db, 'books'), 
        where('userId', '==', auth.currentUser.uid)
      );
        const querySnapshot = await getDocs(q);
      
      // Filter in memory to check if book exists instead of using a compound query
      const bookExists = querySnapshot.docs.some(doc => doc.data().googleBooksId === book.id);
      
      if (bookExists) {
        // Book already exists
        loading.value = false;
        if (window.$notification) {
          window.$notification.info('This book is already in your library');
        }
        return true;
      }
      
      // Add the book to library
      await addDoc(collection(db, 'books'), {
        userId: auth.currentUser.uid,
        title: book.title,
        authors: book.authors,
        description: book.description,
        thumbnail: book.thumbnail,
        googleBooksId: book.id,
        categories: book.categories || [],
        publisher: book.publisher || 'Unknown Publisher',
        publishedDate: book.publishedDate || 'Unknown Date',
        pageCount: book.pageCount || 0,
        language: book.language || 'unknown',
        previewLink: book.previewLink || null,
        notes: '',
        status: 'want-to-read', // Default status: 'want-to-read', 'reading', 'read'
        rating: 0,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      if (window.$notification) {
        window.$notification.success('Book added to your library');
      }
      
      // If not using real-time updates, fetch the updated list
      if (!unsubscribe.value) {
        await fetchSavedBooks();
      }
      
      return true;
    } catch (err) {
      return handleDatabaseError(err, 'saving book to library');
    } finally {
      loading.value = false;
    }
  };
  const updateBookNotes = async (bookId, notes) => {
    if (!auth.currentUser) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const bookRef = doc(db, 'books', bookId);
      await updateDoc(bookRef, {
        notes: notes,
        updatedAt: serverTimestamp()
      });
      
      // If not using real-time updates, update local state
      if (!unsubscribe.value) {
        const index = savedBooks.value.findIndex(book => book.id === bookId);
        if (index !== -1) {
          savedBooks.value[index].notes = notes;
          savedBooks.value[index].updatedAt = new Date();
        }
      }
      
      if (window.$notification) {
        window.$notification.success('Notes updated successfully');
      }
      
      return true;
    } catch (err) {
      return handleDatabaseError(err, 'updating book notes');
    } finally {
      loading.value = false;
    }
  };
  const removeBook = async (bookId) => {
    if (!auth.currentUser) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const bookRef = doc(db, 'books', bookId);
      await deleteDoc(bookRef);
      
      // If not using real-time updates, update the local state
      if (!unsubscribe.value) {
        savedBooks.value = savedBooks.value.filter(book => book.id !== bookId);
      }
      
      if (window.$notification) {
        window.$notification.success('Book removed from your library');
      }
      
      return true;
    } catch (err) {
      return handleDatabaseError(err, 'removing book from library');
    } finally {
      loading.value = false;
    }
  };
  const updateBookStatus = async (bookId, status) => {
    if (!auth.currentUser) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const bookRef = doc(db, 'books', bookId);
      await updateDoc(bookRef, {
        status: status,
        updatedAt: serverTimestamp()
      });
      
      // If not using real-time updates, update local state
      if (!unsubscribe.value) {
        const index = savedBooks.value.findIndex(book => book.id === bookId);
        if (index !== -1) {
          savedBooks.value[index].status = status;
          savedBooks.value[index].updatedAt = new Date();
        }
      }
      
      if (window.$notification) {
        window.$notification.success(`Book status updated to "${status}"`);
      }
      
      return true;
    } catch (err) {
      return handleDatabaseError(err, 'updating book status');
    } finally {
      loading.value = false;
    }
  };

  const updateBookRating = async (bookId, rating) => {
    if (!auth.currentUser) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const bookRef = doc(db, 'books', bookId);
      await updateDoc(bookRef, {
        rating: rating,
        updatedAt: serverTimestamp()
      });
      
      // If not using real-time updates, update local state
      if (!unsubscribe.value) {
        const index = savedBooks.value.findIndex(book => book.id === bookId);
        if (index !== -1) {
          savedBooks.value[index].rating = rating;
          savedBooks.value[index].updatedAt = new Date();
        }
      }
      
      if (window.$notification) {
        window.$notification.success(`Book rating updated to ${rating} stars`);
      }
      
      return true;
    } catch (err) {
      return handleDatabaseError(err, 'updating book rating');
    } finally {
      loading.value = false;
    }
  };
  // Check if a book exists in the library by Google Books ID
  const isInLibrary = (googleBooksId) => {
    return savedBooks.value.some(book => book.googleBooksId === googleBooksId);
  };
  
  // Get book by its Google Books ID
  const getBookByGoogleId = (googleBooksId) => {
    return savedBooks.value.find(book => book.googleBooksId === googleBooksId);
  };

  // Initialize library when component is mounted
  onMounted(() => {
    if (auth.currentUser) {
      // Start with a one-time fetch
      fetchSavedBooks();
      
      // Then set up real-time updates
      subscribeToLibrary();
    }

    // Watch for authentication changes
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // New user logged in, fetch their library
        subscribeToLibrary();
      }      else {
        // User logged out, clear the books
        savedBooks.value = [];
        
        // Clean up any subscriptions
        if (unsubscribe.value) {
          unsubscribe.value();
          unsubscribe.value = null;
        }
      }
    });
    
    // Clean up when component is unmounted
    return () => {
      if (unsubscribe.value) {
        unsubscribe.value();
      }
      authUnsubscribe();
    };
  });
  return {
    savedBooks,
    loading,
    error,
    categoryCounts,
    fetchSavedBooks,
    saveBook,
    updateBookNotes,
    updateBookStatus,
    updateBookRating,
    removeBook,
    isInLibrary,
    getBookByGoogleId
  };
};