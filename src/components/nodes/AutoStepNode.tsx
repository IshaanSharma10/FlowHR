import type { NodeProps } from '@xyflow/react'
import { Zap } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function AutoStepNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#8b5cf6"
      Icon={Zap}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
