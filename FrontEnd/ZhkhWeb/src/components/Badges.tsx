import { Badge } from '@mantine/core'
import type { RequestPriority, RequestStatus } from '../api/types'
import { PRIORITY, STATUS } from '../lib/labels'

// "?? ..." защищает от неизвестного значения: страница не упадёт, если на сервере появится новый статус
export function StatusBadge({ status }: { status: RequestStatus }) {
  const s = STATUS[status] ?? { label: status, color: 'gray' }
  return (
    <Badge color={s.color} variant="light" size="lg">
      {s.label}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const p = PRIORITY[priority] ?? { label: priority, color: 'gray' }
  return (
    <Badge color={p.color} variant="dot" size="lg">
      {p.label}
    </Badge>
  )
}
