import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import clsx from 'clsx'
import type { NodeData } from '../../types'
import { useWorkflowStore } from '../../store/useWorkflowStore'

const COLOR = '#f97316'

export default function DecisionNode({ id, data, selected, isConnectable }: NodeProps<NodeData>) {
  const config = useWorkflowStore((s) => s.nodeConfigs[id]) as { yesLabel?: string; noLabel?: string } | undefined
  const yesLabel = config?.yesLabel || 'Yes'
  const noLabel = config?.noLabel || 'No'

  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-md border-2 transition-all duration-150 select-none',
        selected
          ? 'border-indigo-500 shadow-indigo-200 shadow-lg ring-2 ring-indigo-300 ring-offset-1'
          : 'border-gray-100 hover:border-gray-300'
      )}
      style={{ width: 176 }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: COLOR }} />

      <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: COLOR + '18' }}>
          <GitBranch size={15} style={{ color: COLOR }} strokeWidth={2.2} />
        </div>
        <span className="text-sm font-medium text-gray-700 truncate leading-tight">{data.label}</span>
      </div>

      {/* Branch labels aligned to the two handles */}
      <div className="flex justify-between px-4 pb-2.5 text-xs font-semibold">
        <span className="text-red-500">{noLabel}</span>
        <span className="text-green-600">{yesLabel}</span>
      </div>

      {/* No handle — bottom-left */}
      <Handle
        id="no"
        type="source"
        position={Position.Bottom}
        style={{ left: '28%' }}
        isConnectable={isConnectable}
      />
      {/* Yes handle — bottom-right */}
      <Handle
        id="yes"
        type="source"
        position={Position.Bottom}
        style={{ left: '72%' }}
        isConnectable={isConnectable}
      />
    </div>
  )
}
