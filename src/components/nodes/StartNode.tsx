import type { NodeProps } from '@xyflow/react'
import { PlayCircle } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function StartNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#10b981"
      Icon={PlayCircle}
      selected={!!selected}
      hasTarget={false}
      isConnectable={isConnectable}
    />
  )
}
