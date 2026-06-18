'use client'
import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'

const CATEGORIES = ['Food & Dining', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Other']

const CATEGORY_COLORS = {
  'Food & Dining': 'bg-indigo-100 text-indigo-700',
  'Transport':     'bg-purple-100 text-purple-700',
  'Entertainment': 'bg-pink-100 text-pink-700',
  'Utilities':     'bg-amber-100 text-amber-700',
  'Health':        'bg-emerald-100 text-emerald-700',
  'Other':         'bg-gray-100 text-gray-600',
}

export default function ExpenseForm({ onSuccess }) {
  const [form, setForm] = useState({ description: '', amount: '', category: '', date: '' })
  const [suggestion, setSuggestion] = useState(null)   // { category, confidence }
  const [suggesting, setSuggesting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)

  // Live AI suggestion as user types description
  useEffect(() => {
    if (form.description.length < 3) { setSuggestion(null); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSuggesting(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000'}/categorize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: form.description })
        })
        const data = await res.json()
        setSuggestion(data)
      } catch {
        setSuggestion(null)
      } finally {
        setSuggesting(false)
      }
    }, 500)
  }, [form.description])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/expenses', {
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category || undefined,
        date: form.date ? new Date(form.date).toISOString() : undefined
      })
      setForm({ description: '', amount: '', category: '', date: '' })
      setSuggestion(null)
      setOpen(false)
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const acceptSuggestion = () => {
    if (suggestion) setForm(f => ({ ...f, category: suggestion.category }))
  }

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Expense
        </button>
      ) : (
        <div className="card border-indigo-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">New Expense</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description with AI suggestion */}
            <div>
              <label className="label">Description</label>
              <input
                type="text" required className="input"
                placeholder="e.g. Swiggy dinner, Uber ride..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              {/* AI suggestion badge */}
              {suggesting && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <span className="animate-spin inline-block">⏳</span> Detecting category...
                </p>
              )}
              {suggestion && !suggesting && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">🤖 AI suggests:</span>
                  <button
                    type="button"
                    onClick={acceptSuggestion}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-2 border-dashed transition-all ${
                      form.category === suggestion.category
                        ? 'border-solid ' + CATEGORY_COLORS[suggestion.category]
                        : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {suggestion.category} · {Math.round(suggestion.confidence * 100)}%
                  </button>
                  {suggestion.low_confidence && (
                    <span className="text-xs text-amber-500">Low confidence — please confirm</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount</label>
                <input
                  type="number" required min="0.01" step="0.01" className="input"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date" className="input"
                  max={new Date().toISOString().split('T')[0]}
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Category <span className="text-gray-400 font-normal">(optional — AI will auto-fill)</span></label>
              <select
                className="input bg-white"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Let AI decide</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Expense'}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}