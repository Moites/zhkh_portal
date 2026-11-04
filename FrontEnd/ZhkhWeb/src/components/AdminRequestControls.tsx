import {
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconBan, IconCheck, IconUserCheck } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import {
  ADMIN_REQUESTS_KEY,
  ADMIN_REVIEW_KEY,
  appointWorker,
  changeRequestInformation,
} from '../api/requests'
import type {
  RequestComplexity,
  RequestPriority,
  RequestStatus,
  ServiceRequest,
  Specialization,
  User,
} from '../api/types'
import { COMPLEXITY, PRIORITY, SPECIALIZATION, STATUS, toOptions } from '../lib/labels'
import { SOFT_BG } from '../theme'

interface AdminRequestControlsProps {
  request: ServiceRequest
  workers?: User[]
  onUpdated?: () => void
}

const statusOptions = (Object.keys(STATUS) as RequestStatus[]).map((value) => ({
  value,
  label: STATUS[value].label,
}))

const priorityOptions = (Object.keys(PRIORITY) as RequestPriority[]).map((value) => ({
  value,
  label: PRIORITY[value].label,
}))

const complexityOptions = toOptions(COMPLEXITY)
const specializationOptions = toOptions(SPECIALIZATION)

export function AdminRequestControls({ request, workers = [], onUpdated }: AdminRequestControlsProps) {
  const queryClient = useQueryClient()

  const [title, setTitle] = useState(request.title)
  const [address, setAddress] = useState(request.address)
  const [description, setDescription] = useState(request.description)

  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [priority, setPriority] = useState<RequestPriority>(request.priority)
  const [complexity, setComplexity] = useState<RequestComplexity>(request.complexity)
  const [specialization, setSpecialization] = useState<Specialization>(request.specialization)
  const [workerId, setWorkerId] = useState<string>(request.assignedWorkerId ?? '')

  useEffect(() => {
    setTitle(request.title)
    setAddress(request.address)
    setDescription(request.description)
    setStatus(request.status)
    setPriority(request.priority)
    setComplexity(request.complexity)
    setSpecialization(request.specialization)
    setWorkerId(request.assignedWorkerId ?? '')
  }, [request])

  const invalidateAdminQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_REQUESTS_KEY })
    void queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_KEY })
  }

  const changeInfoMutation = useMutation({
    mutationFn: changeRequestInformation,
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Заявка успешно обновлена' })
      invalidateAdminQueries()
      onUpdated?.()
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось обновить заявку',
      })
    },
  })

  const appointMutation = useMutation({
    mutationFn: ({ reqId, wId }: { reqId: string; wId: string }) => appointWorker(reqId, wId),
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Работник назначен на заявку' })
      invalidateAdminQueries()
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось назначить работника',
      })
    },
  })

  const workerSelectData = workers.map((w) => {
    const spec = w.specialization ? (SPECIALIZATION[w.specialization] ?? w.specialization) : 'Общая'
    return {
      value: w.id,
      label: `${w.lastName} ${w.firstName} — ${spec} (${w.phone})`,
    }
  })

  const handleSave = (overrideStatus?: RequestStatus) => {
    changeInfoMutation.mutate({
      requestId: request.id,
      status: overrideStatus ?? status,
      priority,
      complexity,
      specialization,
      title: title.trim(),
      address: address.trim(),
      description: description.trim(),
    })
  }

  return (
    <Stack gap="md">
      <Paper bg={SOFT_BG} p="md" radius="md">
        <Stack gap="sm">
          <Text fw={600}>Редактирование заявки и параметров</Text>

          <TextInput
            label="Заголовок заявки"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />

          <TextInput
            label="Адрес"
            value={address}
            onChange={(e) => setAddress(e.currentTarget.value)}
          />

          <Textarea
            label="Описание (и комментарии)"
            minRows={4}
            autosize
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <SimpleGrid cols={2} spacing="sm">
            <Select
              label="Статус"
              data={statusOptions}
              value={status}
              onChange={(v) => v && setStatus(v as RequestStatus)}
              allowDeselect={false}
            />
            <Select
              label="Приоритет"
              data={priorityOptions}
              value={priority}
              onChange={(v) => v && setPriority(v as RequestPriority)}
              allowDeselect={false}
            />
            <Select
              label="Специальность"
              data={specializationOptions}
              value={specialization}
              onChange={(v) => v && setSpecialization(v as Specialization)}
              allowDeselect={false}
            />
            <Select
              label="Сложность"
              data={complexityOptions}
              value={complexity}
              onChange={(v) => v && setComplexity(v as RequestComplexity)}
              allowDeselect={false}
            />
          </SimpleGrid>

          <Group grow mt="xs">
            <Button
              leftSection={<IconCheck size={18} />}
              loading={changeInfoMutation.isPending}
              onClick={() => handleSave()}
            >
              {request.needsReview ? 'Подтвердить и снять с проверки' : 'Сохранить правки'}
            </Button>

            {request.status !== 'Rejected' && (
              <Button
                color="red"
                variant="light"
                leftSection={<IconBan size={18} />}
                loading={changeInfoMutation.isPending}
                onClick={() => handleSave('Rejected')}
              >
                Отменить (Отклонить)
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>

      <Paper bg={SOFT_BG} p="md" radius="md">
        <Stack gap="sm">
          <Text fw={600}>Назначение исполнителя вручную</Text>

          <Select
            label="Сотрудник"
            placeholder={
              workerSelectData.length > 0
                ? 'Выберите сотрудника из списка'
                : 'Сначала добавьте сотрудников во вкладке «Сотрудники»'
            }
            data={workerSelectData}
            value={workerId || null}
            onChange={(v) => setWorkerId(v ?? '')}
            searchable
            clearable
          />

          <Button
            variant="light"
            color="brand"
            leftSection={<IconUserCheck size={18} />}
            loading={appointMutation.isPending}
            disabled={!workerId}
            onClick={() => appointMutation.mutate({ reqId: request.id, wId: workerId })}
            fullWidth
          >
            Назначить выбранного работника
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}