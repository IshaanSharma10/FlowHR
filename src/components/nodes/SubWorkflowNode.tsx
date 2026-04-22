import type { NodeProps } from '@xyflow/react'
import { Layers } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function SubWorkflowNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#0d9488"
      Icon={Layers}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
