import { useCallback } from 'react'
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, useReactFlow } from '@xyflow/react'
import { MousePointerClick } from 'lucide-react'
import {
  StartNode, TaskNode, ApprovalNode, AutoStepNode, EndNode,
  DecisionNode, ForkNode, JoinNode,
  NotificationNode, DelayNode, SubWorkflowNode, DataTransformNode,
} from '../nodes'
import { useWorkflowStore } from '../../store/useWorkflowStore'
import type { NodeType } from '../../types'

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  autostep: AutoStepNode,
  end: EndNode,
  decision: DecisionNode,
  fork: ForkNode,
  join: JoinNode,
  notification: NotificationNode,
  delay: DelayNode,
  subworkflow: SubWorkflowNode,
  datatransform: DataTransformNode,
}

const defaultLabels: Record<NodeType, string> = {
  start: 'Start',
  task: 'Task',
  approval: 'Approval',
  autostep: 'Auto Step',
  end: 'End',
  decision: 'Decision',
  fork: 'Fork',
  join: 'Join',
  notification: 'Notify',
  delay: 'Delay',
  subworkflow: 'Sub-Workflow',
  datatransform: 'Transform',
}

const defaultConfigs = {
  start:         { label: 'Start',        triggerType: 'manual' as const },
  task:          { label: 'Task',          assignee: '', dueInDays: 7, instructions: '' },
  approval:      { label: 'Approval',      approver: '', threshold: 'single' as const },
  autostep:      { label: 'Auto Step',     actionId: '', params: {} },
  end:           { label: 'End',           status: 'complete' as const, notify: false },
  decision:      { label: 'Decision',      condition: '', yesLabel: 'Yes', noLabel: 'No' },
  fork:          { label: 'Fork',          description: '' },
  join:          { label: 'Join',          strategy: 'wait-all' as const },
  notification:  { label: 'Notify',        channel: 'email' as const, recipients: '', subject: '', message: '' },
  delay:         { label: 'Delay',         durationType: 'fixed' as const, durationValue: 1, durationUnit: 'days' as const, untilDate: '' },
  subworkflow:   { label: 'Sub-Workflow',  workflowId: '', workflowName: '', inputMapping: '' },
  datatransform: { label: 'Transform',     operation: 'map' as const, sourceField: '', expression: '' },
}

export default function WorkflowCanvas() {
  const { screenToFlowPosition } = useReactFlow()
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNodeWithConfig, setSelectedNode,
  } = useWorkflowStore()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const nodeType = e.dataTransfer.getData('application/reactflow') as NodeType
      if (!nodeType) return

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const id = `${nodeType}-${Date.now()}`
      const label = defaultLabels[nodeType]

      addNodeWithConfig(
        { id, type: nodeType, position, data: { nodeType, label } },
        { ...defaultConfigs[nodeType], label }
      )
    },
    [screenToFlowPosition, addNodeWithConfig]
  )

  const nodeColors: Record<string, string> = {
    start: '#10b981', task: '#3b82f6', approval: '#f59e0b',
    autostep: '#8b5cf6', end: '#ef4444', decision: '#f97316',
    fork: '#6366f1', join: '#6366f1', notification: '#0ea5e9',
    delay: '#64748b', subworkflow: '#0d9488', datatransform: '#ec4899',
  }

  return (
    <div
      className="flex-1 h-full relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center select-none">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <MousePointerClick size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">Drag nodes from the sidebar</p>
            <p className="text-xs text-gray-300 mt-0.5">to start building your workflow</p>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        deleteKeyCode="Delete"
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-50"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
        <Controls className="shadow-sm" />
        <MiniMap
          nodeColor={(n) => nodeColors[n.type ?? ''] ?? '#94a3b8'}
          className="shadow-sm rounded-lg overflow-hidden"
        />
      </ReactFlow>
    </div>
  )
}
