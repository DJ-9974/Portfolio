import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Portfolio/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        projects: resolve(__dirname, 'projects.html'),
        contact: resolve(__dirname, 'contact.html'),
        dermtrack: resolve(__dirname, 'projects/dermtrack.html'),
        solarpro: resolve(__dirname, 'projects/solarpro.html'),
        crisis_response: resolve(__dirname, 'projects/crisis-response.html'),
      },
    },
  },
});
