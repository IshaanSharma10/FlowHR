import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { DecisionConfig } from '../../../types'

interface Props {
  nodeId: string
  config?: DecisionConfig
  onSave: (config: DecisionConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function DecisionForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<DecisionConfig>({
    defaultValues: {
      label: config?.label ?? 'Decision',
      condition: config?.condition ?? '',
      yesLabel: config?.yesLabel ?? 'Yes',
      noLabel: config?.noLabel ?? 'No',
    },
  })

  function submit(data: DecisionConfig) {
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
        <label className={labelCls}>Condition</label>
        <input
          className={inputCls}
          placeholder="e.g. employee.level >= 5"
          {...register('condition', { required: 'Condition is required' })}
        />
        {errors.condition && <p className={errorCls}>{errors.condition.message}</p>}
        <p className="text-xs text-gray-400 mt-1">Evaluated at runtime to determine the branch.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>True branch label</label>
          <input className={inputCls} placeholder="Yes" {...register('yesLabel', { required: 'Required' })} />
          {errors.yesLabel && <p className={errorCls}>{errors.yesLabel.message}</p>}
        </div>
        <div>
          <label className={labelCls}>False branch label</label>
          <input className={inputCls} placeholder="No" {...register('noLabel', { required: 'Required' })} />
          {errors.noLabel && <p className={errorCls}>{errors.noLabel.message}</p>}
        </div>
      </div>

      <div className="rounded-md bg-orange-50 border border-orange-100 px-3 py-2 text-xs text-orange-700">
        Connect the <strong>right handle</strong> for the true branch and <strong>left handle</strong> for the false branch.
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
