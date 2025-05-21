import { ref } from 'vue';
import { useRuntimeConfig } from '#app';

export const useBookSearch = () => {
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const searchPerformed = ref(false);
  const cachedSearches = ref({});

  // Search books using Google Books API
  const searchBooks = async (query) => {
    if (!query || !query.trim()) return;
    loading.value = true;
    error.value = null;
    searchPerformed.value = true;

    try {
      // Use cache if available
      if (cachedSearches.value[query]) {
        books.value = cachedSearches.value[query];
        loading.value = false;
        return;
      }
      const config = useRuntimeConfig();
      const apiKey = config.public.googleBooksApiKey;
      const apiUrl = config.public.googleBooksApiUrl;
      let url = `${apiUrl}?q=${encodeURIComponent(query)}&maxResults=20`;
      // Only add API key if it is set, not empty, and not 'undefined'
      if (apiKey && apiKey !== 'undefined' && apiKey !== '') url += `&key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch books: ${response.statusText}`);
      const data = await response.json();
      if (!data.items || !Array.isArray(data.items)) {
        books.value = [];
        return;
      }
      const formattedBooks = data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo?.title || 'Unknown Title',
        authors: item.volumeInfo?.authors || ['Unknown Author'],
        description: item.volumeInfo?.description || 'No description available',
        thumbnail: item.volumeInfo?.imageLinks?.thumbnail || null,
        categories: item.volumeInfo?.categories || [],
        publisher: item.volumeInfo?.publisher || 'Unknown Publisher',
        publishedDate: item.volumeInfo?.publishedDate || 'Unknown Date',
        pageCount: item.volumeInfo?.pageCount || 0,
        language: item.volumeInfo?.language || 'unknown',
        previewLink: item.volumeInfo?.previewLink || null,
      }));
      cachedSearches.value[query] = formattedBooks;
      books.value = formattedBooks;
    } catch (err) {
      error.value = err.message || 'Unknown error';
      books.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Clear search results
  const clearSearch = () => {
    books.value = [];
    searchPerformed.value = false;
  };

  // Clear cache if too large
  const clearCache = () => {
    const queries = Object.keys(cachedSearches.value);
    if (queries.length > 10) {
      const newCache = {};
      queries.slice(-5).forEach(q => {
        newCache[q] = cachedSearches.value[q];
      });
      cachedSearches.value = newCache;
    }
  };

  return {
    books,
    loading,
    error,
    searchPerformed,
    searchBooks,
    clearSearch,
    clearCache
  };
};