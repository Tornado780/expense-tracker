'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import api from '@/lib/api'

export default function ExpensesPage() {
  const { user, loading: authLoading, formatAmount } = useAuth()
  const router = useRouter()

  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', from: '', to: '', page: 1 })

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 15, page: filters.page })
      if (filters.category) params.append('category', filters.category)
      if (filters.from) params.append('from', new Date(filters.from).toISOString())
      if (filters.to) params.append('to', new Date(filters.to + 'T23:59:59').toISOString())
      const res = await api.get(`/expenses?${params}`)
      setExpenses(res.data.expenses)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { if (user) fetchExpenses() }, [user, fetchExpenses])

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      fetchExpenses()
    } catch (err) {
      alert('Failed to delete expense')
    }
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/expenses/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'expenses.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
  }

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage all your spending</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-1.5">
              📥 Export CSV
            </button>
            <ExpenseForm onSuccess={fetchExpenses} />
          </div>
        </div>

        <ExpenseList
          expenses={expenses}
          total={total}
          page={filters.page}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={setFilters}
          onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
          onDelete={handleDelete}
          loading={loading}
        />
      </main>
    </div>
  )
}