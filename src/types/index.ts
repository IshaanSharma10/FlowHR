import type { Node } from '@xyflow/react'
import type { NodeType } from './simulation'

export type { NodeType, SimulationStep, SimulationResult } from './simulation'
export type { AutomationParam, AutomationAction } from './automation'

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
