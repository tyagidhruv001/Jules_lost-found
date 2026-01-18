/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0f172a',
                    navy: '#0f172a',
                },
                royal: '#2563eb',
                amber: '#f59e0b',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
            },
            boxShadow: {
                'premium': '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
            }
        },
    },
    plugins: [],
}
