'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import BudgetCard from '@/components/BudgetCard'
import api from '@/lib/api'

const CATEGORIES = ['Food & Dining', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Other']

export default function BudgetsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: 'Food & Dining', limitAmount: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading])

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/budgets?month=${month}&year=${year}`)
      setBudgets(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { if (user) fetchBudgets() }, [user, fetchBudgets])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/budgets', {
        category: form.category,
        limitAmount: parseFloat(form.limitAmount),
        month, year
      })
      setForm({ category: 'Food & Dining', limitAmount: '' })
      setShowForm(false)
      fetchBudgets()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create budget')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return
    try {
      await api.delete(`/budgets/${id}`)
      fetchBudgets()
    } catch {
      alert('Failed to delete budget')
    }
  }

  const existingCategories = budgets.map(b => b.category)
  const availableCategories = CATEGORIES.filter(c => !existingCategories.includes(c))

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-gray-500 mt-1">Set monthly spending limits per category</p>
        </div>

        {/* Controls row - stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
          <div className="flex gap-2">
            <select
              className="input w-1/2 sm:w-auto text-sm"
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              className="input w-1/2 sm:w-auto text-sm"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {availableCategories.length > 0 && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm sm:ml-auto">
              + Add Budget
            </button>
          )}
        </div>

        {/* Add budget form */}
        {showForm && (
          <div className="card mb-6 border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-4">New Budget</h3>
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
              <div className="flex-1 sm:min-w-40">
                <label className="label">Category</label>
                <select
                  className="input bg-white"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 sm:min-w-40">
                <label className="label">Monthly limit</label>
                <input
                  type="number" required min="1" step="1" className="input"
                  placeholder="e.g. 5000"
                  value={form.limitAmount}
                  onChange={e => setForm({ ...form, limitAmount: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 sm:flex-none">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 sm:flex-none">
                  Cancel
                </button>
              </div>
            </form>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-3">{error}</p>}
          </div>
        )}

        {/* Budget cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
                <div className="h-2 bg-gray-100 rounded mb-3" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">No budgets set for this month.</p>
            <button onClick={() => setShowForm(true)} className="text-indigo-500 hover:underline text-sm mt-2">
              Add your first budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(b => (
              <BudgetCard key={b.id} budget={b} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}