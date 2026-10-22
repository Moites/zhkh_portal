import { Alert, Button, Group, Paper, SegmentedControl, Skeleton, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle, IconFilePlus, IconInbox, IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { MY_REQUESTS_KEY, fetchMyRequests } from '../api/requests'
import type { RequestStatus, ServiceRequest } from '../api/types'
import { RequestCard } from '../components/RequestCard'
import { RequestDrawer } from '../components/RequestDrawer'
import { toDate } from '../lib/format'
import { SOFT_BG } from '../theme'

type Filter = 'all' | 'active' | 'done'

const ACTIVE: RequestStatus[] = ['New', 'Assigned', 'InProgress']

export function MyRequests() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<ServiceRequest | null>(null)
  const [drawerOpened, drawer] = useDisclosure(false)

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: MY_REQUESTS_KEY,
    queryFn: fetchMyRequests,
  })

  // Новые заявки сверху
  const sorted = useMemo(
    () => [...(data ?? [])].sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()),
    [data],
  )

  const activeCount = sorted.filter((r) => ACTIVE.includes(r.status)).length
  const visible = sorted.filter((r) => {
    if (filter === 'active') return ACTIVE.includes(r.status)
    if (filter === 'done') return !ACTIVE.includes(r.status)
    return true
  })

  const open = (request: ServiceRequest) => {
    setSelected(request)
    drawer.open()
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Мои заявки</Title>
        <Button component={Link} to="/requests/new" leftSection={<IconPlus size={18} />}>
          Новая заявка
        </Button>
      </Group>

      {isLoading && (
        <Stack gap="md">
          <Skeleton height={150} radius="lg" />
          <Skeleton height={150} radius="lg" />
          <Skeleton height={150} radius="lg" />
        </Stack>
      )}

      {error && (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Не удалось загрузить заявки">
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
            <ThemeIcon size={64} radius="xl" variant="white" color="brand">
              <IconInbox size={34} />
            </ThemeIcon>
            <Text fw={600} fz={20}>
              Заявок пока нет
            </Text>
            <Text c="dimmed" ta="center">
              Здесь будут появляться ваши обращения и их статусы
            </Text>
            <Button component={Link} to="/requests/new" leftSection={<IconFilePlus size={18} />} mt="sm">
              Подать первую заявку
            </Button>
          </Stack>
        </Paper>
      )}

      {sorted.length > 0 && (
        <>
          <SegmentedControl
            value={filter}
            onChange={(value) => setFilter(value as Filter)}
            data={[
              { value: 'all', label: `Все (${sorted.length})` },
              { value: 'active', label: `Активные (${activeCount})` },
              { value: 'done', label: `Завершённые (${sorted.length - activeCount})` },
            ]}
            fullWidth
            maw={520}
          />

          {visible.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              В этой категории заявок нет
            </Text>
          ) : (
            <Stack gap="md">
              {visible.map((request) => (
                <RequestCard key={request.id} request={request} onOpen={open} />
              ))}
            </Stack>
          )}
        </>
      )}

      <RequestDrawer request={selected} opened={drawerOpened} onClose={drawer.close} />
    </Stack>
  )
}
