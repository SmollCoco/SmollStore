<template>
  <div>
    <h1 class="text-center mb-4">
      <i class="fas fa-bookmark me-2"></i>My Library
    </h1>
      <div v-if="loading" class="text-center my-5">
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="n in 6" :key="n" class="col">
          <SkeletonLoader />
        </div>
      </div>
      <LoadingSpinner size="lg" message="Loading your library..." />
    </div>
    
    <!-- Not authenticated message -->
    <div v-else-if="!isAuthenticated" class="auth-alert polished-auth-card">
      <div class="auth-icon-wrapper">
        <i class="fas fa-user-lock"></i>
      </div>
      <div class="auth-message">
        <p class="mb-0">Please sign in to access your library</p>
        <p class="mb-3">Create an account to save your favorite books</p>
      </div>
      <NuxtLink to="/auth?redirect=/library" class="btn polished-signin-btn">
        <i class="fas fa-sign-in-alt me-2"></i>Sign In
      </NuxtLink>
    </div>
    
    <!-- Books in library -->
    <div v-else-if="savedBooks.length" class="mt-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <p class="mb-2 mb-md-0">You have {{ savedBooks.length }} books in your library</p>
        <div class="d-flex flex-column flex-md-row gap-2">
          <!-- Text search filter -->
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Filter books..." 
              v-model="searchFilter"
              aria-label="Filter books by title or author"
            >
            <span class="input-group-text bg-transparent">
              <i class="fas fa-search"></i>
            </span>
          </div>
          
          <!-- Category filter dropdown -->
          <div class="dropdown" v-if="categoryList.length > 0">
            <button 
              class="btn btn-outline-secondary dropdown-toggle" 
              type="button" 
              id="categoryFilterDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              {{ categoryFilter ? categoryFilter : 'Filter by category' }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="categoryFilterDropdown">
              <li v-if="categoryFilter">
                <button class="dropdown-item" @click="categoryFilter = ''">
                  <i class="fas fa-times me-2"></i>Clear filter
                </button>
              </li>
              <li v-if="categoryFilter"><hr class="dropdown-divider"></li>
              <li v-for="category in categoryList" :key="category.name">
                <button 
                  class="dropdown-item d-flex justify-content-between align-items-center" 
                  @click="categoryFilter = category.name"
                >
                  {{ category.name }}
                  <span class="badge bg-secondary rounded-pill">{{ category.count }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Applied filters display -->
      <div v-if="searchFilter || categoryFilter" class="mb-3">
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <small class="text-muted me-2">Active filters:</small>
          <span v-if="searchFilter" class="badge bg-primary">
            Search: "{{ searchFilter }}"
            <button class="btn-close btn-close-white ms-2" style="font-size: 0.5rem" @click="searchFilter = ''"></button>
          </span>
          <span v-if="categoryFilter" class="badge bg-info">
            Category: {{ categoryFilter }}
            <button class="btn-close btn-close-white ms-2" style="font-size: 0.5rem" @click="categoryFilter = ''"></button>
          </span>
        </div>
      </div>
      
      <div v-if="booksWithCategoryFilter.length" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="book in booksWithCategoryFilter" :key="book.id" class="col">          <BookCard 
            :book="book" 
            :in-library="true" 
            @remove="removeFromLibrary"
            @view-notes="openBookNotes"
          />
        </div>
      </div>
      
      <!-- No results after filtering -->
      <div v-else-if="searchFilter || categoryFilter" class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        No books match your current filters. Try adjusting or clearing your filters.
      </div>
    </div>
    
    <div v-else class="alert alert-info mt-5 text-center empty-library">
      <i class="fas fa-info-circle fa-2x mb-3"></i>
      <p class="mb-0">Your library is empty</p>
      <p class="mb-3">Search for books and save them to build your collection</p>
      <NuxtLink to="/" class="btn btn-primary">
        <i class="fas fa-search me-2"></i>Search Books
      </NuxtLink>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useLibrary } from '~/composables/useLibrary';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

const { savedBooks, loading, error, fetchSavedBooks, removeBook } = useLibrary();
const { isAuthenticated } = useAuth();
const { $db: db, $auth: auth } = useNuxtApp();

// Filter state
const searchFilter = ref('');

// Computed filtered books
const filteredBooks = computed(() => {
  if (!searchFilter.value.trim()) {
    return savedBooks.value;
  }
  
  const filterLower = searchFilter.value.toLowerCase();
  return savedBooks.value.filter(book => 
    book.title.toLowerCase().includes(filterLower) || 
    (book.authors && book.authors.some(author => 
      author.toLowerCase().includes(filterLower)
    ))
  );
});

