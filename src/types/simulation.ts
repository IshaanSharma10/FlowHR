/** Simulation + node palette types only — safe for Node/serverless bundles (no @xyflow/react). */

export type NodeType =
  | 'start' | 'task' | 'approval' | 'autostep' | 'end'
  | 'decision' | 'fork' | 'join'
  | 'notification' | 'delay' | 'subworkflow' | 'datatransform'

export interface SimulationStep {
  nodeId: string
  nodeType: NodeType
  label: string
  status: 'success' | 'pending' | 'skipped'
  message: string
  timestamp: string
}

export interface SimulationResult {
  success: boolean
  steps: SimulationStep[]
  error?: string
}
