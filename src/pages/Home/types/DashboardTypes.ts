import { TablerIconsProps } from '@tabler/icons-react'

export interface ISummaryProps {
  title: string
  value: number
  icon: (props: TablerIconsProps) => JSX.Element
  color?: string
}

export interface ISummaryDataProps {
  [key: string]: ISummaryProps
}

export interface ITopSellingProps {
  title: string
  value: number
  icon: (props: TablerIconsProps) => JSX.Element
  color?: string
}
