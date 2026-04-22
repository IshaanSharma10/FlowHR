import type { NodeProps } from '@xyflow/react'
import { GitMerge } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function JoinNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#6366f1"
      Icon={GitMerge}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
