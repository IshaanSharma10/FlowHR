import type { NodeProps } from '@xyflow/react'
import { GitFork } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function ForkNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#6366f1"
      Icon={GitFork}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
