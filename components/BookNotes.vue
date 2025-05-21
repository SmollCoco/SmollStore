<template>
  <div class="modal fade" 
       id="bookNotesModal" 
       tabindex="-1" 
       aria-labelledby="bookNotesModalLabel" 
       aria-hidden="true"
       data-bs-backdrop="static"
       data-bs-keyboard="false"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="bookNotesModalLabel">
            {{ book?.title ? `Notes for "${book.title}"` : 'Book Notes' }}
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="hideModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="!book" class="text-center py-4">
            <LoadingSpinner />
          </div>
          <form v-else @submit.prevent="saveNotes">
            <div class="mb-3">
              <label for="bookNotes" class="form-label">Your Notes</label>
              <textarea 
                class="form-control" 
                id="bookNotes" 
                v-model="notes" 
                rows="6"
                placeholder="Add your thoughts, favorite quotes, or reading progress here..."
              ></textarea>
            </div>
          </form>
        </div>        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="hideModal"
          >
            Close
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="saveNotes"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Save Notes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useLibrary } from '~/composables/useLibrary';
import { useNuxtApp } from '#app';

const props = defineProps({
  book: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'saved']);

const { updateBookNotes } = useLibrary();
const { $db: db, $auth: auth } = useNuxtApp();
const notes = ref('');
const isSaving = ref(false);
let modal = null;

// Initialize notes when book changes
watch(() => props.book, (newBook) => {
  if (newBook) {
    notes.value = newBook.notes || '';
  }
}, { immediate: true });

// Watch show prop to show/hide modal
watch(() => props.show, (newValue) => {
  if (newValue) {
    showModal();
  } else {
    hideModal();
  }
});

// Initialize Bootstrap modal on client-side
onMounted(() => {
  if (process.client) {
    const modalElement = document.getElementById('bookNotesModal');
    if (modalElement && window.bootstrap) {
      modal = new window.bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Add event listener for modal close
      if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
          emit('close');
        });
      }
      
      // Show modal if needed
      if (props.show) {
        showModal();
      }
    }
  }
});

// Save notes to Firestore
const saveNotes = async () => {
  if (!props.book || !props.book.id) return;
  
  isSaving.value = true;
  
  try {
    await updateBookNotes(props.book.id, notes.value);
    emit('saved', { id: props.book.id, notes: notes.value });
    hideModal();
  } catch (error) {
    console.error('Failed to save notes:', error);
  } finally {
    isSaving.value = false;
  }
};

// Show the modal
const showModal = () => {
  if (modal) {
    modal.show();
  }
};

// Hide the modal
const hideModal = () => {
  if (modal) {
    modal.hide();
  }
};

// Clean up on unmount
onUnmounted(() => {
  if (modal) {
    modal.dispose();
  }
});
</script>

<style scoped>
/* Custom styling for the notes modal */
textarea {
  resize: vertical;
  min-height: 180px;
  border-radius: var(--border-radius);
  background-color: rgba(250, 243, 224, 0.3);
  border: 1px solid var(--cool-gray);
  padding: 1rem;
  transition: all 0.3s ease;
}

textarea:focus {
  border-color: var(--dusty-rose);
  box-shadow: 0 0 0 0.25rem rgba(232, 174, 183, 0.25);
  background-color: white;
}

.modal-content {
  border: none;
  border-radius: var(--border-radius);
  background-color: white;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  border-bottom: 1px solid rgba(189, 195, 199, 0.3);
  background-color: white;
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid rgba(189, 195, 199, 0.3);
  padding: 1.25rem 1.5rem;
}

.modal-title {
  color: var(--soft-navy);
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

.form-label {
  font-weight: 500;
  color: var(--soft-navy);
  margin-bottom: 0.7rem;
}
</style>
