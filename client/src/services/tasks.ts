import { apiFetch } from './api'
import type { Task } from '../types'

export async function getTasks(params?: {
  category_id?: number
  is_completed?: boolean
  sort?: 'due_date' | 'created_at'
}): Promise<Task[]> {
  const query = new URLSearchParams()
  if (params?.category_id) query.set('category_id', String(params.category_id))
  if (params?.is_completed !== undefined) query.set('is_completed', String(params.is_completed))
  if (params?.sort) query.set('sort', params.sort)

  const res = await apiFetch(`/api/tasks?${query}`)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function createTask(data: {
  title: string
  description?: string
  due_date?: string
  point_value?: number
  category_id?: number
}): Promise<Task> {
  const res = await apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  const res = await apiFetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}

export async function deleteTask(id: number): Promise<void> {
  const res = await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete task')
}
