'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import SummaryCard from '@/components/SummaryCard'
import CategoryPieChart from '@/components/CategoryPieChart'
import TrendLineChart from '@/components/TrendLineChart'
import api from '@/lib/api'

const CATEGORY_COLORS = {
  'Food & Dining': 'bg-indigo-100 text-indigo-700',
  'Transport':     'bg-purple-100 text-purple-700',
  'Entertainment': 'bg-pink-100 text-pink-700',
  'Utilities':     'bg-amber-100 text-amber-700',
  'Health':        'bg-emerald-100 text-emerald-700',
  'Other':         'bg-gray-100 text-gray-600',
}

export default function DashboardPage() {
  const { user, loading: authLoading, formatAmount } = useAuth()
  const router = useRouter()

  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [recentExpenses, setRecentExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    const fetchAll = async () => {
      try {
        const now = new Date()
        const [summaryRes, expensesRes] = await Promise.all([
          api.get(`/expenses/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
          api.get(`/expenses?limit=100`)
        ])
        setSummary(summaryRes.data)
        setExpenses(expensesRes.data.expenses)
        setRecentExpenses(expensesRes.data.expenses.slice(0, 5))
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user])

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          <SummaryCard summary={summary} loading={loading} />
          <div className="md:col-span-2">
            <CategoryPieChart byCategory={summary?.byCategory} loading={loading} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <TrendLineChart expenses={expenses} loading={loading} />

          {/* Recent Expenses */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">Recent expenses</p>
              <button
                onClick={() => router.push('/expenses')}
                className="text-xs text-indigo-600 hover:underline"
              >
                View all
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-40" />
                    <div className="h-4 bg-gray-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : recentExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No expenses yet.{' '}
                <button onClick={() => router.push('/expenses')} className="text-indigo-500 hover:underline">
                  Add your first one
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1 gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[e.category]}`}>
                        {e.category}
                      </span>
                      <span className="text-sm text-gray-700 truncate">{e.description}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatAmount(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}