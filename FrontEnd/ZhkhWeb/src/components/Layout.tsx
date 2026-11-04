import {
  Avatar,
  Box,
  Button,
  Container,
  Group,
  Menu,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core'
import { IconBuildingCommunity, IconChevronDown, IconLogout } from '@tabler/icons-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { navItems } from '../lib/nav'
import { ROLE } from '../lib/labels'
import classes from './Layout.module.css'

export function Layout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const items = user ? navItems(user.role) : []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <Box component="header" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Container size="lg" h={76}>
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={46} radius="lg" color="sun">
                  <IconBuildingCommunity size={28} />
                </ThemeIcon>
                <Text fw={700} fz={22}>
                  ЖКХ Портал
                </Text>
              </Group>
            </Link>

            <Group gap="xl" wrap="nowrap">
              {/* Гостю показываем ссылку на подачу заявки: она отправит его на вход */}
              {!user && !loading && (
                <>
                  <Box visibleFrom="sm">
                    <NavLink to="/requests/new" className={classes.link}>
                      Подать заявку
                    </NavLink>
                  </Box>
                  <Group gap="sm" wrap="nowrap">
                    <Button component={Link} to="/login" variant="light" size="md">
                      Войти
                    </Button>
                  </Group>
                </>
              )}

              {/* Вошедшему: ссылки по роли (на компьютере) и меню пользователя */}
              {user && (
                <>
                  <Group gap="xl" visibleFrom="md" wrap="nowrap">
                    {items.map((i) => (
                      <NavLink key={i.to} to={i.to} end className={classes.link}>
                        {i.label}
                      </NavLink>
                    ))}
                  </Group>

                  <Menu position="bottom-end" width={260} shadow="md">
                    <Menu.Target>
                      <UnstyledButton>
                        <Group gap="xs" wrap="nowrap">
                          <Avatar color="brand" radius="xl">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </Avatar>
                          <Text visibleFrom="sm" fw={500}>
                            {user.firstName}
                          </Text>
                          <IconChevronDown size={16} />
                        </Group>
                      </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>
                        {user.lastName} {user.firstName} · {ROLE[user.role]}
                      </Menu.Label>
                      {items.map((i) => (
                        <Menu.Item key={i.to} component={Link} to={i.to} hiddenFrom="md">
                          {i.label}
                        </Menu.Item>
                      ))}
                      <Menu.Divider hiddenFrom="md" />
                      <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                        Выйти
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        <Outlet />
      </Container>
    </>
  )
}