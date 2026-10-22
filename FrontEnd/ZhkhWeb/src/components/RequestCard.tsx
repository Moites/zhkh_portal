import { Badge, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconMapPin } from '@tabler/icons-react'
import type { ServiceRequest } from '../api/types'
import { formatDate } from '../lib/format'
import { SPECIALIZATION } from '../lib/labels'
import { PriorityBadge, StatusBadge } from './Badges'
import classes from './RequestCard.module.css'

interface RequestCardProps {
  request: ServiceRequest
  onOpen: (request: ServiceRequest) => void
}

export function RequestCard({ request, onOpen }: RequestCardProps) {
  const waitingForReview = request.needsReview === true && request.status === 'New'

  return (
    <UnstyledButton className={classes.card} onClick={() => onOpen(request)}>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
          <Text fw={600} fz={18} lineClamp={2}>
            {request.title}
          </Text>
          <Text c="dimmed" fz="sm" style={{ whiteSpace: 'nowrap' }}>
            {formatDate(request.createdAt)}
          </Text>
        </Group>

        <Group gap={6} wrap="nowrap" c="dimmed">
          <IconMapPin size={16} style={{ flexShrink: 0 }} />
          <Text fz="sm" lineClamp={1}>
            {request.address}
          </Text>
        </Group>

        <Text c="dimmed" lineClamp={2}>
          {request.description}
        </Text>

        <Group gap="xs">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
          <Badge variant="outline" color="gray" size="lg">
            {SPECIALIZATION[request.specialization] ?? request.specialization}
          </Badge>
          {waitingForReview && (
            <Badge variant="light" color="blue" size="lg">
              Проверяет диспетчер
            </Badge>
          )}
        </Group>
      </Stack>
    </UnstyledButton>
  )
}
