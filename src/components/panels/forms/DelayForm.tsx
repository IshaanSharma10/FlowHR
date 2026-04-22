import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { DelayConfig } from '../../../types'

interface Props {
  nodeId: string
  config?: DelayConfig
  onSave: (config: DelayConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function DelayForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<DelayConfig>({
    defaultValues: {
      label: config?.label ?? 'Delay',
      durationType: config?.durationType ?? 'fixed',
      durationValue: config?.durationValue ?? 1,
      durationUnit: config?.durationUnit ?? 'days',
      untilDate: config?.untilDate ?? '',
    },
  })

  const durationType = watch('durationType')

  function submit(data: DelayConfig) {
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
        <label className={labelCls}>Delay type</label>
        <select className={inputCls + ' bg-white'} {...register('durationType')}>
          <option value="fixed">Fixed duration</option>
          <option value="business-days">Business days</option>
          <option value="until-date">Wait until date</option>
        </select>
      </div>

      {durationType !== 'until-date' ? (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelCls}>Duration</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              {...register('durationValue', {
                required: 'Required',
                valueAsNumber: true,
                min: { value: 1, message: 'Min 1' },
              })}
            />
            {errors.durationValue && <p className={errorCls}>{errors.durationValue.message}</p>}
          </div>
          <div className="flex-1">
            <label className={labelCls}>Unit</label>
            <select className={inputCls + ' bg-white'} {...register('durationUnit')}>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label className={labelCls}>Wait until</label>
          <input
            type="date"
            className={inputCls}
            {...register('untilDate', { required: 'Date is required' })}
          />
          {errors.untilDate && <p className={errorCls}>{errors.untilDate.message}</p>}
        </div>
      )}

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
