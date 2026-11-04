import { Anchor, Box, Button, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import {
  IconArrowRight,
  IconBolt,
  IconBuildingCommunity,
  IconDroplet,
  IconKey,
  IconTool,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { homePath } from '../lib/nav'

// Палитра в духе референса: мята, тёмная хвоя, коралловые кнопки
const MINT = '#c0e1cc'
const INK = '#123a2e'
const INK_SOFT = '#2f5a4b'
const CORAL = '#e8584f'
const CORAL_DARK = '#c9433b'
const CREAM = '#f6f1e1'
const PAPER = '#f4f4f0'

// Картинки лежат в public/: scene.png, icon-pipe.png, icon-bolt.png, icon-doc.png
const features = [
  { icon: '/icon-pipe.png', title: 'Сантехника', text: 'Течь, засор, нет горячей воды — мастер уже в пути.' },
  { icon: '/icon-bolt.png', title: 'Электрика', text: 'Нет света, искрит розетка или щиток — устраним.' },
  { icon: '/icon-doc.png', title: 'Статус заявки', text: 'Следите за ходом работ и историей обращений.' },
]

const topics = [
  { icon: <IconDroplet size={22} />, title: 'Сантехника', text: 'Течь, засор, нет воды' },
  { icon: <IconBolt size={22} />, title: 'Электрика', text: 'Нет света, искрит розетка' },
  { icon: <IconKey size={22} />, title: 'Замки и двери', text: 'Сломан замок, не закрывается дверь' },
  { icon: <IconBuildingCommunity size={22} />, title: 'Двор и подъезд', text: 'Мусор, уборка, освещение, лифт' },
]

const steps = [
  { title: 'Опишите проблему', text: 'Укажите адрес, тему и пару слов о том, что случилось. Можно приложить фото.' },
  { title: 'Мы назначим мастера', text: 'Заявка попадает в диспетчерскую, и ответственный специалист берёт её в работу.' },
  { title: 'Следите за статусом', text: 'От «принята» до «выполнена» — весь путь заявки виден в личном кабинете.' },
]

const navLinks = [
  { href: '#topics', label: 'Что сообщить' },
  { href: '#steps', label: 'Как это работает' },
  { href: '#contacts', label: 'Контакты' },
]

function CoralButton({ to, children, size = 'sm' }: { to: string; children: ReactNode; size?: 'xs' | 'sm' }) {
  return (
    <Button
      component={Link}
      to={to}
      size={size}
      radius="xl"
      color={CORAL}
      rightSection={<IconArrowRight size={16} />}
      style={{ boxShadow: `0 3px 0 0 ${CORAL_DARK}` }}
    >
      {children}
    </Button>
  )
}

function Header() {
  return (
    <Group justify="space-between" wrap="nowrap" px={{ base: 'md', sm: 'xl' }} py="md" style={{ position: 'relative', zIndex: 2 }}>
      <Group gap={8} wrap="nowrap">
        <IconTool size={18} aria-hidden />
        <Text fw={700} fz={{ base: 13, sm: 15 }}>
          ЖКХ Онлайн
        </Text>
      </Group>

      <Group gap={32} visibleFrom="md" component="nav" aria-label="Основная навигация">
        {navLinks.map((l) => (
          <Anchor key={l.href} href={l.href} c={INK} fz={13} fw={500} underline="hover">
            {l.label}
          </Anchor>
        ))}
      </Group>

      <Button component={Link} to="/requests/new" size="compact-sm" radius="xl" color={CORAL}>
        Подать заявку
      </Button>
    </Group>
  )
}

function Hero() {
  return (
    <Box bg={MINT} style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', isolation: 'isolate' }}>
      <Header />

      <Stack align="center" gap={0} maw={680} mx="auto" px="md" pt={{ base: 'md', sm: 'xl' }} ta="center" style={{ position: 'relative', zIndex: 2 }}>
        <Title order={1} fz={{ base: 28, sm: 46 }} fw={800} lh={1.15} c={INK} style={{ textWrap: 'balance' }}>
          Где дом в порядке, а заявка — в пару кликов.
        </Title>
        <Text mt="lg" maw={460} fz={{ base: 12, sm: 13 }} lh={1.7} c={INK_SOFT}>
          Протекла труба, мигает свет или не горит лампа в подъезде? Опишите проблему онлайн — заявка попадёт в
          управляющую компанию, а вы увидите, кто и когда её выполнит.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt={32} w="100%">
          {features.map((f) => (
            <Stack key={f.title} align="center" gap={4}>
              <Image
                src={f.icon}
                alt=""
                w={52}
                h={52}
                fit="contain"
                style={{ mixBlendMode: 'multiply', imageRendering: 'pixelated' }}
              />
              <Text fw={700} fz={13} c={INK}>
                {f.title}
              </Text>
              <Text maw={210} fz={12} lh={1.6} c={INK_SOFT}>
                {f.text}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>

        <Group justify="center" gap="sm" mt={32}>
          <CoralButton to="/requests/new">Подать заявку</CoralButton>
          <Button
            component={Link}
            to="/requests"
            radius="xl"
            variant="default"
            style={{ background: CREAM, color: INK, borderColor: 'rgba(18,58,46,0.15)', boxShadow: '0 3px 0 0 rgba(18,58,46,0.18)' }}
          >
            Мои заявки
          </Button>
        </Group>
      </Stack>

      <Image
        src="/scene.png"
        alt="Пиксельный сантехник в каске сидит у озера и чинит оранжевую трубу большим разводным ключом"
        w="100%"
        h={{ base: 260, sm: 'auto' }}
        fit="cover"
        mt={{ base: -16, sm: -64, lg: -96 }}
        style={{
          objectPosition: '36% center',
          imageRendering: 'pixelated',
          maskImage: 'linear-gradient(to bottom, transparent, black 22%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 22%)',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </Box>
  )
}

function Topics() {
  return (
    <Box id="topics" py={{ base: 48, sm: 72 }} px={4} style={{ scrollMarginTop: 24 }}>
      <Title order={2} fz={{ base: 24, sm: 30 }} fw={800} c={INK}>
        Что можно сообщить
      </Title>
      <Text mt="sm" maw={460} fz={13} lh={1.7} c={INK_SOFT}>
        Выберите тему — мы передадим заявку нужной службе управляющей компании.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mt="xl">
        {topics.map((t) => (
          <Box
            key={t.title}
            p="lg"
            bg={CREAM}
            style={{ border: `2px solid ${INK}`, borderRadius: 12, boxShadow: `4px 4px 0 0 ${INK}` }}
          >
            <Box
              bg={MINT}
              c={INK}
              style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {t.icon}
            </Box>
            <Text mt="md" fw={700} fz={15} c={INK}>
              {t.title}
            </Text>
            <Text mt={4} fz={12} lh={1.6} c={INK_SOFT}>
              {t.text}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}

function Steps() {
  return (
    <Box id="steps" bg={INK} c={CREAM} px={{ base: 'lg', sm: 48 }} py={{ base: 48, sm: 64 }} style={{ borderRadius: 20, scrollMarginTop: 24 }}>
      <Title order={2} fz={{ base: 24, sm: 30 }} fw={800} c={CREAM}>
        Как это работает
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt={40}>
        {steps.map((s, i) => (
          <div key={s.title}>
            <Box
              bg={CORAL}
              c="white"
              fw={800}
              style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {i + 1}
            </Box>
            <Text mt="md" fw={700} fz={15} c={CREAM}>
              {s.title}
            </Text>
            <Text mt="xs" fz={12} lh={1.7} c="rgba(246,241,225,0.75)">
              {s.text}
            </Text>
          </div>
        ))}
      </SimpleGrid>

      <Box mt={40}>
        <CoralButton to="/requests/new">Подать заявку</CoralButton>
      </Box>
    </Box>
  )
}

function Footer() {
  return (
    <Group id="contacts" justify="space-between" align="flex-start" gap="xl" px={4} py={48} style={{ scrollMarginTop: 24 }}>
      <div>
        <Text fw={700} fz={15} c={INK}>
          ЖКХ Онлайн
        </Text>
        <Text mt="xs" maw={320} fz={12} lh={1.7} c={INK_SOFT}>
          Приём заявок жителей для управляющей компании. Аварийные ситуации — звоните в диспетчерскую.
        </Text>
      </div>
      <address style={{ fontStyle: 'normal' }}>
        <Text fz={12} lh={1.7} c={INK_SOFT}>
          Диспетчерская:{' '}
          <Anchor href="tel:+78000000000" fw={700} c={INK} underline="hover">
            8 800 000-00-00
          </Anchor>
        </Text>
        <Text fz={12} c={INK_SOFT}>
          Ежедневно, круглосуточно
        </Text>
      </address>
    </Group>
  )
}

export function Home() {
  const { user } = useAuth()

  // Сотрудников и админов главная страница жителей не интересует
  if (user && user.role !== 'citizen') return <Navigate to={homePath(user.role)} replace />

  return (
    <Box bg={PAPER} c={INK} p={{ base: 8, sm: 16 }} style={{ borderRadius: 24 }}>
      <Hero />
      <Topics />
      <Steps />
      <Footer />
    </Box>
  )
}