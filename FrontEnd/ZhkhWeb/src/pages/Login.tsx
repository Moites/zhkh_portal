import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { AuthCard } from '../components/AuthCard'
import { applyPhoneInput, isPhoneComplete } from '../lib/phone'

export function Login() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm({
    initialValues: { phone: '', password: '' },
    validate: {
      phone: (v) => (isPhoneComplete(v) ? null : 'Введите номер полностью'),
      password: (v) => (v ? null : 'Введите пароль'),
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(values.phone, values.password)
      notifications.show({ color: 'green', message: `Здравствуйте, ${user.firstName}!` })
      // Переход на нужную страницу сделает GuestOnly, когда увидит, что пользователь появился
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось войти. Попробуйте ещё раз')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AuthCard title="Вход" subtitle="Войдите по номеру телефона и паролю">
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <TextInput
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            inputMode="tel"
            autoComplete="tel"
            size="md"
            {...form.getInputProps('phone')}
            onChange={(e) =>
              form.setFieldValue('phone', applyPhoneInput(form.values.phone, e.currentTarget.value))
            }
          />
          <PasswordInput
            label="Пароль"
            placeholder="Ваш пароль"
            autoComplete="current-password"
            size="md"
            {...form.getInputProps('password')}
          />

          {error && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}

          <Button type="submit" size="md" loading={submitting} fullWidth>
            Войти
          </Button>

          <Text ta="center" c="dimmed">
            Нет аккаунта?{' '}
            <Anchor component={Link} to="/register">
              Зарегистрироваться
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthCard>
  )
}
