import type { VercelRequest, VercelResponse } from '@vercel/node'
import { automationsCatalog } from '../src/api/automationsCatalog'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  res.status(200).json(automationsCatalog)
}
