import { useState } from 'react'
import { ChevronUp, ChevronDown, Play, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { useWorkflowStore } from '../../store/useWorkflowStore'
import type { NodeType, SimulationResult, SimulationStep, NodeConfig } from '../../types'
import type { Edge } from '@xyflow/react'
import type { WorkflowNode } from '../../types'
import { runSimulation } from '../../api/simulate/runSimulation'
import clsx from 'clsx'

// ── Colours / badges ─────────────────────────────────────────────────────────

const nodeColors: Record<NodeType, string> = {
  start: '#10b981', task: '#3b82f6', approval: '#f59e0b',
  autostep: '#8b5cf6', end: '#ef4444', decision: '#f97316',
  fork: '#6366f1', join: '#6366f1', notification: '#0ea5e9',
  delay: '#64748b', subworkflow: '#0d9488', datatransform: '#ec4899',
}

const nodeLabels: Record<NodeType, string> = {
  start: 'START', task: 'TASK', approval: 'APPRV', autostep: 'AUTO', end: 'END',
  decision: 'DCSN', fork: 'FORK', join: 'JOIN', notification: 'NTFY',
  delay: 'WAIT', subworkflow: 'SUBWF', datatransform: 'XFRM',
}

// ── Validation ────────────────────────────────────────────────────────────────

interface ValidationIssue {
  kind: 'error' | 'warning'
  message: string
}

function validateGraph(
  nodes: WorkflowNode[],
  edges: Edge[],
  nodeConfigs: Record<string, NodeConfig>
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (nodes.length === 0) {
    issues.push({ kind: 'error', message: 'Canvas is empty — add nodes to build a workflow' })
    return issues
  }

  // ── Structural ────────────────────────────────────────────────────────────
  if (!nodes.some((n) => n.data.nodeType === 'start'))
    issues.push({ kind: 'error', message: 'Missing Start node' })
  if (!nodes.some((n) => n.data.nodeType === 'end'))
    issues.push({ kind: 'error', message: 'Missing End node' })

  const outgoing: Record<string, Edge[]> = {}
  const incoming: Record<string, Edge[]> = {}
  nodes.forEach((n) => { outgoing[n.id] = []; incoming[n.id] = [] })
  edges.forEach((e) => {
    outgoing[e.source]?.push(e)
    incoming[e.target]?.push(e)
  })

  // Disconnected nodes
  const connectedIds = new Set<string>()
  edges.forEach((e) => { connectedIds.add(e.source); connectedIds.add(e.target) })
  nodes.forEach((n) => {
    if (!connectedIds.has(n.id))
      issues.push({ kind: 'error', message: `"${n.data.label}" is disconnected — connect it to the workflow` })
  })

  // Non-End dead ends
  nodes.forEach((n) => {
    if (n.data.nodeType !== 'end' && outgoing[n.id]?.length === 0 && connectedIds.has(n.id))
      issues.push({ kind: 'error', message: `"${n.data.label}" has no outgoing edge — connect it or replace with an End node` })
  })

  // Decision: both handles must be connected
  nodes.filter((n) => n.data.nodeType === 'decision').forEach((n) => {
    const out = outgoing[n.id] ?? []
    const handles = new Set(out.map((e) => e.sourceHandle))
    if (!handles.has('yes'))
      issues.push({ kind: 'error', message: `Decision "${n.data.label}" is missing the true (Yes) branch` })
    if (!handles.has('no'))
      issues.push({ kind: 'error', message: `Decision "${n.data.label}" is missing the false (No) branch` })
  })

  // Fork: must have ≥ 2 outgoing
  nodes.filter((n) => n.data.nodeType === 'fork').forEach((n) => {
    if ((outgoing[n.id]?.length ?? 0) < 2)
      issues.push({ kind: 'error', message: `Fork "${n.data.label}" must have at least 2 outgoing edges` })
  })

  // Join: must have ≥ 2 incoming
  nodes.filter((n) => n.data.nodeType === 'join').forEach((n) => {
    if ((incoming[n.id]?.length ?? 0) < 2)
      issues.push({ kind: 'error', message: `Join "${n.data.label}" must have at least 2 incoming edges` })
  })

  // Cycle detection (Kahn's algorithm)
  const adj: Record<string, string[]> = {}
  const inDeg: Record<string, number> = {}
  nodes.forEach((n) => { adj[n.id] = []; inDeg[n.id] = 0 })
  edges.forEach((e) => { if (adj[e.source]) { adj[e.source].push(e.target); inDeg[e.target]++ } })
  const q = nodes.filter((n) => inDeg[n.id] === 0).map((n) => n.id)
  let processed = 0
  while (q.length > 0) {
    const curr = q.shift()!
    processed++
    adj[curr]?.forEach((next) => { if (--inDeg[next] === 0) q.push(next) })
  }
  if (processed < nodes.length)
    issues.push({ kind: 'error', message: 'Cycle detected — workflows must be acyclic' })

  // ── Required-field checks ─────────────────────────────────────────────────
  nodes.forEach((n) => {
    const cfg = nodeConfigs[n.id] as Record<string, unknown> | undefined
    const name = `"${n.data.label}"`

    switch (n.data.nodeType) {
      case 'task':
        if (!cfg?.assignee)
          issues.push({ kind: 'error', message: `${name}: Assignee is required` })
        break
      case 'approval':
        if (!cfg?.approver)
          issues.push({ kind: 'error', message: `${name}: Approver is required` })
        break
      case 'autostep':
        if (!cfg?.actionId)
          issues.push({ kind: 'error', message: `${name}: Automation action must be selected` })
        break
      case 'decision':
        if (!cfg?.condition)
          issues.push({ kind: 'error', message: `${name}: Condition expression is required` })
        break
      case 'notification':
        if (!cfg?.recipients)
          issues.push({ kind: 'error', message: `${name}: Recipients are required` })
        if (!cfg?.message)
          issues.push({ kind: 'error', message: `${name}: Message body is required` })
        break
      case 'delay':
        if (cfg?.durationType !== 'until-date' && !(cfg?.durationValue && Number(cfg.durationValue) > 0))
          issues.push({ kind: 'error', message: `${name}: Duration must be greater than 0` })
        if (cfg?.durationType === 'until-date' && !cfg?.untilDate)
          issues.push({ kind: 'error', message: `${name}: Wait-until date is required` })
        break
      case 'subworkflow':
        if (!cfg?.workflowId)
          issues.push({ kind: 'error', message: `${name}: Workflow ID is required` })
        break
      case 'datatransform':
        if (!cfg?.sourceField)
          issues.push({ kind: 'error', message: `${name}: Source field is required` })
        if (!cfg?.expression)
          issues.push({ kind: 'error', message: `${name}: Expression is required` })
        break
    }
  })

  // ── HR-specific warnings ──────────────────────────────────────────────────

  // Duplicate labels
  const labelCounts: Record<string, number> = {}
  nodes.forEach((n) => { labelCounts[n.data.label] = (labelCounts[n.data.label] ?? 0) + 1 })
  Object.entries(labelCounts).forEach(([label, count]) => {
    if (count > 1)
      issues.push({ kind: 'warning', message: `Duplicate label "${label}" — use unique names for clarity` })
  })

  // Fork without a corresponding Join
  const forkCount = nodes.filter((n) => n.data.nodeType === 'fork').length
  const joinCount = nodes.filter((n) => n.data.nodeType === 'join').length
  if (forkCount > joinCount)
    issues.push({ kind: 'warning', message: `${forkCount - joinCount} Fork node(s) have no matching Join — parallel paths may never converge` })

  // Approval directly at start (no preceding task)
  const startNode = nodes.find((n) => n.data.nodeType === 'start')
  if (startNode) {
    const directlyAfterStart = (outgoing[startNode.id] ?? []).map((e) =>
      nodes.find((n) => n.id === e.target)
    )
    directlyAfterStart.forEach((n) => {
      if (n?.data.nodeType === 'approval')
        issues.push({ kind: 'warning', message: `Approval "${n.data.label}" comes immediately after Start — consider adding a Task first` })
    })
  }

  return issues
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepRow({ step, index }: { step: SimulationStep; index: number }) {
  const color = nodeColors[step.nodeType] ?? '#94a3b8'
  const label = nodeLabels[step.nodeType] ?? step.nodeType.toUpperCase()
  const time = new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={14} className="text-green-600" />
        </div>
        {index < 99 && <div className="w-px h-4 bg-gray-200 mt-1" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
          <span className="text-sm font-medium text-gray-700 truncate">{step.label}</span>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">{time}</span>
        </div>
        <p className="text-xs text-gray-500">{step.message}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SandboxPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [issues, setIssues] = useState<ValidationIssue[]>([])

  const { nodes, edges, nodeConfigs } = useWorkflowStore()

  function handleRun() {
    const found = validateGraph(nodes, edges, nodeConfigs)
    const hasErrors = found.some((i) => i.kind === 'error')
    setIssues(found)
    setResult(null)
    setIsOpen(true)
    if (hasErrors) return

    setRunning(true)
    try {
      const result = runSimulation({
        nodes: nodes.map((n) => ({ id: n.id, data: { nodeType: n.data.nodeType, label: n.data.label } })),
        edges: edges.map((e) => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle })),
        nodeConfigs: nodeConfigs as Record<string, Record<string, unknown>>,
      })
      setResult(result)
    } catch {
      setResult({ success: false, steps: [], error: 'Simulation failed — please try again' })
    } finally {
      setRunning(false)
    }
  }

  const errors = issues.filter((i) => i.kind === 'error')
  const warnings = issues.filter((i) => i.kind === 'warning')

  return (
    <div
      className={clsx(
        'border-t border-gray-200 bg-white flex-shrink-0 transition-all duration-300 overflow-hidden',
        isOpen ? 'h-72' : 'h-12'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 flex-shrink-0">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          <span>Sandbox</span>
          {result && (
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium',
              result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
              {result.success ? `${result.steps.length} steps` : 'Failed'}
            </span>
          )}
          {errors.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
              {errors.length} {errors.length === 1 ? 'error' : 'errors'}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
              {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
            </span>
          )}
        </button>

        <button
          onClick={handleRun}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Play size={13} />
          Run Simulation
        </button>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="h-60 overflow-y-auto px-4 pb-4">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={14} className="text-red-500" />
                <p className="text-xs font-semibold text-red-700">Errors ({errors.length})</p>
              </div>
              <div className="flex flex-col gap-1">
                {errors.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    {issue.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <p className="text-xs font-semibold text-amber-700">Warnings ({warnings.length})</p>
              </div>
              <div className="flex flex-col gap-1">
                {warnings.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    <span className="flex-shrink-0 mt-0.5">⚠</span>
                    {issue.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simulation result */}
          {result && (
            <div>
              {result.error ? (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <AlertCircle size={14} />
                  {result.error}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <CheckCircle size={14} className="text-green-600" />
                    <p className="text-xs font-semibold text-green-700">
                      Simulation complete — {result.steps.length} steps executed
                    </p>
                  </div>
                  <div>
                    {result.steps.map((step, i) => (
                      <StepRow key={step.nodeId} step={step} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {issues.length === 0 && !result && !running && (
            <p className="text-sm text-gray-400 text-center py-8">
              Click "Run Simulation" to validate and execute your workflow
            </p>
          )}
        </div>
      )}
    </div>
  )
}
