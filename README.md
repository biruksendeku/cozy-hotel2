# Cozy Hotel

A hotel food-ordering web application built with Express, EJS, and MongoDB. It includes user authentication, a shopping cart, and admin pages.

## Getting started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file based on `.env.example` and configure the required database, session, email, and OAuth settings.
3. Start the development server:
   ```sh
   npm run dev
   ```

Use `npm start` to start the server without nodemon. The app uses the `PORT` environment variable, defaulting to `3000`.

## Application structure

- `src/routes/` defines URLs and attaches middleware and validation.
- `src/controllers/` contains request handlers grouped by feature (`auth`, `api`, `food`, and `admin`).
- `src/controllers/email.js` provides the email-sending functions used by the auth and API controllers.
