export interface IGroupsProps {
  id: number
  name: string
  belongs_to: {
    name: string
    id: number
  } | null
  created_at: string
  total_items: number
}
