import { Button, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <Stack align="center" gap="md" py={80}>
      <Title order={1}>404</Title>
      <Text c="dimmed">Такой страницы нет или она ещё в разработке</Text>
      <Button component={Link} to="/" variant="light">
        На главную
      </Button>
    </Stack>
  )
}
