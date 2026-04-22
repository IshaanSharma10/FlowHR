import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { NotificationConfig } from '../../../types'

interface Props {
  nodeId: string
  config?: NotificationConfig
  onSave: (config: NotificationConfig) => void
}

const inputCls = 'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const errorCls = 'text-xs text-red-500 mt-1'

export default function NotificationForm({ config, onSave }: Props) {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<NotificationConfig>({
    defaultValues: {
      label: config?.label ?? 'Notification',
      channel: config?.channel ?? 'email',
      recipients: config?.recipients ?? '',
      subject: config?.subject ?? '',
      message: config?.message ?? '',
    },
  })

  const channel = watch('channel')

  function submit(data: NotificationConfig) {
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
        <label className={labelCls}>Channel</label>
        <select className={inputCls + ' bg-white'} {...register('channel')}>
          <option value="email">Email</option>
          <option value="slack">Slack</option>
          <option value="teams">Microsoft Teams</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Recipients</label>
        <input
          className={inputCls}
          placeholder={channel === 'slack' ? '#channel or @user' : 'email1@co.com, email2@co.com'}
          {...register('recipients', { required: 'Recipients are required' })}
        />
        {errors.recipients && <p className={errorCls}>{errors.recipients.message}</p>}
      </div>

      {(channel === 'email' || channel === 'teams') && (
        <div>
          <label className={labelCls}>Subject</label>
          <input
            className={inputCls}
            placeholder="Notification subject line"
            {...register('subject', { required: 'Subject is required' })}
          />
          {errors.subject && <p className={errorCls}>{errors.subject.message}</p>}
        </div>
      )}

      <div>
        <label className={labelCls}>Message</label>
        <textarea
          className={inputCls + ' resize-none'}
          rows={3}
          placeholder="Notification body. Use {{field}} for dynamic values."
          {...register('message', { required: 'Message is required' })}
        />
        {errors.message && <p className={errorCls}>{errors.message.message}</p>}
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
