import { Alert, Button, Stack, Text, TextInput, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle, IconPhoneCall } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '../api/client'
import { MY_REQUESTS_KEY, REQUEST_LIMITS, createRequest } from '../api/requests'
import type { ServiceRequest } from '../api/types'
import { CharCounter } from '../components/CharCounter'
import { RequestResult } from '../components/RequestResult'

// Правило "длина от min до max", сообщения на русском
function lengthRule(name: string, limit: { min: number; max: number }) {
  return (value: string) => {
    const length = value.trim().length
    if (length < limit.min) return `${name}: минимум ${limit.min} символов (сейчас ${length})`
    if (length > limit.max) return `${name}: максимум ${limit.max} символов (сейчас ${length})`
    return null
  }
}

export function NewRequest() {
  const queryClient = useQueryClient()
  const [created, setCreated] = useState<ServiceRequest | null>(null)

  const form = useForm({
    initialValues: { title: '', description: '', address: '' },
    validate: {
      title: lengthRule('Заголовок', REQUEST_LIMITS.title),
      description: lengthRule('Описание', REQUEST_LIMITS.description),
      address: lengthRule('Адрес', REQUEST_LIMITS.address),
    },
  })

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: (request) => {
      setCreated(request)
      // Список "Мои заявки" устарел: просим обновить его при следующем открытии
      void queryClient.invalidateQueries({ queryKey: MY_REQUESTS_KEY })
    },
  })

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate({
      title: values.title.trim(),
      description: values.description.trim(),
      address: values.address.trim(),
    })
  })

  const handleAnother = () => {
    setCreated(null)
    form.reset()
    mutation.reset()
  }

  if (created) return <RequestResult request={created} onAnother={handleAnother} />

  return (
    <Stack gap="lg" maw={640} mx="auto">
      <div>
        <Title order={2}>Новая заявка</Title>
        <Text c="dimmed" mt={4}>
          Опишите проблему: что случилось, где именно и с какого времени. Чем подробнее, тем быстрее мы определим
          нужного специалиста.
        </Text>
      </div>

      <Alert color="orange" variant="light" icon={<IconPhoneCall size={20} />}>
        При угрозе жизни и здоровью (пожар, запах газа, сильное затопление) сразу звоните 112. Заявка не заменяет
        вызов экстренных служб.
      </Alert>

      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="lg">
          <div>
            <TextInput
              label="Заголовок"
              placeholder="Например: Течёт труба под раковиной на кухне"
              size="md"
              {...form.getInputProps('title')}
            />
            <CharCounter value={form.values.title} {...REQUEST_LIMITS.title} />
          </div>

          <div>
            <Textarea
              label="Описание"
              placeholder="Что случилось, где именно, с какого времени, что уже пробовали сделать"
              size="md"
              autosize
              minRows={5}
              maxRows={12}
              {...form.getInputProps('description')}
            />
            <CharCounter value={form.values.description} {...REQUEST_LIMITS.description} />
          </div>

          <div>
            <TextInput
              label="Адрес"
              placeholder="Улица, дом, квартира, подъезд"
              size="md"
              autoComplete="street-address"
              {...form.getInputProps('address')}
            />
            <CharCounter value={form.values.address} {...REQUEST_LIMITS.address} />
          </div>

          {mutation.isError && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : 'Не удалось отправить заявку. Попробуйте ещё раз'}
            </Alert>
          )}

          <Button type="submit" size="md" loading={mutation.isPending} fullWidth>
            Отправить заявку
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
