import type { NodeProps } from '@xyflow/react'
import { Bell } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function NotificationNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
  return (
    <BaseNode
      label={data.label}
      color="#0ea5e9"
      Icon={Bell}
      selected={!!selected}
      isConnectable={isConnectable}
    />
  )
}
