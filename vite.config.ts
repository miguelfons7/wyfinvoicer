import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site under /wyfinvoicer/. Local dev still uses /.
const isPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isPages ? '/wyfinvoicer/' : '/',
  plugins: [react(), tailwindcss()],
})
