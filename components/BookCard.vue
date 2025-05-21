<template>
  <div class="card h-100 book-card">    <div class="book-image-container">
      <img 
        v-if="book.thumbnail"
        :src="book.thumbnail" 
        class="card-img-top book-image" 
        :alt="book.title"
      >
      <div v-else class="placeholder-cover d-flex align-items-center justify-content-center">
        <i class="fas fa-book fa-3x"></i>
        <div class="mt-2 text-center">
          <small>No cover available</small>
        </div>
      </div>
    </div>
    <div class="card-body d-flex flex-column">      <h5 class="card-title">{{ book.title }}</h5>
      <p class="card-subtitle text-muted mb-2">
        {{ book.authors?.join(', ') || 'Unknown Author' }}
      </p>
      
      <!-- Categories badges -->
      <div v-if="book.categories && book.categories.length" class="mb-2">
        <span 
          v-for="category in displayCategories" 
          :key="category" 
          class="badge bg-secondary me-1 mb-1"
        >
          {{ category }}
        </span>
        <span v-if="book.categories.length > 2" class="badge bg-light text-dark">
          +{{ book.categories.length - 2 }} more
        </span>
      </div>
      
      <!-- Publisher and date (if available) -->
      <p v-if="book.publisher || book.publishedDate" class="small text-muted mb-2">
        <span v-if="book.publisher">{{ book.publisher }}</span>
        <span v-if="book.publisher && book.publishedDate"> · </span>
        <span v-if="book.publishedDate">{{ book.publishedDate }}</span>
      </p>
        <p class="card-text description">{{ book.description }}</p>
      <div class="mt-auto">
        <!-- Not authenticated yet -->
        <div v-if="!isAuthenticated" class="d-grid gap-2">
          <NuxtLink to="/auth" class="btn btn-primary">
            <i class="fas fa-sign-in-alt me-1"></i> Sign in to Save
          </NuxtLink>
        </div>
        
        <!-- Authenticated with book not in library -->
        <button 
          v-else-if="!inLibrary" 
          class="btn btn-primary w-100"
          @click="saveBook"
        >
          <i class="fas fa-bookmark me-1"></i> Save to Library
        </button>
        
        <!-- Book in library with options -->
        <div v-else class="book-actions">
          <!-- View/Edit Notes button -->
          <button
            class="btn btn-outline-secondary mb-2 w-100"
            @click="toggleNotesModal"
            data-bs-toggle="tooltip"
            title="View or add notes about this book"
          >
            <i class="fas fa-sticky-note me-1"></i>
            {{ bookHasNotes ? 'View Notes' : 'Add Notes' }}
          </button>
          
          <!-- Remove from library button -->
          <button 
            class="btn btn-outline-danger w-100"
            @click="removeBook"
          >
            <i class="fas fa-trash-alt me-1"></i> Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

const { isAuthenticated } = useAuth();
const { $db: db, $auth: auth } = useNuxtApp();

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  inLibrary: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'remove', 'view-notes']);

// Check if book has notes
const bookHasNotes = computed(() => {
  return props.book.notes && props.book.notes.trim().length > 0;
});

// Only show first 2 categories in the UI to save space
const displayCategories = computed(() => {
  if (!props.book.categories || !props.book.categories.length) return [];
  return props.book.categories.slice(0, 2);
});

const saveBook = () => {
  emit('save', props.book);
};

const removeBook = () => {
  emit('remove', props.book.id || props.book.googleBooksId);
};

const toggleNotesModal = () => {
  emit('view-notes', props.book);
};
</script>

<style scoped>
.book-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.book-image-container {
  height: 220px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(250, 243, 224, 0.5);
  position: relative;
}

.placeholder-cover {
  height: 100%;
  width: 100%;
  background-color: var(--warm-cream);
  color: var(--soft-navy-light);
  flex-direction: column;
}

.book-image-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, var(--sage-green), var(--dusty-rose));
  opacity: 0.7;
}

.book-image {
  object-fit: contain;
  max-height: 90%;
  max-width: 90%;
  transition: transform 0.4s ease;
}

.book-card:hover .book-image {
  transform: scale(1.05);
}

.card-body {
  padding: 1.5rem !important;
  background-color: white;
}

.card-title {
  color: var(--soft-navy);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.15rem;
  line-height: 1.4;
}

.card-subtitle {
  font-size: 0.9rem;
  color: var(--cool-gray) !important;
}

.description {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--rich-charcoal);
  font-size: 0.95rem;
  margin-top: 0.75rem;
  margin-bottom: 1.5rem;
}

.badge {
  font-weight: 500;
  font-size: 0.8rem;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
}

.badge.bg-secondary {
  background-color: var(--sage-green) !important;
  color: var(--soft-navy);
}

.badge.bg-light {
  background-color: var(--cool-gray) !important;
  color: white;
}

.small.text-muted {
  color: var(--muted-gold) !important;
  font-weight: 500;
}

.book-actions {
  margin-top: 0.75rem;
}

.btn-outline-danger {
  color: var(--dusty-rose);
  border-color: var(--dusty-rose);
}

.btn-outline-danger:hover {
  background-color: var(--dusty-rose-light);
  color: var(--dusty-rose);
  border-color: var(--dusty-rose);
}
</style>
