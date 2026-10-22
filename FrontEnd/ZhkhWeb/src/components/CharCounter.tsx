import { Text } from '@mantine/core'

interface CharCounterProps {
  value: string
  min: number
  max: number
}

// Счётчик под полем: "12 / 150 · минимум 10". Краснеет, если длина вне допустимых границ
export function CharCounter({ value, min, max }: CharCounterProps) {
  const length = value.trim().length
  const bad = length > 0 && (length < min || length > max)
  return (
    <Text fz="xs" c={bad ? 'red' : 'dimmed'} ta="right" mt={4}>
      {length} / {max} · минимум {min}
    </Text>
  )
}
