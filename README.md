# 📚 SmollStore - Personal Book Tracker

SmollStore is a web application that allows users to search for books using the Google Books API, save them to their personal library, add notes, and organize their reading collection.

## 🚀 Features

- 🔍 Search for books using the Google Books API
- 📖 Save books to your personal library
- 📝 Add and update notes for each book
- 👤 User authentication with Firebase (anonymous, email/password)
- 📱 Responsive design for mobile and desktop

## 🛠️ Technologies

- [Nuxt.js 3](https://nuxt.com/) - Vue.js meta-framework
- [Firebase](https://firebase.google.com/) - Authentication and Firestore database
- [Bootstrap 5](https://getbootstrap.com/) - UI framework
- [FontAwesome](https://fontawesome.com/) - Icons

## 🏗️ Project Setup

### Install Dependencies

```bash
# npm
npm install
```

### Development Server

Start the development server on http://localhost:3000:

```bash
# npm
npm run dev
```

### Production Build

Build the application for production:

```bash
# npm
npm run build
```

Preview the production build:

```bash
# npm
npm run preview
```

## 📁 Project Structure

- `assets/` - Static assets
- `components/` - Vue components
- `composables/` - Reusable Vue composition API functions
- `layouts/` - Layout components
- `pages/` - Application pages and routes
- `plugins/` - Vue plugins
- `public/` - Public assets
- `types/` - TypeScript declarations

## 🔑 Firebase Configuration

The project uses Firebase for authentication and database storage. To set up your own Firebase project:

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Anonymous sign-in methods
3. Create a Firestore database
4. Update the Firebase configuration in `firebase.js`

## 📱 Deployment

The application can be deployed to any static hosting service that supports Nuxt.js:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## 🧑‍💻 Developer Notes

- When adding new Firebase functionality, make sure to update the firestore.rules file
- The Google Books API doesn't require an API key for basic usage, but for production, consider adding an API key
- Run `npm run generate` to create a static version of the site for deployment

## 📜 License

This project is licensed under the MIT License.
