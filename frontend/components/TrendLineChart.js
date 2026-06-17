'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '@/context/AuthContext'

export default function TrendLineChart({ expenses, loading }) {
  const { formatAmount } = useAuth()

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
        <div className="h-48 bg-gray-50 rounded-xl" />
      </div>
    )
  }

  // Group expenses by day
  const byDay = {}
  ;(expenses || []).forEach(e => {
    const day = new Date(e.date).getDate()
    byDay[day] = (byDay[day] || 0) + e.amount
  })

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const today = now.getDate()

  const data = Array.from({ length: today }, (_, i) => ({
    day: i + 1,
    amount: byDay[i + 1] || 0
  }))

  return (
    <div className="card">
      <p className="text-sm font-semibold text-gray-700 mb-4">Daily spending this month</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false} axisLine={false}
            tickFormatter={v => v === 0 ? '' : `${v}`}
            width={40}
          />
          <Tooltip
            formatter={(v) => [formatAmount(v), 'Spent']}
            labelFormatter={(l) => `Day ${l}`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Line
            type="monotone" dataKey="amount"
            stroke="#6366f1" strokeWidth={2}
            dot={false} activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}