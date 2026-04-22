# FlowHR

**FlowHR** is a browser-based **visual workflow designer** focused on **HR and people operations**. It lets you model processes on an interactive canvas—tasks, approvals, automations, branching, delays, and more—configure each step in a dedicated inspector, and **run a sandbox simulation** to see how the workflow would execute end-to-end.

This project was built as a **hands-on demonstration** of modern frontend engineering: a non-trivial UI, structured state, form-heavy configuration, graph-style validation, and API-style simulation—without relying on a separate backend for the demo experience.

---

## What you can do

| Area | Capabilities |
|------|----------------|
| **Modeling** | Drag nodes from a palette onto the canvas; connect steps; pan, zoom, minimap, and fit view (React Flow / XYFlow). |
| **Flow control** | Start, **decision** (yes/no handles and labels), fork, join, and end nodes. |
| **Actions** | Task, approval, auto-step, notification, and data-transform nodes with type-specific configuration. |
| **Utilities** | Delay and sub-workflow placeholders for richer process design. |
| **Editing** | **Undo / redo** with bounded history, keyboard shortcuts (**Ctrl+Z** / **Ctrl+Y** or **Ctrl+Shift+Z**), clear canvas, **export** and **import** workflow JSON. |
| **Simulation** | Validates the graph (e.g. start/end presence, connectivity, cycles), then posts to **`POST /simulate`** and renders a step-by-step execution log with timestamps and messages derived from each node’s config. |

---

## Tech stack

| Layer | Choice | Why it matters here |
|--------|--------|---------------------|
| UI | **React 19** + **TypeScript** | Typed components and domain models for nodes, configs, and simulation results. |
| Build | **Vite 8** | Fast dev server and optimized production builds. |
| Styling | **Tailwind CSS v4** | Consistent layout and responsive panels without heavy custom CSS. |
| Canvas | **@xyflow/react** | Production-grade graph editing (nodes, edges, controls, background). |
| State | **Zustand** | Central store for nodes, edges, per-node configs, selection, and **undo/redo** history. |
| Forms | **react-hook-form** + **Zod** (+ resolvers) | Validated, maintainable config forms per node type. |
| API mocking | **MSW** (Mock Service Worker) | Realistic `fetch` in development; automations list and simulation endpoint. |
| Dev reliability | **Vite middleware** | `POST /simulate` is also handled by the dev server so simulation works even if a request bypasses the service worker. |

---

## Project structure (high level)

```
src/
├── App.tsx                 # Shell layout, React Flow provider, keyboard shortcuts
├── components/
│   ├── canvas/             # Workflow canvas + node registration
│   ├── nodes/              # Visual node components per type
│   ├── sidebar/            # Draggable palette
│   ├── panels/             # Config inspector + per-type forms
│   ├── sandbox/            # Validation + simulation UI
│   └── toolbar/            # Undo/redo, import/export, clear
├── store/
│   └── useWorkflowStore.ts # Zustand store, history, React Flow change handlers
├── api/
│   ├── mocks/              # MSW handlers (browser)
│   └── simulate/           # Shared simulation logic (mock + dev server)
└── types/                  # Shared TypeScript types
```

Simulation logic lives in **`src/api/simulate/runSimulation.ts`** so both **MSW** and the **Vite dev plugin** stay in sync—one implementation, two ways to invoke it during development.

---

## Getting started

**Prerequisites:** Node.js 20+ (or current LTS) and npm.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually **http://localhost:5173/**).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the development server with HMR. |
| `npm run build` | Typecheck (`tsc -b`) and production build. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint on the project. |

---

## How simulation works (brief)

1. The **Sandbox** panel runs **client-side validation** on the current graph.
2. On success, it sends a **JSON payload** (`nodes`, `edges`, `nodeConfigs`) to **`/simulate`**.
3. The server response is a ordered list of **simulation steps** (labels, messages, timestamps).
4. In development, the handler uses a **topological ordering** of the graph so steps reflect a plausible execution order; messages incorporate values from each node’s configuration (e.g. assignee, approver, thresholds).

This keeps the demo **self-contained** while mirroring how a real orchestration service might consume the same shape of data.

---

## Possible extensions (if you continue the project)

- Persist workflows to a real backend and add authentication.
- Stricter HR policy checks (SLAs, mandatory approvals, role rules).
- Branching simulation (decision outcomes) and parallel path execution.
- BPMN or JSON Schema export for integration with other tools.

---


## License

Private / academic use—see `package.json` (`"private": true`).
