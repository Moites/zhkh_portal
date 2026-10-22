import { Alert, Button, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconCheck, IconUserSearch } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ServiceRequest } from '../api/types'
import { COMPLEXITY, SPECIALIZATION } from '../lib/labels'
import { SOFT_BG } from '../theme'
import { PriorityBadge } from './Badges'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text c="dimmed">{label}</Text>
      <div>{children}</div>
    </Group>
  )
}

interface RequestResultProps {
  request: ServiceRequest
  onAnother: () => void
}

// Экран после отправки заявки: что определила система
export function RequestResult({ request, onAnother }: RequestResultProps) {
  // true: модель не уверена, заявку смотрит диспетчер. false: определено автоматически.
  // undefined: сервер пока не присылает этот признак.
  const review = request.needsReview

  return (
    <Paper withBorder radius="lg" p={{ base: 'lg', sm: 'xl' }} maw={640} mx="auto" mt="lg">
      <Stack gap="lg">
        <Group wrap="nowrap" gap="md">
          <ThemeIcon size={52} radius="xl" color="green" variant="light">
            <IconCheck size={30} />
          </ThemeIcon>
          <div>
            <Title order={2}>Заявка отправлена</Title>
            <Text c="dimmed" lineClamp={2}>
              {request.title}
            </Text>
          </div>
        </Group>

        {review === true ? (
          <Alert color="blue" variant="light" icon={<IconUserSearch size={20} />} title="Заявку проверит диспетчер">
            Автоматически определить тип проблемы уверенно не удалось, поэтому диспетчер уточнит данные и назначит
            сотрудника. От вас ничего больше не требуется: статус заявки будет виден в разделе «Мои заявки».
          </Alert>
        ) : (
          <Paper bg={SOFT_BG} radius="lg" p="lg">
            <Text fw={600} mb="sm">
              {review === false ? 'Что определила система' : 'Предварительная оценка'}
            </Text>
            <Stack gap="xs">
              <Row label="Нужный специалист">
                <Text fw={500}>{SPECIALIZATION[request.specialization] ?? request.specialization}</Text>
              </Row>
              <Row label="Приоритет">
                <PriorityBadge priority={request.priority} />
              </Row>
              <Row label="Сложность">
                <Text fw={500}>{COMPLEXITY[request.complexity] ?? request.complexity}</Text>
              </Row>
            </Stack>
            {review === undefined && (
              <Text c="dimmed" fz="sm" mt="sm">
                Диспетчер может уточнить эти данные.
              </Text>
            )}
          </Paper>
        )}

        <Group>
          <Button component={Link} to="/requests">
            К моим заявкам
          </Button>
          <Button variant="light" onClick={onAnother}>
            Подать ещё одну
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
