// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html", // Include the root HTML file
      "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS/JSX/TSX files in src
    ],
    theme: {
      extend: {
        // You can extend the default Tailwind theme here if needed
        // e.g., add custom colors, fonts, etc.
      },
    },
    plugins: [],
    // Optional: Consider prefixing Tailwind classes if major conflicts with Ionic arise
    // prefix: "tw-",
  }