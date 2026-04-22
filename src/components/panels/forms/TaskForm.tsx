import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { TaskConfig } from '../../../types'

const schema = z.object({
  label: z.string().min(1),
  assignee: z.string().min(1),
  dueInDays: z.number().min(1).max(365),
  instructions: z.string(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  nodeId: string
  config?: TaskConfig
  onSave: (config: TaskConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function TaskForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      label: config?.label ?? 'Task',
      assignee: config?.assignee ?? '',
      dueInDays: config?.dueInDays ?? 7,
      instructions: config?.instructions ?? '',
    },
  })

  function submit(data: FormValues) {
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
        <label className={labelCls}>Assignee</label>
        <input
          className={inputCls}
          placeholder="e.g. alice@company.com"
          {...register('assignee', { required: 'Assignee is required' })}
        />
        {errors.assignee && <p className={errorCls}>{errors.assignee.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Due in (days)</label>
        <input
          type="number"
          className={inputCls}
          min={1}
          max={365}
          {...register('dueInDays', {
            required: 'Required',
            valueAsNumber: true,
            min: { value: 1, message: 'Min 1' },
            max: { value: 365, message: 'Max 365' },
          })}
        />
        {errors.dueInDays && <p className={errorCls}>{errors.dueInDays.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Instructions</label>
        <textarea
          className={inputCls + ' resize-none'}
          rows={3}
          placeholder="Task instructions for the assignee..."
          {...register('instructions')}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit(submit)}
        className={`w-full py-2 text-sm font-medium text-white rounded-md transition mt-2 ${
          saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {saved ? '✓ Applied' : 'Apply Changes'}
      </button>
    </form>
  )
}
