import { Paper, Stack, Text, Title } from '@mantine/core'
import { IconTool } from '@tabler/icons-react'

// Временная заглушка для страниц, которые мы ещё не сделали
export function ComingSoon({ title }: { title: string }) {
  return (
    <Stack gap="lg">
      <Title order={2}>{title}</Title>
      <Paper bg="var(--mantine-color-brand-0)" radius="lg" p="xl">
        <Stack align="center" gap="xs" py="lg">
          <IconTool size={36} color="var(--mantine-color-brand-5)" />
          <Text fw={600}>Раздел в разработке</Text>
          <Text c="dimmed" ta="center">
            Страница откроется после следующих шагов
          </Text>
        </Stack>
      </Paper>
    </Stack>
  )
}
