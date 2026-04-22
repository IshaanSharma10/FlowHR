import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { JoinConfig } from '../../../types'

interface Props {
  nodeId: string
  config?: JoinConfig
  onSave: (config: JoinConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

const strategyDesc: Record<string, string> = {
  'wait-all': 'All incoming branches must complete before proceeding',
  'wait-first': 'Proceeds as soon as any one branch completes',
}

export default function JoinForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<JoinConfig>({
    defaultValues: {
      label: config?.label ?? 'Join',
      strategy: config?.strategy ?? 'wait-all',
    },
  })

  const strategy = watch('strategy')

  function submit(data: JoinConfig) {
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
        <label className={labelCls}>Merge strategy</label>
        <select className={inputCls + ' bg-white'} {...register('strategy')}>
          <option value="wait-all">Wait for all branches</option>
          <option value="wait-first">Wait for first branch</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">{strategyDesc[strategy]}</p>
      </div>

      <div className="rounded-md bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs text-indigo-700">
        Connect 2 or more incoming edges into this node to merge parallel branches.
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
