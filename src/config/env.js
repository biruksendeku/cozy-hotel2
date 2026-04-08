require("dotenv").config();

const requiredVariables = [
  "MONGODB_URI",
  "SESSION_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "EMAIL_USER",
  "EMAIL_PASS",
  "BASE_URL",
  "MAX_ITEM_QUANTITY",
];

const missingVariables = requiredVariables.filter(
  (name) => !process.env[name] || !process.env[name].trim(),
);
const maxItemQuantityValue = (process.env.MAX_ITEM_QUANTITY || "").trim();
const maxItemQuantity = Number(maxItemQuantityValue);
const invalidVariables =
  maxItemQuantityValue &&
  (!Number.isInteger(maxItemQuantity) || maxItemQuantity <= 0)
    ? ["MAX_ITEM_QUANTITY must be a positive integer"]
    : [];

if (missingVariables.length || invalidVariables.length) {
  console.error(
    [
      missingVariables.length
        ? `Missing required environment variables: ${missingVariables.join(", ")}`
        : "",
      ...invalidVariables,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  process.exit(1);
}
