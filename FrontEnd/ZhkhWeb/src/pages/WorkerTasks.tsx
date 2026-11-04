import {
  Alert,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconAlertCircle,
  IconCheck,
  IconClipboardList,
  IconMessageReport,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import {
  completeRequest,
  fetchWorkerRequests,
  sendRequestToReview,
  startExecutionRequest,
  WORKER_REQUESTS_KEY,
  WORKER_SPEC_REQUESTS_KEY,
} from '../api/requests'
import type { ServiceRequest } from '../api/types'
import { RequestCard } from '../components/RequestCard'
import { RequestDrawer } from '../components/RequestDrawer'
import { toDate } from '../lib/format'
import { SOFT_BG } from '../theme'

type Filter = 'active' | 'completed' | 'all'

export function WorkerTasks() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<Filter>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [drawerOpened, drawer] = useDisclosure(false)

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: WORKER_REQUESTS_KEY,
    queryFn: fetchWorkerRequests,
  })

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: WORKER_REQUESTS_KEY })
    void queryClient.invalidateQueries({ queryKey: WORKER_SPEC_REQUESTS_KEY })
  }

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

  const completeMutation = useMutation({
    mutationFn: completeRequest,
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Заявка выполнена' })
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

  const reviewMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      sendRequestToReview(id, comment),
    onSuccess: (res) => {
      notifications.show({
        color: 'blue',
        message: res.message || 'Заявка отправлена на рассмотрение администратору',
      })
      setReviewComment('')
      invalidateAll()
      drawer.close()
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось отправить на рассмотрение',
      })
    },
  })

  const sorted = useMemo(
    () => [...(data ?? [])].sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()),
    [data],
  )

  const activeList = sorted.filter((r) => r.status === 'Assigned' || r.status === 'InProgress')
  const completedList = sorted.filter((r) => r.status === 'Completed' || r.status === 'Rejected')

  const visible =
    filter === 'active' ? activeList : filter === 'completed' ? completedList : sorted

  const selected = useMemo(
    () => sorted.find((r) => r.id === selectedId) ?? null,
    [sorted, selectedId],
  )

  const open = (request: ServiceRequest) => {
    setSelectedId(request.id)
    setReviewComment('')
    drawer.open()
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Мои задачи</Title>
          <Text c="dimmed" fz="sm" mt={2}>
            Назначенные вам заявки и управление их выполнением
          </Text>
        </div>
      </Group>

      {isLoading && (
        <Stack gap="md">
          <Skeleton height={150} radius="lg" />
          <Skeleton height={150} radius="lg" />
        </Stack>
      )}

      {error && (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Ошибка загрузки">
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
              <IconClipboardList size={34} />
            </ThemeIcon>
            <Text fw={600} fz={20}>
              У вас пока нет назначенных задач
            </Text>
            <Text c="dimmed" ta="center">
              Новые заявки вашей специализации будут назначаться автоматически или появятся во вкладке «Свободные заявки»
            </Text>
          </Stack>
        </Paper>
      )}

      {sorted.length > 0 && (
        <>
          <SegmentedControl
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            data={[
              { value: 'active', label: `Активные (${activeList.length})` },
              { value: 'completed', label: `Завершённые (${completedList.length})` },
              { value: 'all', label: `Все (${sorted.length})` },
            ]}
            fullWidth
            maw={520}
          />

          <Stack gap="md">
            {visible.map((request) => (
              <RequestCard key={request.id} request={request} onOpen={open} />
            ))}
          </Stack>
        </>
      )}

      <RequestDrawer
        request={selected}
        opened={drawerOpened}
        onClose={drawer.close}
        actions={
          selected && (
            <Stack gap="md">
              {selected.status === 'Assigned' && (
                <Button
                  leftSection={<IconPlayerPlay size={18} />}
                  loading={startMutation.isPending}
                  onClick={() => startMutation.mutate(selected.id)}
                  fullWidth
                >
                  Приступить к выполнению (В работу)
                </Button>
              )}

              {selected.status === 'InProgress' && (
                <Button
                  color="green"
                  leftSection={<IconCheck size={18} />}
                  loading={completeMutation.isPending}
                  onClick={() => completeMutation.mutate(selected.id)}
                  fullWidth
                >
                  Завершить заявку (Выполнено)
                </Button>
              )}

              {(selected.status === 'Assigned' || selected.status === 'InProgress') && (
                <Paper bg={SOFT_BG} p="md" radius="md">
                  <Stack gap="sm">
                    <Text fw={600} fz="sm">
                      Нужна правка или пересмотр администратором?
                    </Text>
                    <Textarea
                      placeholder="Опишите причину (например: требуется другая специальность, неверный адрес, нужна отмена заявки)..."
                      minRows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.currentTarget.value)}
                    />
                    <Button
                      variant="light"
                      color="orange"
                      leftSection={<IconMessageReport size={18} />}
                      disabled={reviewComment.trim().length < 5}
                      loading={reviewMutation.isPending}
                      onClick={() =>
                        reviewMutation.mutate({
                          id: selected.id,
                          comment: reviewComment.trim(),
                        })
                      }
                      fullWidth
                    >
                      Отправить правки на рассмотрение
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Stack>
          )
        }
      />
    </Stack>
  )
}