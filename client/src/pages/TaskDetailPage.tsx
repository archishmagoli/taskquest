import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTasks, updateTask, deleteTask } from '../services/tasks'
import { getCategories } from '../services/categories'
import type { Task, Category } from '../types'
import { Check, Trash2, ArrowLeft } from 'lucide-react'

interface TaskDetailPageProps {
  onTaskUpdate: () => void
}

export default function TaskDetailPage({ onTaskUpdate }: TaskDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editPoints, setEditPoints] = useState(10)
  const [editCategoryId, setEditCategoryId] = useState<number | undefined>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getTasks(), getCategories()])
      .then(([tasks, cats]) => {
        const found = tasks.find(t => t.id === Number(id))
        if (!found) { setError('Task not found'); return }
        setTask(found)
        setCategories(cats)
        setEditTitle(found.title)
        setEditDescription(found.description || '')
        setEditDueDate(found.due_date ? found.due_date.split('T')[0] : '')
        setEditPoints(found.point_value)
        setEditCategoryId(found.category_id ?? undefined)
      })
      .catch(() => setError('Failed to load task'))
      .finally(() => setLoading(false))
  }, [id])

  const handleToggleComplete = async () => {
    if (!task) return
    try {
      const updated = await updateTask(task.id, { is_completed: !task.is_completed })
      setTask(updated)
      onTaskUpdate()
    } catch {
      setError('Failed to update task')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    setSaving(true)
    try {
      await updateTask(task.id, {
        title: editTitle,
        description: editDescription,
        due_date: editDueDate || undefined,
        point_value: editPoints,
        category_id: editCategoryId ?? null,
      })
      const tasks = await getTasks()
      const refreshed = tasks.find(t => t.id === task.id)
      if (refreshed) setTask(refreshed)
      setEditing(false)
    } catch {
      setError('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !window.confirm('Delete this task?')) return
    try {
      await deleteTask(task.id)
      navigate('/')
    } catch {
      setError('Failed to delete task')
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center text-purple-600 font-semibold">Loading...</div>
  if (error || !task) return <div className="flex-1 flex items-center justify-center text-red-500">{error || 'Task not found'}</div>

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-purple-600 font-semibold mb-6 hover:text-purple-800">
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </button>

      <div className="max-w-2xl mx-auto">
        {!editing ? (
          <div className={`border-2 p-8 rounded-lg shadow-lg ${task.is_completed ? 'bg-gray-100 border-gray-300' : 'bg-blue-100 border-blue-300'}`}>
            <div className="flex items-start justify-between mb-4">
              <h2 className={`text-2xl font-bold ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.title}
              </h2>
              <button
                onClick={handleToggleComplete}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${task.is_completed ? 'bg-gray-200 border-gray-400 text-gray-600' : 'bg-white border-gray-400 text-gray-700 hover:border-green-400'}`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${task.is_completed ? 'bg-green-500 border-green-600' : 'border-gray-400'}`}>
                  {task.is_completed && <Check className="w-3 h-3 text-white" />}
                </div>
                {task.is_completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>

            {task.description && <p className="text-gray-600 mb-6">{task.description}</p>}

            <div className="flex gap-3 flex-wrap mb-8">
              <span className="px-4 py-2 bg-white border-2 border-gray-400 rounded font-bold text-purple-700">{task.point_value} pts</span>
              {task.category_name && (
                <span className="px-4 py-2 rounded text-white font-semibold" style={{ backgroundColor: task.category_color || '#6366f1' }}>
                  {task.category_name}
                </span>
              )}
              {task.due_date && (
                <span className="px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-600">
                  Due: {new Date(task.due_date.slice(0, 10) + 'T12:00:00').toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white border-2 border-red-600 rounded-lg font-bold hover:bg-red-600">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button onClick={() => setEditing(true)} className="px-6 py-3 bg-blue-500 text-white border-2 border-blue-600 rounded-lg font-bold hover:bg-blue-600">
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-purple-300 p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Task</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title *</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded" rows={3} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Due Date</label>
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded" />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-semibold mb-1">Points</label>
                  <input type="number" min={1} value={editPoints} onChange={e => setEditPoints(Number(e.target.value))} className="w-full px-3 py-2 border-2 border-gray-300 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select value={editCategoryId ?? ''} onChange={e => setEditCategoryId(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 border-2 border-gray-300 rounded">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setEditing(false)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-3 bg-purple-500 text-white rounded font-semibold hover:bg-purple-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
