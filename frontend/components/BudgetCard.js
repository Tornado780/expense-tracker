'use client'
import { useAuth } from '@/context/AuthContext'

const CATEGORY_ICONS = {
  'Food & Dining': '🍽️',
  'Transport':     '🚗',
  'Entertainment': '🎬',
  'Utilities':     '⚡',
  'Health':        '💊',
  'Other':         '📦',
}

export default function BudgetCard({ budget, onDelete }) {
  const { formatAmount } = useAuth()
  const pct = Math.min(budget.percentage, 100)
  const isWarning = pct >= 80 && pct < 100
  const isExceeded = pct >= 100

  const barColor = isExceeded
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-indigo-500'

  const statusColor = isExceeded
    ? 'text-red-600 bg-red-50'
    : isWarning
    ? 'text-amber-600 bg-amber-50'
    : 'text-emerald-600 bg-emerald-50'

  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{CATEGORY_ICONS[budget.category]}</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{budget.category}</p>
            <p className="text-xs text-gray-400">
              {new Date(0, budget.month - 1).toLocaleString('default', { month: 'long' })} {budget.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
            {isExceeded ? 'Exceeded' : isWarning ? `${pct}% used` : `${pct}% used`}
          </span>
          <button
            onClick={() => onDelete(budget.id)}
            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          <span className="font-semibold text-gray-800">{formatAmount(budget.spent)}</span> spent
        </span>
        <span className="text-gray-500">
          limit <span className="font-semibold text-gray-800">{formatAmount(budget.limitAmount)}</span>
        </span>
      </div>

      {budget.remaining < 0 ? (
        <p className="text-xs text-red-500 mt-2">
          Over budget by {formatAmount(Math.abs(budget.remaining))}
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-2">
          {formatAmount(budget.remaining)} remaining
        </p>
      )}
    </div>
  )
}