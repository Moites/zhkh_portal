import {
  Alert,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle, IconInbox, IconSearch } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import {
  ADMIN_REQUESTS_KEY,
  ADMIN_WORKERS_KEY,
  fetchAdminRequests,
  fetchAdminWorkers,
} from '../api/requests'
import type { ServiceRequest, Specialization } from '../api/types'
import { AdminRequestControls } from '../components/AdminRequestControls'
import { RequestCard } from '../components/RequestCard'
import { RequestDrawer } from '../components/RequestDrawer'
import { toDate } from '../lib/format'
import { SPECIALIZATION, toOptions } from '../lib/labels'
import { SOFT_BG } from '../theme'

type Filter = 'all' | 'new' | 'in_work' | 'done'

const specFilterOptions = [{ value: 'ALL', label: 'Все специальности' }, ...toOptions(SPECIALIZATION)]

export function AdminRequests() {
  const [filter, setFilter] = useState<Filter>('all')
  const [specFilter, setSpecFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpened, drawer] = useDisclosure(false)

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ADMIN_REQUESTS_KEY,
    queryFn: fetchAdminRequests,
  })

  const { data: workers } = useQuery({
    queryKey: ADMIN_WORKERS_KEY,
    queryFn: fetchAdminWorkers,
  })

  const sorted = useMemo(
    () => [...(data ?? [])].sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()),
    [data],
  )

  const newList = sorted.filter((r) => r.status === 'New')
  const inWorkList = sorted.filter((r) => r.status === 'Assigned' || r.status === 'InProgress')
  const doneList = sorted.filter((r) => r.status === 'Completed' || r.status === 'Rejected')

  const visible = useMemo(() => {
    let base = sorted
    if (filter === 'new') base = newList
    else if (filter === 'in_work') base = inWorkList
    else if (filter === 'done') base = doneList

    if (specFilter !== 'ALL') {
      base = base.filter((r) => r.specialization === (specFilter as Specialization))
    }

    const q = search.trim().toLowerCase()
    if (q) {
      base = base.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      )
    }
    return base
  }, [sorted, newList, inWorkList, doneList, filter, specFilter, search])

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
          <Title order={2}>Все заявки</Title>
          <Text c="dimmed" fz="sm" mt={2}>
            Полный реестр обращений жителей, назначение исполнителей и управление статусами
          </Text>
        </div>
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
              В системе пока нет заявок
            </Text>
            <Text c="dimmed" ta="center">
              Новые обращения жителей сразу появятся в этом списке
            </Text>
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
              { value: 'new', label: `Новые (${newList.length})` },
              { value: 'in_work', label: `В работе (${inWorkList.length})` },
              { value: 'done', label: `Завершённые (${doneList.length})` },
            ]}
            fullWidth
            maw={680}
          />

          <Group grow preventGrowOverflow={false} gap="md">
            <TextInput
              placeholder="Поиск по заголовку, адресу или описанию..."
              leftSection={<IconSearch size={18} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Select
              data={specFilterOptions}
              value={specFilter}
              onChange={(v) => setSpecFilter(v ?? 'ALL')}
              allowDeselect={false}
              maw={260}
            />
          </Group>

          {visible.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              По выбранным фильтрам заявок не найдено
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

      <RequestDrawer
        request={selected}
        opened={drawerOpened}
        onClose={drawer.close}
        actions={selected && <AdminRequestControls request={selected} workers={workers} />}
      />
    </Stack>
  )
}