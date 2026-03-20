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

## Environment variables

The application loads settings from `.env`. Use the exact names below; in particular, the MongoDB setting is `MONGODB_URI` (not `MONGO_URI`).

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime environment. Set to `production` when deployed. |
| `PORT` | HTTP port; defaults to `3000` if unset. |
| `MONGODB_URI` | MongoDB connection string used by the app and session store. |
| `SESSION_SECRET_KEY` | Secret used to sign session cookies. Set a long, random value and keep it private. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name used for image uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key used for image uploads. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret used for image uploads; keep it private. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret; keep it private. |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL, typically ending in `/auth/google/callback`. |
| `FACEBOOK_APP_ID` | Facebook OAuth app ID. |
| `FACEBOOK_APP_SECRET` | Facebook OAuth app secret; keep it private. |
| `FACEBOOK_CALLBACK_URL` | Facebook OAuth callback URL, typically ending in `/auth/facebook/callback`. |
| `EMAIL_USER` | Gmail account used to send verification and password-reset emails. |
| `EMAIL_PASS` | Gmail app password for `EMAIL_USER`; keep it private. |
| `BASE_URL` | Application's public base URL, used to create links in emails. |
| `ACCESS_TOKEN_KEY` | Present in the example file but not currently read by the application. |
| `REFRESH_TOKEN_KEY` | Present in the example file but not currently read by the application. |
| `GEMINI_API_KEY` | Present in the example file but not currently read by the application. |
| `WEBSITE_ID` | Present in the example file but not currently read by the application. |
| `CLOUDINARY_URL` | Present in the example file; the app currently configures Cloudinary with the three separate Cloudinary keys above. |
| `CHAPA_SECRET_KEY` | Present in the example file but not currently read by the application. |
| `CHAPA_URL` | Present in the example file but not currently read by the application. |

OAuth settings are needed only if using that provider. Never commit real credentials or secret values to the repository.

## Application structure

- `src/routes/` defines URLs and attaches middleware and validation.
- `src/controllers/` contains request handlers grouped by feature (`auth`, `api`, `food`, and `admin`).
- `src/controllers/email.js` provides the email-sending functions used by the auth and API controllers.
