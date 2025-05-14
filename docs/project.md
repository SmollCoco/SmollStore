## ✅ **Project: Book Tracker App with Nuxt 3 + Firestore**

### 🔧 Technical Requirements

#### 1. **Frontend Framework**

* Use **Nuxt 3** with **Composition API** and **TypeScript (optional)**

#### 2. **External API Integration**

* Use the **Google Books API** to:
  
  * Search books by title/author/keywords
  * Display book info (title, authors, thumbnail, description)

#### 3. **Firebase Setup**

* Use **Firebase v9+ modular SDK**

* Enable and use:
  
  * **Firestore Database**
  * **Authentication** (Anonymous login)

#### 4. **User Authentication**

* Sign users in **anonymously**
* Associate saved books with their `uid`

#### 5. **Firestore Functionality**

* Save books to:
  * Collection: `users/{uid}/library`
  * Fields: `title`, `authors`, `thumbnail`, `description`
* Read saved books from Firestore
* Delete books from the saved list

#### 6. **Pages & Components**

* `/` — Homepage with:
  
  * A search bar
  * Display of search results with "Save" buttons

* `/library` — User’s saved books from Firestore with "Remove" buttons

* **Components**:
  
  * `BookCard.vue`: Display a single book's info
  * `SearchBar.vue`: Input for search

#### 7. **Design & UX**

* Responsive layout
* Basic styling (Tailwind CSS or minimal CSS)
* Feedback messages (e.g., “Book saved”, “Removed”)
