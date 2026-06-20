'use client'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = ['All', 'Food & Dining', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Other']

const CATEGORY_COLORS = {
  'Food & Dining': 'bg-indigo-100 text-indigo-700',
  'Transport':     'bg-purple-100 text-purple-700',
  'Entertainment': 'bg-pink-100 text-pink-700',
  'Utilities':     'bg-amber-100 text-amber-700',
  'Health':        'bg-emerald-100 text-emerald-700',
  'Other':         'bg-gray-100 text-gray-600',
}

export default function ExpenseList({ expenses, total, page, totalPages, filters, onFilterChange, onPageChange, onDelete, loading }) {
  const { formatAmount } = useAuth()

  return (
    <div className="card">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-5">
        <select
          className="input w-full sm:w-auto text-sm"
          value={filters.category}
          onChange={e => onFilterChange({ ...filters, category: e.target.value, page: 1 })}
        >
          {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <input
            type="date" className="input w-full sm:w-auto text-sm"
            value={filters.from}
            onChange={e => onFilterChange({ ...filters, from: e.target.value, page: 1 })}
          />
          <input
            type="date" className="input w-full sm:w-auto text-sm"
            value={filters.to}
            onChange={e => onFilterChange({ ...filters, to: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex items-center justify-between sm:contents">
          {(filters.category || filters.from || filters.to) && (
            <button
              className="text-xs text-gray-500 hover:text-gray-900 underline"
              onClick={() => onFilterChange({ category: '', from: '', to: '', page: 1 })}
            >
              Clear filters
            </button>
          )}
          <span className="sm:ml-auto text-sm text-gray-400 self-center">{total} expenses</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex justify-between items-center py-2">
              <div className="flex gap-3 items-center">
                <div className="h-5 bg-gray-100 rounded-full w-24" />
                <div className="h-4 bg-gray-100 rounded w-32 hidden sm:block" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No expenses found</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {expenses.map(e => (
            <div key={e.id} className="flex items-center justify-between py-3 group gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[e.category]}`}>
                  {e.category}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">{e.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {e.confidence && (
                      <span className="ml-2 text-indigo-400">🤖 {Math.round(e.confidence * 100)}%</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="text-sm font-semibold text-gray-900">{formatAmount(e.amount)}</span>
                <button
                  onClick={() => onDelete(e.id)}
                  className="text-gray-300 hover:text-red-500 active:text-red-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-lg leading-none p-1"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
          <button
            className="btn-secondary text-sm py-1.5 px-3"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Prev
          </button>
          <span className="text-xs sm:text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            className="btn-secondary text-sm py-1.5 px-3"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}