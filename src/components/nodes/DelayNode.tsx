import type { NodeProps } from '@xyflow/react'
import { Clock } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function DelayNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#64748b"
      Icon={Clock}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
