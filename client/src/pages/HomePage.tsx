import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTasks, createTask, updateTask } from '../services/tasks'
import { getCategories, createCategory } from '../services/categories'
import type { Task, Category } from '../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/dialog'
import { Check, Plus, SlidersHorizontal, ChevronDown } from 'lucide-react'

interface HomePageProps {
  onTaskUpdate: () => void
}

export default function HomePage({ onTaskUpdate }: HomePageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterCategory, setFilterCategory] = useState<number | undefined>()
  const [filterCompleted, setFilterCompleted] = useState<boolean | undefined>()
  const [sort, setSort] = useState<'due_date' | 'created_at'>('created_at')
  const [showFilters, setShowFilters] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newPoints, setNewPoints] = useState(10)
  const [newCategoryId, setNewCategoryId] = useState<number | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getTasks(), getCategories()])
      .then(([t, c]) => { setTasks(t); setCategories(c) })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getTasks({ category_id: filterCategory, is_completed: filterCompleted, sort })
      .then(setTasks)
      .catch(() => setError('Failed to load tasks'))
  }, [filterCategory, filterCompleted, sort])

  const handleToggleComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateTask(task.id, { is_completed: !task.is_completed })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t))
      onTaskUpdate()
    } catch {
      setError('Failed to update task')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      await createCategory({ name: newCategoryName.trim(), color: newCategoryColor })
      const updated = await getCategories()
      setCategories(updated)
      setNewCategoryName('')
      setNewCategoryColor('#6366f1')
      setShowNewCategory(false)
    } catch {
      setError('Failed to create category')
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSubmitting(true)
    try {
      await createTask({
        title: newTitle,
        description: newDescription || undefined,
        due_date: newDueDate || undefined,
        point_value: newPoints,
        category_id: newCategoryId,
      })
      const updated = await getTasks({ category_id: filterCategory, is_completed: filterCompleted, sort })
      setTasks(updated)
      setDialogOpen(false)
      setNewTitle(''); setNewDescription(''); setNewDueDate(''); setNewPoints(10); setNewCategoryId(undefined)
    } catch {
      setError('Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center text-purple-600 font-semibold">Loading tasks...</div>
  if (error) return <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={e => setSort(e.target.value as 'due_date' | 'created_at')}
            className="px-4 py-2 border-2 border-purple-300 rounded bg-white font-semibold text-purple-700"
          >
            <option value="created_at">Sort: Newest</option>
            <option value="due_date">Sort: Due Date</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded border-2 border-purple-600 font-semibold hover:bg-purple-600"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded border-2 border-green-600 font-semibold hover:bg-green-600">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Title *</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded" placeholder="Task title" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded" rows={3} placeholder="Optional description" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Due Date</label>
                  <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded" />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-semibold mb-1">Points</label>
                  <input type="number" min={1} value={newPoints} onChange={e => setNewPoints(Number(e.target.value))} className="w-full px-3 py-2 border-2 border-gray-300 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <select value={newCategoryId ?? ''} onChange={e => setNewCategoryId(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 border-2 border-gray-300 rounded">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={submitting} className="mt-2 px-6 py-3 bg-purple-500 text-white rounded font-semibold hover:bg-purple-600 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white border-2 border-purple-300 rounded-lg shadow-md flex gap-10">
          <div>
            <h4 className="font-bold text-gray-700 mb-2">Status</h4>
            {([['All', undefined], ['Incomplete', false], ['Completed', true]] as const).map(([label, val]) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="radio" name="status" checked={filterCompleted === val} onChange={() => setFilterCompleted(val)} />
                {label}
              </label>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-gray-700 mb-2">Category</h4>
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="radio" name="category" checked={filterCategory === undefined} onChange={() => setFilterCategory(undefined)} /> All
            </label>
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="radio" name="category" checked={filterCategory === c.id} onChange={() => setFilterCategory(c.id)} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </label>
            ))}
            {showNewCategory ? (
              <form onSubmit={handleCreateCategory} className="mt-2 flex flex-col gap-2">
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="px-2 py-1 border-2 border-purple-300 rounded text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={e => setNewCategoryColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">Pick color</span>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={creatingCategory} className="px-3 py-1 bg-purple-500 text-white rounded text-sm font-semibold hover:bg-purple-600 disabled:opacity-50">
                    {creatingCategory ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryName(''); setNewCategoryColor('#6366f1') }} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewCategory(true)}
                className="mt-2 flex items-center gap-1 text-sm text-purple-600 font-semibold hover:text-purple-800"
              >
                <Plus className="w-3 h-3" /> New Category
              </button>
            )}
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 mt-16 text-lg">No tasks found. Create one!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="border-2 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative"
              style={task.is_completed
                ? { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }
                : task.category_color
                  ? { backgroundColor: task.category_color + '22', borderColor: task.category_color }
                  : { backgroundColor: '#ffffff', borderColor: '#d8b4fe' }
              }
            >
              <button
                onClick={e => handleToggleComplete(task, e)}
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${task.is_completed ? 'bg-green-500 border-green-700' : 'bg-white border-gray-400 hover:border-purple-400'}`}
              >
                {task.is_completed && <Check className="w-5 h-5 text-white stroke-[3]" />}
              </button>
              <h3 className={`text-lg font-bold mb-2 pr-10 ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.title}
              </h3>
              {task.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-purple-100 border border-purple-300 rounded text-purple-700 font-bold text-sm">{task.point_value} pts</span>
                {task.category_name && (
                  <span className="px-3 py-1 rounded text-white text-sm font-semibold" style={{ backgroundColor: task.category_color || '#6366f1' }}>
                    {task.category_name}
                  </span>
                )}
                {task.due_date && <span className="text-xs text-gray-400">Due {new Date(task.due_date.slice(0, 10) + 'T12:00:00').toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
