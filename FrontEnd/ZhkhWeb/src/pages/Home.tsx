import { Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import {
  IconBolt,
  IconBuildingCommunity,
  IconDroplet,
  IconFilePlus,
  IconKey,
  IconListDetails,
} from '@tabler/icons-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Tile } from '../components/Tile'
import { homePath } from '../lib/nav'

const topics = [
  { icon: <IconDroplet size={26} />, title: 'Сантехника', text: 'Течь, засор, нет воды' },
  { icon: <IconBolt size={26} />, title: 'Электрика', text: 'Нет света, искрит розетка' },
  { icon: <IconKey size={26} />, title: 'Замки и двери', text: 'Сломан замок, не закрывается дверь' },
  { icon: <IconBuildingCommunity size={26} />, title: 'Двор и подъезд', text: 'Мусор, уборка, освещение, лифт' },
]

export function Home() {
  const { user } = useAuth()

  // Сотрудников и админов главная страница жителей не интересует
  if (user && user.role !== 'citizen') return <Navigate to={homePath(user.role)} replace />

  return (
    <Stack gap="xl">
      <Title order={1} fz={{ base: 26, sm: 36 }} mt="md">
        Заявки в управляющую компанию онлайн
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Tile
          to="/requests/new"
          icon={<IconFilePlus size={30} />}
          title="Подать заявку"
          text="Опишите проблему, остальное сделаем мы"
        />
        <Tile
          to="/requests"
          icon={<IconListDetails size={30} />}
          title="Мои заявки"
          text="Статусы и история обращений"
        />
      </SimpleGrid>

      <Stack gap="md" px="md" mt="md">
        <Title order={4}>Что можно сообщить</Title>
        {topics.map((t) => (
          <Group key={t.title} wrap="nowrap" gap="md">
            <ThemeIcon variant="light" color="sun" size={52} radius="xl">
              {t.icon}
            </ThemeIcon>
            <div>
              <Text fz={18}>{t.title}</Text>
              <Text c="dimmed">{t.text}</Text>
            </div>
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}
