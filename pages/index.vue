<template>
  <div>
    <h1 class="text-center mb-4">SmollStore Book Search</h1>
    
    <SearchBar @search="performSearch" />
    
    <div v-if="loading" class="text-center my-5">
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="n in 6" :key="n" class="col">
          <SkeletonLoader />
        </div>
      </div>
      <LoadingSpinner size="lg" message="Searching for books..." />
    </div>
    
    <div v-else-if="books.length" class="mt-4">
      <p class="text-muted mb-3">Found {{ books.length }} books matching your search</p>
      
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="book in books" :key="book.id" class="col">          <BookCard 
            :book="book" 
            :in-library="isInLibrary(book.id)" 
            @save="saveToLibrary" 
            @remove="removeFromLibrary" 
            @view-notes="openBookNotes"
          />
        </div>
      </div>
    </div>
    
    <div v-else-if="searchPerformed" class="alert alert-info mt-5 text-center">
      <i class="fas fa-info-circle me-2"></i>
      No books found matching your search. Try different keywords.    </div>
      <div v-else class="text-center mt-5 welcome-section">
      <img src="~/assets/images/logo.png" alt="SmollStore Logo" class="app-logo app-logo-xl mb-3">
      <h2>Welcome to SmollStore</h2>
      <p class="lead">Your personal book tracker</p>
      <p class="text-muted">Search for books above to get started</p>
    </div>

    <!-- Book Notes Modal -->
    <BookNotes 
      :book="selectedBook" 
      :show="showNotesModal"
      @close="closeBookNotes"
      @saved="onNotesSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBookSearch } from '~/composables/useBookSearch';
import { useLibrary } from '~/composables/useLibrary';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

// Initialize composables
const { books, loading, error, searchPerformed, searchBooks } = useBookSearch();
const { savedBooks, saveBook, removeBook, isInLibrary, getBookByGoogleId } = useLibrary();
const { isAuthenticated, authError } = useAuth();
const { $notification } = useNuxtApp();

// Search for books
const performSearch = async (query) => {
  await searchBooks(query);
  if (error.value && $notification) {
    $notification.error('Failed to fetch books: ' + error.value);
  }
};

// Save a book to the library
const saveToLibrary = async (book) => {
  if (!isAuthenticated.value) {
    if ($notification) $notification.info('Please sign in to save books.');
    return;
  }
  await saveBook(book);
};

// Remove a book from the library
const removeFromLibrary = async (bookId) => {
  await removeBook(bookId);
};

// Book notes modal state
const selectedBook = ref(null);
const showNotesModal = ref(false);

// Open the notes modal for a book
const openBookNotes = (book) => {
  selectedBook.value = book;
  showNotesModal.value = true;
};

// Close the notes modal
const closeBookNotes = () => {
  showNotesModal.value = false;
  selectedBook.value = null;
};

// Handle saved notes
const onNotesSaved = ({ id, notes }) => {
  // Optionally update local state or refetch
  if ($notification) $notification.success('Notes saved!');
  closeBookNotes();
};
</script>

<style scoped>
.welcome-section {
  padding: 5rem 1rem;
  max-width: 650px;
  margin: 0 auto;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-section h2 {
  color: var(--soft-navy);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.welcome-section .lead {
  color: var(--dusty-rose);
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.welcome-section .text-muted {
  color: var(--cool-gray) !important;
  font-size: 1.05rem;
}

.welcome-section .display-1 {
  color: var(--dusty-rose) !important;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

h1 {
  font-weight: 700;
  color: var(--soft-navy);
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}

h1::after {
  content: '';
  position: absolute;
  width: 50%;
  height: 3px;
  background: linear-gradient(to right, var(--dusty-rose), var(--sage-green));
  bottom: -10px;
  left: 25%;
  border-radius: 2px;
}

.text-muted {
  color: var(--cool-gray) !important;
}

.alert-info {
  background-color: rgba(168, 195, 160, 0.2);
  border: none;
  color: var(--soft-navy);
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.auth-alert {
  max-width: 550px;
  margin: 4rem auto;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
</style>