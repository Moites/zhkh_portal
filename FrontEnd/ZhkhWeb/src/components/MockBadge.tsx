import { Badge } from '@mantine/core'

// Плашка в углу, чтобы не перепутать демо с настоящим сервером
export function MockBadge() {
  return (
    <Badge color="yellow" variant="filled" style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 1000 }}>
      Демо-режим: данные не настоящие
    </Badge>
  )
}
