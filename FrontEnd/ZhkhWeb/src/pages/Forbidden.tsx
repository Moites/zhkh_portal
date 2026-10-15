import { Button, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export function Forbidden() {
  return (
    <Stack align="center" gap="md" py={80}>
      <Title order={1}>Нет доступа</Title>
      <Text c="dimmed">У вашей роли нет прав открывать эту страницу</Text>
      <Button component={Link} to="/" variant="light">
        На главную
      </Button>
    </Stack>
  )
}
