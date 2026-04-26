export interface User {
  id: number
  username: string
  points: number
  created_at: string
  avatar_name: string | null
  avatar_image: string | null
  tasks_completed: number
}

export interface Category {
  id: number
  user_id: number
  name: string
  color: string
}

export interface Task {
  id: number
  user_id: number
  category_id: number | null
  title: string
  description: string | null
  due_date: string | null
  point_value: number
  is_completed: boolean
  created_at: string
  category_name: string | null
  category_color: string | null
}

export interface Avatar {
  id: number
  name: string
  image_url: string
  point_cost: number
  description: string | null
  user_avatar_id: number | null
  is_equipped: boolean
  is_unlocked: boolean
  unlocked_at: string | null
}
