import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Les pages des coulisses sont du HTML statique : elles ne voient pas
 * import.meta.env. Ce plugin leur sert l'URL du script Google sous forme de
 * petit fichier, généré à la volée — l'URL n'entre jamais dans le dépôt.
 */
function coulissesConfig(scriptUrl: string): Plugin {
  const path = 'coulisses-4f2a91/config.js'
  const source = `window.ORGA_CONFIG = ${JSON.stringify({ scriptUrl })};\n`
  return {
    name: 'coulisses-config',
    configureServer(server) {
      server.middlewares.use(`/${path}`, (_req, res) => {
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        res.end(source)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: path, source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), coulissesConfig(env.VITE_GOOGLE_SCRIPT_URL || '')],
  }
})
