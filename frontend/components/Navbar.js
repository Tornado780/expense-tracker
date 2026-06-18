'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AlertBell from '@/components/AlertBell'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/budgets', label: 'Budgets' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
            SpendSmart
          </Link>
          <div className="hidden md:flex gap-1">
            {links.map(l => (
              <Link
                key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AlertBell />
          <Link
            href="/profile"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden md:block"
          >
            {user?.name}
          </Link>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}