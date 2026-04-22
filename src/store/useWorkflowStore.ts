import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import type { Connection, EdgeChange, NodeChange, Edge } from '@xyflow/react'
import type { NodeConfig, NodeData, WorkflowNode } from '../types'

const MAX_HISTORY = 50

type HistoryEntry = {
  nodes: WorkflowNode[]
  edges: Edge[]
  nodeConfigs: Record<string, NodeConfig>
}

function snapshot(state: WorkflowState): HistoryEntry {
  return {
    nodes: [...state.nodes],
    edges: [...state.edges],
    nodeConfigs: { ...state.nodeConfigs },
  }
}

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: Edge[]
  nodeConfigs: Record<string, NodeConfig>
  selectedNodeId: string | null
  past: HistoryEntry[]
  future: HistoryEntry[]

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNodeWithConfig: (node: WorkflowNode, config: NodeConfig) => void
  setSelectedNode: (id: string | null) => void
  updateNodeConfig: (nodeId: string, config: NodeConfig) => void
  clearCanvas: () => void
  undo: () => void
  redo: () => void
  importWorkflow: (data: Partial<HistoryEntry>) => void
}

const decisionEdgeColors: Record<string, string> = { yes: '#10b981', no: '#ef4444' }

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  nodeConfigs: {},
  selectedNodeId: null,
  past: [],
  future: [],

  onNodesChange: (changes) =>
    set((state) => {
      const removedIds = changes.filter((c) => c.type === 'remove').map((c) => c.id)
      const newConfigs = { ...state.nodeConfigs }
      removedIds.forEach((id) => delete newConfigs[id])
      const hasRemoves = removedIds.length > 0
      return {
        ...(hasRemoves ? { past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot(state)], future: [] } : {}),
        nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[],
        nodeConfigs: newConfigs,
        selectedNodeId: removedIds.includes(state.selectedNodeId ?? '') ? null : state.selectedNodeId,
      }
    }),

  onEdgesChange: (changes) =>
    set((state) => {
      const hasRemoves = changes.some((c) => c.type === 'remove')
      return {
        ...(hasRemoves ? { past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot(state)], future: [] } : {}),
        edges: applyEdgeChanges(changes, state.edges),
      }
    }),

  onConnect: (connection) =>
    set((state) => {
      const sourceNode = state.nodes.find((n) => n.id === connection.source)
      const isDecision = (sourceNode?.data as NodeData | undefined)?.nodeType === 'decision'
      const handle = connection.sourceHandle

      const edgeColor = isDecision && handle
        ? (decisionEdgeColors[handle] ?? '#6366f1')
        : '#6366f1'

      // Derive label from saved config so custom yes/no labels are respected
      let label: string | undefined
      if (isDecision && handle) {
        const cfg = state.nodeConfigs[connection.source ?? ''] as
          | { yesLabel?: string; noLabel?: string }
          | undefined
        label = handle === 'yes' ? (cfg?.yesLabel || 'Yes') : (cfg?.noLabel || 'No')
      }

      const edgeData: Parameters<typeof addEdge>[0] = {
        ...connection,
        animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 },
        ...(label
          ? {
              label,
              labelStyle: { fill: '#374151', fontWeight: 600, fontSize: 11 },
              labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
              labelBgPadding: [4, 2] as [number, number],
              labelBgBorderRadius: 4,
            }
          : {}),
      }

      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot(state)],
        future: [],
        edges: addEdge(edgeData, state.edges),
      }
    }),

  addNodeWithConfig: (node, config) =>
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot(state)],
      future: [],
      nodes: [...state.nodes, node],
      nodeConfigs: { ...state.nodeConfigs, [node.id]: config },
    })),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  updateNodeConfig: (nodeId, config) =>
    set((state) => ({
      nodeConfigs: { ...state.nodeConfigs, [nodeId]: config },
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: (config as NodeData & { label: string }).label ?? n.data.label } }
          : n
      ),
    })),

  clearCanvas: () =>
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot(state)],
      future: [],
      nodes: [],
      edges: [],
      nodeConfigs: {},
      selectedNodeId: null,
    })),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        future: [snapshot(state), ...state.future.slice(0, MAX_HISTORY - 1)],
        nodes: prev.nodes,
        edges: prev.edges,
        nodeConfigs: prev.nodeConfigs,
        selectedNodeId: null,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot(state)],
        future: state.future.slice(1),
        nodes: next.nodes,
        edges: next.edges,
        nodeConfigs: next.nodeConfigs,
        selectedNodeId: null,
      }
    }),

  importWorkflow: (data) =>
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot(state)],
      future: [],
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
      nodeConfigs: data.nodeConfigs ?? {},
      selectedNodeId: null,
    })),
}))
