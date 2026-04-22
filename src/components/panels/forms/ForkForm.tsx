import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ForkConfig } from '../../../types'

interface Props {
  nodeId: string
  config?: ForkConfig
  onSave: (config: ForkConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function ForkForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForkConfig>({
    defaultValues: {
      label: config?.label ?? 'Fork',
      description: config?.description ?? '',
    },
  })

  function submit(data: ForkConfig) {
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
        <label className={labelCls}>Description</label>
        <textarea
          className={inputCls + ' resize-none'}
          rows={2}
          placeholder="Why is this workflow branching into parallel paths?"
          {...register('description')}
        />
      </div>

      <div className="rounded-md bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs text-indigo-700">
        Connect 2 or more outgoing edges from this node. Each edge starts a parallel branch. Pair with a <strong>Join</strong> node to merge them later.
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