// Remove a book from the library
const removeFromLibrary = async (bookId) => {
  const success = await removeBook(bookId);
  
  if (success && window.$notification) {
    const book = savedBooks.value.find(b => b.id === bookId);
    window.$notification.info(`"${book?.title || 'Book'}" has been removed from your library`);
  } else if (window.$notification) {
    window.$notification.error('Failed to remove book from library');
  }
};

// Add category filter
const categoryFilter = ref('');
const categoryList = computed(() => {
  const categories = {};
  savedBooks.value.forEach(book => {
    if (book.categories) {
      book.categories.forEach(category => {
        categories[category] = (categories[category] || 0) + 1;
      });
    }
  });
  return Object.entries(categories)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

// Final filtered books with category filter
const booksWithCategoryFilter = computed(() => {
  if (!categoryFilter.value) {
    return filteredBooks.value;
  }
  
  return filteredBooks.value.filter(book => 
    book.categories && book.categories.includes(categoryFilter.value)
  );
});

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
  // Update the local book data if we're not using real-time updates
  const bookIndex = savedBooks.value.findIndex(b => b.id === id);
  if (bookIndex !== -1) {
    savedBooks.value[bookIndex].notes = notes;
  }
  
  if (window.$notification) {
    window.$notification.success('Notes saved successfully');
  }
  
  closeBookNotes();
};

// Load saved books when authenticated
onMounted(async () => {
  if (isAuthenticated.value && !loading.value) {
    await fetchSavedBooks();
    if (error.value && window.$notification) {
      window.$notification.error(`Failed to load library: ${error.value}`);
    }
  }
});

// Watch for authentication changes
watch(() => isAuthenticated.value, async (isAuth) => {
  if (isAuth && !loading.value) {
    await fetchSavedBooks();
  }
});
</script>

<style scoped>
.empty-library, .auth-alert {
  max-width: 550px;
  margin: 4rem auto;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: none;
}

.empty-library i, .auth-alert i {
  font-size: 3rem;
  color: var(--muted-gold);
  margin-bottom: 1.5rem;
}

.empty-library p, .auth-alert p {
  color: var(--rich-charcoal);
  font-size: 1.05rem;
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
  background: linear-gradient(to right, var(--dusty-rose), var(--muted-gold));
  bottom: -10px;
  left: 25%;
  border-radius: 2px;
}

h1 i {
  color: var(--dusty-rose);
}

.form-control {
  border-radius: var(--border-radius);
  border: 1px solid var(--cool-gray);
  padding: 0.6rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--dusty-rose);
  box-shadow: 0 0 0 0.25rem rgba(232, 174, 183, 0.25);
}

.input-group-text {
  border-color: var(--cool-gray);
}

.dropdown-menu {
  border: none;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  padding: 0.5rem;
  overflow: hidden;
}

.dropdown-item {
  border-radius: 6px;
  padding: 0.6rem 1rem;
  transition: all 0.25s ease;
}

.dropdown-item:hover {
  background-color: rgba(168, 195, 160, 0.15);
}

.dropdown-item .badge {
  background-color: var(--sage-green) !important;
  color: var(--soft-navy);
  font-weight: 500;
}

.badge.bg-primary {
  background-color: var(--dusty-rose) !important;
}

.badge.bg-info {
  background-color: var(--sage-green) !important;
  color: var(--soft-navy);
}

.btn-outline-secondary {
  border-color: var(--cool-gray);
  color: var(--soft-navy);
}

.btn-outline-secondary:hover {
  background-color: var(--sage-green-light);
  border-color: var(--sage-green);
  color: var(--soft-navy);
}

.alert-info {
  background-color: rgba(168, 195, 160, 0.2);
  border: none;
  color: var(--soft-navy);
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.polished-auth-card {
  background: linear-gradient(135deg, #f8f6f2 60%, #f3e6e1 100%);
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.10);
  border-radius: 1.5rem;
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  max-width: 420px;
  margin: 4rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
}

.auth-icon-wrapper {
  background: rgba(232, 174, 183, 0.13);
  border-radius: 50%;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-icon-wrapper i {
  font-size: 3.2rem;
  color: var(--muted-gold);
}

.auth-message p {
  color: var(--rich-charcoal);
  font-size: 1.08rem;
  margin-bottom: 0.3rem;
}

.polished-signin-btn {
  background: var(--dusty-rose);
  color: #fff;
  border: none;
  border-radius: 0.8rem;
  padding: 0.85rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.2rem;
  box-shadow: 0 2px 8px rgba(232, 174, 183, 0.10);
  transition: background 0.2s, transform 0.2s;
}

.polished-signin-btn:hover, .polished-signin-btn:focus {
  background: #e8aeb7;
  color: #fff;
  transform: translateY(-2px) scale(1.03);
}
</style>
