import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runSimulation, type SimulateRequestBody } from '../src/api/simulate/runSimulation'

function parseRequestBody(raw: unknown): SimulateRequestBody {
  if (raw == null) {
    return { nodes: [], edges: [], nodeConfigs: {} }
  }
  if (Buffer.isBuffer(raw)) {
    try {
      return JSON.parse(raw.toString('utf8') || '{}') as SimulateRequestBody
    } catch {
      return { nodes: [], edges: [], nodeConfigs: {} }
    }
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw || '{}') as SimulateRequestBody
    } catch {
      return { nodes: [], edges: [], nodeConfigs: {} }
    }
  }
  if (typeof raw === 'object') {
    return raw as SimulateRequestBody
  }
  return { nodes: [], edges: [], nodeConfigs: {} }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const body = parseRequestBody(req.body)
    const result = runSimulation(body)
    res.status(200).json(result)
  } catch (err) {
    console.error('[api/simulate]', err)
    res.status(500).json({
      success: false,
      steps: [],
      error: 'Simulation failed — please try again',
    })
  }
}
