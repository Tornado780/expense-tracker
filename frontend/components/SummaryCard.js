'use client'
import { useAuth } from '@/context/AuthContext'

export default function SummaryCard({ summary, loading }) {
  const { formatAmount } = useAuth()

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-100 rounded w-40 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
    )
  }

  const diff = summary?.total - summary?.prevTotal
  const pct = summary?.prevTotal > 0
    ? ((diff / summary.prevTotal) * 100).toFixed(1)
    : null

  const isUp = diff > 0

  return (
    <div className="card">
      <p className="text-sm text-gray-500 font-medium mb-1">Total this month</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {formatAmount(summary?.total || 0)}
      </p>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          isUp ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {isUp ? '↑' : '↓'} {pct ? `${Math.abs(pct)}%` : '—'}
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-6">
        <div>
          <p className="text-xs text-gray-400">Transactions</p>
          <p className="text-lg font-semibold text-gray-800">{summary?.count || 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Last month</p>
          <p className="text-lg font-semibold text-gray-800">{formatAmount(summary?.prevTotal || 0)}</p>
        </div>
      </div>
    </div>
  )
}