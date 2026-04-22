import {
  PlayCircle, ClipboardList, ShieldCheck, Zap, StopCircle,
  GitBranch, GitFork, GitMerge, Bell, Clock, Layers, Shuffle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NodeType } from '../../types'

interface PaletteItem {
  type: NodeType
  label: string
  description: string
  color: string
  Icon: LucideIcon
}

const groups: { title: string; items: PaletteItem[] }[] = [
  {
    title: 'Flow Control',
    items: [
      { type: 'start',    label: 'Start',    description: 'Trigger point',    color: '#10b981', Icon: PlayCircle },
      { type: 'decision', label: 'Decision', description: 'Branch condition', color: '#f97316', Icon: GitBranch },
      { type: 'fork',     label: 'Fork',     description: 'Parallel split',   color: '#6366f1', Icon: GitFork },
      { type: 'join',     label: 'Join',     description: 'Merge paths',      color: '#6366f1', Icon: GitMerge },
      { type: 'end',      label: 'End',      description: 'Workflow end',     color: '#ef4444', Icon: StopCircle },
    ],
  },
  {
    title: 'Actions',
    items: [
      { type: 'task',          label: 'Task',      description: 'Human action',   color: '#3b82f6', Icon: ClipboardList },
      { type: 'approval',      label: 'Approval',  description: 'Review gate',    color: '#f59e0b', Icon: ShieldCheck },
      { type: 'autostep',      label: 'Auto Step', description: 'Automation',     color: '#8b5cf6', Icon: Zap },
      { type: 'notification',  label: 'Notify',    description: 'Send message',   color: '#0ea5e9', Icon: Bell },
      { type: 'datatransform', label: 'Transform', description: 'Shape data',     color: '#ec4899', Icon: Shuffle },
    ],
  },
  {
    title: 'Utilities',
    items: [
      { type: 'delay',       label: 'Delay',       description: 'Wait / pause',     color: '#64748b', Icon: Clock },
      { type: 'subworkflow', label: 'Sub-Workflow', description: 'Nested workflow', color: '#0d9488', Icon: Layers },
    ],
  },
]

function DraggableNode({ item }: { item: PaletteItem }) {
  const { type, label, description, color, Icon } = item

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all duration-100 select-none"
    >
      <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: color + '18' }}>
        <Icon size={14} style={{ color }} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-700 leading-none mb-0.5">{label}</p>
        <p className="text-xs text-gray-400 truncate">{description}</p>
      </div>
      <div className="ml-auto flex-shrink-0">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-sm font-bold text-gray-800 tracking-tight">FlowHR</h1>
        <p className="text-xs text-gray-400 mt-0.5">Workflow designer</p>
      </div>

      <div className="px-3 py-3 flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              {group.title}
            </p>
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => (
                <DraggableNode key={item.type} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Drag nodes to canvas</p>
      </div>
    </aside>
  )
}
