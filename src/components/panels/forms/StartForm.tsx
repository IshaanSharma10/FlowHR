import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { StartConfig } from '../../../types'

const schema = z.object({
  label: z.string().min(1),
  triggerType: z.enum(['manual', 'scheduled']),
  schedule: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  nodeId: string
  config?: StartConfig
  onSave: (config: StartConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function StartForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      label: config?.label ?? 'Start',
      triggerType: config?.triggerType ?? 'manual',
      schedule: config?.schedule ?? '',
    },
  })

  const triggerType = watch('triggerType')

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
        <label className={labelCls}>Trigger Type</label>
        <select className={inputCls + ' bg-white'} {...register('triggerType')}>
          <option value="manual">Manual</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {triggerType === 'scheduled' && (
        <div>
          <label className={labelCls}>Cron Schedule</label>
          <input
            className={inputCls}
            placeholder="e.g. 0 9 * * 1"
            {...register('schedule')}
          />
          <p className="text-xs text-gray-400 mt-1">Standard cron expression</p>
        </div>
      )}

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
