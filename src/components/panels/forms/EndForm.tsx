import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { EndConfig } from '../../../types'

const schema = z.object({
  label: z.string().min(1),
  status: z.enum(['complete', 'cancelled']),
  notify: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  nodeId: string
  config?: EndConfig
  onSave: (config: EndConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function EndForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      label: config?.label ?? 'End',
      status: config?.status ?? 'complete',
      notify: config?.notify ?? false,
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
        <label className={labelCls}>Completion Status</label>
        <select className={inputCls + ' bg-white'} {...register('status')}>
          <option value="complete">Complete</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Notifications</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            id="notify"
            className="w-4 h-4 accent-indigo-600"
            {...register('notify')}
          />
          <label htmlFor="notify" className="text-sm text-gray-600">
            Notify stakeholders on completion
          </label>
        </div>
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
