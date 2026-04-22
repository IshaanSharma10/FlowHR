import type { AutomationAction } from '../types'

export const automationsCatalog: AutomationAction[] = [
  {
    id: 'send_email',
    name: 'Send Email',
    params: [
      { name: 'to', type: 'string', label: 'Recipient Email', required: true },
      { name: 'subject', type: 'string', label: 'Subject', required: true },
      { name: 'body', type: 'string', label: 'Body', required: false },
    ],
  },
  {
    id: 'update_hris',
    name: 'Update HRIS Record',
    params: [
      { name: 'field', type: 'select', label: 'Field', required: true, options: ['status', 'department', 'role', 'manager'] },
      { name: 'value', type: 'string', label: 'New Value', required: true },
    ],
  },
  {
    id: 'create_ticket',
    name: 'Create IT Ticket',
    params: [
      { name: 'priority', type: 'select', label: 'Priority', required: true, options: ['low', 'medium', 'high', 'critical'] },
      { name: 'title', type: 'string', label: 'Ticket Title', required: true },
      { name: 'auto_assign', type: 'boolean', label: 'Auto Assign', required: false },
    ],
  },
  {
    id: 'slack_notify',
    name: 'Send Slack Notification',
    params: [
      { name: 'channel', type: 'string', label: 'Channel (e.g. #hr-ops)', required: true },
      { name: 'message', type: 'string', label: 'Message', required: true },
    ],
  },
  {
    id: 'generate_doc',
    name: 'Generate Document',
    params: [
      { name: 'template', type: 'select', label: 'Template', required: true, options: ['offer_letter', 'nda', 'termination', 'review_form'] },
      { name: 'send_to_employee', type: 'boolean', label: 'Send to Employee', required: false },
    ],
  },
]
