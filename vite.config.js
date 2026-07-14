import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// NOTE: React Compiler is intentionally disabled. It hoisted property reads on
// nullable state (e.g. `editing.active` while `editing` is null) into per-render
// memoization guards, crashing the AdminConsole on mount. The compiler is only an
// optimization and is not needed for this prototype.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
