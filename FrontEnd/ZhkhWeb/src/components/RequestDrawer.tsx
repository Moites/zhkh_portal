import { Divider, Drawer, Group, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import type { ServiceRequest } from '../api/types'
import { formatDateTime } from '../lib/format'
import { COMPLEXITY, SPECIALIZATION } from '../lib/labels'
import { PriorityBadge, StatusBadge } from './Badges'

interface RequestDrawerProps {
  request: ServiceRequest | null
  opened: boolean
  onClose: () => void
  actions?: ReactNode
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Text c="dimmed" fz="sm">
        {label}
      </Text>
      {children}
    </div>
  )
}

// Боковая панель с полной информацией о заявке
export function RequestDrawer({ request, opened, onClose, actions }: RequestDrawerProps) {
  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="md" title="Заявка" padding="lg">
      {request && (
        <Stack gap="lg">
          <Title order={3}>{request.title}</Title>

          <Group gap="xs">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </Group>

          <Field label="Описание">
            <Text style={{ whiteSpace: 'pre-wrap' }}>{request.description}</Text>
          </Field>

          <Field label="Адрес">
            <Text>{request.address}</Text>
          </Field>

          <Field label="Создана">
            <Text>{formatDateTime(request.createdAt)}</Text>
          </Field>

          {request.doneAt && (
            <Field label="Завершена">
              <Text>{formatDateTime(request.doneAt)}</Text>
            </Field>
          )}

          <Field label="Нужный специалист">
            <Text>{SPECIALIZATION[request.specialization] ?? request.specialization}</Text>
          </Field>

          <Field label="Сложность">
            <Text>{COMPLEXITY[request.complexity] ?? request.complexity}</Text>
          </Field>

          {request.needsReview === true && request.status === 'New' && (
            <Text c="dimmed" fz="sm">
              Заявку проверяет диспетчер: он уточнит специальность и приоритет, после чего назначит сотрудника.
            </Text>
          )}

          {actions && (
            <>
              <Divider />
              {actions}
            </>
          )}
        </Stack>
      )}
    </Drawer>
  )
}