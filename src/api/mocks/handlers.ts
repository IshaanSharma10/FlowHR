import { http, HttpResponse } from 'msw'
import { automationsCatalog } from '../automationsCatalog'
import { runSimulation, type SimulateRequestBody } from '../simulate/runSimulation'

export const handlers = [
  http.get('/automations', () => HttpResponse.json(automationsCatalog)),

  http.post('/simulate', async ({ request }) => {
    const body = await request.json() as SimulateRequestBody
    return HttpResponse.json(runSimulation(body))
  }),
]
