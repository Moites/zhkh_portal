import { Box, Group, Paper, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SOFT_BG } from '../theme'
import classes from './Tile.module.css'

interface TileProps {
  to: string
  icon: ReactNode
  title: string
  text?: string
}

// Крупная голубая плитка со значком в белом квадрате, как на примере дизайна
export function Tile({ to, icon, title, text }: TileProps) {
  return (
    <Paper component={Link} to={to} className={classes.tile} bg={SOFT_BG} radius="lg" p="lg">
      <Group wrap="nowrap" gap="lg">
        <Box
          w={60}
          h={60}
          bg="white"
          c="brand.4"
          style={{
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text fz={24} fw={700} lh={1.15}>
            {title}
          </Text>
          {text && (
            <Text c="dimmed" mt={4}>
              {text}
            </Text>
          )}
        </Box>
      </Group>
    </Paper>
  )
}
