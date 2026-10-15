import { createTheme } from '@mantine/core'
import type { MantineColorsTuple } from '@mantine/core'

// Основной синий (кнопки, ссылки, акценты)
const brand: MantineColorsTuple = [
  '#eef5fe',
  '#dbe9fb',
  '#b7d3f7',
  '#8fbaf2',
  '#6ba5ee',
  '#4f95eb',
  '#3b8aea',
  '#2b77d1',
  '#2268b9',
  '#1558a3',
]

// Оранжевый (логотип, иконки-акценты)
const sun: MantineColorsTuple = [
  '#fff4e6',
  '#ffe8cc',
  '#ffd8a8',
  '#ffc078',
  '#ffa94d',
  '#ff9a1f',
  '#f08c00',
  '#d97706',
  '#b45f06',
  '#8f4a05',
]

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 7,
  colors: { brand, sun },
  fontFamily: "'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontWeight: '700',
  },
  defaultRadius: 'md',
  radius: { xs: '6px', sm: '10px', md: '14px', lg: '20px', xl: '28px' },
})

// Цвет фона карточек, как на примере (светло-голубой)
export const SOFT_BG = 'var(--mantine-color-brand-0)'
