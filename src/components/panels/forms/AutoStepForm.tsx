import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AutoStepConfig, AutomationAction } from '../../../types'

const schema = z.object({
  label: z.string().min(1),
  actionId: z.string().min(1),
  params: z.record(z.string()),
})

type FormValues = z.infer<typeof schema>

interface Props {
  nodeId: string
  config?: AutoStepConfig
  onSave: (config: AutoStepConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function AutoStepForm({ config, onSave }: Props) {
  const [automations, setAutomations] = useState<AutomationAction[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const prevActionRef = useRef<string>('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      label: config?.label ?? 'Auto Step',
      actionId: config?.actionId ?? '',
      params: (config?.params as Record<string, string>) ?? {},
    },
  })

  useEffect(() => {
    fetch('/automations')
      .then((r) => r.json())
      .then((data) => { setAutomations(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const actionId = watch('actionId')
  const selectedAction = automations.find((a) => a.id === actionId)

  useEffect(() => {
    if (prevActionRef.current && prevActionRef.current !== actionId) {
      setValue('params', {})
    }
    prevActionRef.current = actionId
  }, [actionId, setValue])

  function submit(values: FormValues) {
    onSave({ label: values.label, actionId: values.actionId, params: values.params })
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
        <label className={labelCls}>Automation Action</label>
        {loading ? (
          <div className="text-xs text-gray-400 py-2">Loading actions...</div>
        ) : (
          <select
            className={inputCls + ' bg-white'}
            {...register('actionId', { required: 'Select an action' })}
          >
            <option value="">— Select an action —</option>
            {automations.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}
        {errors.actionId && <p className={errorCls}>{errors.actionId.message}</p>}
      </div>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Parameters
          </p>
          <div className="flex flex-col gap-3">
            {selectedAction.params.map((param) => (
              <div key={param.name}>
                <label className={labelCls}>
                  {param.label}
                  {param.required && <span className="text-red-400 ml-0.5">*</span>}
                </label>

                {param.type === 'boolean' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id={param.name}
                      className="w-4 h-4 accent-indigo-600"
                      {...register(`params.${param.name}`)}
                    />
                    <label htmlFor={param.name} className="text-sm text-gray-600">Enable</label>
                  </div>
                ) : param.type === 'select' ? (
                  <select className={inputCls + ' bg-white'} {...register(`params.${param.name}`)}>
                    <option value="">— Select —</option>
                    {param.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={param.type === 'number' ? 'number' : 'text'}
                    className={inputCls}
                    placeholder={param.label}
                    {...register(`params.${param.name}`)}
                  />
                )}
              </div>
            ))}
          </div>
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
