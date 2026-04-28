import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000,
        host: true, // It's good practice for docker to listen on all interfaces
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
