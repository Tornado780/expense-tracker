'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '@/context/AuthContext'

const COLORS = {
  'Food & Dining':  '#6366f1',
  'Transport':      '#8b5cf6',
  'Entertainment':  '#ec4899',
  'Utilities':      '#f59e0b',
  'Health':         '#10b981',
  'Other':          '#94a3b8',
}

export default function CategoryPieChart({ byCategory, loading }) {
  const { formatAmount } = useAuth()

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
        <div className="h-48 bg-gray-50 rounded-xl" />
      </div>
    )
  }

  const data = Object.entries(byCategory || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64 text-gray-400 text-sm">
        No expenses this month yet
      </div>
    )
  }

  return (
    <div className="card">
      <p className="text-sm font-semibold text-gray-700 mb-4">Spending by category</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatAmount(v)} />
          <Legend
            iconType="circle" iconSize={8}
            formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}