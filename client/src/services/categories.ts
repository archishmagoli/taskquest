import { apiFetch } from './api'
import type { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch('/api/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createCategory(data: { name: string; color?: string }): Promise<Category> {
  const res = await apiFetch('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete category')
}
