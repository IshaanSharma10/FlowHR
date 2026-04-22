import type { Node } from '@xyflow/react'

export type NodeType =
  | 'start' | 'task' | 'approval' | 'autostep' | 'end'
  | 'decision' | 'fork' | 'join'
  | 'notification' | 'delay' | 'subworkflow' | 'datatransform'

export interface AutomationParam {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  label: string
  required: boolean
  options?: string[]
}

export interface AutomationAction {
  id: string
  name: string
  params: AutomationParam[]
}

// ── Existing configs ──────────────────────────────────────────────────────────

export interface StartConfig {
  label: string
  triggerType: 'manual' | 'scheduled'
  schedule?: string
}

export interface TaskConfig {
  label: string
  assignee: string
  dueInDays: number
  instructions: string
}

export interface ApprovalConfig {
  label: string
  approver: string
  threshold: 'unanimous' | 'majority' | 'single'
}

export interface AutoStepConfig {
  label: string
  actionId: string
  params: Record<string, string | number | boolean>
}

export interface EndConfig {
  label: string
  status: 'complete' | 'cancelled'
  notify: boolean
}

// ── New configs ───────────────────────────────────────────────────────────────

export interface DecisionConfig {
  label: string
  condition: string
  yesLabel: string
  noLabel: string
}

export interface ForkConfig {
  label: string
  description: string
}

export interface JoinConfig {
  label: string
  strategy: 'wait-all' | 'wait-first'
}

export interface NotificationConfig {
  label: string
  channel: 'email' | 'slack' | 'teams' | 'sms'
  recipients: string
  subject: string
  message: string
}

export interface DelayConfig {
  label: string
  durationType: 'fixed' | 'business-days' | 'until-date'
  durationValue: number
  durationUnit: 'hours' | 'days' | 'weeks'
  untilDate: string
}

export interface SubWorkflowConfig {
  label: string
  workflowId: string
  workflowName: string
  inputMapping: string
}

export interface DataTransformConfig {
  label: string
  operation: 'map' | 'filter' | 'format' | 'enrich' | 'validate'
  sourceField: string
  expression: string
}

export type NodeConfig =
  | StartConfig | TaskConfig | ApprovalConfig | AutoStepConfig | EndConfig
  | DecisionConfig | ForkConfig | JoinConfig
  | NotificationConfig | DelayConfig | SubWorkflowConfig | DataTransformConfig

export interface NodeData extends Record<string, unknown> {
  nodeType: NodeType
  label: string
}

export type WorkflowNode = Node<NodeData>

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
