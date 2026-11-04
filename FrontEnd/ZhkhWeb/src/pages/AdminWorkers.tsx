import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  CopyButton,
  Group,
  Modal,
  Paper,
  PasswordInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconEdit,
  IconPhone,
  IconPlus,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import {
  ADMIN_REQUESTS_KEY,
  ADMIN_USERS_KEY,
  ADMIN_WORKERS_KEY,
  createWorkerByAdmin,
  fetchAdminRequests,
  fetchAdminUsers,
  promoteToWorker,
} from '../api/requests'
import type { Specialization, User } from '../api/types'
import { ROLE, SPECIALIZATION, toOptions } from '../lib/labels'
import { SOFT_BG } from '../theme'

const specializationOptions = toOptions(SPECIALIZATION)

export function AdminWorkers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleTab, setRoleTab] = useState<'worker' | 'citizen' | 'ALL'>('worker')

  // Модалка создания нового сотрудника (как в регистрации + специализация)
  const [createOpened, createModal] = useDisclosure(false)

  // Модалка назначения роли / смены специализации существующему пользователю
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<Specialization>('Plumber')
  const [promoteOpened, promoteModal] = useDisclosure(false)

  const {
    data: users,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: fetchAdminUsers,
  })

  const { data: requests } = useQuery({
    queryKey: ADMIN_REQUESTS_KEY,
    queryFn: fetchAdminRequests,
  })

  const createForm = useForm({
    initialValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      dateOfBirth: '1995-01-01',
      phone: '',
      password: '',
      specialization: 'Plumber' as Specialization,
    },
    validate: {
      lastName: (v) => (v.trim().length < 2 ? 'Введите фамилию' : null),
      firstName: (v) => (v.trim().length < 2 ? 'Введите имя' : null),
      dateOfBirth: (v) => (!v ? 'Укажите дату рождения' : null),
      phone: (v) => (v.trim().length < 10 ? 'Введите корректный номер телефона' : null),
      password: (v) => (v.length < 6 ? 'Пароль должен быть не менее 6 символов' : null),
    },
  })

  const invalidateUserLists = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY })
    void queryClient.invalidateQueries({ queryKey: ADMIN_WORKERS_KEY })
  }

  const createWorkerMutation = useMutation({
    mutationFn: createWorkerByAdmin,
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Сотрудник успешно создан' })
      invalidateUserLists()
      createForm.reset()
      createModal.close()
      setRoleTab('worker')
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось создать сотрудника',
      })
    },
  })

  const promoteMutation = useMutation({
    mutationFn: ({ userId, spec }: { userId: string; spec: Specialization }) =>
      promoteToWorker(userId, spec),
    onSuccess: (res) => {
      notifications.show({ color: 'green', message: res.message || 'Специализация сохранена' })
      invalidateUserLists()
      promoteModal.close()
      setTargetUser(null)
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        message: e instanceof ApiError ? e.message : 'Не удалось обновить сотрудника',
      })
    },
  })

  // Подсчёт активных и завершённых заявок по каждому сотруднику
  const statsByWorker = useMemo(() => {
    const map: Record<string, { active: number; completed: number }> = {}
    for (const r of requests ?? []) {
      if (!r.assignedWorkerId) continue
      if (!map[r.assignedWorkerId]) {
        map[r.assignedWorkerId] = { active: 0, completed: 0 }
      }
      if (r.status === 'Assigned' || r.status === 'InProgress') {
        map[r.assignedWorkerId].active += 1
      } else if (r.status === 'Completed') {
        map[r.assignedWorkerId].completed += 1
      }
    }
    return map
  }, [requests])

  const workersCount = (users ?? []).filter((u) => u.role === 'worker').length
  const citizensCount = (users ?? []).filter((u) => u.role === 'citizen').length

  const filteredUsers = useMemo(() => {
    let base = users ?? []
    if (roleTab !== 'ALL') {
      base = base.filter((u) => u.role === roleTab)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      base = base.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          (u.middleName && u.middleName.toLowerCase().includes(q)) ||
          u.phone.toLowerCase().includes(q),
      )
    }
    return base
  }, [users, roleTab, search])

  const openPromoteModal = (user: User) => {
    setTargetUser(user)
    setSelectedSpec((user.specialization as Specialization) || 'Plumber')
    promoteModal.open()
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Сотрудники</Title>
          <Text c="dimmed" fz="sm" mt={2}>
            Регистрация новых сотрудников, выбор специализации и управление персоналом
          </Text>
        </div>

        <Button leftSection={<IconPlus size={18} />} onClick={createModal.open}>
          Добавить сотрудника
        </Button>
      </Group>

      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <SegmentedControl
          value={roleTab}
          onChange={(v) => setRoleTab(v as 'worker' | 'citizen' | 'ALL')}
          data={[
            { value: 'worker', label: `Сотрудники (${workersCount})` },
            { value: 'citizen', label: `Жители (${citizensCount})` },
            { value: 'ALL', label: `Все (${(users ?? []).length})` },
          ]}
        />

        <TextInput
          placeholder="Поиск по ФИО или телефону..."
          leftSection={<IconSearch size={18} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          miw={280}
          style={{ flex: 1, maxWidth: 420 }}
        />
      </Group>

      {isLoading && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Skeleton height={140} radius="lg" />
          <Skeleton height={140} radius="lg" />
        </SimpleGrid>
      )}

      {error && (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Не удалось загрузить список">
          <Stack gap="sm" align="flex-start">
            <Text>
              {error instanceof ApiError ? error.message : 'Пересоберите контейнер csharp-api с обновлённым AdminController'}
            </Text>
            <Button variant="light" color="red" size="xs" loading={isFetching} onClick={() => void refetch()}>
              Повторить
            </Button>
          </Stack>
        </Alert>
      )}

      {!isLoading && !error && filteredUsers.length === 0 && (
        <Paper bg={SOFT_BG} radius="lg" p="xl">
          <Stack align="center" gap="sm" py="lg">
            <ThemeIcon size={64} radius="xl" variant="white" color="brand">
              <IconUsers size={34} />
            </ThemeIcon>
            <Text fw={600} fz={20}>
              Список пуст
            </Text>
            <Text c="dimmed" ta="center">
              Нажмите «Добавить сотрудника», чтобы зарегистрировать нового специалиста
            </Text>
          </Stack>
        </Paper>
      )}

      {filteredUsers.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {filteredUsers.map((w) => {
            const stats = statsByWorker[w.id] ?? { active: 0, completed: 0 }
            const specLabel = w.specialization
              ? (SPECIALIZATION[w.specialization] ?? w.specialization)
              : 'Общая'
            const isWorker = w.role === 'worker'

            return (
              <Paper key={w.id} p="lg" radius="lg" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color={isWorker ? 'brand' : 'gray'} radius="xl" size="md">
                        {w.firstName?.[0]}
                        {w.lastName?.[0]}
                      </Avatar>
                      <div>
                        <Text fw={600} fz={17}>
                          {w.lastName} {w.firstName} {w.middleName ?? ''}
                        </Text>
                        <Group gap={6} c="dimmed">
                          <IconPhone size={14} />
                          <Text fz="sm">{w.phone}</Text>
                        </Group>
                      </div>
                    </Group>

                    <CopyButton value={w.id} timeout={1500}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'ID скопирован' : 'Скопировать ID'}>
                          <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>

                  <Group justify="space-between" align="center" mt={4}>
                    <Group gap="xs">
                      <Badge color={isWorker ? 'brand' : 'gray'} variant="light" size="lg">
                        {ROLE[w.role] ?? w.role}
                      </Badge>
                      {isWorker && (
                        <>
                          <Badge color="violet" variant="light" size="lg">
                            {specLabel}
                          </Badge>
                          <Badge color={stats.active > 0 ? 'yellow' : 'gray'} variant="light" size="lg">
                            В работе: {stats.active}
                          </Badge>
                          <Badge color="green" variant="light" size="lg">
                            Выполнено: {stats.completed}
                          </Badge>
                        </>
                      )}
                    </Group>

                    {isWorker && (
                      <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        leftSection={<IconEdit size={14} />}
                        onClick={() => openPromoteModal(w)}
                      >
                        Специализация
                      </Button>
                    )}

                    {w.role === 'citizen' && (
                      <Button
                        size="xs"
                        variant="light"
                        color="brand"
                        leftSection={<IconUserPlus size={14} />}
                        onClick={() => openPromoteModal(w)}
                      >
                        Сделать сотрудником
                      </Button>
                    )}
                  </Group>
                </Stack>
              </Paper>
            )
          })}
        </SimpleGrid>
      )}

      {/* Модальное окно регистрации нового сотрудника с выбором специализации */}
      <Modal
        opened={createOpened}
        onClose={createModal.close}
        title="Регистрация нового сотрудника"
        radius="lg"
        size="md"
      >
        <form onSubmit={createForm.onSubmit((values) => createWorkerMutation.mutate(values))}>
          <Stack gap="sm">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Фамилия"
                placeholder="Иванов"
                withAsterisk
                {...createForm.getInputProps('lastName')}
              />
              <TextInput
                label="Имя"
                placeholder="Иван"
                withAsterisk
                {...createForm.getInputProps('firstName')}
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Отчество"
                placeholder="Иванович"
                {...createForm.getInputProps('middleName')}
              />
              <TextInput
                label="Дата рождения"
                type="date"
                withAsterisk
                {...createForm.getInputProps('dateOfBirth')}
              />
            </SimpleGrid>

            <Select
              label="Специализация сотрудника"
              data={specializationOptions}
              withAsterisk
              allowDeselect={false}
              {...createForm.getInputProps('specialization')}
            />

            <TextInput
              label="Номер телефона (логин)"
              placeholder="79001234567"
              withAsterisk
              {...createForm.getInputProps('phone')}
            />

            <PasswordInput
              label="Пароль"
              placeholder="Минимум 6 символов"
              withAsterisk
              {...createForm.getInputProps('password')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={createModal.close}>
                Отмена
              </Button>
              <Button type="submit" loading={createWorkerMutation.isPending}>
                Создать сотрудника
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Модальное окно смены специализации / перевода жителя в сотрудники */}
      <Modal
        opened={promoteOpened}
        onClose={promoteModal.close}
        title={targetUser?.role === 'worker' ? 'Изменить специализацию' : 'Назначение сотрудником'}
        radius="lg"
      >
        {targetUser && (
          <Stack gap="md">
            <Text fz="sm">
              Пользователь:{' '}
              <Text span fw={600}>
                {targetUser.lastName} {targetUser.firstName} {targetUser.middleName ?? ''}
              </Text>{' '}
              ({targetUser.phone})
            </Text>

            <Select
              label="Специализация"
              data={specializationOptions}
              value={selectedSpec}
              onChange={(v) => v && setSelectedSpec(v as Specialization)}
              allowDeselect={false}
            />

            <Button
              loading={promoteMutation.isPending}
              onClick={() => promoteMutation.mutate({ userId: targetUser.id, spec: selectedSpec })}
              fullWidth
            >
              Сохранить
            </Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}