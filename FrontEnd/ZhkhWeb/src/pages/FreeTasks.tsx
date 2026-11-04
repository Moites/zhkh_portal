import { Alert, Button, Group, Paper, Skeleton, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconInbox, IconPlayerPlay, IconSend } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import {
  WORKER_REQUESTS_KEY,
  WORKER_SPEC_REQUESTS_KEY,
  fetchWorkerSpecRequests,
  startExecutionRequest,
} from '../api/requests'
import type { ServiceRequest } from '../api/types'
import { RequestCard } from '../components/RequestCard'
import { RequestDrawer } from '../components/RequestDrawer'
import { toDate } from '../lib/format'
import { SOFT_BG } from '../theme'

export function FreeTasks() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<ServiceRequest | null>(null)
  const [drawerOpened, drawer] = useDisclosure(false)

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: WORKER_SPEC_REQUESTS_KEY,
    queryFn: fetchWorkerSpecRequests,
  })

  const takeMutation = useMutation({
    mutationFn: startExecutionRequest,
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Заявка взята в работу' })
      void queryClient.invalidateQueries({ queryKey: WORKER_SPEC_REQUESTS_KEY })
      void queryClient.invalidateQueries({ queryKey: WORKER_REQUESTS_KEY })
      drawer.close()
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось взять заявку',
      })
    },
  })

  const handleSendToReview = (_requestId: string) => {
    notifications.show({
      color: 'blue',
      message: 'Запрос на проверку менеджеру отправлен (функция скоро будет подключена к серверу)',
    })
  }

  // Показываем только свободные заявки (статус New, без назначенного сотрудника и не на проверке)
  const freeRequests = useMemo(() => {
    return (data ?? [])
      .filter((r) => r.status === 'New' && !r.assignedWorkerId && !r.needsReview)
      .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
  }, [data])

  const open = (request: ServiceRequest) => {
    setSelected(request)
    drawer.open()
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Свободные заявки</Title>
          <Text c="dimmed" fz="sm" mt={2}>
            Новые обращения по вашей специальности, которые можно взять в работу
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
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Не удалось загрузить заявки">
          <Stack gap="sm" align="flex-start">
            <Text>{error instanceof ApiError ? error.message : 'Попробуйте ещё раз'}</Text>
            <Button variant="light" color="red" size="xs" loading={isFetching} onClick={() => void refetch()}>
              Повторить
            </Button>
          </Stack>
        </Alert>
      )}

      {!isLoading && !error && freeRequests.length === 0 && (
        <Paper bg={SOFT_BG} radius="lg" p="xl">
          <Stack align="center" gap="sm" py="lg">
            <ThemeIcon size={64} radius="xl" variant="white" color="brand">
              <IconInbox size={34} />
            </ThemeIcon>
            <Text fw={600} fz={20}>
              Свободных заявок нет
            </Text>
            <Text c="dimmed" ta="center">
              Все заявки по вашей специальности уже распределены или находятся в работе
            </Text>
          </Stack>
        </Paper>
      )}

      {freeRequests.length > 0 && (
        <Stack gap="md">
          {freeRequests.map((request) => (
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
            <Stack gap="sm">
              <Button
                size="md"
                color="brand"
                leftSection={<IconPlayerPlay size={18} />}
                loading={takeMutation.isPending}
                onClick={() => takeMutation.mutate(selected.id)}
                fullWidth
              >
                Взять в работу
              </Button>
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
            </Stack>
          )
        }
      />
    </Stack>
  )
}