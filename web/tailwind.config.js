/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bitdoge: {
                    gold: '#f2a900',
                    dark: '#0a0a0a',
                    gray: '#1a1a1a',
                    text: '#e0e0e0',
                },
            },
            fontFamily: {
                mono: ['"Roboto Mono"', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 12s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
