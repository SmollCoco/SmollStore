# SmollStore - Technical Implementation Plan

## Overview
SmollStore is a book tracker application built with Nuxt 3 and Firebase. It allows users to search for books using the Google Books API, view details, and save their favorite books to a personal library stored in Firebase Firestore.

## Technology Stack
- **Frontend Framework**: Nuxt 3 with Composition API
- **UI Libraries**: Bootstrap 5 and Font Awesome 6
- **Backend/Database**: Firebase (Firestore, Authentication)
- **API Integration**: Google Books API
- **Languages**: JavaScript, CSS

## Implementation Steps

### Phase 1: Project Setup and Configuration

1. **Install Dependencies**
   ```bash
   # Install Bootstrap, Font Awesome, and other required packages
   npm install bootstrap @popperjs/core @fortawesome/fontawesome-free
   ```

2. **Configure Nuxt.config.js**
   - Add Bootstrap and Font Awesome CSS
   - Configure environment variables for Google Books API
   - Set up meta tags and global styles

3. **Firebase Configuration**
   - Review existing Firebase setup in `firebase.js`
   - Ensure Firebase authentication and Firestore are properly configured
   - Create authentication utility functions

### Phase 2: UI Components Development

1. **Create Layouts**
   - Create `default.vue` layout with navigation bar and footer
   - Implement responsive design using Bootstrap grid system

2. **Develop Core Components**
   - `components/SearchBar.vue`: Input field with search button
   - `components/BookCard.vue`: Display book information with save/remove buttons
   - `components/LoadingSpinner.vue`: Loading indicator for API calls
   - `components/Notification.vue`: Toast messages for user actions

3. **Page Structure**
   - `pages/index.vue`: Homepage with search functionality
   - `pages/library.vue`: User's saved books page

### Phase 3: Firebase Integration

1. **Authentication**
   - Implement anonymous sign-in functionality
   - Create composable for authentication state (`useAuth.js`)
   - Ensure user persistence across page refreshes

2. **Firestore Data Management**
   - Create composable for library operations (`useLibrary.js`)
   - Implement functions to:
     - Save books to `users/{uid}/library` collection
     - Fetch user's saved books
     - Delete books from library
   - Add error handling for database operations

### Phase 4: Google Books API Integration

1. **API Service**
   - Create composable for Google Books API calls (`useBookSearch.js`)
   - Implement search functionality with proper error handling
   - Cache search results to minimize API calls

2. **Search Results Handler**
   - Display search results in a grid layout
   - Implement pagination if API returns many results
   - Add filtering options (by title, author, etc.)

### Phase 5: User Experience and Polish

1. **Responsive Design**
   - Ensure mobile-friendly layout
   - Test on different screen sizes

2. **User Feedback**
   - Implement toast notifications for actions:
     - Book saved successfully
     - Book removed from library
     - Search errors
     - Authentication status

3. **Loading States**
   - Add loading indicators for API calls and database operations
   - Implement skeleton loaders for better UX

4. **Error Handling**
   - Create comprehensive error states for:
     - API failures
     - Database operations
     - Network issues

### Phase 6: Testing and Deployment

1. **Testing**
   - Test all features manually
   - Ensure responsive design works on all devices
   - Check for edge cases (no search results, API failures)

2. **Deployment**
   - Configure Firebase hosting
   - Deploy the application
   - Set up proper security rules for Firestore

## Detailed Component Structure

### Components
- **SearchBar.vue**
  ```vue
  <template>
    <div class="search-container">
      <div class="input-group">
        <input type="text" class="form-control" v-model="searchQuery" placeholder="Search for books...">
        <button class="btn btn-primary" @click="search">
          <i class="fas fa-search"></i> Search
        </button>
      </div>
    </div>
  </template>
  ```

