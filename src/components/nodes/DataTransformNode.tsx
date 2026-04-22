import type { NodeProps } from '@xyflow/react'
import { Shuffle } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function DataTransformNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#ec4899"
      Icon={Shuffle}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
