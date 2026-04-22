import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SubWorkflowConfig } from '../../../types'

interface Props {
  nodeId: string
  config?: SubWorkflowConfig
  onSave: (config: SubWorkflowConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function SubWorkflowForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SubWorkflowConfig>({
    defaultValues: {
      label: config?.label ?? 'Sub-Workflow',
      workflowId: config?.workflowId ?? '',
      workflowName: config?.workflowName ?? '',
      inputMapping: config?.inputMapping ?? '',
    },
  })

  function submit(data: SubWorkflowConfig) {
    onSave(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <form className="flex flex-col gap-4">
      <div>
        <label className={labelCls}>Label</label>
        <input className={inputCls} {...register('label', { required: 'Required' })} />
        {errors.label && <p className={errorCls}>{errors.label.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Workflow ID</label>
        <input
          className={inputCls}
          placeholder="e.g. wf-offboarding-v2"
          {...register('workflowId', { required: 'Workflow ID is required' })}
        />
        {errors.workflowId && <p className={errorCls}>{errors.workflowId.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Workflow name</label>
        <input
          className={inputCls}
          placeholder="e.g. Employee Offboarding"
          {...register('workflowName')}
        />
      </div>

      <div>
        <label className={labelCls}>Input mapping <span className="text-gray-300">(optional)</span></label>
        <textarea
          className={inputCls + ' resize-none font-mono text-xs'}
          rows={3}
          placeholder={'employeeId: {{trigger.employeeId}}\ndepartment: {{trigger.department}}'}
          {...register('inputMapping')}
        />
        <p className="text-xs text-gray-400 mt-1">Map parent workflow fields to sub-workflow inputs.</p>
      </div>

      <button
        type="button"
        onClick={handleSubmit(submit)}
        className={`w-full py-2 text-sm font-medium text-white rounded-md transition mt-2 ${saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {saved ? '✓ Applied' : 'Apply Changes'}
      </button>
    </form>
  )
}
