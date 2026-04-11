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

## Admin setup

Set `ADMIN_EMAIL` to the email address of an existing, verified account, then run:

```sh
npm run seed:admin
```

The command grants that account admin privileges and exits; it does not create accounts or run automatically when the server starts.

## Environment variables

The application loads settings from `.env`. Startup validates required settings and exits with a list of missing variables. Required at startup are `MONGODB_URI`, `SESSION_SECRET_KEY`, the Cloudinary and Google OAuth settings, `EMAIL_USER`, `EMAIL_PASS` - the gmail app password, not the password of your email, `BASE_URL`, and a positive integer `MAX_ITEM_QUANTITY`. Use the exact names below; in particular, the MongoDB setting is `MONGODB_URI` (not `MONGO_URI`).

| Variable                | Purpose                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`              | Runtime environment. Set to `production` when deployed.                                                             |
| `PORT`                  | HTTP port; defaults to `3000` if unset.                                                                             |
| `ADMIN_EMAIL`           | Existing account email to promote when running `npm run seed:admin`.                                                |
| `MAX_ITEM_QUANTITY`     | Positive integer limit for each food item in a cart.                                                                |
| `MONGODB_URI`           | MongoDB connection string used by the app and session store.                                                        |
| `SESSION_SECRET_KEY`    | Secret used to sign session cookies. Set a long, random value and keep it private.                                  |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name used for image uploads.                                                                       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key used for image uploads.                                                                          |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret used for image uploads; keep it private.                                                      |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID.                                                                                             |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth client secret; keep it private.                                                                        |
| `GOOGLE_CALLBACK_URL`   | Google OAuth callback URL, typically ending in `/auth/google/callback`.                                             |
| `EMAIL_USER`            | Gmail account used to send verification and password-reset emails.                                                  |
| `EMAIL_PASS`            | Gmail app password for `EMAIL_USER`; keep it private.                                                               |
| `BASE_URL`              | Application's public base URL, used to create links in emails.                                                      |
| `ACCESS_TOKEN_KEY`      | Present in the example file but not currently read by the application.                                              |
| `REFRESH_TOKEN_KEY`     | Present in the example file but not currently read by the application.                                              |
| `GEMINI_API_KEY`        | Present in the example file but not currently read by the application.                                              |
| `WEBSITE_ID`            | Present in the example file but not currently read by the application.                                              |
| `CLOUDINARY_URL`        | Present in the example file; the app currently configures Cloudinary with the three separate Cloudinary keys above. |
| `CHAPA_SECRET_KEY`      | Present in the example file but not currently read by the application.                                              |
| `CHAPA_URL`             | Present in the example file but not currently read by the application.                                              |

Google OAuth settings are required while Google sign-in is enabled. Never commit real credentials or secret values to the repository.

## Application structure

```text
src/
|-- app.js                 Express app and middleware setup
|-- config/                Cloudinary and Passport provider configuration
|   `-- passport/
|-- controllers/           Request handlers and application logic
|-- middlewares/           Authentication, sessions, rate limits, and errors
|   `-- errors/
|-- models/                Mongoose schemas and models
|-- public/                Browser assets (CSS, images, and JavaScript)
|-- routes/                URL routes and request validation
|-- utils/                 Shared helpers and database connection
`-- views/                 EJS page templates
```

`src/controllers/email.js` contains email-sending functions used by the auth and API controllers.
