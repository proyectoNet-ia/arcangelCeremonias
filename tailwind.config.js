/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: '#FDF8F1',
                chocolate: '#3E2723',
                bronze: '#8D6E63',
                gold: '#C5A059',
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            animation: {
                'reveal-up': 'revealUp 1.2s cubic-bezier(0.2, 1, 0.3, 1) forwards',
                'grow-line': 'growLine 1.5s cubic-bezier(0.2, 1, 0.3, 1) forwards',
                'fade-in-down': 'fadeInDown 1s ease-out forwards',
                'fade-in-up': 'fadeInUp 1s ease-out forwards',
                'zoom': 'zoom 60s linear infinite alternate',
            },
            keyframes: {
                revealUp: {
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                growLine: {
                    'to': { width: '6rem' },
                },
                fadeInDown: {
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInUp: {
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                zoom: {
                    '0%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1.2)' },
                }
            }
        },
    },
    plugins: [],
}
