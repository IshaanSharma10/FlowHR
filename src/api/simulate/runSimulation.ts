import type { NodeType, SimulationResult } from '../../types/simulation'

export interface SimulateRequestBody {
  nodes: Array<{ id: string; data: { nodeType: string; label: string } }>
  edges: Array<{ source: string; target: string; sourceHandle?: string | null }>
  nodeConfigs: Record<string, Record<string, unknown>>
}

const messages: Record<string, (cfg: Record<string, unknown>) => string> = {
  start: (c) => `Workflow triggered — mode: ${(c?.triggerType as string) || 'manual'}`,
  task: (c) => `Assigned to ${(c?.assignee as string) || 'unassigned'} · due in ${(c?.dueInDays as number) || 7} days`,
  approval: (c) => `Approval sent to ${(c?.approver as string) || 'approver'} (${(c?.threshold as string) || 'single'})`,
  autostep: (c) => `Running automation: ${(c?.actionId as string) || 'none'}`,
  end: (c) => `Workflow ended · status: ${(c?.status as string) || 'complete'}`,
  decision: (c) => `Evaluating: "${(c?.condition as string) || '(no condition)'}" → following all branches (simulation)`,
  fork: (c) => `Splitting into parallel branches${(c?.description as string) ? ` — ${c.description}` : ''}`,
  join: (c) => `Merging parallel branches · strategy: ${(c?.strategy as string) || 'wait-all'}`,
  notification: (c) => {
    const channel = (c?.channel as string) || 'email'
    const to = (c?.recipients as string) || '(no recipients)'
    const subj = (c?.subject as string) ? ` · "${c.subject}"` : ''
    return `Sending ${channel} to ${to}${subj}`
  },
  delay: (c) => {
    if (c?.durationType === 'until-date') return `Waiting until ${(c?.untilDate as string) || '(date unset)'}`
    const val = (c?.durationValue as number) || 1
    const unit = (c?.durationUnit as string) || 'days'
    const type = c?.durationType === 'business-days' ? 'business ' : ''
    return `Waiting ${val} ${type}${unit}`
  },
  subworkflow: (c) => `Executing sub-workflow: ${(c?.workflowName as string) || (c?.workflowId as string) || '(unset)'}`,
  datatransform: (c) => `${(c?.operation as string) || 'map'} on ${(c?.sourceField as string) || 'data'}: ${(c?.expression as string) || '(no expression)'}`,
}

export function runSimulation(body: SimulateRequestBody): SimulationResult {
  const nodes = Array.isArray(body?.nodes) ? body.nodes : []
  const edges = Array.isArray(body?.edges) ? body.edges : []
  const rawCfg = body?.nodeConfigs
  const nodeConfigs: Record<string, Record<string, unknown>> =
    rawCfg && typeof rawCfg === 'object' && !Array.isArray(rawCfg)
      ? (rawCfg as Record<string, Record<string, unknown>>)
      : {}

  const adj: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}
  nodes.forEach((n) => { adj[n.id] = []; inDegree[n.id] = 0 })
  edges.forEach((e) => {
    if (!adj[e.source] || inDegree[e.target] === undefined) return
    adj[e.source].push(e.target)
    inDegree[e.target]++
  })

  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id)
  const order: string[] = []
  while (queue.length > 0) {
    const curr = queue.shift()!
    order.push(curr)
    ;(adj[curr] ?? []).forEach((next) => { if (--inDegree[next] === 0) queue.push(next) })
  }

  const steps = order.map((nodeId, i) => {
    const node = nodes.find((n) => n.id === nodeId)
    const cfg = nodeConfigs[nodeId] ?? {}
    const nodeType = (node?.data?.nodeType ?? 'task') as NodeType
    return {
      nodeId,
      nodeType,
      label: node?.data?.label ?? nodeType,
      status: 'success' as const,
      message: (messages[nodeType] ?? (() => 'Step executed'))(cfg),
      timestamp: new Date(Date.now() + i * 1200).toISOString(),
    }
  })

  return { success: true, steps }
}
