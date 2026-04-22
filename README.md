# FlowHR — HR Workflow Designer

A visual, browser-based designer for modeling and simulating HR workflows. Build process automations with a drag-and-drop canvas, configure each step through guided forms, validate the graph in real time, and run sandbox simulations — all before touching production.

---

## Features

- **Visual canvas editor** — drag, drop, connect, and rearrange 12 node types on an infinite canvas with zoom, pan, minimap, and keyboard shortcuts
- **12 workflow node types** across three categories (Flow Control, Actions, Utilities)
- **Context-sensitive configuration** — each node type has its own validated settings form
- **Real-time graph validation** — detects missing start/end nodes, disconnected nodes, cycles, and misconfigured steps
- **Sandbox simulation** — executes the workflow via topological ordering and produces a timestamped step-by-step log
- **Undo / Redo** — 50-step history with full state snapshots
- **Import / Export** — save and load workflows as JSON
- **Mock API layer** — MSW-based mocks for development; Vercel serverless functions in production

---

## Node Types

| Category | Node | Description |
|---|---|---|
| Flow Control | Start | Entry point of the workflow |
| Flow Control | End | Terminal node |
| Flow Control | Decision | Branches on Yes / No conditions |
| Flow Control | Fork | Splits into parallel execution paths |
| Flow Control | Join | Merges parallel paths back into one |
| Actions | Task | Manual or system task assignment |
| Actions | Approval | Approval gate with assignee and deadline |
| Actions | Auto Step | Runs a preconfigured automation from the catalog |
| Actions | Sub-Workflow | Embeds a child workflow |
| Utilities | Notification | Sends an alert via email, Slack, or webhook |
| Utilities | Delay | Pauses execution for a specified duration |
| Utilities | Data Transform | Maps, filters, or reshapes data payloads |

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Canvas / graph | @xyflow/react (React Flow) 12 |
| State management | Zustand 5 |
| Forms & validation | React Hook Form 7 + Zod 4 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Build tool | Vite 8 |
| Language | TypeScript 6 |
| API mocking (dev) | Mock Service Worker (MSW) 2 |
| Deployment | Vercel (serverless functions) |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
git clone <repository-url>
cd hr-workflow-designer
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. MSW activates automatically and intercepts all API calls locally — no backend required.

### Production Build

```bash
npm run build
```

Outputs a minified, optimized bundle to `dist/`. Deploy the `dist/` folder and the `/api` serverless functions to Vercel (or any compatible host).

### Preview the Production Build Locally

```bash
npm run preview
```

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server with Hot Module Replacement |
| `build` | `vite build` | Bundle and minify for production |
| `typecheck` | `tsc -b --noEmit` | Type-check without emitting files |
| `lint` | `eslint .` | Run ESLint across all TypeScript files |
| `preview` | `vite preview` | Serve the production build locally |

---

## Project Structure

```
hr-workflow-designer/
├── api/                        # Vercel serverless functions
│   ├── automations.ts          #   GET  /automations — automation catalog
│   └── simulate.ts             #   POST /simulate    — run a workflow simulation
│
├── public/
│   └── mockServiceWorker.js    # MSW service worker (auto-generated)
│
├── src/
│   ├── api/
│   │   ├── automationsCatalog.ts       # Predefined automation actions
│   │   ├── mocks/
│   │   │   ├── browser.ts              # MSW worker setup
│   │   │   └── handlers.ts             # Mock request handlers
│   │   └── simulate/
│   │       └── runSimulation.ts        # Simulation engine (topological sort)
│   │
│   ├── components/
│   │   ├── canvas/
│   │   │   └── WorkflowCanvas.tsx      # ReactFlow canvas, drag-and-drop placement
│   │   ├── nodes/                      # One component per node type + shared BaseNode
│   │   ├── panels/
│   │   │   ├── ConfigPanel.tsx         # Right-side configuration sidebar
│   │   │   └── forms/                  # One validated form per node type
│   │   ├── sandbox/
│   │   │   └── SandboxPanel.tsx        # Validation results and simulation output
│   │   ├── sidebar/
│   │   │   └── Sidebar.tsx             # Draggable node palette
│   │   └── toolbar/
│   │       └── Toolbar.tsx             # Export, import, new, clear, undo, redo
│   │
│   ├── store/
│   │   └── useWorkflowStore.ts         # Zustand store: nodes, edges, configs, history
│   │
│   ├── types/
│   │   ├── index.ts                    # Config interfaces for all node types
│   │   ├── automation.ts               # AutomationAction, AutomationParam
│   │   └── simulation.ts               # NodeType, SimulationStep, SimulationResult
│   │
│   ├── App.tsx                         # Root layout and ReactFlowProvider
│   └── main.tsx                        # Entry point, MSW initialization
│
├── vercel.json                 # URL rewrites for serverless functions
├── vite.config.ts              # Vite config with custom simulate dev plugin
└── tsconfig.json               # TypeScript project references
```

---

## Architecture Notes

### State Management

All workflow state lives in a single Zustand store (`useWorkflowStore`). Every mutating action snapshots the current state into a `past` stack (capped at 50 entries), enabling undo. Redo is supported via a `future` stack that is cleared on any new action.

### Simulation Engine

The simulation runs fully in-process. It uses **Kahn's algorithm** to produce a topological execution order, then generates a timestamped step-by-step log with human-readable messages for each node type. The same engine powers both the Vite dev plugin and the Vercel serverless function.

### Validation

The sandbox panel runs graph-level checks before any simulation:

- **Errors (blocking):** empty canvas, missing Start or End node, disconnected nodes, detected cycles, missing required fields
- **Warnings (advisory):** duplicate labels, unmatched Fork/Join pairs, suspicious ordering (e.g. Approval immediately after Start)

### API Layer

| Environment | `/automations` | `/simulate` |
|---|---|---|
| Development | MSW mock handler | Vite plugin (in-process) with MSW fallback |
| Production | Vercel serverless (`api/automations.ts`) | Vercel serverless (`api/simulate.ts`) |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl + Y` / `Ctrl/Cmd + Shift + Z` | Redo |
| `Delete` | Remove selected node or edge |

---

## Deployment

The project is configured for **Vercel** out of the box.

1. Push to your Git remote.
2. Import the repository in the Vercel dashboard.
3. Vercel detects the `vite build` script and the `/api` directory automatically.
4. `vercel.json` rewrites `/simulate` → `/api/simulate` and `/automations` → `/api/automations`.

No environment variables are required for the default configuration.

---

## License

This project is proprietary. All rights reserved.
