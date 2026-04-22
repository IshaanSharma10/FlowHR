import type { NodeProps } from '@xyflow/react'
import { ShieldCheck } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function ApprovalNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#f59e0b"
      Icon={ShieldCheck}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
