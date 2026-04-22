import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Sidebar from './components/sidebar/Sidebar'
import WorkflowCanvas from './components/canvas/WorkflowCanvas'
import ConfigPanel from './components/panels/ConfigPanel'
import SandboxPanel from './components/sandbox/SandboxPanel'
import Toolbar from './components/toolbar/Toolbar'
import { useWorkflowStore } from './store/useWorkflowStore'

function KeyboardShortcuts() {
  const { undo, redo } = useWorkflowStore()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return null
}

export default function App() {
  return (
    <ReactFlowProvider>
      <KeyboardShortcuts />
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Toolbar />
          <div className="flex flex-1 min-h-0 relative">
            <WorkflowCanvas />
            <ConfigPanel />
          </div>
          <SandboxPanel />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
