import { Alert, Anchor, Button, PasswordInput, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { AuthCard } from '../components/AuthCard'
import { applyPhoneInput, isPhoneComplete } from '../lib/phone'

const today = new Date().toISOString().slice(0, 10) // "2026-10-16"

export function Register() {
  const { register } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm({
    initialValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      dateOfBirth: '',
      phone: '',
      password: '',
      confirm: '',
    },
    validate: {
      lastName: (v) => (v.trim() ? null : 'Укажите фамилию'),
      firstName: (v) => (v.trim() ? null : 'Укажите имя'),
      dateOfBirth: (v) => {
        if (!v) return null
        if (v > today) return 'Дата не может быть в будущем'
        if (v < '1900-01-01') return 'Проверьте год рождения'
        return null
      },
      phone: (v) => (isPhoneComplete(v) ? null : 'Введите номер полностью'),
      password: (v) => (v.length >= 6 ? null : 'Минимум 6 символов'),
      confirm: (v, values) => (v === values.password ? null : 'Пароли не совпадают'),
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    setError(null)
    setSubmitting(true)
    try {
      const user = await register({
        phone: values.phone,
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        middleName: values.middleName.trim() || null,
        dateOfBirth: values.dateOfBirth || null,
      })
      notifications.show({ color: 'green', message: `Аккаунт создан. Добро пожаловать, ${user.firstName}!` })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось зарегистрироваться. Попробуйте ещё раз')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AuthCard title="Регистрация" subtitle="Создайте аккаунт, чтобы подавать заявки" maxWidth={560}>
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Фамилия"
              autoComplete="family-name"
              {...form.getInputProps('lastName')}
            />
            <TextInput label="Имя" autoComplete="given-name" {...form.getInputProps('firstName')} />
            <TextInput
              label="Отчество"
              description="Необязательно"
              autoComplete="additional-name"
              {...form.getInputProps('middleName')}
            />
            <TextInput
              type="date"
              label="Дата рождения"
              description="Необязательно"
              max={today}
              {...form.getInputProps('dateOfBirth')}
            />
          </SimpleGrid>

          <TextInput
            label="Телефон"
            description="По нему вы будете входить в систему"
            placeholder="+7 (999) 123-45-67"
            inputMode="tel"
            autoComplete="tel"
            {...form.getInputProps('phone')}
            onChange={(e) =>
              form.setFieldValue('phone', applyPhoneInput(form.values.phone, e.currentTarget.value))
            }
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <PasswordInput
              label="Пароль"
              description="Минимум 6 символов"
              autoComplete="new-password"
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="Повторите пароль"
              autoComplete="new-password"
              {...form.getInputProps('confirm')}
            />
          </SimpleGrid>

          {error && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}

          <Button type="submit" size="md" loading={submitting} fullWidth>
            Создать аккаунт
          </Button>

          <Text ta="center" c="dimmed">
            Уже есть аккаунт?{' '}
            <Anchor component={Link} to="/login">
              Войти
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthCard>
  )
}
