import type { Role } from '../api/types'

export interface NavItem {
  to: string
  label: string
}

// Куда попадает пользователь после входа
export function homePath(role: Role): string {
  switch (role) {
    case 'citizen':
      return '/requests'
    case 'worker':
      return '/tasks'
    case 'admin':
      return '/admin/requests'
  }
}

// Пункты меню для каждой роли
export function navItems(role: Role): NavItem[] {
  switch (role) {
    case 'citizen':
      return [
        { to: '/requests', label: 'Мои заявки' },
        { to: '/requests/new', label: 'Подать заявку' },
      ]
    case 'worker':
      return [
        { to: '/tasks', label: 'Мои задачи' },
        { to: '/tasks/free', label: 'Свободные заявки' },
      ]
    case 'admin':
      return [
        { to: '/admin/requests', label: 'Все заявки' },
        { to: '/admin/review', label: 'Очередь проверки' },
        { to: '/admin/workers', label: 'Сотрудники' },
      ]
  }
}
