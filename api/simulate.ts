import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runSimulation, type SimulateRequestBody } from '../src/api/simulate/runSimulation'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const raw = req.body
    const body = (typeof raw === 'string' ? JSON.parse(raw || '{}') : raw) as SimulateRequestBody
    const result = runSimulation(body)
    res.status(200).json(result)
  } catch {
    res.status(500).json({
      success: false,
      steps: [],
      error: 'Simulation failed — please try again',
    })
  }
}
