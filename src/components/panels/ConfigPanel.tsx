import { X, Settings2 } from 'lucide-react'
import { useWorkflowStore } from '../../store/useWorkflowStore'
import type { NodeType, NodeConfig } from '../../types'
import StartForm from './forms/StartForm'
import TaskForm from './forms/TaskForm'
import ApprovalForm from './forms/ApprovalForm'
import AutoStepForm from './forms/AutoStepForm'
import EndForm from './forms/EndForm'
import DecisionForm from './forms/DecisionForm'
import ForkForm from './forms/ForkForm'
import JoinForm from './forms/JoinForm'
import NotificationForm from './forms/NotificationForm'
import DelayForm from './forms/DelayForm'
import SubWorkflowForm from './forms/SubWorkflowForm'
import DataTransformForm from './forms/DataTransformForm'

const nodeTypeLabels: Record<NodeType, string> = {
  start: 'Start',
  task: 'Task',
  approval: 'Approval',
  autostep: 'Auto Step',
  end: 'End',
  decision: 'Decision',
  fork: 'Fork (Parallel Split)',
  join: 'Join (Merge)',
  notification: 'Notification',
  delay: 'Delay',
  subworkflow: 'Sub-Workflow',
  datatransform: 'Data Transform',
}

const nodeTypeColors: Record<NodeType, string> = {
  start: '#10b981',
  task: '#3b82f6',
  approval: '#f59e0b',
  autostep: '#8b5cf6',
  end: '#ef4444',
  decision: '#f97316',
  fork: '#6366f1',
  join: '#6366f1',
  notification: '#0ea5e9',
  delay: '#64748b',
  subworkflow: '#0d9488',
  datatransform: '#ec4899',
}

function FormRouter({
  nodeId,
  nodeType,
  config,
  onSave,
}: {
  nodeId: string
  nodeType: NodeType
  config: NodeConfig | undefined
  onSave: (c: NodeConfig) => void
}) {
  const props = { nodeId, config: config as never, onSave: onSave as never }
  switch (nodeType) {
    case 'start':        return <StartForm {...props} />
    case 'task':         return <TaskForm {...props} />
    case 'approval':     return <ApprovalForm {...props} />
    case 'autostep':     return <AutoStepForm {...props} />
    case 'end':          return <EndForm {...props} />
    case 'decision':     return <DecisionForm {...props} />
    case 'fork':         return <ForkForm {...props} />
    case 'join':         return <JoinForm {...props} />
    case 'notification': return <NotificationForm {...props} />
    case 'delay':        return <DelayForm {...props} />
    case 'subworkflow':  return <SubWorkflowForm {...props} />
    case 'datatransform':return <DataTransformForm {...props} />
  }
}

export default function ConfigPanel() {
  const { nodes, nodeConfigs, selectedNodeId, setSelectedNode, updateNodeConfig } = useWorkflowStore()

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)
  const isOpen = !!selectedNode

  return (
    <aside
      className={`
        absolute top-0 right-0 h-full w-72 bg-white border-l border-gray-200 shadow-xl z-20
        flex flex-col transition-transform duration-250 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {selectedNode && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: nodeTypeColors[selectedNode.data.nodeType] }}
              />
              <div>
                <p className="text-xs text-gray-400 leading-none mb-0.5">Configure</p>
                <h3 className="text-sm font-semibold text-gray-800 leading-none">
                  {nodeTypeLabels[selectedNode.data.nodeType]}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FormRouter
              key={selectedNodeId!}
              nodeId={selectedNodeId!}
              nodeType={selectedNode.data.nodeType}
              config={nodeConfigs[selectedNodeId!]}
              onSave={(cfg) => updateNodeConfig(selectedNodeId!, cfg)}
            />
          </div>
        </>
      )}

      {!selectedNode && (
        <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
          <Settings2 size={32} strokeWidth={1} />
          <p className="text-sm">Select a node to configure</p>
        </div>
      )}
    </aside>
  )
}
