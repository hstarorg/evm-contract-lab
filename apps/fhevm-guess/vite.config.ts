import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-oxc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {},
});
