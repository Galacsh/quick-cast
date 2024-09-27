import { CardStackIcon } from '@radix-ui/react-icons'
import Main from './main'
import type { Command } from '@/cast/types'

export default {
  icon: CardStackIcon,
  name: 'Manage tab groups',
  mode: 'view',
  view: <Main />,
} satisfies Command
