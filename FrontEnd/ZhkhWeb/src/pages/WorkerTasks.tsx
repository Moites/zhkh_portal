import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconAlertCircle,
  IconCheck,
  IconChecklist,
  IconPlayerPlay,
  IconSend,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import {
  WORKER_REQUESTS_KEY,
  WORKER_SPEC_REQUESTS_KEY,
  completeRequest,
  fetchWorkerRequests,
  startExecutionRequest,
} from '../api/requests'
import type { RequestPriority, ServiceRequest } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { RequestCard } from '../components/RequestCard'
import { RequestDrawer } from '../components/RequestDrawer'
import { toDate } from '../lib/format'
import { SPECIALIZATION } from '../lib/labels'
import { SOFT_BG } from '../theme'

type Filter = 'active' | 'assigned' | 'in_progress' | 'done'

const PRIORITY_WEIGHT: Record<RequestPriority, number> = {
  Emergency: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

export function WorkerTasks() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<Filter>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpened, drawer] = useDisclosure(false)

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: WORKER_REQUESTS_KEY,
    queryFn: fetchWorkerRequests,
  })

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: WORKER_REQUESTS_KEY })
    void queryClient.invalidateQueries({ queryKey: WORKER_SPEC_REQUESTS_KEY })
  }

  // Мутация: Взять заявку в работу (Assigned -> InProgress)
  const startMutation = useMutation({
    mutationFn: startExecutionRequest,
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Заявка взята в работу' })
      invalidateAll()
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось взять заявку в работу',
      })
    },
  })

  // Мутация: Завершить заявку (InProgress -> Completed)
  const completeMutation = useMutation({
    mutationFn: completeRequest,
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Заявка успешно выполнена' })
      invalidateAll()
      drawer.close()
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось завершить заявку',
      })
    },
  })

  // Обработчик для кнопки «Отправить на проверку менеджеру» (под будущий бэкенд)
  const handleSendToReview = (_requestId: string) => {
    notifications.show({
      color: 'blue',
      message: 'Запрос на проверку менеджеру отправлен (функция скоро будет подключена к серверу)',
    })
  }

  // Сортировка: приоритетные и свежие сверху
  const sorted = useMemo(() => {
    return [...(data ?? [])].sort((a, b) => {
      const weightDiff = (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0)
      if (weightDiff !== 0) return weightDiff
      return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
    })
  }, [data])

  const assignedList = sorted.filter((r) => r.status === 'Assigned' || r.status === 'New')
  const inProgressList = sorted.filter((r) => r.status === 'InProgress')
  const activeList = sorted.filter(
    (r) => r.status === 'Assigned' || r.status === 'InProgress' || r.status === 'New',
  )
  const doneList = sorted
    .filter((r) => r.status === 'Completed' || r.status === 'Rejected')
    .sort((a, b) => toDate(b.doneAt ?? b.createdAt).getTime() - toDate(a.doneAt ?? a.createdAt).getTime())

  const visible = useMemo(() => {
    switch (filter) {
      case 'assigned':
        return assignedList
      case 'in_progress':
        return inProgressList
      case 'done':
        return doneList
      case 'active':
      default:
        return activeList
    }
  }, [filter, assignedList, inProgressList, doneList, activeList])

  // Всегда берём актуальный объект заявки из кеша по ID, чтобы в открытом Drawer сразу менялся статус
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
      <Group justify="space-between" align="center" wrap="wrap">
        <div>
          <Title order={2}>Мои задачи</Title>
          <Text c="dimmed" fz="sm" mt={2}>
            Назначенные вам заявки и история выполненных работ
          </Text>
        </div>

        {user?.specialization && (
          <Badge variant="light" color="brand" size="lg">
            Специализация: {SPECIALIZATION[user.specialization] ?? user.specialization}
          </Badge>
        )}
      </Group>

      {isLoading && (
        <Stack gap="md">
          <Skeleton height={150} radius="lg" />
          <Skeleton height={150} radius="lg" />
          <Skeleton height={150} radius="lg" />
        </Stack>
      )}

      {error && (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Не удалось загрузить задачи">
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
              <IconChecklist size={34} />
            </ThemeIcon>
            <Text fw={600} fz={20}>
              Назначенных заявок пока нет
            </Text>
            <Text c="dimmed" ta="center">
              Когда диспетчер или система назначит вам заявку, она появится здесь
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
              { value: 'active', label: `Активные (${activeList.length})` },
              { value: 'assigned', label: `Назначенные (${assignedList.length})` },
              { value: 'in_progress', label: `В работе (${inProgressList.length})` },
              { value: 'done', label: `Выполненные (${doneList.length})` },
            ]}
            fullWidth
            maw={680}
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

      <RequestDrawer
        request={selected}
        opened={drawerOpened}
        onClose={drawer.close}
        actions={
          selected && (
            <Stack gap="sm">
              {(selected.status === 'Assigned' || selected.status === 'New') && (
                <Button
                  size="md"
                  color="brand"
                  leftSection={<IconPlayerPlay size={18} />}
                  loading={startMutation.isPending}
                  onClick={() => startMutation.mutate(selected.id)}
                  fullWidth
                >
                  Взять в работу
                </Button>
              )}

              {selected.status === 'InProgress' && (
                <Button
                  size="md"
                  color="green"
                  leftSection={<IconCheck size={18} />}
                  loading={completeMutation.isPending}
                  onClick={() => completeMutation.mutate(selected.id)}
                  fullWidth
                >
                  Завершить задание
                </Button>
              )}

              {selected.status !== 'Completed' && selected.status !== 'Rejected' && (
                <Button
                  size="md"
                  variant="light"
                  color="orange"
                  leftSection={<IconSend size={18} />}
                  onClick={() => handleSendToReview(selected.id)}
                  fullWidth
                >
                  Отправить на проверку менеджеру
                </Button>
              )}
            </Stack>
          )
        }
      />
    </Stack>
  )
}