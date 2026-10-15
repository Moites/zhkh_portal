import { Paper, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  maxWidth?: number
}

// Общая рамка для страниц входа и регистрации
export function AuthCard({ title, subtitle, children, maxWidth = 440 }: AuthCardProps) {
  return (
    <Paper withBorder radius="lg" p={{ base: 'lg', sm: 'xl' }} maw={maxWidth} mx="auto" mt="lg">
      <Stack gap="lg">
        <div>
          <Title order={2}>{title}</Title>
          {subtitle && (
            <Text c="dimmed" mt={4}>
              {subtitle}
            </Text>
          )}
        </div>
        {children}
      </Stack>
    </Paper>
  )
}
