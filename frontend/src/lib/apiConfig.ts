// Central backend URL configuration
// Change NEXT_PUBLIC_API_URL in .env.local for local dev,
// or set it as an environment variable in your hosting platform (Vercel, Azure, etc.)

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hms-backend-gjcxcca5aagmdwab.eastasia-01.azurewebsites.net";

export default API_BASE_URL;
