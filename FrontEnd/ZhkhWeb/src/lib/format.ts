// Сервер отдаёт время по UTC. Если "Z" в конце потерялась, добавляем её,
// иначе браузер решит, что это местное время, и сдвинет на несколько часов.
export function toDate(iso: string): Date {
  return new Date(/(Z|[+-]\d\d:?\d\d)$/.test(iso) ? iso : `${iso}Z`)
}

export function formatDate(iso: string): string {
  return toDate(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return toDate(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
