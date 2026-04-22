import { Handle, Position } from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface BaseNodeProps {
  label: string
  color: string
  Icon: LucideIcon
  selected: boolean
  hasTarget?: boolean
  hasSource?: boolean
  isConnectable: boolean
}

export default function BaseNode({
  label,
  color,
  Icon,
  selected,
  hasTarget = true,
  hasSource = true,
  isConnectable,
}: BaseNodeProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-md w-44 border-2 transition-all duration-150',
        selected
          ? 'border-indigo-500 shadow-indigo-200 shadow-lg ring-2 ring-indigo-300 ring-offset-1'
          : 'border-gray-100 hover:border-gray-300'
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}

      <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: color }} />

      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div
          className="p-1.5 rounded-lg flex-shrink-0"
          style={{ backgroundColor: color + '18' }}
        >
          <Icon size={15} style={{ color }} strokeWidth={2.2} />
        </div>
        <span className="text-sm font-medium text-gray-700 truncate leading-tight">
          {label}
        </span>
      </div>

      {hasSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </div>
  )
}
