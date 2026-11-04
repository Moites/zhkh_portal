import { Alert, Badge, Button, Group, Paper, Skeleton, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle, IconClipboardCheck } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import {
  ADMIN_REVIEW_KEY,
  ADMIN_WORKERS_KEY,
  fetchAdminReviewRequests,
  fetchAdminWorkers,
} from '../api/requests'
import type { ServiceRequest } from '../api/types'
import { AdminRequestControls } from '../components/AdminRequestControls'
import { RequestCard } from '../components/RequestCard'
import { RequestDrawer } from '../components/RequestDrawer'
import { toDate } from '../lib/format'
import { SOFT_BG } from '../theme'

export function AdminReview() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpened, drawer] = useDisclosure(false)

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ADMIN_REVIEW_KEY,
    queryFn: fetchAdminReviewRequests,
  })

  const { data: workers } = useQuery({
    queryKey: ADMIN_WORKERS_KEY,
    queryFn: fetchAdminWorkers,
  })

  const sorted = useMemo(
    () =>
      [...(data ?? [])]
        .map((r) => ({ ...r, needsReview: true }))
        .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()),
    [data],
  )

  const selected = useMemo(
    () => sorted.find((r) => r.id === selectedId) ?? null,
    [sorted, selectedId],
  )

  const open = (request: ServiceRequest) => {
    setSelectedId(request.id)
    drawer.open()
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Очередь проверки</Title>
          <Text c="dimmed" fz="sm" mt={2}>
            Заявки, требующие уточнения специальности, приоритета или назначения сотрудника вручную
          </Text>
        </div>

        {sorted.length > 0 && (
          <Badge color="blue" variant="light" size="lg">
            Ожидают: {sorted.length}
          </Badge>
        )}
      </Group>

      {isLoading && (
        <Stack gap="md">
          <Skeleton height={150} radius="lg" />
          <Skeleton height={150} radius="lg" />
        </Stack>
      )}

      {error && (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Не удалось загрузить очередь">
          <Stack gap="sm" align="flex-start">
            <Text>{error instanceof ApiError ? error.message : 'Попробуйте ещё раз'}</Text>
            <Button variant="light" color="red" size="xs" loading={isFetching} onClick={() => void refetch()}>
              Повторить
            </Button>
          </Stack>
        </Alert>
      )}

      {!isLoading && !error && sorted.length === 0 && (
        <Paper bg={SOFT_BG} radius="lg" p="xl">
          <Stack align="center" gap="sm" py="lg">
            <ThemeIcon size={64} radius="xl" variant="white" color="green">
              <IconClipboardCheck size={34} />
            </ThemeIcon>
            <Text fw={600} fz={20}>
              Очередь проверки пуста
            </Text>
            <Text c="dimmed" ta="center">
              Все заявки успешно классифицированы и распределены
            </Text>
          </Stack>
        </Paper>
      )}

      {sorted.length > 0 && (
        <Stack gap="md">
          {sorted.map((request) => (
            <RequestCard key={request.id} request={request} onOpen={open} />
          ))}
        </Stack>
      )}

      <RequestDrawer
        request={selected}
        opened={drawerOpened}
        onClose={drawer.close}
        actions={
          selected && (
            <AdminRequestControls
              request={selected}
              workers={workers}
              onUpdated={drawer.close}
            />
          )
        }
      />
    </Stack>
  )
}