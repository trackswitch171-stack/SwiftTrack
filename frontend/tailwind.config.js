/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0B3D91',
                    50: '#E8EFFE',
                    100: '#C5D7FD',
                    200: '#9BBEFB',
                    300: '#70A4F9',
                    400: '#4A8CF7',
                    500: '#2563EB',
                    600: '#1A4FC4',
                    700: '#0B3D91',
                    800: '#082E6E',
                    900: '#051F4A',
                },
                secondary: {
                    DEFAULT: '#2563EB',
                    500: '#2563EB',
                },
                accent: {
                    DEFAULT: '#F97316',
                    50: '#FFF5ED',
                    100: '#FFE6CC',
                    200: '#FFCC99',
                    300: '#FFB366',
                    400: '#FF9933',
                    500: '#F97316',
                    600: '#CC5C0A',
                    700: '#994508',
                    800: '#662E05',
                    900: '#331703',
                },
                success: '#16A34A',
                navy: '#0B3D91',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'card': '0 4px 20px rgba(0,0,0,0.08)',
                'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
                'glow': '0 0 20px rgba(37, 99, 235, 0.3)',
            },
        },
    },
    plugins: [],
}
