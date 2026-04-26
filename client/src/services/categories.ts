import { BASE_URL, USER_ID } from './api'
import type { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/categories?user_id=${USER_ID}`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createCategory(data: { name: string; color?: string }): Promise<Category> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, user_id: USER_ID }),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete category')
}
