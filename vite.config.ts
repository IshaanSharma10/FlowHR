import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { runSimulation, type SimulateRequestBody } from './src/api/simulate/runSimulation'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/** Fallback when the MSW service worker does not intercept POST /simulate (avoids Vite 404). */
function simulateDevApiPlugin(): Plugin {
  return {
    name: 'simulate-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (url !== '/simulate' || req.method !== 'POST') {
          next()
          return
        }
        try {
          const raw = await readBody(req as IncomingMessage)
          const body = JSON.parse(raw || '{}') as SimulateRequestBody
          const result = runSimulation(body)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            success: false,
            steps: [],
            error: 'Simulation failed — please try again',
          }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [simulateDevApiPlugin(), react(), tailwindcss()],
})
