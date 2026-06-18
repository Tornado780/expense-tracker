'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

const CURRENCIES = [
  { code: 'INR', label: '₹ Indian Rupee' },
  { code: 'USD', label: '$ US Dollar' },
  { code: 'EUR', label: '€ Euro' },
  { code: 'GBP', label: '£ British Pound' },
  { code: 'JPY', label: '¥ Japanese Yen' },
  { code: 'AED', label: 'د.إ UAE Dirham' },
]

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({ name: '', currency: 'INR' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (user) setForm({ name: user.name, currency: user.currency })
  }, [user, authLoading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.patch('/auth/me', form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-sm text-gray-500 mb-8">Update your name and preferred currency</p>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                type="text" required className="input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email" disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed"
                value={user?.email || ''}
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Currency</label>
              <select
                className="input bg-white"
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">✓ Profile updated successfully</p>}

            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="card mt-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Account info</p>
          <p className="text-xs text-gray-400">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
        </div>
      </main>
    </div>
  )
}