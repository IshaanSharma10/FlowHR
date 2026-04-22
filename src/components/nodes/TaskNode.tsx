import type { NodeProps } from '@xyflow/react'
import { ClipboardList } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function TaskNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#3b82f6"
      Icon={ClipboardList}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
