import { useRef } from 'react'
import { Undo2, Redo2, Trash2, Download, Upload, GitBranch } from 'lucide-react'
import { useWorkflowStore } from '../../store/useWorkflowStore'

export default function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { nodes, edges, nodeConfigs, past, future, clearCanvas, undo, redo, importWorkflow } =
    useWorkflowStore()

  function handleExport() {
    const data = { nodes, edges, nodeConfigs }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        importWorkflow(data)
      } catch {
        alert('Invalid workflow file — could not parse JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClear() {
    if (nodes.length === 0) return
    if (window.confirm('Clear all nodes and edges from the canvas?')) {
      clearCanvas()
    }
  }

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-0.5">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={undo}
          disabled={!canUndo}
          title={`Undo${canUndo ? ` (${past.length})` : ''} · Ctrl+Z`}
        >
          <Undo2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={redo}
          disabled={!canRedo}
          title={`Redo${canRedo ? ` (${future.length})` : ''} · Ctrl+Y`}
        >
          <Redo2 size={14} />
        </ToolbarButton>

        <Divider />

        {/* Clear canvas */}
        <ToolbarButton
          onClick={handleClear}
          disabled={nodes.length === 0}
          title="Clear canvas"
          danger
        >
          <Trash2 size={14} />
        </ToolbarButton>

        <Divider />

        {/* Export / Import */}
        <ToolbarButton
          onClick={handleExport}
          disabled={nodes.length === 0}
          title="Export workflow as JSON"
        >
          <Download size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Import workflow from JSON"
        >
          <Upload size={14} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        {nodes.length > 0 ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="font-medium text-gray-600">{nodes.length}</span>
              {nodes.length === 1 ? 'node' : 'nodes'}
            </span>
            <span className="text-gray-200">·</span>
            <span className="flex items-center gap-1">
              <span className="font-medium text-gray-600">{edges.length}</span>
              {edges.length === 1 ? 'edge' : 'edges'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <GitBranch size={12} />
            <span>Empty canvas</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-gray-200 mx-1" />
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'p-1.5 rounded transition-colors',
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : danger
          ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
