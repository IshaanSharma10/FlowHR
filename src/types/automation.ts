/** Automation catalog types only — safe for Node/serverless bundles (no @xyflow/react). */

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
