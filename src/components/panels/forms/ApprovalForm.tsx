import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ApprovalConfig } from '../../../types'

const schema = z.object({
  label: z.string().min(1),
  approver: z.string().min(1),
  threshold: z.enum(['unanimous', 'majority', 'single']),
})

type FormValues = z.infer<typeof schema>

interface Props {
  nodeId: string
  config?: ApprovalConfig
  onSave: (config: ApprovalConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

const thresholdDesc: Record<string, string> = {
  single: 'Any one approver can approve',
  majority: 'More than half must approve',
  unanimous: 'All approvers must approve',
}

export default function ApprovalForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      label: config?.label ?? 'Approval',
      approver: config?.approver ?? '',
      threshold: config?.threshold ?? 'single',
    },
  })

  const threshold = watch('threshold')

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
        <label className={labelCls}>Approver</label>
        <input
          className={inputCls}
          placeholder="e.g. manager@company.com"
          {...register('approver', { required: 'Approver is required' })}
        />
        {errors.approver && <p className={errorCls}>{errors.approver.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Approval Threshold</label>
        <select className={inputCls + ' bg-white'} {...register('threshold')}>
          <option value="single">Single</option>
          <option value="majority">Majority</option>
          <option value="unanimous">Unanimous</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">{thresholdDesc[threshold]}</p>
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
