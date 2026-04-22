import type { NodeProps } from '@xyflow/react'
import { StopCircle } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function EndNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#ef4444"
      Icon={StopCircle}
      selected={!!selected}
      hasSource={false}
      isConnectable={isConnectable}
    />
  )
}
