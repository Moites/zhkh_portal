import type {
  RequestComplexity,
  RequestPriority,
  RequestStatus,
  Role,
  Specialization,
} from '../api/types'

// Подпись + цвет бейджа (названия цветов из Mantine)
interface Label {
  label: string
  color: string
}

export const STATUS: Record<RequestStatus, Label> = {
  New: { label: 'Новая', color: 'gray' },
  Assigned: { label: 'Назначена', color: 'violet' },
  InProgress: { label: 'В работе', color: 'yellow' },
  Completed: { label: 'Выполнена', color: 'green' },
  Rejected: { label: 'Отклонена', color: 'red' },
}

export const PRIORITY: Record<RequestPriority, Label> = {
  Low: { label: 'Низкий', color: 'gray' },
  Medium: { label: 'Средний', color: 'blue' },
  High: { label: 'Высокий', color: 'orange' },
  Emergency: { label: 'Аварийный', color: 'red' },
}

export const COMPLEXITY: Record<RequestComplexity, string> = {
  Simple: 'Простая',
  Medium: 'Средняя',
  Complex: 'Сложная',
}

export const SPECIALIZATION: Record<Specialization, string> = {
  General: 'Общая',
  Plumber: 'Сантехник',
  Electrician: 'Электрик',
  Carpenter: 'Плотник',
  Painter: 'Маляр',
  Cleaner: 'Уборщик',
  Janitor: 'Дворник',
  Roofer: 'Кровельщик',
  Locksmith: 'Слесарь',
}

export const ROLE: Record<Role, string> = {
  citizen: 'Житель',
  worker: 'Сотрудник',
  admin: 'Администратор',
}

// Список для выпадающих меню: [{ value: 'Plumber', label: 'Сантехник' }, ...]
export function toOptions<T extends string>(dict: Record<T, string>) {
  return (Object.keys(dict) as T[]).map((value) => ({ value, label: dict[value] }))
}
