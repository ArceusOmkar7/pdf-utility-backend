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
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.5s ease-out',
          'bounce-light': 'bounce 1s ease-in-out infinite',
          'pulse-light': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'spin-slow': 'spin 3s linear infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          }
        }
      },
    },
    plugins: [],
    // Optional: Consider prefixing Tailwind classes if major conflicts with Ionic arise
    // prefix: "tw-",
  }