- **BookCard.vue**
  ```vue
  <template>
    <div class="card h-100">
      <img :src="book.thumbnail || '/placeholder.jpg'" class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">{{ book.title }}</h5>
        <p class="card-text">{{ book.authors?.join(', ') }}</p>
        <p class="card-text text-truncate">{{ book.description }}</p>
        <button class="btn btn-primary" @click="saveBook" v-if="!inLibrary">
          <i class="fas fa-bookmark"></i> Save
        </button>
        <button class="btn btn-danger" @click="removeBook" v-else>
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    </div>
  </template>
  ```

### Pages
- **index.vue**: Homepage with search functionality
  ```vue
  <template>
    <div>
      <h1 class="mb-4">SmollStore Book Search</h1>
      <SearchBar @search="performSearch" />
      <div v-if="loading" class="text-center my-5">
        <LoadingSpinner />
      </div>
      <div v-else-if="books.length" class="row row-cols-1 row-cols-md-3 g-4 mt-3">
        <div v-for="book in books" :key="book.id" class="col">
          <BookCard :book="book" :in-library="false" @save="saveToLibrary" />
        </div>
      </div>
      <div v-else-if="searchPerformed" class="alert alert-info mt-4">
        No books found matching your search.
      </div>
    </div>
  </template>
  ```

- **library.vue**: User's saved books
  ```vue
  <template>
    <div>
      <h1 class="mb-4">My Library</h1>
      <div v-if="loading" class="text-center my-5">
        <LoadingSpinner />
      </div>
      <div v-else-if="savedBooks.length" class="row row-cols-1 row-cols-md-3 g-4">
        <div v-for="book in savedBooks" :key="book.id" class="col">
          <BookCard :book="book" :in-library="true" @remove="removeFromLibrary" />
        </div>
      </div>
      <div v-else class="alert alert-info mt-4">
        Your library is empty. Search for books to add them here!
      </div>
    </div>
  </template>
  ```

## Composables

### useAuth.js
```javascript
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
```

### useBookSearch.js
```javascript
import { ref } from 'vue';

export const useBookSearch = () => {
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const searchPerformed = ref(false);

  const searchBooks = async (query) => {
    if (!query) return;
    
    loading.value = true;
    error.value = null;
    searchPerformed.value = true;
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      
      books.value = data.items?.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown Author'],
        description: item.volumeInfo.description || 'No description available',
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || null
      })) || [];
    } catch (err) {
      error.value = err.message;
      books.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    books,
    loading,
    error,
    searchPerformed,
    searchBooks
  };
};
```

### useLibrary.js
```javascript
import { ref, onMounted } from 'vue';
import { db, auth } from '~/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';

export const useLibrary = () => {
  const savedBooks = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchSavedBooks = async () => {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const libraryRef = collection(db, `users/${auth.currentUser.uid}/library`);
      const querySnapshot = await getDocs(libraryRef);
      
      savedBooks.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      error.value = err.message;
      savedBooks.value = [];
    } finally {
      loading.value = false;
    }
  };

  const saveBook = async (book) => {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const libraryRef = collection(db, `users/${auth.currentUser.uid}/library`);
      await addDoc(libraryRef, {
        title: book.title,
        authors: book.authors,
        description: book.description,
        thumbnail: book.thumbnail,
        googleBooksId: book.id,
        createdAt: new Date()
      });
      
      await fetchSavedBooks();
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const removeBook = async (bookId) => {
    if (!auth.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const bookRef = doc(db, `users/${auth.currentUser.uid}/library`, bookId);
      await deleteDoc(bookRef);
      
      savedBooks.value = savedBooks.value.filter(book => book.id !== bookId);
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (auth.currentUser) {
      fetchSavedBooks();
    }
  });

  return {
    savedBooks,
    loading,
    error,
    fetchSavedBooks,
    saveBook,
    removeBook
  };
};
```

## Timeline Estimation
- Phase 1 (Project Setup): 1 day
- Phase 2 (UI Components): 2-3 days
- Phase 3 (Firebase Integration): 1-2 days
- Phase 4 (Google Books API): 1-2 days
- Phase 5 (UX Polish): 1-2 days
- Phase 6 (Testing & Deployment): 1 day

Total estimated time: 7-11 days
